'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import {useCrewUser} from '@/lib/use-crew';
import {schemaMissing,type Creator,type Project,type Work} from '@/lib/crew-types';
import '../crew-app.css';
import '../platform.css';
import '../brand-skin.css';

export default function LikeMindsHome(){
  const {client,user,userId,loading,error} = useCrewUser();
  const [projects,setProjects] = useState<Project[]>([]);
  const [mine,setMine] = useState<Project[]>([]);
  const [people,setPeople] = useState<Creator[]>([]);
  const [works,setWorks] = useState<Work[]>([]);
  const [setup,setSetup] = useState('');
  useEffect(() => {
    if (!client || !userId) return;
    void (async () => {
      const [featured, owned, members, creators, portfolio] = await Promise.all([
        client.from('projects').select('*').eq('status','published').eq('featured',true).order('created_at',{ascending:false}),
        client.from('projects').select('*').eq('owner_id',userId).order('created_at',{ascending:false}),
        client.from('project_members').select('project_id,projects(*)').eq('user_id',userId).eq('status','accepted'),
        client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).limit(6),
        client.from('works').select('*').order('created_at',{ascending:false}).limit(6),
      ]);
      if (schemaMissing(featured.error) || schemaMissing(portfolio.error)) setSetup('Run supabase/migrations/20261115220000_likeminds_platform.sql in the Supabase SQL editor, then reload.');
      setProjects((featured.data || []) as Project[]);
      const joined = ((members.data || []) as {projects: Project | Project[] | null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
      const map = new Map<string,Project>();
      for (const project of [...((owned.data || []) as Project[]), ...joined]) map.set(project.id, project);
      setMine([...map.values()]);
      setPeople((creators.data || []) as Creator[]);
      setWorks((portfolio.data || []) as Work[]);
    })();
  }, [client, userId]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">{error || 'Opening LikeMinds…'}</div></main>;
  const first = user.display_name.split(/\s+/)[0];
  return <PlatformShell>
    <p className="lm-kicker">LikeMinds</p>
    <h1>Hello, {first}.</h1>
    <p className="lm-lead">One profile. One way to connect. Projects are the reason you collaborate.</p>
    {setup && <p className="fc-error" role="alert">{setup}</p>}
    <section>
      <h2 className="fc-section-title">Featured projects</h2>
      <div className="lm-grid">{projects.map(project => <Link className="lm-card" key={project.id} href={'/projects/' + project.id}><span className="lm-kicker">{project.team_name_required ? 'Team name required' : 'Open collaboration'}</span><strong>{project.name}</strong><p>{project.description}</p></Link>)}
      {!projects.length && !setup && <p className="lm-muted">No featured projects yet.</p>}</div>
    </section>
    <section>
      <h2 className="fc-section-title">Your projects</h2>
      <div className="lm-row">{mine.length ? mine.map(project => <Link className="fc-btn fc-btn-alt" key={project.id} href={'/projects/' + project.id}>{project.name}</Link>) : <p className="lm-muted">You haven’t joined a project yet.</p>}</div>
    </section>
    <section>
      <h2 className="fc-section-title">Suggested creators</h2>
      <div className="lm-grid">{people.map(person => <Link className="lm-card" key={person.id} href={'/creators/' + encodeURIComponent(person.username)}><strong>{person.display_name}</strong><p>{person.primary_role || 'Creator'}{person.location ? ' · ' + person.location : ''}</p></Link>)}</div>
    </section>
    <section>
      <h2 className="fc-section-title">Featured work</h2>
      <div className="lm-grid">{works.map(work => <a className="lm-card" key={work.id} href={work.url} target="_blank" rel="noopener noreferrer"><span className="lm-kicker">{work.platform || 'Link'}</span><strong>{work.title}</strong></a>)}
      {!works.length && <p className="lm-muted">Members share work by linking out to Instagram, YouTube, Vimeo or Behance.</p>}</div>
    </section>
  </PlatformShell>;
}
