'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew,CrewMember,Creator} from '@/lib/crew-types';
import '../crew-app.css';
type Inv=CrewMember&{crews?:{name:string}|null};
export default function Crews(){
 const {client,user,userId,loading}=useCrewUser();
 const [mine,setMine]=useState<Crew[]>([]),[invitations,setInvitations]=useState<Inv[]>([]),[members,setMembers]=useState<CrewMember[]>([]),[people,setPeople]=useState<Record<string,Creator>>({});
 const [name,setName]=useState(''),[description,setDescription]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const refresh=useCallback(async()=>{if(!client||!userId)return;
  const [a,b]=await Promise.all([client.from('crews').select('*').eq('owner_id',userId).order('created_at',{ascending:false}),client.from('crew_members').select('*,crews(name)').eq('user_id',userId).order('created_at',{ascending:false})]);
  const ownedIds=(a.data||[]).map(x=>x.id);
  const c=ownedIds.length?await client.from('crew_members').select('*').in('crew_id',ownedIds):{data:[] as CrewMember[]};
  if(a.error)setError(a.error.message);else setMine((a.data||[]) as Crew[]);
  if(b.error)setError(b.error.message);else setInvitations((b.data||[]) as Inv[]);
  setMembers((c.data||[]) as CrewMember[]);
  const ids=Array.from(new Set((c.data||[]).map(x=>x.user_id)));
  if(ids.length){const p=await client.from('profiles').select('*').in('id',ids);setPeople(Object.fromEntries(((p.data||[]) as Creator[]).map(x=>[x.id,x])))}
 },[client,userId]);
 useEffect(()=>{void refresh()},[refresh]);
 async function create(e:FormEvent){e.preventDefault();if(!client||!userId||busy)return;setBusy(true);setError('');
 const {error:e2}=await client.from('crews').insert({owner_id:userId,name:name.trim(),description:description.trim()});setBusy(false);
 if(e2)setError(e2.message);else{setName('');setDescription('');setNotice('Your crew has been created. Discover creators to send invitations.');void refresh()}}
 async function respond(id:string,status:'accepted'|'declined'){if(!client||busy)return;setBusy(true);setError('');
 const {error:e2}=await client.from('crew_members').update({status}).eq('id',id).eq('user_id',userId);
 setBusy(false);if(e2)setError(e2.message);else{setNotice(status==='accepted'?'You joined the crew!':'Invitation declined.');void refresh()}}
 if(loading||!user)return <main className="fc-app"><div className="fc-main">Loading your crews…</div></main>;
 return <main className="fc-app"><CrewNav userName={user.display_name}/><div className="fc-main">
  <p className="fc-eyebrow">THE FILM IS BETTER TOGETHER</p><h1 className="fc-display">My <em>Crews.</em></h1><p className="fc-lead">Every creator can build a crew or join one. Start with a name, then invite the people who make your vision possible.</p>
  {error&&<p className="fc-error" role="alert">{error}</p>}{notice&&<p className="fc-notice" role="status">{notice}</p>}
  <div className="fc-two-col" style={{marginTop:36}}>
   <section className="fc-panel"><p className="fc-eyebrow">LIGHTS. CAMERA. COLLABORATE.</p><h2 style={{fontSize:36}}>Start a new crew.</h2>
    <form onSubmit={create} style={{display:'grid',gap:19,marginTop:20}}>
    <div className="fc-field"><label htmlFor="crew-name">Crew name *</label><input id="crew-name" required minLength={2} maxLength={70} value={name} onChange={e=>setName(e.target.value)} placeholder="The Midnight Makers"/></div>
    <div className="fc-field"><label htmlFor="crew-about">What are you making? (optional)</label><textarea id="crew-about" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Your story, your vibe, your vision…"/></div>
    <button className="fc-btn" type="submit" disabled={busy}>{busy?'Creating…':'Create Crew →'}</button>
    </form>
   </section>
   <section className="fc-panel"><p className="fc-eyebrow">PEOPLE WANT TO CREATE WITH YOU</p><h2 style={{fontSize:36}}>Invitations.</h2>
    {invitations.filter(i=>i.status==='invited').length? <div className="fc-list">{invitations.filter(i=>i.status==='invited').map(i=><div key={i.id} className="fc-list-item"><div><strong>{i.crews?.name||'Film crew'}</strong><p style={{margin:'5px 0'}}>Invited you as {i.role}</p></div><div style={{display:'flex',gap:8}}><button className="fc-btn fc-btn-small" disabled={busy} onClick={()=>void respond(i.id,'accepted')}>Join</button><button className="fc-btn fc-btn-alt fc-btn-small" disabled={busy} style={{color:'#211b16',borderColor:'#8a755a'}} onClick={()=>void respond(i.id,'declined')}>Decline</button></div></div>)}</div>:<p style={{color:'#726451'}}>No incoming invitations yet. As people discover you, invitations will appear here.</p>}
   </section>
  </div>
  <div className="fc-section-header"><div><p className="fc-eyebrow">YOUR FILM FAMILIES</p><h2 className="fc-section-title">Crews you created.</h2></div><Link href="/discover" className="fc-btn fc-btn-alt fc-btn-small">Find people to invite ↗</Link></div>
  {mine.length?<div className="fc-grid">{mine.map(crew=><div key={crew.id} className="fc-panel"><p className="fc-eyebrow">YOUR CREW / DUBAI</p><h2 style={{fontSize:31,margin:'10px 0'}}>{crew.name}</h2><p>{crew.description||'Every great film begins with a crew.'}</p><div className="fc-list">{members.filter(m=>m.crew_id===crew.id).map(m=><div className="fc-list-item" key={m.id}><div><strong>{people[m.user_id]?.display_name||'Creator'}</strong><p>{m.role}</p></div><span className="fc-pill">{m.status}</span></div>)}</div><Link style={{display:'inline-block',marginTop:20}} className="fc-btn" href="/discover">Invite Creators →</Link></div>)}</div>:<div className="fc-empty"><h2>Your first crew is one idea away.</h2><p>Create a crew above, then discover amazing collaborators to invite.</p></div>}
  <div className="fc-section-header"><div><p className="fc-eyebrow">YOUR CREATIVE CONNECTIONS</p><h2 className="fc-section-title">Crews you've joined.</h2></div></div>
  {invitations.filter(i=>i.status==='accepted').length?<div className="fc-grid">{invitations.filter(i=>i.status==='accepted').map(i=><div className="fc-panel" key={i.id}><p className="fc-eyebrow">YOU'RE ON THE TEAM</p><h2>{i.crews?.name||'Film crew'}</h2><p>Your role: {i.role}</p><span className="fc-pill">Confirmed member</span></div>)}</div>:<div className="fc-empty"><h2>You've got room for more stories.</h2><p>Connect with creators and find your next crew.</p><Link href="/discover" className="fc-btn">Discover filmmakers →</Link></div>}
 </div></main>;
}
