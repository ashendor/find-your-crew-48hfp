'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import CrewInboxDrawer from '@/components/CrewInboxDrawer';
import {getCrewSupabase} from '@/lib/crew-supabase';
import '@/app/dashboard-modern.css';
type InboxTab='chats'|'requests'|'invites';

export default function CrewNav({userName}:{userName?:string}){
 const path=usePathname();
 const [inboxOpen,setInboxOpen]=useState(false);
 const [tab,setTab]=useState<InboxTab>('chats');
 const [requests,setRequests]=useState(0),[invites,setInvites]=useState(0);
 const [connected,setConnected]=useState(0);
 const refresh=useCallback(async()=>{const client=getCrewSupabase();if(!client)return;
  const {data:{user}}=await client.auth.getUser();if(!user)return;
  const [a,b,c]=await Promise.all([
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',user.id).eq('status','pending'),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('status','invited'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('status','accepted').or('requester_id.eq.'+user.id+',recipient_id.eq.'+user.id)
  ]);
  setRequests(a.count||0);setInvites(b.count||0);setConnected(c.count||0);
 },[]);
 const openTab=useCallback((next:InboxTab)=>{setTab(next);setInboxOpen(true)},[]);
 useEffect(()=>{const open=(event:Event)=>{const detail=(event as CustomEvent<{tab?:InboxTab}>).detail;openTab(detail?.tab||'chats')};window.addEventListener('fc:open-inbox',open);return()=>window.removeEventListener('fc:open-inbox',open)},[openTab]);
 useEffect(()=>{void refresh();const handler=()=>void refresh();window.addEventListener('fc:activity-changed',handler);const interval=window.setInterval(()=>void refresh(),30000);return()=>{window.removeEventListener('fc:activity-changed',handler);window.clearInterval(interval)}},[refresh]);
 useEffect(()=>{if(!inboxOpen)void refresh()},[inboxOpen,refresh]);
 return <>
  <header className="fc-nav fc-nav--studio fc-nav--two-pillar fc-nav--activity">
   <Link href="/" className="fc-wordmark" title="Find Your Crew homepage">FIND YOUR CREW<span>BY LIKEMINDS · DUBAI '26</span></Link>
   <nav aria-label="Your creative workspace">
    <Link href="/dashboard" aria-current={path==='/dashboard'?'page':undefined}>My Space</Link>
    <Link href="/discover" aria-current={path==='/discover'?'page':undefined}>Discover</Link>
    <Link href="/crews" aria-current={path==='/crews'?'page':undefined}>My Crews</Link>
   </nav>
   <div className="fc-two-nav-actions">
    <button type="button" className={'fc-alert-trigger'+(requests+invites?' has-pending':'')} onClick={()=>openTab(requests?'requests':invites?'invites':'chats')} aria-label={'Activity and invitations'+(requests+invites?' — '+(requests+invites)+' pending':'')} title="Requests and invitations">
     <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>
     {(requests+invites)>0&&<span className="fc-nav-count">{requests+invites}</span>}
    </button>
    <button type="button" className="fc-chat-trigger fc-chat-trigger-v2" onClick={()=>openTab('chats')} aria-label={'Open chats — '+connected+' connections'} title="Chats and conversations"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l1.6-4A8 8 0 1 1 20 11.5Z"/></svg>{connected>0&&<span className="fc-chat-available" aria-hidden="true"/>}</button>
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
  <CrewInboxDrawer open={inboxOpen} initialTab={tab} onClose={()=>setInboxOpen(false)}/>
 </>;
}
