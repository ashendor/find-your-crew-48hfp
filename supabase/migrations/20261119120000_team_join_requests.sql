-- Someone can ask to join a team. Only the team lead can approve, and approval
-- is what adds them. A connection is still separate and does not join a team.

create table if not exists public.team_join_requests (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (crew_id, user_id)
);

alter table public.team_join_requests enable row level security;

grant select on public.team_join_requests to authenticated;

drop policy if exists team_join_requests_select on public.team_join_requests;
create policy team_join_requests_select on public.team_join_requests
for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.crews c where c.id = crew_id and c.owner_id = auth.uid())
);

drop policy if exists crews_public_read on public.crews;
create policy crews_public_read on public.crews
for select to authenticated
using (true);

drop policy if exists crew_members_public_accepted on public.crew_members;
create policy crew_members_public_accepted on public.crew_members
for select to authenticated
using (status = 'accepted');

create or replace function public.request_team_join(p_crew uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing uuid;
  owner uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to request a team.';
  end if;
  select c.owner_id into owner from public.crews c where c.id = p_crew;
  if owner is null then
    raise exception 'Team not found.';
  end if;
  if owner = auth.uid() then
    raise exception 'You lead this team.';
  end if;
  if exists (
    select 1 from public.crew_members
    where crew_id = p_crew and user_id = auth.uid() and status = 'accepted'
  ) then
    raise exception 'You are already on this team.';
  end if;
  select id into existing from public.team_join_requests
  where crew_id = p_crew and user_id = auth.uid();
  if existing is not null then
    update public.team_join_requests
      set status = 'pending', created_at = now()
      where id = existing;
    return existing;
  end if;
  insert into public.team_join_requests (crew_id, user_id, status)
  values (p_crew, auth.uid(), 'pending')
  returning id into existing;
  return existing;
end;
$$;

create or replace function public.respond_team_join(p_request uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.team_join_requests;
  owner uuid;
  role_name text;
begin
  if auth.uid() is null then
    raise exception 'Sign in to answer this request.';
  end if;
  select * into req from public.team_join_requests where id = p_request;
  if req.id is null then
    raise exception 'Request not found.';
  end if;
  select c.owner_id into owner from public.crews c where c.id = req.crew_id;
  if owner is distinct from auth.uid() then
    raise exception 'Only the team lead can answer this request.';
  end if;
  if not p_accept then
    update public.team_join_requests set status = 'declined' where id = req.id;
    return;
  end if;
  select coalesce(nullif(trim(primary_role), ''), 'Member') into role_name
  from public.profiles where id = req.user_id;
  update public.team_join_requests set status = 'accepted' where id = req.id;
  if exists (
    select 1 from public.crew_members where crew_id = req.crew_id and user_id = req.user_id
  ) then
    update public.crew_members
      set status = 'accepted', role = coalesce(role_name, 'Member')
      where crew_id = req.crew_id and user_id = req.user_id;
  else
    insert into public.crew_members (crew_id, user_id, invited_by, role, status)
    values (req.crew_id, req.user_id, auth.uid(), coalesce(role_name, 'Member'), 'accepted');
  end if;
end;
$$;

revoke all on function public.request_team_join(uuid) from public;
revoke all on function public.respond_team_join(uuid, boolean) from public;
grant execute on function public.request_team_join(uuid) to authenticated;
grant execute on function public.respond_team_join(uuid, boolean) to authenticated;
