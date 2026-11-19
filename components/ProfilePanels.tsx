'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import {projectTitle,type Project} from '@/lib/crew-types';
import TeamCopy from '@/components/TeamCopy';

type TeamRow = {id:string;name:string;description:string;owner_id:string};

export default function ProfilePanels({userId,tab,owner=true}:{userId:string;tab:'work'|'projects'|'teams';owner?:boolean}){
  const client = getCrewSupabase();
  const [projects,setProjects] = useState<Project[]>([]);
  const [teams,setTeams] = useState<TeamRow[]>([]);
  useEffect(() => {
    if (!client || !userId || tab === 'work' || (tab === 'teams' && !owner)) return;
    void (async () => {
      if (tab === 'projects') {
        const [owned, member] = await Promise.all([
          client.from('projects').select('*').eq('owner_id', userId),
          client.from('project_members').select('projects(*)').eq('user_id', userId).eq('status','accepted'),
        ]);
        const extra = ((member.data || []) as {projects:Project|Project[]|null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
        const map = new Map<string,Project>();
        for (const project of [...((owned.data || []) as Project[]), ...extra]) map.set(project.id, project);
        setProjects([...map.values()].filter(project => project.featured));
      }
      if (tab === 'teams') {
        const [owned, member] = await Promise.all([
          client.from('crews').select('id,name,description,owner_id').eq('owner_id', userId),
          client.from('crew_members').select('crews(id,name,description,owner_id)').eq('user_id', userId).eq('status','accepted'),
        ]);
        const map = new Map<string, TeamRow>();
        for (const team of (owned.data || []) as TeamRow[]) map.set(team.id, team);
        for (const row of (member.data || []) as {crews:TeamRow|TeamRow[]|null}[]) {
          const team = Array.isArray(row.crews) ? row.crews[0] : row.crews;
          if (team?.id) map.set(team.id, team);
        }
        setTeams([...map.values()]);
      }
    })();
  }, [client, userId, tab]);
  if (tab === 'work' || (tab === 'teams' && !owner)) return null;
  if (tab === 'projects') return projects.length ? <div>{projects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{projectTitle(project).slice(0,1)}</span><div><strong>{projectTitle(project)}</strong><p>Featured project</p></div></Link>)}</div> : <div className="lm-empty"><strong>No featured project yet</strong><p>The featured project shows here after this profile joins it.</p></div>;
  if (!teams.length) return <div className="lm-empty"><strong>No teams yet</strong><p>{owner ? 'A team is only created when you confirm it. A team name on a request does not make one.' : 'A team appears here only after this creator creates one.'}</p>{owner && <Link className="lm-btn" href="/create?mode=team">Create a team</Link>}</div>;
  const leading = teams.filter(team => team.owner_id === userId).length;
  const summary = teams.length === 1 ? '1 team' : leading === teams.length ? 'You lead ' + teams.length : teams.length + ' teams';
  return <section className="lm-teamlist" aria-label="Your teams">
    <div className="lm-teamhead">
      <div><h2>Your teams</h2><p>{summary}</p></div>
      {owner && <Link className="lm-addchip" href="/create?mode=team"><span aria-hidden="true">+</span>Add</Link>}
    </div>
    <div className="lm-teamcard">
      {teams.map(team => <Link className="lm-rowitem lm-teamline" key={team.id} href={'/teams/' + team.id}><span className="lm-avatar">{team.name.slice(0,1)}</span><div><TeamCopy name={team.name} description={team.description} member /></div></Link>)}
    </div>
  </section>;
}
