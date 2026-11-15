'use client';
import {Suspense,useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Creator} from '@/lib/crew-types';
import {nameOf} from '@/lib/crew-types';
import CreatorCard from '@/components/CreatorCard';
import '../../crew-app.css';
function CreatorDetail(){
 const {username}=useParams<{username:string}>(),router=useRouter(),client=getCrewSupabase();
 const [creator,setCreator]=useState<Creator|null>(null),[viewer,setViewer]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{
  const [p,u]=await Promise.all([client.from('profiles').select('*').eq('username',username).eq('onboarding_complete',true).maybeSingle(),client.auth.getUser()]);
  if(!active)return;if(p.error)setError(p.error.message);setCreator(p.data as Creator|null);setViewer(u.data.user?.id||'');setLoading(false)
 })();return()=>{active=false}},[client,username]);
 async function connect(){if(!client||!creator)return;if(!viewer){router.push('/auth');return}if(creator.id===viewer){router.push('/profile');return}setBusy(true);setError('');
 const {error:e}=await client.from('connections').insert({requester_id:viewer,recipient_id:creator.id,status:'pending'});
 setBusy(false);if(e)setError(e.code==='23505'?'A connection already exists or is awaiting a response.':e.message);else setNotice('Connection request sent. You can follow up from your Connections page.')}
 const validLink=creator?.portfolio_url&&/^https:\/\//i.test(creator.portfolio_url)?creator.portfolio_url:null;
 return <main className="fc-app"><div className="fc-main"><Link href="/discover" style={{fontSize:13,color:'#e4b972'}}>← Back to Discover</Link>
 {loading?<div className="fc-empty">Opening Creator Card…</div>:error?<div role="alert" className="fc-error">{error}</div>:!creator?<div className="fc-empty"><h2>Creator not found.</h2><p>Only completed creator profiles are publicly visible.</p></div>:
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))',gap:45,marginTop:35,alignItems:'start'}}>
  <CreatorCard creator={creator}/><div><p className="fc-eyebrow">MEET YOUR NEXT CREATIVE COLLABORATOR</p><h1 className="fc-display" style={{fontSize:'clamp(42px,5vw,75px)'}}>{nameOf(creator)}<em>.</em></h1><p className="fc-lead">{creator.headline||'A filmmaker in the Find Your Crew community.'}</p>
  {creator.bio&&<><h2 className="fc-section-title">Their story.</h2><p className="fc-lead">{creator.bio}</p></>}
  <div className="fc-section-header"><h2 className="fc-section-title">The craft.</h2></div><div className="fc-card-tags">{(creator.categories||[]).map(r=><span key={r}>{r}</span>)}</div>
  <p className="fc-muted" style={{marginTop:20}}>{creator.location||'Location not listed'} · {creator.experience||'Creator'} · {creator.available_for_collaboration?'Open to collaborate':'Not currently available'}</p>
  {validLink&&<p><a href={validLink} target="_blank" rel="noopener noreferrer" style={{color:'#e3b879'}}>Explore portfolio ↗</a></p>}
  {notice&&<p className="fc-notice" role="status">{notice}</p>}{error&&<p className="fc-error" role="alert">{error}</p>}
  <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:30}}>{creator.id!==viewer?<button className="fc-btn" onClick={()=>void connect()} disabled={busy}>{busy?'Sending…':'♡ Request to connect'}</button>:<Link className="fc-btn" href="/profile">Edit my card</Link>}
  <Link className="fc-btn fc-btn-alt" href="/discover">Find more creators ↗</Link></div>
  <p className="fc-muted" style={{fontSize:12,marginTop:26}}>Connection requests require acceptance before messaging. Crew invitations are sent separately from Discover.</p>
 </div></div>}
 </div></main>
}
export default function CreatorPublicPage(){return <Suspense fallback={<main className="fc-app"><div className="fc-main">Loading creator…</div></main>}><CreatorDetail/></Suspense>}
