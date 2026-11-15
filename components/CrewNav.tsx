'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import CrewInboxDrawer from '@/components/CrewInboxDrawer';
import {getCrewSupabase} from '@/lib/crew-supabase';

export default function CrewNav({userName}:{userName?:string}){
 const path=usePathname();
 const [inboxOpen,setInboxOpen]=useState(false);
 const [pendingCount,setPendingCount]=useState(0);
 useEffect(()=>{const open=()=>setInboxOpen(true);window.addEventListener('fc:open-inbox',open);return()=>window.removeEventListener('fc:open-inbox',open)},[]);
 useEffect(()=>{if(inboxOpen)return;const client=getCrewSupabase();if(!client)return;let active=true;(async()=>{const {data:{user}}=await client.auth.getUser();if(!user)return;const [a,b]=await Promise.all([client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',user.id).eq('status','pending'),client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('status','invited')]);if(active)setPendingCount((a.count||0)+(b.count||0))})();return()=>{active=false}},[inboxOpen]);
 return <>
  <header className="fc-nav fc-nav--studio fc-nav--two-pillar">
   <Link href="/" className="fc-wordmark" title="Find Your Crew homepage">FIND YOUR CREW<span>BY LIKEMINDS · DUBAI '26</span></Link>
   <nav aria-label="Your creative workspace">
    <Link href="/dashboard" aria-current={path==='/dashboard'?'page':undefined}>My Space</Link>
    <Link href="/discover" aria-current={path==='/discover'?'page':undefined}>Discover</Link>
    <Link href="/crews" aria-current={path==='/crews'?'page':undefined}>My Crews</Link>
   </nav>
   <div className="fc-two-nav-actions">
    <button type="button" className="fc-chat-trigger" onClick={()=>setInboxOpen(true)} aria-label="Open chats and activity" title="Chats and Activity"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l1.6-4A8 8 0 1 1 20 11.5Z"/></svg>{pendingCount>0&&<span className="fc-chat-trigger-dot" aria-hidden="true"/>}</button>
    <details className="fc-account-menu">
     <summary aria-label="Account menu"><span className="fc-account-avatar" aria-hidden="true">{(userName||'C').trim().charAt(0).toUpperCase()}</span><span className="fc-account-name">{userName||'My Account'}</span><span aria-hidden="true">⌄</span></summary>
     <div className="fc-account-dropdown">
      <div className="fc-account-dropdown-label">YOUR CREATIVE SPACE</div>
      <Link href="/profile">My Creator Card ↗</Link>
      <Link href="/">Back to Homepage ↗</Link>
      <div className="fc-menu-rule"/>
      <SignOutButton className="fc-menu-signout"/>
     </div>
    </details>
   </div>
  </header>
  <CrewInboxDrawer open={inboxOpen} onClose={()=>setInboxOpen(false)}/>
 </>;
}
