-- A person who has joined can leave. This removes only their membership.
-- The team, the project, and other people stay.

create or replace function public.leave_team(p_crew uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.crews where id = p_crew and owner_id = auth.uid()) then
    raise exception 'You lead this team. Delete the team instead of leaving it.';
  end if;
  delete from public.crew_members
  where crew_id = p_crew and user_id = auth.uid() and status = 'accepted';
  if not found then
    raise exception 'You are not on this team.';
  end if;
end;
$$;

create or replace function public.leave_project(p_project uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.projects where id = p_project and owner_id = auth.uid()) then
    raise exception 'You created this project, so this does not remove you.';
  end if;
  delete from public.project_members
  where project_id = p_project and user_id = auth.uid() and status = 'accepted';
  if not found then
    raise exception 'You are not on this project.';
  end if;
end;
$$;

revoke all on function public.leave_team(uuid) from public;
revoke all on function public.leave_project(uuid) from public;
grant execute on function public.leave_team(uuid) to authenticated;
grant execute on function public.leave_project(uuid) to authenticated;

drop policy if exists crew_members_leave on public.crew_members;
create policy crew_members_leave on public.crew_members
for delete to authenticated
using (user_id = auth.uid() and status = 'accepted');

drop policy if exists project_members_leave on public.project_members;
create policy project_members_leave on public.project_members
for delete to authenticated
using (user_id = auth.uid() and status = 'accepted');
