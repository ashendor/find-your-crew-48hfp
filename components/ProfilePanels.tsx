'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import WorkShot from '@/components/WorkShot';
import type {Crew,Project,Work} from '@/lib/crew-types';

export default function ProfilePanels({userId,tab,owner=true}:{userId:string;tab:'work'|'projects'|'crews';owner?:boolean}){
  const client = getCrewSupabase();
  const [works,setWorks] = useState<Work[]>([]);
  const [projects,setProjects] = useState<Project[]>([]);
  const [crews,setCrews] = useState<Crew[]>([]);
  const [joined,setJoined] = useState<string[]>([]);
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
      if (tab === 'crews') {
        const [owned, member] = await Promise.all([
          client.from('crews').select('*').eq('owner_id', userId),
          client.from('crew_members').select('crews(name)').eq('user_id', userId).eq('status','accepted'),
        ]);
        setCrews((owned.data || []) as Crew[]);
        setJoined(((member.data || []) as {crews:{name:string}|{name:string}[]|null}[]).map(row => Array.isArray(row.crews) ? row.crews[0]?.name : row.crews?.name).filter(Boolean) as string[]);
      }
    })();
  }, [client, userId, tab]);
  const stills = ['/brand/past-jbr-finals.jpg','/brand/poster-heist.jpg','/brand/poster-scifi.jpg','/brand/past-crew-at-monitor-2019.jpg','/brand/poster-documentary.jpg','/brand/poster-silent-film.jpg'];
  const pieces = works.filter(work => work.platform !== 'profile-link');
  if (tab === 'work') return pieces.length ? <section className="lm-plat-block"><div className="lm-plat-head"><h3>Shared links</h3><p>Individual pieces, separate from the platforms above.</p></div>{error && <p className="lm-alert" role="alert">{error}</p>}<div className="lm-mosaic">{owner && <Link className="lm-addshot" href="/create?mode=work"><b>+</b><span>Add</span></Link>}{pieces.map((work, index) => <div className="lm-shotwrap" key={work.id}><WorkShot url={work.url} fallback={stills[index % stills.length]}><i>{work.platform || 'Link'}</i><span>{work.title}</span></WorkShot>{owner && <button className="lm-shot-x" type="button" disabled={busy} aria-label={'Remove ' + work.title} onClick={() => void remove(work)}>×</button>}</div>)}</div></section> : null;
  if (tab === 'projects') return projects.length ? <div>{projects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{project.name.slice(0,1)}</span><div><strong>{project.name}</strong><p>{project.description || 'Project'}</p></div></Link>)}{owner && <Link className="lm-addline" href="/create?mode=project">Add a project</Link>}</div> : <div className="lm-empty"><strong>No projects yet</strong><p>{owner ? 'Start one, or join after you are invited. Connecting with someone does not add you.' : 'Projects this creator starts will show up here.'}</p>{owner && <Link className="lm-btn" href="/create?mode=project">Create a project</Link>}</div>;
  return <div>{crews.map(crew => <article className="lm-rowitem" key={crew.id}><span className="lm-avatar">{crew.name.slice(0,1)}</span><div><strong>{crew.name}</strong><p>{crew.description || (owner ? 'Crew you lead' : 'Crew')}</p></div></article>)}{joined.map(name => <article className="lm-rowitem" key={name}><span className="lm-avatar">{name.slice(0,1)}</span><div><strong>{name}</strong><p>Joined</p></div></article>)}{!crews.length && !joined.length && <div className="lm-empty"><strong>No crews yet</strong><p>{owner ? 'A crew is only created when you confirm it. A team name on a request does not make one.' : 'A crew appears here only after this creator creates one.'}</p>{owner && <Link className="lm-btn" href="/create?mode=crew">Create a crew</Link>}</div>}{owner && (crews.length > 0 || joined.length > 0) && <div className="lm-actions" style={{marginTop:16}}><Link className="lm-addline" href="/create?mode=crew">Add a crew</Link><Link className="lm-addline" href="/crews">Manage crews</Link></div>}</div>;
}
