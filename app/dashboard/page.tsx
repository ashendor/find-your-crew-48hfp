'use client';

import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {useCrewUser} from '@/lib/use-crew';
import '../crew-app.css';
import '../two-pillar.css';
import '../dashboard-modern.css';
import '../dashboard-clean.css';
import '../brand-skin.css';

type RecentMessage={connection_id:string;sender_id:string;body:string;created_at:string};
type LatestChat={name:string;role:string;body:string;created_at:string};
type ActivityTab='chats'|'requests'|'invites';

function openActivity(tab:ActivityTab='chats'){
 window.dispatchEvent(new CustomEvent('fc:open-inbox',{detail:{tab}}));
}
function relativeTime(date:string){
 const time=Date.parse(date);if(!Number.isFinite(time))return '';
 const mins=Math.max(0,Math.floor((Date.now()-time)/60000));
 if(mins<1)return 'Just now';if(mins<60)return mins+'m ago';
 const hours=Math.floor(mins/60);if(hours<24)return hours+'h ago';
 return Math.floor(hours/24)+'d ago';
}
function AppIcon({name}:{name:'search'|'crew'|'message'|'requests'|'invite'|'arrow'|'edit'|'check'}){
 const paths:Record<string,React.ReactNode>={
  search:<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  crew:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 4 0 16m10-16v16M3 9h4m-4 6h4m10-6h4m-4 6h4"/></>,
  message:<path d="M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5H5l1.7-4.2a8.5 8.5 0 1 1 13.8-4.3Z"/>,
  requests:<><circle cx="9" cy="8" r="3"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M18 9v8m-4-4h8"/></>,
  invite:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 8 9 6 9-6"/></>,
  arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,
  edit:<><path d="M4 20h4L20 8l-4-4L4 16v4Zm10-14 4 4"/></>,
  check:<path d="m4 12 5 5L20 6"/>
 };
 return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Dashboard(){
 const {client,user,userId,loading,error}=useCrewUser();
 const [crews,setCrews]=useState(0),[requests,setRequests]=useState(0),[invites,setInvites]=useState(0),[connections,setConnections]=useState(0);
 const [latest,setLatest]=useState<LatestChat|null>(null);
 const refresh=useCallback(async()=>{if(!client||!userId)return;
  const [crew,connectionRequests,crewInvites,accepted]=await Promise.all([
   client.from('crews').select('id',{count:'exact',head:true}).eq('owner_id',userId),
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',userId).eq('status','pending'),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','invited'),
   client.from('connections').select('id,requester_id,recipient_id').eq('status','accepted').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId)
  ]);
  setCrews(crew.count||0);setRequests(connectionRequests.count||0);setInvites(crewInvites.count||0);
  const list=accepted.data||[];setConnections(list.length);
  if(!list.length){setLatest(null);return}
  const {data:messages}=await client.from('messages').select('connection_id,sender_id,body,created_at').in('connection_id',list.map(x=>x.id)).order('created_at',{ascending:false}).limit(1);
  const last=(messages||[])[0] as RecentMessage|undefined;
  if(!last){setLatest(null);return}
  const source=list.find(x=>x.id===last.connection_id);
  if(!source)return;
  const otherId=source.requester_id===userId?source.recipient_id:source.requester_id;
  const {data:person}=await client.from('profiles').select('display_name,primary_role').eq('id',otherId).maybeSingle();
  setLatest({name:person?.display_name||'A filmmaker',role:person?.primary_role||'Creator',body:last.body,created_at:last.created_at});
 },[client,userId]);
 useEffect(()=>{void refresh();const handle=()=>void refresh();window.addEventListener('fc:activity-changed',handle);return()=>window.removeEventListener('fc:activity-changed',handle)},[refresh]);
 if(loading||!user)return <main className="fc-app"><div className="fc-main">{error||'Opening your creative space…'}</div></main>;
 const firstName=(user.display_name||user.username).trim().split(/\s+/)[0];
 const pending=requests+invites;
 const profileUrl='/creators/'+encodeURIComponent(user.username);
 return <main className="fc-app fc-duo-app fc-dashboard-v2 fc-dashboard-clean">
  <CrewNav userName={user.display_name}/>
  <div className="fd-workspace">
   <div className="fd-inner">
    <header className="fd-welcome">
     <div className="fd-intro"><span className="fd-eyebrow">YOUR WORKSPACE</span><h1>Hey {firstName}<span className="fd-spark">.</span></h1><p>Find your people, build a crew, and get making.</p></div>
     <button type="button" className={'fd-inbox-shortcut'+(pending?' has-pending':'')} onClick={()=>openActivity(pending?(requests?'requests':'invites'):'chats')}><AppIcon name="message"/><span>{pending?pending+' item'+(pending===1?'':'s')+' need your attention':'Open inbox'}</span><AppIcon name="arrow"/></button>
    </header>
    <div className="fd-grid">
     <div className="fd-main">
      <section className="fd-section" aria-labelledby="fd-start-heading">
       <div className="fd-section-heading"><div><span className="fd-eyebrow">01 / START HERE</span><h2 id="fd-start-heading">What would you like to do?</h2></div></div>
       <div className="fd-actions">
        <Link href="/discover" className="fd-action fd-action-primary"><span className="fd-action-icon"><AppIcon name="search"/></span><span className="fd-action-content"><strong>Discover filmmakers</strong><small>Explore people and send a connection request.</small></span><span className="fd-action-arrow"><AppIcon name="arrow"/></span></Link>
        <Link href="/crews" className="fd-action"><span className="fd-action-icon"><AppIcon name="crew"/></span><span className="fd-action-content"><strong>My crews</strong><small>{crews?crews+' crew'+(crews===1?'':'s')+' created':'Create or manage a filmmaking team.'}</small></span><span className="fd-action-arrow"><AppIcon name="arrow"/></span></Link>
       </div>
      </section>
      <section className="fd-section" aria-labelledby="fd-activity-heading">
       <div className="fd-section-heading"><div><span className="fd-eyebrow">02 / STAY CONNECTED</span><h2 id="fd-activity-heading">Your activity</h2></div><span className="fd-quiet-label">{pending?pending+' awaiting response':'All caught up'}</span></div>
       <div className="fd-activity-grid">
        <button type="button" onClick={()=>openActivity('chats')} className="fd-activity"><span className="fd-activity-icon"><AppIcon name="message"/></span><strong>{connections}</strong><span>Conversations</span><AppIcon name="arrow"/></button>
        <button type="button" onClick={()=>openActivity('requests')} className={'fd-activity'+(requests?' needs-attention':'')}><span className="fd-activity-icon"><AppIcon name="requests"/></span><strong>{requests}</strong><span>Requests</span><AppIcon name="arrow"/></button>
        <button type="button" onClick={()=>openActivity('invites')} className={'fd-activity'+(invites?' needs-attention':'')}><span className="fd-activity-icon"><AppIcon name="invite"/></span><strong>{invites}</strong><span>Crew invites</span><AppIcon name="arrow"/></button>
       </div>
      </section>
      <section className="fd-section fd-conversation" aria-labelledby="fd-chat-heading">
       <div className="fd-section-heading"><div><span className="fd-eyebrow">03 / PICK UP WHERE YOU LEFT OFF</span><h2 id="fd-chat-heading">Latest conversation</h2></div><button type="button" className="fd-text-action" onClick={()=>openActivity('chats')}>All chats <AppIcon name="arrow"/></button></div>
       {latest?<button type="button" className="fd-chat-row" onClick={()=>openActivity('chats')}><span className="fd-chat-avatar">{latest.name.charAt(0).toUpperCase()}</span><span className="fd-chat-copy"><strong>{latest.name} <span>· {latest.role}</span></strong><small>{latest.body}</small></span><time>{relativeTime(latest.created_at)}</time><AppIcon name="arrow"/></button>:<div className="fd-empty-chat"><p>No conversations yet. Discover a creator and say hello.</p><Link href="/discover">Find filmmakers <AppIcon name="arrow"/></Link></div>}
      </section>
     </div>
     <aside className="fd-side" aria-labelledby="fd-profile-heading">
      <div className="fd-profile-card">
       <div className="fd-profile-top"><span className="fd-eyebrow">YOUR CREATOR CARD</span><span className="fd-profile-tag">YOUR IDENTITY</span></div>
       <div className="fd-profile-person"><div className="fd-profile-avatar" style={user.avatar_url?{backgroundImage:'url("'+user.avatar_url+'")'}:{}}>{!user.avatar_url&&firstName.slice(0,1).toUpperCase()}</div><div className="fd-profile-name"><h2 id="fd-profile-heading">{user.display_name}</h2><p>{user.primary_role||'Creator'} · {user.location||'Dubai'}</p><span className="fd-availability"><i/>{user.available_for_collaboration?'Open to collaborate':'Your creative profile'}</span></div></div>
       <div className="fd-profile-buttons"><Link href={profileUrl}>View profile <AppIcon name="arrow"/></Link><Link href="/profile">Edit profile <AppIcon name="edit"/></Link></div>
      </div>
      <div className="fd-tip"><span className="fd-eyebrow">THE NEXT STEP</span><p>Great films start with people. Find a collaborator or invite someone into your crew.</p><Link href="/discover">Explore creators <AppIcon name="arrow"/></Link></div>
     </aside>
    </div>
    <footer className="fd-footer">FIND YOUR CREW <span>BY LIKEMINDS · DUBAI 2026</span></footer>
   </div>
  </div>
 </main>;
}
