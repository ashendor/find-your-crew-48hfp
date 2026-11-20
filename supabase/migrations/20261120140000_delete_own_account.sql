-- A signed-in person can delete their own profile and login.
-- Their username is freed, and the same email can sign in later as a new account.
-- Run in the Supabase SQL editor. A deploy does not apply this file.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in before deleting your profile.';
  end if;

  delete from public.messages
  where sender_id = uid
     or connection_id in (
       select id from public.connections
       where requester_id = uid or recipient_id = uid
     );

  delete from public.connections
  where requester_id = uid or recipient_id = uid;

  delete from public.crew_projects
  where crew_id in (select id from public.crews where owner_id = uid);

  delete from public.team_join_requests
  where user_id = uid
     or crew_id in (select id from public.crews where owner_id = uid);

  delete from public.crew_members
  where user_id = uid
     or crew_id in (select id from public.crews where owner_id = uid);

  update public.crew_members
  set invited_by = null
  where invited_by = uid;

  delete from public.crews
  where owner_id = uid;

  delete from public.works where user_id = uid;
  delete from public.project_members where user_id = uid;
  delete from public.project_messages where sender_id = uid;
  update public.project_links set created_by = null where created_by = uid;
  update public.projects set owner_id = null where owner_id = uid;
  delete from public.direct_chat_hides where user_id = uid;
  delete from public.project_inbox_hides where user_id = uid;
  delete from public.platform_admins where user_id = uid;

  begin
    delete from public.creator_swipes
    where viewer_id = uid or target_id = uid;
  exception
    when undefined_table then null;
  end;

  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
