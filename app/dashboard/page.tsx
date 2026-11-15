'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useCrewUser} from '@/lib/use-crew';
import CreatorCard from '@/components/CreatorCard';
import CrewNav from '@/components/CrewNav';
import type {Creator} from '@/lib/crew-types';
import '../crew-app.css';
export default function Dashboard(){
 const {client,user,userId,loading,error}=useCrewUser();
 const [crews,setCrews]=useState(0),[invites,setInvites]=useState(0),[requests,setRequests]=useState(0),[suggestions,setSuggestions]=useState<Creator[]>([]);
 useEffect(()=>{if(!client||!userId||!user)return;(async()=>{
  const [a,b,c,d]=await Promise.all([
   client.from('crews').select('id',{count:'exact',head:true}).eq('owner_id',userId),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','invited'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',userId).eq('status','pending'),
   client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).limit(6)
  ]);
  setCrews(a.count||0);setInvites(b.count||0);setRequests(c.count||0);
  const profiles=(d.data||[]) as Creator[];
  setSuggestions(profiles.sort((x,y)=>Number(y.primary_role===user.primary_role)-Number(x.primary_role===user.primary_role)).slice(0,3))
 })()},[client,userId,user]);
 if(loading||!user)return <main className="fc-app"><div className="fc-main">{error||'Opening your creative space…'}</div></main>;
 return <main className="fc-app"><CrewNav userName={user.display_name}/><div className="fc-main">
  <section className="fc-dashboard-hero"><div className="fc-dashboard-hero-content"><p className="fc-eyebrow">WELCOME BACK / {user.display_name.toUpperCase()}</p><h1 className="fc-display">Your next film <em>starts here.</em></h1><p className="fc-lead">Meet creative people, build a crew and make something unforgettable. Your space. Your story.</p><div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:25}}><Link className="fc-btn" href="/discover">Discover Creators ↗</Link><Link className="fc-btn fc-btn-alt" href="/crews">Create a Crew ＋</Link></div></div><div className="fc-dashboard-art" role="img" aria-label="Cinematic film set"/></section>
  <div className="fc-section-header"><div><p className="fc-eyebrow">EVERYTHING IN ONE PLACE</p><h2 className="fc-section-title">My Crew Space.</h2></div><span className="fc-muted">CREATE · CONNECT · COLLABORATE</span></div>
  <div className="fc-bento"><Link href="/crews"><span className="fc-bento-symbol">◎</span><strong>My Crews</strong><small>{crews} crews created · Manage your team</small></Link>
   <Link href="/discover"><span className="fc-bento-symbol">◇</span><strong>Discover</strong><small>Swipe through creators and connect</small></Link>
   <Link href="/connections"><span className="fc-bento-symbol">♡</span><strong>Connections</strong><small>{requests} requests · {invites} crew invitations</small></Link>
   <Link href="/profile"><span className="fc-bento-symbol">▧</span><strong>My Creator Card</strong><small>Edit your craft and share your story</small></Link></div>
  <div className="fc-section-header"><div><p className="fc-eyebrow">A CREATOR WORTH KNOWING</p><h2 className="fc-section-title">Your story. <em>Your card.</em></h2></div><Link href={'/creators/'+encodeURIComponent(user.username)} className="fc-btn fc-btn-alt fc-btn-small">Share your profile ↗</Link></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,330px),1fr))',gap:35,alignItems:'start'}}>
   <CreatorCard creator={user}/><div><p className="fc-eyebrow">YOUR FILM BEGINS WITH A CONNECTION</p><h2 className="fc-section-title">Make your next move.</h2><p className="fc-lead">Your Creator Card is how other filmmakers discover you. Add a portrait and a great introduction to make it your own.</p><div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:25}}><Link href="/profile" className="fc-btn fc-btn-alt">Edit my card ↗</Link><Link href="/discover" className="fc-btn">Meet creators →</Link></div></div>
  </div>
  <div className="fc-section-header"><div><p className="fc-eyebrow">PEOPLE WORTH MEETING</p><h2 className="fc-section-title">The next connection.</h2></div><Link className="fc-btn fc-btn-alt fc-btn-small" href="/discover">Explore all ↗</Link></div>
  {suggestions.length?<div className="fc-grid">{suggestions.map(p=><CreatorCard key={p.id} creator={p} variant="compact"/>)}</div>:<div className="fc-empty"><h2>You're early. That's exciting.</h2><p>As more creators join, you'll see real profiles and collaborators here.</p><Link className="fc-btn" href="/discover">Explore the community →</Link></div>}
 </div></main>;
}
