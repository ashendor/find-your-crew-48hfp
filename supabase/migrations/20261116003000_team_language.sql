-- User-facing copy only. Tables stay named crews so existing accounts and memberships are unchanged.
update public.projects
set description = 'A LikeMinds featured project for the Dubai film weekend. Find people and connect with 42HR Project selected. A team name is required on that request. Accepting opens a chat only. It does not create a team or add anyone to the project.'
where name = '42HR Project'
  and description like '%does not add anyone to a crew%';
