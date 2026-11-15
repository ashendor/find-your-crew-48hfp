'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew,CrewMember,Creator} from '@/lib/crew-types';
import '../crew-app.css';
import '../crews-clean.css';
import '../platform.css';
import '../brand-skin.css';

type Invite=CrewMember&{crews?:{name:string}|null};

export default function Crews(){
 const {client,user,userId,loading}=useCrewUser();
 const [mine,setMine]=useState<Crew[]>([]),[membership,setMembership]=useState<Invite[]>([]),[members,setMembers]=useState<CrewMember[]>([]),[people,setPeople]=useState<Record<string,Creator>>({});
 const [name,setName]=useState(''),[description,setDescription]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [showForm,setShowForm]=useState(false),[expanded,setExpanded]=useState<string[]>([]);
 const refresh=useCallback(async()=>{if(!client||!userId)return;
  const [a,b]=await Promise.all([client.from('crews').select('*').eq('owner_id',userId).order('created_at',{ascending:false}),client.from('crew_members').select('*,crews(name)').eq('user_id',userId).order('created_at',{ascending:false})]);
  const ownedIds=(a.data||[]).map(x=>x.id);
  const c=ownedIds.length?await client.from('crew_members').select('*').in('crew_id',ownedIds):{data:[] as CrewMember[]};
  if(a.error)setError(a.error.message);else setMine((a.data||[]) as Crew[]);
  if(b.error)setError(b.error.message);else setMembership((b.data||[]) as Invite[]);
  setMembers((c.data||[]) as CrewMember[]);
  const ids=Array.from(new Set((c.data||[]).map(x=>x.user_id)));
  if(ids.length){const p=await client.from('profiles').select('*').in('id',ids);setPeople(Object.fromEntries(((p.data||[]) as Creator[]).map(x=>[x.id,x])))}else setPeople({});
 },[client,userId]);
 useEffect(()=>{void refresh()},[refresh]);
 async function create(e:FormEvent){e.preventDefault();if(!client||!userId||busy||name.trim().length<2)return;
  setBusy(true);setError('');setNotice('');
  const {error:issue}=await client.from('crews').insert({owner_id:userId,name:name.trim().slice(0,70),description:description.trim()});
  setBusy(false);
  if(issue)setError(issue.message);else{setName('');setDescription('');setShowForm(false);setNotice('Crew created. Discover filmmakers to invite to your new team.');void refresh()}
 }
 async function respond(id:string,status:'accepted'|'declined'){if(!client||!userId||busy)return;
  setBusy(true);setError('');
  const {error:issue}=await client.from('crew_members').update({status}).eq('id',id).eq('user_id',userId);
  setBusy(false);if(issue)setError(issue.message);else{setNotice(status==='accepted'?'Invitation accepted. Welcome to the crew!':'Invitation declined.');window.dispatchEvent(new Event('fc:activity-changed'));void refresh()}
 }
 if(loading||!user)return <main className="fc-app"><div className="fc-main">Opening your crews…</div></main>;
 const pending=membership.filter(i=>i.status==='invited');
 const joined=membership.filter(i=>i.status==='accepted'&&!mine.some(c=>c.id===i.crew_id));
 const total=mine.length+joined.length;
 return <PlatformShell>
  <div className="cc-shell">
   <header className="cc-head">
    <div><p className="cc-eyebrow">YOUR FILM TEAMS</p><h1>My Crews</h1><p>Create a team, invite filmmakers, and make your film together.</p></div>
    <button className="cc-primary cc-head-create" type="button" onClick={()=>setShowForm(v=>!v)} aria-expanded={showForm} aria-controls="cc-create">{showForm?'Close form':'＋ Create crew'}</button>
   </header>

   <div className="cc-how" aria-label="How crews work"><span><b>1</b> Create a crew</span><span className="cc-how-arrow" aria-hidden="true">→</span><span><b>2</b> Invite filmmakers</span><span className="cc-how-arrow" aria-hidden="true">→</span><span><b>3</b> Make your film</span></div>
   {error&&<p className="cc-alert" role="alert">{error}</p>}{notice&&<p className="cc-notice" role="status">{notice}</p>}

   <section id="cc-create" className={'cc-create '+(showForm?'cc-create-open':'')} aria-label="Create a crew" hidden={!showForm}>
    <div className="cc-section-top"><div><p className="cc-eyebrow">START SOMETHING NEW</p><h2>Create your crew</h2></div><button type="button" className="cc-text-button" onClick={()=>setShowForm(false)}>Close ✕</button></div>
    <form onSubmit={create}>
     <div className="cc-input-row"><label htmlFor="crew-name">Crew name <span>*</span><input id="crew-name" autoComplete="off" required minLength={2} maxLength={70} placeholder="e.g. The Midnight Makers" value={name} onChange={e=>setName(e.target.value)}/></label><button className="cc-primary" disabled={busy||name.trim().length<2} type="submit">{busy?'Creating…':'Create crew →'}</button></div>
     <details className="cc-optional"><summary>+ Add a description (optional)</summary><label htmlFor="crew-about" className="cc-describe-label">What is your crew making?</label><textarea id="crew-about" maxLength={500} placeholder="A short description of your film idea" value={description} onChange={e=>setDescription(e.target.value)}/></details>
    </form>
   </section>

   {pending.length>0&&<section className="cc-invitations" aria-labelledby="cc-invites-title">
    <div className="cc-section-top"><div><p className="cc-eyebrow">ACTION NEEDED</p><h2 id="cc-invites-title">Crew invitations <span className="cc-count">{pending.length}</span></h2></div></div>
    {pending.map(i=><div className="cc-invite" key={i.id}><div className="cc-invite-copy"><strong>{i.crews?.name||'Film crew'}</strong><p>You’ve been invited as {i.role}</p></div><div className="cc-invite-actions"><button disabled={busy} type="button" onClick={()=>void respond(i.id,'accepted')} className="cc-primary">Accept</button><button disabled={busy} type="button" onClick={()=>void respond(i.id,'declined')} className="cc-secondary">Decline</button></div></div>)}
   </section>}

   <section className="cc-teams" aria-labelledby="cc-your-crews">
    <div className="cc-section-top"><div><p className="cc-eyebrow">YOUR WORKSPACE</p><h2 id="cc-your-crews">Your teams <span className="cc-count">{total}</span></h2><p className="cc-subtitle">Crews you lead and teams you’ve joined, all in one place.</p></div><Link href="/explore" className="cc-discover-link">Find filmmakers <span aria-hidden="true">↗</span></Link></div>
    {total===0?<div className="cc-empty"><div className="cc-empty-symbol" aria-hidden="true">✳</div><h3>No crews yet</h3><p>Create a crew to start inviting people, or discover filmmakers to collaborate with.</p><div className="cc-empty-actions"><button type="button" className="cc-primary" onClick={()=>{setShowForm(true);document.getElementById('cc-create')?.scrollIntoView({behavior:'smooth',block:'start'})}}>Create your first crew →</button><Link href="/explore" className="cc-secondary">Discover filmmakers</Link></div></div>:<div className="cc-team-grid">
     {mine.map(crew=>{const crewMembers=members.filter(m=>m.crew_id===crew.id);const open=expanded.includes(crew.id);return <article className="cc-team-card" key={crew.id}>
      <div className="cc-team-top"><span className="cc-tag">CREW OWNER</span><span className="cc-member-count">{crewMembers.filter(m=>m.status==='accepted').length} members</span></div>
      <h3>{crew.name}</h3><p className="cc-team-description">{crew.description||'Your film team is ready for collaborators.'}</p>
      <div className="cc-team-actions"><Link className="cc-primary" href="/explore">Invite filmmakers ↗</Link>{crewMembers.length>0&&<button className="cc-secondary" type="button" aria-expanded={open} onClick={()=>setExpanded(x=>x.includes(crew.id)?x.filter(id=>id!==crew.id):[...x,crew.id])}>{open?'Hide members':'View members'}</button>}</div>
      {open&&crewMembers.length>0&&<ul className="cc-members">{crewMembers.map(m=><li key={m.id}><span>{people[m.user_id]?.display_name||'Filmmaker'} <small>· {m.role}</small></span><span className="cc-member-status">{m.status}</span></li>)}</ul>}
     </article>})}
     {joined.map(i=><article className="cc-team-card" key={i.id}><div className="cc-team-top"><span className="cc-tag cc-tag-joined">CREW MEMBER</span><span className="cc-member-count">Joined</span></div><h3>{i.crews?.name||'Film crew'}</h3><p className="cc-team-description">Your role: <strong>{i.role}</strong></p><p className="cc-joined-note">You’re part of this crew.</p></article>)}
    </div>}
   </section>
   <footer className="cc-footer">FIND YOUR CREW <span>BY LIKEMINDS · DUBAI 2026</span></footer>
  </div>
 </PlatformShell>
}
