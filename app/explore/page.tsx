'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import HeaderActions from '@/components/HeaderActions';
import Tabs from '@/components/Tabs';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,type Creator,type Project} from '@/lib/crew-types';
import '../platform.css';

const stills = ['/brand/poster-heist.jpg','/brand/poster-disaster.jpg','/brand/poster-scifi.jpg','/brand/poster-silent-film.jpg','/brand/poster-documentary.jpg','/brand/poster-western.jpg','/brand/past-jbr-finals.jpg','/brand/past-crew-at-monitor-2019.jpg','/brand/poster-noir.jpg','/brand/poster-horror.jpg'];
const chips = ['All', 'Director', 'Cinematographer', 'Editor', 'Producer', 'Writer', 'Actor', 'Sound'];

function ExploreInner(){
  const {client,user,userId,loading} = useCrewUser();
  const params = useSearchParams();
  const tab = params.get('tab') === 'projects' ? 'projects' : 'people';
  const preset = params.get('project') || undefined;
  const [people,setPeople] = useState<Creator[]>([]);
  const [projects,setProjects] = useState<Project[]>([]);
  const [role,setRole] = useState('All');
  const [kind,setKind] = useState<'All'|'Featured'>('All');
  const q = params.get('q') || '';
  const [query,setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (!client || !userId) return;
    void Promise.all([
      client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200),
      client.from('projects').select('*').eq('status','published').order('featured',{ascending:false}).order('name'),
    ]).then(([creators, work]) => {
      setPeople((creators.data || []) as Creator[]);
      setProjects((work.data || []) as Project[]);
    });
  }, [client, userId]);
  const shownPeople = useMemo(() => people.filter(person => {
    const hay = (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '') + ' ' + (person.skills_tags || []).join(' ') + ' ' + (person.categories || []).join(' ') + ' ' + (person.bio || '')).toLowerCase();
    const known = chips.includes(role) || ROLES.includes(role);
    return (!known || role === 'All' || person.primary_role === role || person.categories?.includes(role)) && hay.includes(query.toLowerCase());
  }), [people, role, query]);
  const shownProjects = useMemo(() => projects.filter(project => {
    const hay = (project.name + ' ' + project.description + ' ' + (project.required_roles || []).join(' ')).toLowerCase();
    return (kind === 'All' || project.featured) && hay.includes(query.toLowerCase());
  }), [projects, kind, query]);
  const linkFor = (next:'people'|'projects') => {
    const search = new URLSearchParams();
    if (next === 'projects') search.set('tab', 'projects');
    if (query.trim()) search.set('q', query.trim());
    if (preset && next === 'people') search.set('project', preset);
    const value = search.toString();
    return '/explore' + (value ? '?' + value : '');
  };
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening Explore…</div></main>;
  return <PlatformShell>
    <header className="lm-top">
      <h1 className="lm-title">Explore</h1>
      <HeaderActions />
    </header>
    <Tabs label="Explore" current={tab} items={[{id:'people', label:'People', href:linkFor('people')},{id:'projects', label:'Projects', href:linkFor('projects')}]} />
    <label className="lm-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label={tab === 'people' ? 'Search people' : 'Search projects'} placeholder={tab === 'people' ? 'Search by name or skill' : 'Search projects'} value={query} onChange={e => setQuery(e.target.value)} />
    </label>
    {tab === 'people' && <>
      <div className="lm-filters" role="group" aria-label="Roles">
        {chips.map(item => <button key={item} className={role === item ? 'on' : ''} type="button" onClick={() => setRole(item)}>{item}</button>)}
      </div>
      <div className="lm-masonry">
        {shownPeople.map((person, index) => <article className="lm-tile" key={person.id}>
          <Link href={'/creators/' + encodeURIComponent(person.username) + (preset ? '?project=' + preset : '')}>
            <span className="lm-still" style={{backgroundImage:'url(' + stills[index % stills.length] + ')'}} />
            <b>{person.display_name}</b>
          </Link>
        </article>)}
      </div>
      {!shownPeople.length && <div className="lm-empty"><strong>No people found</strong><p>Try another name, skill, or role.</p></div>}
    </>}
    {tab === 'projects' && <>
      <div className="lm-filters" role="group" aria-label="Projects">
        {(['All','Featured'] as const).map(item => <button key={item} className={kind === item ? 'on' : ''} type="button" onClick={() => setKind(item)}>{item}</button>)}
      </div>
      {shownProjects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}>
        <span className="lm-avatar">{project.name.slice(0,1)}</span>
        <div><strong>{project.name}</strong><p>{project.featured ? 'Featured · ' : ''}{project.description || 'Project'}</p></div>
      </Link>)}
      {!shownProjects.length && <div className="lm-empty"><strong>No projects found</strong><p>Featured and community projects show up together here.</p></div>}
    </>}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<main className="lm-page"><div className="lm-main">Opening Explore…</div></main>}><ExploreInner/></Suspense>;
}
