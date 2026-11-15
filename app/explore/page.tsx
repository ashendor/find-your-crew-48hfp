'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import ConnectSheet from '@/components/ConnectSheet';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,type Creator} from '@/lib/crew-types';
import '../crew-app.css';
import '../platform.css';
import '../brand-skin.css';

function ExploreInner(){
  const {client,user,userId,loading} = useCrewUser();
  const params = useSearchParams();
  const preset = params.get('project') || undefined;
  const [people,setPeople] = useState<Creator[]>([]);
  const [role,setRole] = useState('All');
  const [query,setQuery] = useState('');
  const [target,setTarget] = useState<Creator|null>(null);
  useEffect(() => {
    if (!client || !userId) return;
    void client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('display_name').limit(200)
      .then(({data}) => setPeople((data || []) as Creator[]));
  }, [client, userId]);
  const shown = useMemo(() => people.filter(person => {
    const hay = (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '') + ' ' + (person.skills_tags || []).join(' ') + ' ' + (person.categories || []).join(' ') + ' ' + (person.bio || '')).toLowerCase();
    return (role === 'All' || person.primary_role === role || person.categories?.includes(role)) && hay.includes(query.toLowerCase());
  }), [people, role, query]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening Explore…</div></main>;
  return <PlatformShell>
    <p className="lm-kicker">Explore</p>
    <h1>Find creators.</h1>
    <div className="lm-row">
      <input className="lm-field" style={{maxWidth:360}} aria-label="Search creators" placeholder="Name, role, skill or interest" value={query} onChange={e => setQuery(e.target.value)} />
    </div>
    <div className="lm-tabs" role="group" aria-label="Roles">
      {['All', ...ROLES].map(item => <button key={item} className={role === item ? 'on' : ''} type="button" onClick={() => setRole(item)}>{item}</button>)}
    </div>
    <div className="lm-grid">
      {shown.map(person => <article className="lm-card" key={person.id}>
        <Link href={'/creators/' + encodeURIComponent(person.username)}><strong>{person.display_name}</strong></Link>
        <p>{person.primary_role || 'Creator'}{person.location ? ' · ' + person.location : ''}</p>
        <button className="fc-btn" type="button" onClick={() => setTarget(person)}>Connect</button>
      </article>)}
    </div>
    {!shown.length && <p className="lm-muted">No creators match that search.</p>}
    {target && <ConnectSheet open onClose={() => setTarget(null)} recipientId={target.id} recipientName={target.display_name} presetProjectId={preset} />}
  </PlatformShell>;
}

export default function ExplorePage(){
  return <Suspense fallback={<main className="lm-page"><div className="lm-main">Opening Explore…</div></main>}><ExploreInner/></Suspense>;
}
