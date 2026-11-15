'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

const items = [
 {href:'/dashboard',label:'My Space'},
 {href:'/discover',label:'Discover'},
 {href:'/crews',label:'My Crews'},
 {href:'/connections',label:'Connections'},
 {href:'/profile',label:'My Card'},
];

export default function CrewNav({userName}:{userName?:string}){
 const path=usePathname();
 return <header className="fc-nav">
   <Link href="/" className="fc-wordmark" title="Find Your Crew homepage">FIND YOUR CREW<span>BY LIKEMINDS · DUBAI '26</span></Link>
   <nav aria-label="Your crew space">{items.map(item=><Link key={item.href} href={item.href} aria-current={path===item.href?'page':undefined}>{item.label}</Link>)}</nav>
   <div className="fc-nav-account">
     <Link className="fc-nav-user" href="/profile" title="Edit your Creator Card">{userName||'My Profile'} ↗</Link>
     <SignOutButton />
   </div>
 </header>;
}
