'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {useCrewUser} from '@/lib/use-crew';
import '../crew-app.css';
import '../two-pillar.css';

export default function Dashboard(){
 const {client,user,userId,loading,error}=useCrewUser();
 const [crewCount,setCrewCount]=useState(0),[requests,setRequests]=useState(0),[invites,setInvites]=useState(0),[connections,setConnections]=useState(0);
 useEffect(()=>{if(!client||!userId)return;let mounted=true;(async()=>{
  const [a,b,c,d]=await Promise.all([
   client.from('crews').select('id',{count:'exact',head:true}).eq('owner_id',userId),
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',userId).eq('status','pending'),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','invited'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('status','accepted').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId)
  ]);
  if(mounted){setCrewCount(a.count||0);setRequests(b.count||0);setInvites(c.count||0);setConnections(d.count||0)}
 })();return()=>{mounted=false}},[client,userId]);
 if(loading||!user)return <main className="fc-app"><div className="fc-main">{error||'Opening your creative world…'}</div></main>;
 const firstName=(user.display_name||user.username).trim().split(/\s+/)[0];
 const pending=requests+invites;
 const openInbox=()=>window.dispatchEvent(new Event('fc:open-inbox'));
 return <main className="fc-app fc-duo-app">
  <CrewNav userName={user.display_name}/>
  <div className="fc-duo-scene">
   <div className="fc-duo-hero-photo" aria-hidden="true"/>
   <div className="fc-duo-film-edge" aria-hidden="true"/>
   <div className="fc-duo-container">
    <section className="fc-duo-intro">
     <p className="fc-duo-kicker"><span/> MY SPACE / YOUR CREATIVE WORLD</p>
     <h1>Welcome to your<br/><em>creative world.</em></h1>
     <p>Hey {firstName}. Find your people. Build your crew. Bring ideas to life.</p>
    </section>
    <div className="fc-duo-composition">
     <section className="fc-duo-choices" aria-label="The two ways to create">
      <Link className="fc-duo-choice fc-duo-choice-discover" href="/discover">
       <div className="fc-duo-choice-photo" aria-hidden="true"/>
       <div className="fc-duo-choice-overlay" aria-hidden="true"/>
       <div className="fc-duo-choice-inner">
        <div className="fc-duo-choice-top"><span>01 / FIND YOUR PEOPLE</span><span>↗</span></div>
        <div className="fc-duo-choice-bottom">
         <div className="fc-duo-choice-emblem" aria-hidden="true">✳</div>
         <h2>Discover</h2><p>Find people, connect, chat, invite.</p>
         <div className="fc-duo-choice-cta"><span>Explore Creators</span><span className="fc-duo-choice-circle">→</span></div>
        </div>
       </div>
      </Link>
      <Link className="fc-duo-choice fc-duo-choice-crews" href="/crews">
       <div className="fc-duo-choice-photo" aria-hidden="true"/>
       <div className="fc-duo-choice-overlay" aria-hidden="true"/>
       <div className="fc-duo-choice-inner">
        <div className="fc-duo-choice-top"><span>02 / CREATE TOGETHER</span><span>↗</span></div>
        <div className="fc-duo-choice-bottom">
         <div className="fc-duo-choice-emblem" aria-hidden="true">◎</div>
         <h2>My Crews</h2><p>Create a crew, invite, join, manage.</p>
         <div className="fc-duo-choice-cta"><span>{crewCount?crewCount+' crew'+(crewCount===1?'':'s')+' in your space':'Your crew starts here'}</span><span className="fc-duo-choice-circle">→</span></div>
        </div>
       </div>
      </Link>
     </section>
     <aside className="fc-duo-side" aria-label="Your creative activity">
      <div className="fc-duo-side-heading"><span className="fc-duo-side-flare">✳</span><p>JUST AROUND THE CORNER</p><h3>Stay in the <em>loop.</em></h3><p>Your conversations and invitations, without another dashboard to manage.</p></div>
      <button type="button" onClick={openInbox} className="fc-duo-activity-button">
       <span className="fc-duo-activity-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H5l2-4a8 8 0 1 1 13-4Z"/></svg> Chats & Activity <span>↗</span></span>
       <span className="fc-duo-activity-row"><span>Connection requests</span><strong>{requests}</strong></span>
       <span className="fc-duo-activity-row"><span>Crew invitations</span><strong>{invites}</strong></span>
       <span className="fc-duo-activity-row"><span>Connected filmmakers</span><strong>{connections}</strong></span>
       <span className="fc-duo-activity-foot">{pending?'You have '+pending+' item'+(pending===1?'':'s')+' waiting for you':'All caught up. Good things are coming.'}<span>OPEN ↗</span></span>
      </button>
      <Link className="fc-duo-identity-link" href="/profile"><span className="fc-duo-identity-avatar" style={user.avatar_url?{backgroundImage:'url("'+user.avatar_url+'")'}:{}}>{!user.avatar_url&&firstName.slice(0,1).toUpperCase()}</span><span><small>YOUR CREATIVE IDENTITY</small><strong>My Creator Card</strong></span><span>↗</span></Link>
     </aside>
    </div>
    <footer className="fc-duo-footer"><span>BY LIKEMINDS · DUBAI '26</span><span>CREATE <b>✳</b> CONNECT <b>✳</b> COLLABORATE</span></footer>
   </div>
   <div className="fc-duo-filmstrip" aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
  </div>
 </main>;
}
