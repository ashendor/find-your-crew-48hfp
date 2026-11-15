'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {useCrewUser} from '@/lib/use-crew';
import '../crew-app.css';
import '../two-pillar.css';
import '../dashboard-modern.css';

type RecentMessage={connection_id:string;sender_id:string;body:string;created_at:string};
type LatestChat={name:string;role:string;body:string;created_at:string};

function openActivity(tab:'chats'|'requests'|'invites'='chats'){
 window.dispatchEvent(new CustomEvent('fc:open-inbox',{detail:{tab}}));
}
function relativeTime(date:string){
 const time=Date.parse(date);if(!Number.isFinite(time))return '';
 const mins=Math.max(0,Math.floor((Date.now()-time)/60000));
 if(mins<1)return 'Just now';if(mins<60)return mins+'m ago';
 const hours=Math.floor(mins/60);if(hours<24)return hours+'h ago';
 return Math.floor(hours/24)+'d ago';
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
 const attention=requests+invites;
 return <main className="fc-app fc-duo-app fc-dashboard-v2">
  <CrewNav userName={user.display_name}/>
  <div className="fc-v2-stage">
   <div className="fc-v2-shell">
    <div className="fc-v2-intro"><div><p className="fc-v2-overline"><span/> MY SPACE / YOUR STUDIO</p>
     <h1>Your creative <em>world.</em></h1>
     <p>Hey {firstName}. Find your people. Build your crew. Make something great.</p></div>
     <button type="button" className="fc-v2-header-activity" onClick={()=>openActivity(attention?'requests':'chats')}>
      <span className="fc-v2-status-pulse" aria-hidden="true"/> {attention?attention+' waiting for you':'Chats & activity'} <span>↗</span>
     </button>
    </div>
    <div className="fc-v2-layout">
     <div className="fc-v2-primary">
      <section className="fc-v2-pillars" aria-label="Choose what you want to do">
       <Link href="/discover" className="fc-v2-pillar fc-v2-discover">
        <div className="fc-v2-art" aria-hidden="true"/>
        <div className="fc-v2-pillar-top"><span>01 / FIND YOUR PEOPLE</span><span>↗</span></div>
        <div className="fc-v2-pillar-copy"><div className="fc-v2-pillar-icon">✳</div><h2>Discover</h2><p>Meet filmmakers. Connect and collaborate.</p><span className="fc-v2-linkline">Explore creators <span>→</span></span></div>
       </Link>
       <Link href="/crews" className="fc-v2-pillar fc-v2-crews">
        <div className="fc-v2-art" aria-hidden="true"/>
        <div className="fc-v2-pillar-top"><span>02 / CREATE TOGETHER</span><span>↗</span></div>
        <div className="fc-v2-pillar-copy"><div className="fc-v2-pillar-icon">◎</div><h2>My Crews</h2><p>Create, join and manage your film teams.</p><span className="fc-v2-linkline">{crews?crews+' crew'+(crews===1?'':'s')+' created':'Start your first crew'} <span>→</span></span></div>
       </Link>
      </section>
      <section className="fc-v2-overview" aria-label="Your collaboration at a glance">
       <div className="fc-v2-section-heading"><span>AT A GLANCE</span><span>THE THINGS THAT MATTER</span></div>
       <div className="fc-v2-stats">
        <button type="button" onClick={()=>openActivity('chats')}><span className="fc-v2-stat-icon">◌</span><span><small>Conversations</small><strong>{connections}</strong></span><span className="fc-v2-stat-arrow">↗</span></button>
        <button type="button" onClick={()=>openActivity('requests')} className={requests?'has-alert':''}><span className="fc-v2-stat-icon">♡</span><span><small>Connection requests</small><strong>{requests}</strong></span><span className="fc-v2-stat-arrow">↗</span></button>
        <button type="button" onClick={()=>openActivity('invites')} className={invites?'has-alert':''}><span className="fc-v2-stat-icon">◎</span><span><small>Crew invitations</small><strong>{invites}</strong></span><span className="fc-v2-stat-arrow">↗</span></button>
       </div>
      </section>
      <section className="fc-v2-latest">
       <div className="fc-v2-section-heading"><span>YOUR LATEST CONVERSATION</span><button type="button" onClick={()=>openActivity('chats')}>Open chats ↗</button></div>
       {latest?<button type="button" className="fc-v2-last-message" onClick={()=>openActivity('chats')}><span className="fc-v2-chat-avatar">{latest.name.charAt(0)}</span><span><strong>{latest.name} <small>· {latest.role}</small></strong><span>{latest.body}</span></span><time>{relativeTime(latest.created_at)}</time></button>:<div className="fc-v2-no-messages">No messages yet. The next conversation starts with a connection. <Link href="/discover">Discover people ↗</Link></div>}
      </section>
     </div>
     <aside className="fc-v2-rail" aria-label="Chats, activity and your creator identity">
      <div className="fc-v2-rail-activity">
       <div className="fc-v2-rail-title"><div><span>YOUR CONNECTIONS</span><h2>In the <em>loop.</em></h2></div><button type="button" onClick={()=>openActivity('chats')}>OPEN ↗</button></div>
       <p>Your conversations and invitations, always close by.</p>
       <button type="button" onClick={()=>openActivity('chats')}><span><span className="fc-v2-rail-icon">◌</span> Chats & conversations</span><strong>{connections} ↗</strong></button>
       <button type="button" onClick={()=>openActivity('requests')} className={requests?'has-alert':''}><span><span className="fc-v2-rail-icon">♡</span> Connection requests</span><strong>{requests} ↗</strong></button>
       <button type="button" onClick={()=>openActivity('invites')} className={invites?'has-alert':''}><span><span className="fc-v2-rail-icon">◎</span> Crew invitations</span><strong>{invites} ↗</strong></button>
       <div className="fc-v2-rail-foot"><span className="fc-v2-status-pulse"/>{attention?attention+' pending item'+(attention===1?'':'s')+' to review':'You’re all caught up'}</div>
      </div>
      <div className="fc-v2-card-dock">
       <div className="fc-v2-card-label">✳ &nbsp; YOUR CREATOR CARD <span>ALWAYS YOURS</span></div>
       <div className="fc-v2-card-person"><div className="fc-v2-card-avatar" style={user.avatar_url?{backgroundImage:'url("'+user.avatar_url+'")'}:{}}>{!user.avatar_url&&firstName.slice(0,1).toUpperCase()}</div><div><h3>{user.display_name}</h3><p>{user.primary_role||'Creator'} · {user.location||'Dubai'}</p><span>{user.available_for_collaboration?'● Open to collaborate':'Your creative identity'}</span></div></div>
       <div className="fc-v2-card-actions"><Link href={'/creators/'+encodeURIComponent(user.username)}>View card ↗</Link><Link href="/profile">Edit card ✎</Link></div>
      </div>
     </aside>
    </div>
    <footer className="fc-v2-footer"><span>FIND YOUR CREW · BY LIKEMINDS</span><span>CREATE ✳ CONNECT ✳ COLLABORATE</span></footer>
   </div>
  </div>
 </main>;
}
