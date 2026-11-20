-- A team can list the roles it needs and how many people each role takes.
-- Run in the Supabase SQL editor. A deploy does not apply this file.

alter table public.crews
  add column if not exists role_needs jsonb not null default '[]'::jsonb;

drop policy if exists crews_owner_update on public.crews;
create policy crews_owner_update on public.crews
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
