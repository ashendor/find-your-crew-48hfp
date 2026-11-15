'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function CrewNav({userName}:{userName?:string}){
 const path=usePathname();
 return <header className="fc-nav"><Link href="/dashboard" className="fc-wordmark">FIND YOUR CREW<span>BY LIKEMINDS · DUBAI '26</span></Link><nav aria-label="Your crew space">{[{href:'/dashboard',label:'My Space'},{href:'/discover',label:'Discover'},{href:'/crews',label:'My Crews'},{href:'/connections',label:'Connections'},{href:'/profile',label:'My Card'}].map(x=><Link key={x.href} href={x.href} aria-current={path===x.href?'page':undefined}>{x.label}</Link>)}</nav><Link className="fc-nav-user" href="/profile">{userName||'MY PROFILE'} ↗</Link></header>
}
