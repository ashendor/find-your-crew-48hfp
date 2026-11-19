-- Anyone signed in can see which teams are registered for a published featured project,
-- so they can open the team and request to join. Only the team lead can register one.

drop policy if exists crews_public_read on public.crews;
create policy crews_public_read on public.crews
for select to authenticated
using (true);

drop policy if exists crew_projects_public_featured on public.crew_projects;
create policy crew_projects_public_featured on public.crew_projects
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.status = 'published' and p.featured = true
  )
);
