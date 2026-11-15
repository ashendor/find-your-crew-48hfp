'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,type Creator} from '@/lib/crew-types';
import '../platform.css';

const stills = ['/brand/poster-heist.jpg','/brand/poster-disaster.jpg','/brand/poster-scifi.jpg','/brand/poster-silent-film.jpg','/brand/poster-documentary.jpg','/brand/poster-western.jpg','/brand/past-jbr-finals.jpg','/brand/past-crew-at-monitor-2019.jpg','/brand/poster-noir.jpg','/brand/poster-horror.jpg'];
const chips = ['All', 'Director', 'Cinematographer', 'Editor', 'Producer', 'Writer', 'Actor', 'Sound'];

function ExploreInner(){
  const {client,user,userId,loading} = useCrewUser();
  const params = useSearchParams();
  const preset = params.get('project') || undefined;
  const [people,setPeople] = useState<Creator[]>([]);
  const [role,setRole] = useState('All');
  const q = params.get('q') || '';
  const [query,setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (!client || !userId) return;
    void client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200)
      .then(({data}) => setPeople((data || []) as Creator[]));
  }, [client, userId]);
  const shown = useMemo(() => people.filter(person => {
    const hay = (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '') + ' ' + (person.skills_tags || []).join(' ') + ' ' + (person.categories || []).join(' ') + ' ' + (person.bio || '')).toLowerCase();
    const known = chips.includes(role) || ROLES.includes(role);
    return (!known || role === 'All' || person.primary_role === role || person.categories?.includes(role)) && hay.includes(query.toLowerCase());
  }), [people, role, query]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening Explore…</div></main>;
  return <PlatformShell>
    <header className="lm-top">
      <h1 className="lm-title">Explore</h1>
      <HeaderActions />
    </header>
    <label className="lm-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label="Search creators, skills or projects" placeholder="Search creators, skills or projects" value={query} onChange={e => setQuery(e.target.value)} />
    </label>
    <div className="lm-filters" role="group" aria-label="Roles">
      {chips.map(item => <button key={item} className={role === item ? 'on' : ''} type="button" onClick={() => setRole(item)}>{item}</button>)}
    </div>
    <div className="lm-masonry">
      {shown.map((person, index) => <article className="lm-tile" key={person.id}>
        <Link href={'/creators/' + encodeURIComponent(person.username) + (preset ? '?project=' + preset : '')}>
          <span className="lm-still" style={{backgroundImage:'url(' + stills[index % stills.length] + ')'}} />
          <b>{person.display_name}</b>
        </Link>
      </article>)}
    </div>
    {!shown.length && <div className="lm-empty"><strong>No creators found</strong><p>Try another name, skill, or role.</p></div>}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<main className="lm-page"><div className="lm-main">Opening Explore…</div></main>}><ExploreInner/></Suspense>;
}
