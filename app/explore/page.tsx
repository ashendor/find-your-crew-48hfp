'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import {type Crew,type Creator} from '@/lib/crew-types';
import TeamCopy from '@/components/TeamCopy';
import '../platform.css';

const ROLE_GROUPS:[string, string[]][] = [
  ['Production', ['Producer', 'General Production', 'Help With Anything/Runner']],
  ['Story', ['Writer', 'Director']],
  ['Cast', ['Actor', 'Actress']],
  ['Camera', ['DOP', 'Camera Team', 'Lighting Team', 'Grip team']],
  ['Art', ['Wardrobe', 'Makeup']],
  ['Sound', ['Sound', 'Sound Design']],
  ['Post', ['Editor', 'Colour']],
];

function haystack(person:Creator){
  return (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '') + ' ' + (person.skills_tags || []).join(' ') + ' ' + (person.categories || []).join(' ') + ' ' + (person.bio || '')).toLowerCase();
}
function hasRole(person:Creator, role:string){
  return person.primary_role === role || person.categories?.includes(role);
}
function face(person:Creator){
  if (!person.avatar_url) return <span className="lm-avatar">{person.display_name.slice(0,1)}</span>;
  return <Image src={person.avatar_url} alt="" width={48} height={48} quality={55} sizes="48px" />;
}

function ExploreInner(){
  const {client,user,userId,loading} = useCrewUser();
  const params = useSearchParams();
  const [people,setPeople] = useState<Creator[]>([]);
  const [teams,setTeams] = useState<Crew[]>([]);
  const [mine,setMine] = useState<Set<string>>(new Set());
  const [view,setView] = useState<'people'|'teams'>('people');
  const [picked,setPicked] = useState<string[]>([]);
  const [rolesOpen,setRolesOpen] = useState(false);
  const q = params.get('q') || '';
  const [query,setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (!client || !userId) return;
    void Promise.all([
      client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200),
      client.from('crews').select('id,name,description,owner_id,created_at').order('name').limit(200),
      client.from('crew_members').select('crew_id').eq('user_id', userId).eq('status', 'accepted'),
    ]).then(([profiles, crewRows, memberRows]) => {
      const list = (crewRows.data || []) as Crew[];
      const joined = new Set(((memberRows.data || []) as {crew_id:string}[]).map(row => row.crew_id));
      for (const team of list) if (team.owner_id === userId) joined.add(team.id);
      setPeople((profiles.data || []) as Creator[]);
      setTeams(list);
      setMine(joined);
    });
  }, [client, userId]);
  const needle = query.trim().toLowerCase();
  const shownPeople = useMemo(() => people.filter(person => {
    if (picked.length && !picked.some(role => hasRole(person, role))) return false;
    return !needle || haystack(person).includes(needle);
  }), [people, picked, needle]);
  const shownTeams = useMemo(() => teams.filter(team => !needle || (team.name + ' ' + (team.description || '')).toLowerCase().includes(needle)), [teams, needle]);
  function toggleRole(role:string){
    setPicked(list => list.includes(role) ? list.filter(item => item !== role) : [...list, role]);
  }
  if (loading || !user) return <FilmLoader delay={600} />;
  return <PlatformShell>
    <header className="lm-top">
      <h1 className="lm-title">Explore</h1>
      <HeaderActions />
    </header>
    <label className="lm-search lm-browse-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label={view === 'people' ? 'Search people' : 'Search teams'} placeholder={view === 'people' ? 'Search people' : 'Search teams'} value={query} onChange={e => setQuery(e.target.value)} />
      {needle && <button className="lm-search-x" type="button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
    </label>
    <div className="lm-search-tabs" role="tablist" aria-label="Explore">
      <button type="button" role="tab" aria-selected={view === 'people'} className={view === 'people' ? 'on' : ''} onClick={() => setView('people')}>People</button>
      <button type="button" role="tab" aria-selected={view === 'teams'} className={view === 'teams' ? 'on' : ''} onClick={() => setView('teams')}>Teams</button>
    </div>
    {view === 'people' ? <>
      <div className="lm-filterbar">
        <button className={'lm-rolebtn' + (picked.length ? ' on' : '')} type="button" aria-expanded={rolesOpen} onClick={() => setRolesOpen(true)}>
          {picked.length ? 'Roles · ' + picked.length : 'Roles'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        {picked.length > 0 && <button className="lm-filter-clear" type="button" onClick={() => setPicked([])}>Clear</button>}
      </div>
      {picked.length > 0 && <div className="lm-picked">
        {picked.map(role => <button type="button" key={role} onClick={() => toggleRole(role)}>{role} <span aria-hidden="true">×</span></button>)}
      </div>}
      <div className="lm-hits">
        {shownPeople.map(person => <Link className="lm-hit" key={person.id} href={'/creators/' + encodeURIComponent(person.username)}>
          {face(person)}
          <span><strong>{person.display_name}</strong><p>{person.primary_role || '@' + person.username}</p></span>
        </Link>)}
      </div>
      {!shownPeople.length && <div className="lm-empty"><strong>No people found</strong><p>Try another name or clear a role.</p></div>}
    </> : <div className="lm-hits">
      {shownTeams.map(team => <Link className="lm-hit lm-teamline" key={team.id} href={'/teams/' + team.id}>
        <span className="lm-avatar lm-mark" aria-hidden="true">{team.name.slice(0,1)}</span>
        <span><TeamCopy name={team.name} description={team.description} member={mine.has(team.id)} /></span>
      </Link>)}
      {!shownTeams.length && <div className="lm-empty"><strong>No teams found</strong><p>{needle ? 'Try another team name.' : 'Teams show up here once someone creates one.'}</p></div>}
    </div>}
    {rolesOpen && <div className="lm-sheet lm-rolesheet" role="presentation" onClick={() => setRolesOpen(false)}>
      <div className="lm-sheet-panel" role="dialog" aria-labelledby="role-filter-title" onClick={e => e.stopPropagation()}>
        <div className="lm-rolehead">
          <h2 id="role-filter-title">Roles</h2>
          <button type="button" aria-label="Close" onClick={() => setRolesOpen(false)}>×</button>
        </div>
        <p className="lm-muted">Choose any roles. People who match one of them stay in the list.</p>
        {ROLE_GROUPS.map(([group, items]) => <section className="lm-rolelist" key={group}>
          <p>{group}</p>
          <div className="lm-rolechips">
            {items.map(item => <button type="button" key={item} aria-pressed={picked.includes(item)} className={picked.includes(item) ? 'on' : ''} onClick={() => toggleRole(item)}>{item}</button>)}
          </div>
        </section>)}
        <div className="lm-rolefoot">
          <button className="lm-btn-line" type="button" onClick={() => setPicked([])}>Clear</button>
          <button className="lm-btn" type="button" onClick={() => setRolesOpen(false)}>Done</button>
        </div>
      </div>
    </div>}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<FilmLoader delay={600} />}><ExploreInner/></Suspense>;
}
