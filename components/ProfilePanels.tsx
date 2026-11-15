'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import WorkShot from '@/components/WorkShot';
import type {Project,Work} from '@/lib/crew-types';

type TeamRow = {id:string;name:string;description:string;owner_id:string};

export default function ProfilePanels({userId,tab,owner=true}:{userId:string;tab:'work'|'projects'|'teams';owner?:boolean}){
  const client = getCrewSupabase();
  const [works,setWorks] = useState<Work[]>([]);
  const [projects,setProjects] = useState<Project[]>([]);
  const [teams,setTeams] = useState<TeamRow[]>([]);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  async function remove(work:Work){
    if (!client || busy) return;
    if (!window.confirm('Remove “' + work.title + '” from your shared links?')) return;
    setBusy(true); setError('');
    const {error:deleteError} = await client.from('works').delete().eq('id', work.id).eq('user_id', userId);
    setBusy(false);
    if (deleteError) setError(deleteError.message);
    else setWorks(list => list.filter(item => item.id !== work.id));
  }
  useEffect(() => {
    if (!client || !userId) return;
    void (async () => {
      if (tab === 'work') {
        const {data} = await client.from('works').select('*').eq('user_id', userId).order('created_at',{ascending:false});
        setWorks((data || []) as Work[]);
      }
      if (tab === 'projects') {
        const [owned, member] = await Promise.all([
          client.from('projects').select('*').eq('owner_id', userId),
          client.from('project_members').select('projects(*)').eq('user_id', userId).eq('status','accepted'),
        ]);
        const extra = ((member.data || []) as {projects:Project|Project[]|null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
        const map = new Map<string,Project>();
        for (const project of [...((owned.data || []) as Project[]), ...extra]) map.set(project.id, project);
        setProjects([...map.values()]);
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
  const stills = ['/brand/past-jbr-finals.jpg','/brand/poster-heist.jpg','/brand/poster-scifi.jpg','/brand/past-crew-at-monitor-2019.jpg','/brand/poster-documentary.jpg','/brand/poster-silent-film.jpg'];
  const pieces = works.filter(work => work.platform !== 'profile-link');
  if (tab === 'work') return pieces.length ? <section className="lm-plat-block"><div className="lm-plat-head"><h3>Shared links</h3><p>Individual pieces, separate from the platforms above.</p></div>{error && <p className="lm-alert" role="alert">{error}</p>}<div className="lm-mosaic">{owner && <Link className="lm-addshot" href="/create?mode=work"><b>+</b><span>Add</span></Link>}{pieces.map((work, index) => <div className="lm-shotwrap" key={work.id}><WorkShot url={work.url} fallback={stills[index % stills.length]}><i>{work.platform || 'Link'}</i><span>{work.title}</span></WorkShot>{owner && <button className="lm-shot-x" type="button" disabled={busy} aria-label={'Remove ' + work.title} onClick={() => void remove(work)}>×</button>}</div>)}</div></section> : null;
  if (tab === 'projects') return projects.length ? <div>{projects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{project.name.slice(0,1)}</span><div><strong>{project.name}</strong><p>{project.description || 'Project'}</p></div></Link>)}{owner && <Link className="lm-addline" href="/create?mode=project">Add a project</Link>}</div> : <div className="lm-empty"><strong>No projects yet</strong><p>{owner ? 'Start one, or join after you are invited. Connecting with someone does not add you.' : 'Projects this creator starts will show up here.'}</p>{owner && <Link className="lm-btn" href="/create?mode=project">Create a project</Link>}</div>;
  return <div>{teams.map(team => <Link className="lm-rowitem" key={team.id} href={'/teams/' + team.id}><span className="lm-avatar">{team.name.slice(0,1)}</span><div><strong>{team.name}</strong><p>{team.description || (team.owner_id === userId ? (owner ? 'You lead this team' : 'Leads this team') : 'Member')}</p></div></Link>)}{!teams.length && <div className="lm-empty"><strong>No teams yet</strong><p>{owner ? 'A team is only created when you confirm it. A team name on a request does not make one.' : 'A team appears here only after this creator creates one.'}</p>{owner && <Link className="lm-btn" href="/create?mode=team">Create a team</Link>}</div>}{owner && teams.length > 0 && <Link className="lm-addline" href="/create?mode=team">Add a team</Link>}</div>;
}
