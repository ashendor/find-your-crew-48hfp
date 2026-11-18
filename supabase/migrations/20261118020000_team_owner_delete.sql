-- The person who created a team can delete it.
-- Memberships and featured-project registration are removed with the team.
-- A connection is not a membership and is left in place.

create or replace function public.delete_own_team(p_crew uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.crews
    where id = p_crew and owner_id = auth.uid()
  ) then
    raise exception 'Only the person who created this team can delete it.';
  end if;

  delete from public.crew_projects where crew_id = p_crew;
  delete from public.crew_members where crew_id = p_crew;
  delete from public.crews where id = p_crew and owner_id = auth.uid();
end;
$$;

revoke all on function public.delete_own_team(uuid) from public;
grant execute on function public.delete_own_team(uuid) to authenticated;
