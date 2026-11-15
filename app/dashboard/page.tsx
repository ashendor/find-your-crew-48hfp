'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useCrewUser} from '@/lib/use-crew';
import CrewNav from '@/components/CrewNav';
import '../crew-app.css';

export default function Dashboard(){
 const {client,user,userId,loading,error}=useCrewUser();
 const [crewCount,setCrewCount]=useState(0),[invites,setInvites]=useState(0),[requests,setRequests]=useState(0),[connections,setConnections]=useState(0);
 useEffect(()=>{if(!client||!userId)return;let active=true;(async()=>{
  const [crews,crewInvites,connectionRequests,accepted]=await Promise.all([
   client.from('crews').select('id',{count:'exact',head:true}).eq('owner_id',userId),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','invited'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',userId).eq('status','pending'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('status','accepted').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId)
  ]);
  if(active){setCrewCount(crews.count||0);setInvites(crewInvites.count||0);setRequests(connectionRequests.count||0);setConnections(accepted.count||0)}
 })();return()=>{active=false}},[client,userId]);
 if(loading||!user)return <main className="fc-app"><div className="fc-main">{error||'Opening your creative space…'}</div></main>;
 const attention=invites+requests;
 const firstName=(user.display_name||user.username).trim().split(/\s+/)[0];
 const actions=[
 {href:'/discover',icon:'◈',eyebrow:'01 / MEET PEOPLE',title:'Discover Creators',desc:'Find the right creative people for your next film.',cta:'Explore creators ↗',kind:'primary'},
 {href:'/crews',icon:'◎',eyebrow:'02 / BUILD TOGETHER',title:'My Crews',desc:crewCount?crewCount+' crew'+(crewCount===1?'':'s')+' created · Manage your people':'Create a crew and invite collaborators.',cta:'Open my crews ↗',kind:'neutral'},
 {href:'/connections',icon:'♡',eyebrow:'03 / SAY HELLO',title:'Connections',desc:requests?requests+' request'+(requests===1?'':'s')+' awaiting your response':connections?connections+' creator'+(connections===1?'':'s')+' connected':'Requests, messages and conversations.',cta:'Open connections ↗',kind:'neutral'}
 ];
 return <main className="fc-app fc-app--cinematic"><CrewNav userName={user.display_name}/><div className="fc-command-shell">
   <section className="fc-command-intro">
     <p className="fc-eyebrow">YOUR CREATIVE COMMAND CENTRE <span className="fc-command-dash">/</span> DUBAI 2026</p>
     <h1>Hey, <em>{firstName}.</em></h1>
     <p>What will you create next? Your people, your crews, your next great film — all in one place.</p>
   </section>
   <section className="fc-command-grid" aria-label="Choose your next move">
     <Link href="/discover" className="fc-command-feature">
       <div className="fc-command-photo" aria-hidden="true"/>
       <div className="fc-command-photo-shade" aria-hidden="true"/>
       <div className="fc-command-feature-content">
         <span className="fc-command-label">THE NEXT CONNECTION STARTS HERE</span>
         <div><h2>Find your<br/><em>people.</em></h2><p>Discover filmmakers who can bring your story to life.</p><span className="fc-command-feature-cta">Discover Creators <span>↗</span></span></div>
       </div>
     </Link>
     <Link href="/profile" className="fc-command-profile">
       <span className="fc-command-label">YOUR CREATOR IDENTITY <span>↗</span></span>
       <div className="fc-command-profile-portrait" style={user.avatar_url?{backgroundImage:'url("'+user.avatar_url+'")'}:{}}>{!user.avatar_url&&<span>{firstName.charAt(0)}</span>}</div>
       <div className="fc-command-profile-text"><h2>{user.display_name}</h2><p>{user.primary_role||'Creator'} <span>·</span> {user.location||'Dubai'}</p><span>View & edit your card ↗</span></div>
     </Link>
     {actions.slice(1).map(item=><Link key={item.href} href={item.href} className="fc-command-action">
       <div className="fc-command-action-top"><span className="fc-command-label">{item.eyebrow}</span><span className="fc-command-action-icon" aria-hidden="true">{item.icon}</span></div>
       <div><h2>{item.title}</h2><p>{item.desc}</p><span>{item.cta}</span></div>
     </Link>)}
     <Link href={requests?'/connections':'/crews'} className="fc-command-attention">
       <div className="fc-command-attention-title"><span className="fc-command-attention-dot"/> YOUR ACTIVITY</div>
       <span className="fc-command-attention-text">{attention>0?attention+' item'+(attention===1?'':'s')+' need your attention':'You’re all caught up. Ready to make something?'}</span>
       <span className="fc-command-attention-arrow">↗</span>
     </Link>
   </section>
   <footer className="fc-command-footer"><span>FIND YOUR CREW · BY LIKEMINDS</span><span>CREATE <i>·</i> CONNECT <i>·</i> COLLABORATE</span></footer>
 </div></main>;
}
