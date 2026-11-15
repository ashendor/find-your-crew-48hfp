-- Featured projects: a person can join themselves. No invite or approval.
-- Other projects stay invite-only.

drop policy if exists project_members_join_featured on public.project_members;
create policy project_members_join_featured on public.project_members
for insert to authenticated
with check (
  status = 'accepted'
  and user_id = auth.uid()
  and invited_by = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = project_id and p.featured = true and p.status = 'published'
  )
);

drop policy if exists project_members_accept_featured on public.project_members;
create policy project_members_accept_featured on public.project_members
for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = project_id and p.featured = true and p.status = 'published'
  )
)
with check (
  user_id = auth.uid()
  and status = 'accepted'
  and exists (
    select 1 from public.projects p
    where p.id = project_id and p.featured = true and p.status = 'published'
  )
);
