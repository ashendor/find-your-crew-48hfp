-- Hide or delete a direct chat without ending the connection.
-- Removing a chat from one inbox does not delete the other person's messages.
-- Deleting for both removes the messages and hides the thread for each person.

create table if not exists public.direct_chat_hides (
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.connections(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, connection_id)
);

create table if not exists public.project_inbox_hides (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

alter table public.direct_chat_hides enable row level security;
alter table public.project_inbox_hides enable row level security;

grant select, insert, update, delete on public.direct_chat_hides to authenticated;
grant select, insert, update, delete on public.project_inbox_hides to authenticated;

drop policy if exists direct_chat_hides_own on public.direct_chat_hides;
create policy direct_chat_hides_own on public.direct_chat_hides
for all to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.connections c
    where c.id = connection_id
      and c.status = 'accepted'
      and (c.requester_id = auth.uid() or c.recipient_id = auth.uid())
  )
);

drop policy if exists project_inbox_hides_own on public.project_inbox_hides;
create policy project_inbox_hides_own on public.project_inbox_hides
for all to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    or exists (
      select 1 from public.project_members m
      where m.project_id = project_inbox_hides.project_id
        and m.user_id = auth.uid()
        and m.status = 'accepted'
    )
  )
);

create or replace function public.delete_direct_chat(p_connection uuid, p_both boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  conn public.connections;
begin
  select * into conn from public.connections
  where id = p_connection
    and status = 'accepted'
    and (requester_id = auth.uid() or recipient_id = auth.uid());
  if conn.id is null then
    raise exception 'Chat not found';
  end if;

  insert into public.direct_chat_hides (user_id, connection_id, hidden_at)
  values (auth.uid(), p_connection, now())
  on conflict (user_id, connection_id) do update set hidden_at = excluded.hidden_at;

  if p_both then
    delete from public.messages where connection_id = p_connection;
    insert into public.direct_chat_hides (user_id, connection_id, hidden_at)
    values (conn.requester_id, p_connection, now()), (conn.recipient_id, p_connection, now())
    on conflict (user_id, connection_id) do update set hidden_at = excluded.hidden_at;
  end if;
end $$;

revoke all on function public.delete_direct_chat(uuid, boolean) from public;
grant execute on function public.delete_direct_chat(uuid, boolean) to authenticated;
