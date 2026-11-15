'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';

const items = [
  {href:'/home', label:'Home'},
  {href:'/explore', label:'Explore'},
  {href:'/create', label:'Create', plus:true},
  {href:'/inbox', label:'Inbox'},
  {href:'/profile', label:'Profile'},
] as const;

export default function PlatformNav(){
  const path = usePathname();
  const current = (href:string) => {
    if (href === '/profile' && (path.startsWith('/crews') || path.startsWith('/projects') || path.startsWith('/creators'))) return true;
    return path === href || path.startsWith(href + '/');
  };
  return <>
    <header className="lm-bar">
      <Link href="/home" className="lm-brand">LIKEMINDS<small>CREATIVE COMMUNITY</small></Link>
      <nav className="lm-links" aria-label="LikeMinds">
        {items.map(item => 'plus' in item
          ? <Link key={item.href} href={item.href} className="lm-plus" aria-current={current(item.href) ? 'page' : undefined} aria-label="Create">+</Link>
          : <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}>{item.label}</Link>)}
      </nav>
    </header>
    <nav className="lm-bottom" aria-label="LikeMinds">
      {items.map(item => <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}>{'plus' in item ? '+' : item.label}</Link>)}
    </nav>
  </>;
}

export function PlatformShell({children}:{children:ReactNode}){
  return <div className="lm-page"><PlatformNav/><main className="lm-main">{children}</main></div>;
}
