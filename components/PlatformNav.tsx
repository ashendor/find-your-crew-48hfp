'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState, type ReactNode} from 'react';
import {NavigationTrail} from '@/components/BackButton';
import CreateSheet from '@/components/CreateSheet';
import Motion from '@/components/Motion';
import {WebSide, WebTop} from '@/components/WebChrome';

const items = [
  {href:'/home', label:'Home'},
  {href:'/explore', label:'Explore'},
  {href:'/create', label:'Create', plus:true},
  {href:'/inbox', label:'Inbox'},
  {href:'/profile', label:'Profile'},
] as const;

function Icon({name}:{name:string}){
  const common = {width:22, height:22, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.8, 'aria-hidden':true as const};
  if (name === 'home') return <svg {...common}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>;
  if (name === 'explore') return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>;
  if (name === 'inbox') return <svg {...common}><path d="M7 16.5 4.5 19.5v-11A2.5 2.5 0 0 1 7 6h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 17H9z"/></svg>;
  if (name === 'profile') return <svg {...common}><circle cx="12" cy="8" r="3.2"/><path d="M5 19c1.4-3 3.6-4.5 7-4.5S17.6 16 19 19"/></svg>;
  return <svg {...common} strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>;
}

export default function PlatformNav(){
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  const current = (href:string) => {
    if (href === '/profile' && (path.startsWith('/crews') || path.startsWith('/teams') || path.startsWith('/projects') || path.startsWith('/creators'))) return true;
    return path === href || path.startsWith(href + '/');
  };
  return <>
    <CreateSheet open={open} onClose={() => setOpen(false)} />
    <nav className="lm-bottom" aria-label="LikeMinds">
      {items.map(item => 'plus' in item ? <button key={item.href} className="lm-plus" type="button" aria-label="Create" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <Icon name="plus" />
      </button> : <Link key={item.href} href={item.href} aria-label={item.label} aria-current={current(item.href) ? 'page' : undefined}>
        <Icon name={item.label.toLowerCase()} />
      </Link>)}
    </nav>
  </>;
}

export function PlatformShell({children}:{children:ReactNode}){
  return <div className="lm-page"><NavigationTrail /><div className="lm-frame"><WebSide /><div className="lm-stage"><WebTop /><main className="lm-main"><Motion>{children}</Motion></main></div><PlatformNav/></div></div>;
}
