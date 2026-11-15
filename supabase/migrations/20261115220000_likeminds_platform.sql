-- LikeMinds platform: projects, connection purpose, external work, crew links.
-- Run in the Supabase SQL editor. Existing profiles, connections, messages and crews stay in place.
-- Accepting a connection only changes connection status. It does not create project or crew membership.

alter table public.profiles
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists vimeo_url text,
  add column if not exists behance_url text,
  add column if not exists dribbble_url text,
  add column if not exists website_url text;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text not null default '',
  kind text not null default 'member' check (kind in ('featured','member')),
  status text not null default 'draft' check (status in ('draft','published','closed')),
  featured boolean not null default false,
  team_name_required boolean not null default false,
  required_roles text[] not null default '{}',
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Member',
  status text not null default 'invited' check (status in ('invited','accepted','declined')),
  invited_by uuid,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  url text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crew_projects (
  crew_id uuid not null references public.crews(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  primary key (crew_id, project_id)
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  platform text,
  created_at timestamptz not null default now()
);

alter table public.connections
  add column if not exists purpose text default 'network',
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists team_name text,
  add column if not exists crew_id uuid references public.crews(id) on delete set null,
  add column if not exists note text;

alter table public.connections drop constraint if exists connections_purpose_check;
alter table public.connections
  add constraint connections_purpose_check check (purpose in ('network','project','crew'));

create or replace function public.guard_connection_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare required boolean;
begin
  if new.purpose = 'project' and new.project_id is not null then
    select team_name_required into required from public.projects where id = new.project_id;
    if coalesce(required, false)
       and nullif(trim(coalesce(new.team_name, '')), '') is null
       and new.crew_id is null then
      raise exception 'A team name is required for this project';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists connections_guard_purpose on public.connections;
create trigger connections_guard_purpose
  before insert or update of purpose, project_id, team_name, crew_id
  on public.connections
  for each row execute function public.guard_connection_request();

insert into public.projects (name, description, kind, status, featured, team_name_required, required_roles, starts_on, ends_on)
select '42HR Project',
  'A LikeMinds featured collaboration for the Dubai film weekend. Find creators and connect with 42HR Project selected. A team name is mandatory on the request. Accepting the request starts a chat only. It does not add anyone to a crew or to the project.',
  'featured', 'published', true, true,
  array['Director','Producer','Writer','Cinematographer','Editor','Sound','Actor','Production Design'],
  date '2026-11-27', date '2026-11-29'
where not exists (select 1 from public.projects where name = '42HR Project');

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_links enable row level security;
alter table public.project_messages enable row level security;
alter table public.crew_projects enable row level security;
alter table public.works enable row level security;
alter table public.platform_admins enable row level security;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.project_links to authenticated;
grant select, insert, update, delete on public.project_messages to authenticated;
grant select, insert, update, delete on public.crew_projects to authenticated;
grant select, insert, update, delete on public.works to authenticated;
grant select on public.platform_admins to authenticated;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

create or replace function public.is_project_owner(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.projects where id = pid and owner_id = auth.uid());
$$;

create or replace function public.is_project_member(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and user_id = auth.uid() and status = 'accepted'
  );
$$;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_project_owner(uuid) to authenticated;
grant execute on function public.is_project_member(uuid) to authenticated;

drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select to authenticated
using (status = 'published' or owner_id = auth.uid() or public.is_platform_admin());

drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert to authenticated
with check (
  owner_id = auth.uid()
  and (
    (kind = 'member' and featured = false)
    or (kind = 'featured' and featured = true and public.is_platform_admin())
  )
);

drop policy if exists projects_owner_update on public.projects;
create policy projects_owner_update on public.projects for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid() and kind = 'member' and featured = false);

drop policy if exists projects_admin_update on public.projects;
create policy projects_admin_update on public.projects for update to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists project_members_select on public.project_members;
create policy project_members_select on public.project_members for select to authenticated
using (
  user_id = auth.uid()
  or public.is_project_owner(project_id)
  or public.is_platform_admin()
  or exists (select 1 from public.projects p where p.id = project_id and p.status = 'published' and status = 'accepted')
);

drop policy if exists project_members_insert on public.project_members;
create policy project_members_insert on public.project_members for insert to authenticated
with check (
  status = 'invited'
  and (
    (user_id = auth.uid() and invited_by = auth.uid())
    or ((public.is_project_owner(project_id) or public.is_platform_admin()) and invited_by = auth.uid())
  )
);

drop policy if exists project_members_update on public.project_members;
create policy project_members_update on public.project_members for update to authenticated
using (
  (user_id = auth.uid() and invited_by is distinct from auth.uid())
  or public.is_project_owner(project_id)
  or public.is_platform_admin()
)
with check (
  (user_id = auth.uid() and invited_by is distinct from auth.uid() and status in ('accepted','declined'))
  or public.is_project_owner(project_id)
  or public.is_platform_admin()
);

drop policy if exists project_links_select on public.project_links;
create policy project_links_select on public.project_links for select to authenticated
using (
  exists (select 1 from public.projects p where p.id = project_id and (p.status = 'published' or p.owner_id = auth.uid()))
  or public.is_project_member(project_id)
  or public.is_platform_admin()
);

drop policy if exists project_links_write on public.project_links;
create policy project_links_write on public.project_links for insert to authenticated
with check (
  created_by = auth.uid()
  and (public.is_project_owner(project_id) or public.is_project_member(project_id) or public.is_platform_admin())
);

drop policy if exists project_messages_select on public.project_messages;
create policy project_messages_select on public.project_messages for select to authenticated
using (public.is_project_owner(project_id) or public.is_project_member(project_id) or public.is_platform_admin());

drop policy if exists project_messages_insert on public.project_messages;
create policy project_messages_insert on public.project_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and (public.is_project_owner(project_id) or public.is_project_member(project_id) or public.is_platform_admin())
);

drop policy if exists crew_projects_select on public.crew_projects;
create policy crew_projects_select on public.crew_projects for select to authenticated
using (
  exists (select 1 from public.crews c where c.id = crew_id and c.owner_id = auth.uid())
  or exists (select 1 from public.crew_members m where m.crew_id = crew_projects.crew_id and m.user_id = auth.uid() and m.status = 'accepted')
);

drop policy if exists crew_projects_write on public.crew_projects;
create policy crew_projects_write on public.crew_projects for insert to authenticated
with check (exists (select 1 from public.crews c where c.id = crew_id and c.owner_id = auth.uid()));

drop policy if exists crew_projects_delete on public.crew_projects;
create policy crew_projects_delete on public.crew_projects for delete to authenticated
using (exists (select 1 from public.crews c where c.id = crew_id and c.owner_id = auth.uid()));

drop policy if exists works_select on public.works;
create policy works_select on public.works for select to authenticated using (true);

drop policy if exists works_insert on public.works;
create policy works_insert on public.works for insert to authenticated with check (user_id = auth.uid());

drop policy if exists works_update on public.works;
create policy works_update on public.works for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists works_delete on public.works;
create policy works_delete on public.works for delete to authenticated using (user_id = auth.uid());

drop policy if exists admins_select_self on public.platform_admins;
create policy admins_select_self on public.platform_admins for select to authenticated
using (user_id = auth.uid());

-- To publish featured projects, add a row for that user:
-- insert into public.platform_admins (user_id) values ('00000000-0000-0000-0000-000000000000');
