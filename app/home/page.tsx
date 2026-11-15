'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import HeaderActions from '@/components/HeaderActions';
import WorkShot from '@/components/WorkShot';
import {useCrewUser} from '@/lib/use-crew';
import {schemaMissing,type Creator,type Crew,type Project,type Work} from '@/lib/crew-types';
import '../platform.css';

const stills = ['/brand/past-crew-at-monitor-2019.jpg','/brand/past-jbr-finals.jpg','/brand/poster-heist.jpg','/brand/poster-scifi.jpg','/brand/poster-documentary.jpg','/brand/poster-silent-film.jpg'];

function lines(name:string){
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const mid = Math.ceil(parts.length / 2);
  return <>{parts.slice(0, mid).join(' ')}<br/>{parts.slice(mid).join(' ')}</>;
}
function dates(start?:string|null, end?:string|null){
  if (!start) return 'Dates soon';
  const s = new Date(start + 'T00:00:00');
  const e = end ? new Date(end + 'T00:00:00') : null;
  const month = (d:Date) => d.toLocaleDateString('en-GB', {month:'short'}).toUpperCase();
  if (!e || Number.isNaN(e.getTime())) return `${s.getDate()} ${month(s)} ${s.getFullYear()}`;
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${s.getDate()} – ${e.getDate()} ${month(e)} ${e.getFullYear()}`;
  return `${s.getDate()} ${month(s)} – ${e.getDate()} ${month(e)} ${e.getFullYear()}`;
}

export default function LikeMindsHome(){
  const {client,user,userId,loading,error} = useCrewUser();
  const [projects,setProjects] = useState<Project[]>([]);
  const [mine,setMine] = useState<Project[]>([]);
  const [teams,setTeams] = useState<Crew[]>([]);
  const [people,setPeople] = useState<Creator[]>([]);
  const [works,setWorks] = useState<Work[]>([]);
  const [setup,setSetup] = useState('');
  useEffect(() => {
    if (!client || !userId) return;
    void (async () => {
      const [featured, owned, members, ownedTeams, joinedTeams, creators, portfolio] = await Promise.all([
        client.from('projects').select('*').eq('status','published').eq('featured',true).order('created_at',{ascending:false}),
        client.from('projects').select('*').eq('owner_id',userId).order('created_at',{ascending:false}),
        client.from('project_members').select('project_id,projects(*)').eq('user_id',userId).eq('status','accepted'),
        client.from('crews').select('id,name,description,owner_id,created_at').eq('owner_id',userId),
        client.from('crew_members').select('crews(id,name,description,owner_id,created_at)').eq('user_id',userId).eq('status','accepted'),
        client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).limit(8),
        client.from('works').select('*').or('platform.is.null,platform.neq.profile-link').order('created_at',{ascending:false}).limit(6),
      ]);
      if (schemaMissing(featured.error) || schemaMissing(portfolio.error)) setSetup('Projects appear here after the LikeMinds database update.');
      setProjects((featured.data || []) as Project[]);
      const joined = ((members.data || []) as {projects: Project | Project[] | null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
      const map = new Map<string,Project>();
      for (const project of [...((owned.data || []) as Project[]), ...joined]) map.set(project.id, project);
      setMine([...map.values()]);
      const teamMap = new Map<string, Crew>();
      for (const team of (ownedTeams.data || []) as Crew[]) teamMap.set(team.id, team);
      for (const row of (joinedTeams.data || []) as {crews:Crew|Crew[]|null}[]) {
        const team = Array.isArray(row.crews) ? row.crews[0] : row.crews;
        if (team?.id) teamMap.set(team.id, team);
      }
      setTeams([...teamMap.values()]);
      setPeople((creators.data || []) as Creator[]);
      setWorks((portfolio.data || []) as Work[]);
    })();
  }, [client, userId]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">{error || 'Opening LikeMinds…'}</div></main>;
  const hero = projects[0];
  const shown = hero || {id:'', name:'42HR Project', description:'A 48-hour filmmaking challenge in Dubai.', starts_on:'2026-11-27', ends_on:'2026-11-29'};
  const blurb = (shown.description || 'A 48-hour filmmaking challenge in Dubai.').split(/(?<=\.)\s/)[0];
  return <PlatformShell>
    <header className="lm-top">
      <h1>LikeMinds</h1>
      <HeaderActions />
    </header>
    <Link className="lm-feature" href={hero ? '/projects/' + hero.id : '/explore'}>
      <div className="lm-feature-copy">
        <p className="lm-kicker">Featured project</p>
        <strong>{lines(shown.name)}</strong>
        <p>{blurb}</p>
      </div>
      <img src="/brand/past-jbr-finals.jpg" alt="" />
      <div className="lm-feature-date"><span>{dates(shown.starts_on, shown.ends_on)}</span><span aria-hidden="true">→</span></div>
    </Link>
    {setup && <p className="lm-note" style={{marginTop:10}}>{setup}</p>}
    {(mine.length > 0 || teams.length > 0) && <section>
      <div className="lm-section"><h2>Yours</h2></div>
      {mine.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{project.name.slice(0,1)}</span><div><strong>{project.name}</strong><p>Project</p></div></Link>)}
      {teams.map(team => <Link className="lm-rowitem" key={team.id} href={'/teams/' + team.id}><span className="lm-avatar">{team.name.slice(0,1)}</span><div><strong>{team.name}</strong><p>Team</p></div></Link>)}
    </section>}
    {people.length > 0 && <section>
      <div className="lm-section"><h2>Suggested people</h2><Link href="/explore">See all</Link></div>
      <div className="lm-people">
        {people.map(person => <Link className="lm-person" key={person.id} href={'/creators/' + encodeURIComponent(person.username)}>
          {person.avatar_url ? <img src={person.avatar_url} alt="" /> : <span>{person.display_name.slice(0,1)}</span>}
          <small>{person.display_name.split(' ')[0]}</small>
        </Link>)}
      </div>
    </section>}
    <section>
      <div className="lm-section"><h2>Recent work</h2><Link href="/create">Share</Link></div>
      {works.length ? <div className="lm-mosaic">{works.map((work, index) => <WorkShot key={work.id} url={work.url} fallback={stills[index % stills.length]}><i>{work.platform || 'Link'}</i><span>{work.title}</span></WorkShot>)}</div> : <div className="lm-empty"><strong>No work shared yet</strong><p>Members link out to Instagram, YouTube, Vimeo, or Behance.</p><Link className="lm-btn" href="/create">Share work</Link></div>}
    </section>
  </PlatformShell>;
}
