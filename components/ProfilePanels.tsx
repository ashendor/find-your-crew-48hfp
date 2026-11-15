'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Crew,Project,Work} from '@/lib/crew-types';

export default function ProfilePanels({userId,tab}:{userId:string;tab:'work'|'projects'|'crews'}){
  const client = getCrewSupabase();
  const [works,setWorks] = useState<Work[]>([]);
  const [projects,setProjects] = useState<Project[]>([]);
  const [crews,setCrews] = useState<Crew[]>([]);
  const [joined,setJoined] = useState<string[]>([]);
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
  if (tab === 'work') return <div className="lm-grid">{works.map(work => <a className="lm-card" key={work.id} href={work.url} target="_blank" rel="noopener noreferrer"><span className="lm-kicker">{work.platform || 'Link'}</span><strong>{work.title}</strong></a>)}{!works.length && <p className="lm-muted">No external work yet. Share a link from Create.</p>}<Link className="fc-btn" href="/create">Share work</Link></div>;
  if (tab === 'projects') return <div className="lm-grid">{projects.map(project => <Link className="lm-card" key={project.id} href={'/projects/' + project.id}><strong>{project.name}</strong><p>{project.description}</p></Link>)}{!projects.length && <p className="lm-muted">No projects yet.</p>}</div>;
  return <div className="lm-grid">{crews.map(crew => <article className="lm-card" key={crew.id}><span className="lm-kicker">Owner</span><strong>{crew.name}</strong><p>{crew.description}</p></article>)}{joined.map(name => <article className="lm-card" key={name}><span className="lm-kicker">Member</span><strong>{name}</strong></article>)}{!crews.length && !joined.length && <p className="lm-muted">No crews yet. Create one when you mean to.</p>}<Link className="fc-btn" href="/crews">Manage crews</Link></div>;
}
