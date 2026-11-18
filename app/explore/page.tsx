'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,type Creator} from '@/lib/crew-types';
import '../platform.css';

const stills = ['/brand/poster-heist.jpg','/brand/poster-disaster.jpg','/brand/poster-scifi.jpg','/brand/poster-silent-film.jpg','/brand/poster-documentary.jpg','/brand/poster-western.jpg','/brand/past-jbr-finals.jpg','/brand/past-crew-at-monitor-2019.jpg','/brand/poster-noir.jpg','/brand/poster-horror.jpg'];
const chips = ['All', ...ROLES];

function ExploreInner(){
  const {client,user,userId,loading} = useCrewUser();
  const params = useSearchParams();
  const [people,setPeople] = useState<Creator[]>([]);
  const [role,setRole] = useState('All');
  const q = params.get('q') || '';
  const [query,setQuery] = useState(q);
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (!client || !userId) return;
    void client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200).then(({data}) => {
      setPeople((data || []) as Creator[]);
    });
  }, [client, userId]);
  const shownPeople = useMemo(() => people.filter(person => {
    const hay = (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '') + ' ' + (person.skills_tags || []).join(' ') + ' ' + (person.categories || []).join(' ') + ' ' + (person.bio || '')).toLowerCase();
    const known = chips.includes(role) || ROLES.includes(role);
    return (!known || role === 'All' || person.primary_role === role || person.categories?.includes(role)) && hay.includes(query.toLowerCase());
  }), [people, role, query]);
  if (loading || !user) return <FilmLoader delay={600} />;
  return <PlatformShell>
    <header className="lm-top">
      <h1 className="lm-title">Explore</h1>
      <HeaderActions />
    </header>
    <label className="lm-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label="Search people" placeholder="Search by name or skill" value={query} onChange={e => setQuery(e.target.value)} />
    </label>
      <div className="lm-filters" role="group" aria-label="Roles">
        {chips.map(item => <button key={item} className={role === item ? 'on' : ''} type="button" onClick={() => setRole(item)}>{item}</button>)}
      </div>
      <div className="lm-masonry">
        {shownPeople.map((person, index) => <article className="lm-tile" key={person.id}>
          <Link href={'/creators/' + encodeURIComponent(person.username)}>
            <span className="lm-still" style={{backgroundImage:'url(' + stills[index % stills.length] + ')'}} />
            <b>{person.display_name}</b>
          </Link>
        </article>)}
      </div>
      {!shownPeople.length && <div className="lm-empty"><strong>No people found</strong><p>Try another name, skill, or role.</p></div>}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<FilmLoader delay={600} />}><ExploreInner/></Suspense>;
}
