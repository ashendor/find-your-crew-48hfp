'use client';
import {TouchEvent,useCallback,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {FilmLoader} from '@/components/FilmLoader';
import CreatorCard from '@/components/CreatorCard';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,type Creator,type Crew} from '@/lib/crew-types';
import '../crew-app.css';
import '../brand-skin.css';
export default function Discover(){
 const {client,user,userId,loading,error:userError}=useCrewUser();
 const [creators,setCreators]=useState<Creator[]>([]),[history,setHistory]=useState<string[]>([]),[connections,setConnections]=useState<string[]>([]),[crews,setCrews]=useState<Crew[]>([]);
 const [mode,setMode]=useState<'swipe'|'grid'>('grid'),[role,setRole]=useState('All roles'),[search,setSearch]=useState(''),[available,setAvailable]=useState(false);
 const [index,setIndex]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [target,setTarget]=useState<Creator|null>(null),[crewId,setCrewId]=useState(''),[newCrew,setNewCrew]=useState(''),[inviteRole,setInviteRole]=useState('Producer'),[touchX,setTouchX]=useState<number|null>(null),[drag,setDrag]=useState(0);
 const refresh=useCallback(async()=>{if(!client||!userId)return;const [a,b,c,d]=await Promise.all([
 client.from('profiles').select('*').eq('onboarding_complete',true).neq('id',userId).order('created_at',{ascending:false}).limit(200),
 client.from('creator_swipes').select('target_id').eq('viewer_id',userId),
 client.from('connections').select('requester_id,recipient_id').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId),
 client.from('crews').select('*').eq('owner_id',userId).order('created_at',{ascending:false})
 ]);if(a.error)setError(a.error.message);else setCreators((a.data||[]) as Creator[]);setHistory((b.data||[]).map(x=>x.target_id));setConnections((c.data||[]).map(x=>x.requester_id===userId?x.recipient_id:x.requester_id));setCrews((d.data||[]) as Crew[])},[client,userId]);
 useEffect(()=>{void refresh()},[refresh]);
 const filtered=useMemo(()=>creators.filter(p=>(role==='All roles'||p.categories?.includes(role)||p.primary_role===role)&&(!available||p.available_for_collaboration)&&(p.display_name+' '+p.username+' '+(p.headline||'')+' '+(p.location||'')+' '+(p.categories||[]).join(' ')).toLowerCase().includes(search.toLowerCase())),[creators,role,search,available]);
 const queue=filtered.filter(p=>!history.includes(p.id)&&!connections.includes(p.id));
 const active=queue[Math.min(index,Math.max(0,queue.length-1))];
 useEffect(()=>{setIndex(0)},[role,search,available,history.length,connections.length]);
 async function act(creator:Creator,decision:'pass'|'connect'){
 if(!client||!userId||busy)return;setBusy(true);setError('');setNotice('');
 if(decision==='connect'&&!connections.includes(creator.id)){
 const {error:reqError}=await client.from('connections').insert({requester_id:userId,recipient_id:creator.id,status:'pending'});
 if(reqError){setError(reqError.code==='23505'?'You already have a connection request with this creator.':reqError.message);setBusy(false);return}
 setConnections(v=>[...v,creator.id]);setNotice('Connection request sent to '+creator.display_name+'.');
 }
 const {error:swipeError}=await client.from('creator_swipes').upsert({viewer_id:userId,target_id:creator.id,decision,created_at:new Date().toISOString()},{onConflict:'viewer_id,target_id'});
 if(swipeError)setError(swipeError.message);else{setHistory(v=>[...v,creator.id]);if(decision==='pass')setNotice('Passed for now.')}
 setBusy(false);setDrag(0)
 }
 async function invite(){
 if(!client||!userId||!target||busy)return;setBusy(true);setError('');
 let id=crewId;
 if(!id){if(!newCrew.trim()){setError('Choose a crew or enter a new crew name.');setBusy(false);return}
 const {data,error:e}=await client.from('crews').insert({owner_id:userId,name:newCrew.trim().slice(0,70)}).select().single();
 if(e||!data){setError(e?.message||'Could not create crew.');setBusy(false);return}
 id=data.id;setCrews(v=>[data as Crew,...v])}
 const {error:e}=await client.from('crew_members').insert({crew_id:id,user_id:target.id,invited_by:userId,role:inviteRole||'Producer',status:'invited'});
 if(e){setError(e.code==='23505'?'This creator has already been invited to that crew.':e.message);setBusy(false);return}
 setNotice('Crew invitation sent to '+target.display_name+'.');setTarget(null);setNewCrew('');setCrewId('');setBusy(false);setHistory(v=>[...v,target.id])
 }
 function startTouch(e:TouchEvent){setTouchX(e.touches[0].clientX)}
 function moveTouch(e:TouchEvent){if(touchX!==null)setDrag(e.touches[0].clientX-touchX)}
 function endTouch(){if(!active)return;if(drag>80)void act(active,'connect');else if(drag< -80)void act(active,'pass');setDrag(0);setTouchX(null)}
 if(loading||!user)return userError ? <main className="fc-app"><div className="fc-main">{userError}</div></main> : <FilmLoader delay={600} />;
 return <main className="fc-app fc-app--cinematic fc-workspace-page"><CrewNav userName={user.display_name}/><div className="fc-main">
  <p className="fc-eyebrow">DISCOVER / CREATIVE CONNECTIONS</p><h1 className="fc-display">Find your <em>people.</em></h1><p className="fc-lead">Browse real filmmakers, filter by role and connect with people you'd like to work with.</p>
  <div className="fc-filters"><div className="fc-toggle" aria-label="Discovery display"><button type="button" className={mode==='swipe'?'active':''} onClick={()=>setMode('swipe')}>Swipe</button><button type="button" className={mode==='grid'?'active':''} onClick={()=>setMode('grid')}>Grid</button></div>
   <input className="fc-filter-input" aria-label="Search creators" placeholder="Search creative people…" value={search} onChange={e=>setSearch(e.target.value)}/>
   <select className="fc-filter-input" aria-label="Filter by role" value={role} onChange={e=>setRole(e.target.value)}><option>All roles</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
   <label style={{display:'flex',gap:7,alignItems:'center',fontSize:12}}><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)}/> Open to collaborate</label>
  </div>
  {error&&<p className="fc-error" role="alert">{error}</p>}{notice&&<p className="fc-notice" role="status">{notice}</p>}
  {mode==='swipe'?(active?<div className="fc-discover-layout">
    <aside className="fc-swipe-aside"><p className="fc-eyebrow">A NEW CREATIVE WORLD</p><h3>Swipe to discover.</h3><p>Swipe left to pass. Swipe right to request a connection. Or invite someone directly to your crew.</p><p>Each connection is a chance to make something new.</p></aside>
    <div className={'fc-swipe-frame '+(touchX!==null?'dragging':'')} style={{transform:'translateX('+Math.max(-100,Math.min(100,drag))*.25+'px) rotate('+Math.max(-100,Math.min(100,drag))*.06+'deg)'}} onTouchStart={startTouch} onTouchMove={moveTouch} onTouchEnd={endTouch}>
    {drag < -35&&<span className="fc-swipe-indicator left">PASS</span>}{drag>35&&<span className="fc-swipe-indicator right">CONNECT</span>}
    <CreatorCard creator={active} busy={busy} onPass={()=>void act(active,'pass')} onConnect={()=>void act(active,'connect')} onInvite={()=>{setTarget(active);setInviteRole(active.primary_role||'Producer');setError('')}}/>
    </div>
    <aside className="fc-swipe-aside"><p className="fc-eyebrow">THE RIGHT PEOPLE CHANGE EVERYTHING</p><h3>More than a swipe.</h3><p>Open a creator's full profile to learn more about their work. Crew invitations always require acceptance.</p><p className="fc-muted">Creators remaining: {queue.length}</p></aside>
   </div>:<div className="fc-empty"><h2>{creators.length?"You've seen everyone for now.":'Be one of the first.'}</h2><p>{creators.length?'Try another filter or switch to Explore grid. New creatives will appear here as they join.':'Creator cards will appear here as people complete onboarding. No fake profiles.'}</p><button className="fc-btn fc-btn-alt" onClick={()=>{setHistory([]);setIndex(0)}}>Review creators again</button></div>)
   :(filtered.length?<div className="fc-grid">{filtered.map(p=><CreatorCard key={p.id} creator={p} variant="compact" busy={busy} connectionLabel={connections.includes(p.id)?'REQUESTED':undefined} onPass={()=>void act(p,'pass')} onConnect={()=>void act(p,'connect')} onInvite={()=>{setTarget(p);setInviteRole(p.primary_role||'Producer');setError('')}}/>)}</div>:<div className="fc-empty"><h2>No creators found yet.</h2><p>Try another filter, or return when more creators have joined.</p></div>)}
  {target&&<div className="fc-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setTarget(null)}}><div className="fc-modal" role="dialog" aria-modal="true" aria-labelledby="fc-invite-title"><p className="fc-eyebrow">BUILD SOMETHING TOGETHER</p><h2 id="fc-invite-title">Invite {target.display_name}</h2><p>They'll receive a request and can accept or decline. No one joins a crew automatically.</p><div className="fc-field"><label htmlFor="fc-crew-select">Choose your crew</label><select id="fc-crew-select" value={crewId} onChange={e=>{setCrewId(e.target.value);setNewCrew('')}}><option value="">Create a new crew</option>{crews.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
    {!crewId&&<div className="fc-field" style={{marginTop:14}}><label htmlFor="fc-new-crew">New crew name</label><input id="fc-new-crew" value={newCrew} maxLength={70} onChange={e=>setNewCrew(e.target.value)} placeholder="The Midnight Makers"/></div>}
    <div className="fc-field" style={{marginTop:14}}><label htmlFor="fc-invite-role">Invite them as</label><select id="fc-invite-role" value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>{(inviteRole && !ROLES.includes(inviteRole) ? [inviteRole, ...ROLES] : ROLES).map(role => <option key={role}>{role}</option>)}</select></div>
    {error&&<p className="fc-error" role="alert" style={{color:'#a83b25'}}>{error}</p>}<div className="fc-modal-actions"><button className="fc-btn" disabled={busy} onClick={()=>void invite()}>{busy?'Sending…':'Send Invitation →'}</button><button className="fc-btn fc-btn-alt" onClick={()=>setTarget(null)}>Cancel</button></div>
   </div></div>}
 </div></main>;
}
