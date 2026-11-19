'use client';
import {FormEvent, Suspense, useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {getCrewSupabase} from '@/lib/crew-supabase';
import {leadJoinRequests} from '@/lib/team-joins';
import {armLoader} from '@/components/RouteLoader';
import CreateSheet from '@/components/CreateSheet';
import {projectTitle,type Creator,type Project} from '@/lib/crew-types';
import { appPath, withBasePath } from '@/lib/base-path';

const items = [
  {href:'/home', label:'Home'},
  {href:'/explore', label:'Explore'},
  {href:'/create', label:'Create'},
  {href:'/inbox', label:'Inbox'},
  {href:'/profile', label:'Profile'},
] as const;

function Icon({name}:{name:string}){
  const common = {width:20, height:20, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.8, 'aria-hidden':true as const};
  if (name === 'Home') return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>;
  if (name === 'Explore') return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>;
  if (name === 'Inbox') return <svg {...common}><path d="M7 16.5 4.5 19.5v-11A2.5 2.5 0 0 1 7 6h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 17H9z"/></svg>;
  if (name === 'Profile') return <svg {...common}><circle cx="12" cy="8" r="3.2"/><path d="M5 19c1.4-3 3.6-4.5 7-4.5S17.6 16 19 19"/></svg>;
  return <svg {...common} strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>;
}

function useDeskAccount(){
  const [me, setMe] = useState<Creator | null>(null);
  const [dot, setDot] = useState(false);
  const [featured, setFeatured] = useState<Project | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1180px)');
    const client = getCrewSupabase();
    if (!client) return;
    let active = true;
    const load = () => {
      if (!desktop.matches) return;
      void (async () => {
      const {data:{user}} = await client.auth.getUser();
      if (!active || !user) return;
      const [profile, waiting, feature, joins] = await Promise.all([
        client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        client.from('connections').select('id', {count:'exact', head:true}).eq('recipient_id', user.id).eq('status', 'pending'),
        client.from('projects').select('*').eq('status', 'published').eq('featured', true).order('created_at', {ascending:false}).limit(1).maybeSingle(),
        leadJoinRequests(client, user.id),
      ]);
      if (!active) return;
      setMe((profile.data as Creator) || null);
      setDot((waiting.count || 0) + joins.length > 0);
      setFeatured((feature.data as Project) || null);
    })();
    };
    load();
    const poke = () => { if (document.visibilityState === 'visible') load(); };
    desktop.addEventListener('change', load);
    window.addEventListener('focus', poke);
    document.addEventListener('visibilitychange', poke);
    const timer = window.setInterval(poke, 15000);
    return () => { active = false; desktop.removeEventListener('change', load); window.removeEventListener('focus', poke); document.removeEventListener('visibilitychange', poke); window.clearInterval(timer); };
  }, []);
  return {me, dot, featured};
}

export function WebSide(){
  const path = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const {dot, featured} = useDeskAccount();
  const current = (href:string) => {
    if (href === '/profile') return path.startsWith('/profile') || path.startsWith('/crews') || path.startsWith('/teams');
    if (href === '/explore') return path === '/explore' || path.startsWith('/creators');
    if (href === '/home') return path === '/home' || path.startsWith('/projects');
    return path === href;
  };
  return <aside className="lm-webchrome">
    <Link className="lm-webmark" href="/home">LikeMinds</Link>
    <nav aria-label="LikeMinds">
      {items.map(item => item.label === 'Create' ? <button key={item.href} type="button" aria-expanded={createOpen} onClick={() => setCreateOpen(value => !value)}><Icon name={item.label} />{item.label}</button> : <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}><Icon name={item.label} />{item.label}{item.href === '/inbox' && dot && <i className="lm-webdot" aria-label="New"/>}</Link>)}
    </nav>
    <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    <Link className="lm-webfeature" href={featured ? '/projects/' + featured.id : '/home'}>
      <img src={withBasePath("/brand/past-jbr-finals.jpg")} alt="" />
      <span>{featured ? projectTitle(featured) : 'Featured project'}<em aria-hidden="true">→</em></span>
    </Link>
  </aside>;
}

function SearchQuery({onChange}:{onChange:(value:string)=>void}){
  const q = useSearchParams().get('q') || '';
  useEffect(() => { onChange(q); }, [q, onChange]);
  return null;
}

export function WebTop(){
  const router = useRouter();
  const {me, dot} = useDeskAccount();
  const [text, setText] = useState('');
  const applyQuery = useCallback((value:string) => setText(value), []);
  function search(e:FormEvent){
    e.preventDefault();
    const next = new URLSearchParams();
    if (text.trim()) next.set('q', text.trim());
    const dest = '/explore' + (next.toString() ? '?' + next.toString() : '');
    if (dest !== appPath(window.location.pathname + window.location.search)) armLoader();
    router.push(dest);
  }
  return <div className="lm-webtop">
    <Suspense fallback={null}><SearchQuery onChange={applyQuery} /></Suspense>
    <form onSubmit={search}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label="Search people or teams" placeholder="Search people or teams" value={text} onChange={e => setText(e.target.value)} />
    </form>
    <Link className="lm-iconbtn" href="/inbox?tab=requests" aria-label="Notifications" onClick={() => window.dispatchEvent(new Event('lm:requests'))}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>{dot && <span className="lm-dot"/>}</Link>
    <Link className="lm-webme" href="/profile" aria-label="Profile">{me?.avatar_url ? <img src={me.avatar_url} alt="" /> : <span>{(me?.display_name || 'L').slice(0,1)}</span>}</Link>
    <Link className="lm-webchev" href="/profile?tab=settings" aria-label="Settings">▾</Link>
  </div>;
}
