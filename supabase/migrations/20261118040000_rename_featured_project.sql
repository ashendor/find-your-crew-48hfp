-- The featured project is shown as 48hr project.
-- Official team registration stays on the 48 Hour Film Project site.

update public.projects
set name = '48hr project',
    description = 'A LikeMinds featured project for the Dubai film weekend. Find people and build a team here. Once your team is ready, click the official link and register the team there: https://www.48hourfilm.com/dubai/48hfp'
where featured = true
  and status = 'published'
  and (name = '42HR Project' or name = '48hr project');
