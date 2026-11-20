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
import {schemaMissing,type Crew,type Creator} from '@/lib/crew-types';
import {parseNeeds,roleSeats} from '@/lib/team-roles';
import TeamCopy from '@/components/TeamCopy';
import OpenRoles from '@/components/OpenRoles';
import '../platform.css';

type SeatBits = {open:number; filled:number; seats:number; openings:{role:string; open:number}[]};
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
  const [seatStats,setSeatStats] = useState<Record<string,SeatBits>>({});
  const [view,setView] = useState<'people'|'teams'>('people');
  const [picked,setPicked] = useState<string[]>([]);
  const [openRoles,setOpenRoles] = useState<string[]>([]);
  const [roleSheet,setRoleSheet] = useState<'people'|'teams'|null>(null);
  const q = params.get('q') || '';
  const [query,setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (!client || !userId) return;
    void (async () => {
      const profiles = await client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200);
      const withNeeds = await client.from('crews').select('id,name,description,owner_id,created_at,role_needs').order('name').limit(200);
      const crewRows = schemaMissing(withNeeds.error) ? await client.from('crews').select('id,name,description,owner_id,created_at').order('name').limit(200) : withNeeds;
      const memberRows = await client.from('crew_members').select('crew_id').eq('user_id', userId).eq('status', 'accepted');
      const list = (crewRows.data || []) as Crew[];
      const joined = new Set(((memberRows.data || []) as {crew_id:string}[]).map(row => row.crew_id));
      for (const team of list) if (team.owner_id === userId) joined.add(team.id);
      setPeople((profiles.data || []) as Creator[]);
      setTeams(list);
      setMine(joined);
      const needing = list.filter(team => parseNeeds(team.role_needs).length);
      if (!needing.length) { setSeatStats({}); return; }
      const [accepted, owners] = await Promise.all([
        client.from('crew_members').select('crew_id,user_id,role').eq('status', 'accepted').in('crew_id', needing.map(team => team.id)),
        client.from('profiles').select('id,primary_role').in('id', Array.from(new Set(needing.map(team => team.owner_id)))),
      ]);
      const byCrew:Record<string, {user_id:string; role:string}[]> = {};
      for (const row of (accepted.data || []) as {crew_id:string; user_id:string; role:string}[]) {
        (byCrew[row.crew_id] ||= []).push({user_id:row.user_id, role:row.role});
      }
      const ownerRole = Object.fromEntries(((owners.data || []) as {id:string; primary_role:string|null}[]).map(person => [person.id, person.primary_role]));
      const stats:Record<string,SeatBits> = {};
      for (const team of needing) {
        const roles = roleSeats(parseNeeds(team.role_needs), byCrew[team.id] || [], team.owner_id, ownerRole[team.owner_id]);
        const seats = roles.reduce((total, role) => total + role.count, 0);
        if (!seats) continue;
        stats[team.id] = {
          seats,
          filled: roles.reduce((total, role) => total + role.filled, 0),
          open: roles.reduce((total, role) => total + role.open, 0),
          openings: roles.filter(role => role.open > 0).map(role => ({role:role.role, open:role.open})),
        };
      }
      setSeatStats(stats);
    })();
  }, [client, userId]);
  const needle = query.trim().toLowerCase();
  const shownPeople = useMemo(() => people.filter(person => {
    if (picked.length && !picked.some(role => hasRole(person, role))) return false;
    return !needle || haystack(person).includes(needle);
  }), [people, picked, needle]);
  const shownTeams = useMemo(() => teams.filter(team => {
    const openings = seatStats[team.id]?.openings || [];
    if (openRoles.length && !openRoles.some(role => openings.some(item => item.role === role))) return false;
    return !needle || (team.name + ' ' + (team.description || '') + ' ' + parseNeeds(team.role_needs).map(item => item.role).join(' ')).toLowerCase().includes(needle);
  }), [teams, needle, openRoles, seatStats]);
  function toggleRole(role:string){
    const update = (list:string[]) => list.includes(role) ? list.filter(item => item !== role) : [...list, role];
    if (roleSheet === 'teams') setOpenRoles(update);
    else setPicked(update);
  }
  const chosen = roleSheet === 'teams' ? openRoles : picked;
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
      <button type="button" role="tab" aria-selected={view === 'people'} className={view === 'people' ? 'on' : ''} onClick={() => { setRoleSheet(null); setView('people'); }}>People</button>
      <button type="button" role="tab" aria-selected={view === 'teams'} className={view === 'teams' ? 'on' : ''} onClick={() => { setRoleSheet(null); setView('teams'); }}>Teams</button>
    </div>
    {view === 'people' ? <>
      <div className="lm-filterbar">
        <button className={'lm-rolebtn' + (picked.length ? ' on' : '')} type="button" aria-expanded={roleSheet === 'people'} onClick={() => setRoleSheet('people')}>
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
    </> : <>
      <div className="lm-filterbar">
        <button className={'lm-rolebtn' + (openRoles.length ? ' on' : '')} type="button" aria-expanded={roleSheet === 'teams'} onClick={() => setRoleSheet('teams')}>
          {openRoles.length ? 'Open roles · ' + openRoles.length : 'Open roles'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        {openRoles.length > 0 && <button className="lm-filter-clear" type="button" onClick={() => setOpenRoles([])}>Clear</button>}
      </div>
      {openRoles.length > 0 && <div className="lm-picked">
        {openRoles.map(role => <button type="button" key={role} onClick={() => setOpenRoles(list => list.filter(item => item !== role))}>{role} <span aria-hidden="true">×</span></button>)}
      </div>}
      {shownTeams.length ? <div className="lm-xcards">
        {shownTeams.map(team => {
          const openings = seatStats[team.id]?.openings || [];
          const ranked = [...openings].sort((a, b) => Number(!openRoles.includes(a.role)) - Number(!openRoles.includes(b.role)));
          return <Link className="lm-xcard" key={team.id} href={'/teams/' + team.id}>
            <span className="lm-avatar lm-mark" aria-hidden="true">{team.name.slice(0,1)}</span>
            <span className="lm-xcard-copy"><TeamCopy name={team.name} description={team.description} member={mine.has(team.id)} /></span>
            <OpenRoles items={ranked} />
          </Link>;
        })}
      </div> : <div className="lm-empty"><strong>No teams found</strong><p>{openRoles.length ? 'No open seats for those roles.' : needle ? 'Try another team name.' : 'Teams show up here once someone creates one.'}</p></div>}
    </>}
    {roleSheet && <div className="lm-sheet lm-rolesheet" role="presentation" onClick={() => setRoleSheet(null)}>
      <div className="lm-sheet-panel" role="dialog" aria-labelledby="role-filter-title" onClick={e => e.stopPropagation()}>
        <div className="lm-rolehead">
          <h2 id="role-filter-title">{roleSheet === 'teams' ? 'Open roles' : 'Roles'}</h2>
          <button type="button" aria-label="Close" onClick={() => setRoleSheet(null)}>×</button>
        </div>
        <p className="lm-muted">{roleSheet === 'teams' ? 'Teams with an open seat in one of these roles stay in the list.' : 'Choose any roles. People who match one of them stay in the list.'}</p>
        {ROLE_GROUPS.map(([group, items]) => <section className="lm-rolelist" key={group}>
          <p>{group}</p>
          <div className="lm-rolechips">
            {items.map(item => <button type="button" key={item} aria-pressed={chosen.includes(item)} className={chosen.includes(item) ? 'on' : ''} onClick={() => toggleRole(item)}>{item}</button>)}
          </div>
        </section>)}
        <div className="lm-rolefoot">
          <button className="lm-btn-line" type="button" onClick={() => roleSheet === 'teams' ? setOpenRoles([]) : setPicked([])}>Clear</button>
          <button className="lm-btn" type="button" onClick={() => setRoleSheet(null)}>Done</button>
        </div>
      </div>
    </div>}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<FilmLoader delay={600} />}><ExploreInner/></Suspense>;
}
