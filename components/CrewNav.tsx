'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

export default function CrewNav({userName}:{userName?:string}){
 const path=usePathname();
 return <header className="fc-nav fc-nav--studio">
   <Link href="/" className="fc-wordmark" title="Find Your Crew homepage">FIND YOUR CREW<span>BY LIKEMINDS · DUBAI '26</span></Link>
   <nav aria-label="Your creative workspace">
     <Link href="/dashboard" aria-current={path==='/dashboard'?'page':undefined}>My Space</Link>
     <Link href="/discover" aria-current={path==='/discover'?'page':undefined}>Discover</Link>
     <Link href="/connections" aria-current={path==='/connections'?'page':undefined}>Connections</Link>
   </nav>
   <details className="fc-account-menu">
     <summary aria-label="Account menu"><span className="fc-account-avatar" aria-hidden="true">{(userName||'C').trim().charAt(0).toUpperCase()}</span><span className="fc-account-name">{userName||'My Account'}</span><span aria-hidden="true">⌄</span></summary>
     <div className="fc-account-dropdown">
       <div className="fc-account-dropdown-label">YOUR CREATIVE SPACE</div>
       <Link href="/profile">My Creator Card ↗</Link>
       <Link href="/crews">My Crews ↗</Link>
       <Link href="/">Back to Homepage ↗</Link>
       <div className="fc-menu-rule"/>
       <SignOutButton className="fc-menu-signout"/>
     </div>
   </details>
 </header>;
}
