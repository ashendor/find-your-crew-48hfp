'use client';
import {Suspense,useEffect,useState} from 'react';
import {useParams,useRouter,useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Creator} from '@/lib/crew-types';
import {nameOf} from '@/lib/crew-types';
import CreatorCard from '@/components/CreatorCard';
import ConnectSheet from '@/components/ConnectSheet';
import {PlatformShell} from '@/components/PlatformNav';
import '../../crew-app.css';
import '../../platform.css';
import '../../brand-skin.css';
function CreatorDetail(){
 const {username}=useParams<{username:string}>(),router=useRouter(),params=useSearchParams(),client=getCrewSupabase();
 const [creator,setCreator]=useState<Creator|null>(null),[viewer,setViewer]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{
  const [p,u]=await Promise.all([client.from('profiles').select('*').eq('username',username).eq('onboarding_complete',true).maybeSingle(),client.auth.getUser()]);
  if(!active)return;if(p.error)setError(p.error.message);setCreator(p.data as Creator|null);setViewer(u.data.user?.id||'');setLoading(false)
 })();return()=>{active=false}},[client,username]);
 function connect(){if(!creator)return;if(!viewer){router.push('/auth');return}if(creator.id===viewer){router.push('/profile');return}setOpen(true)}
 const validLink=creator?.portfolio_url&&/^https:\/\//i.test(creator.portfolio_url)?creator.portfolio_url:null;
 const socials=creator?[['Instagram',creator.instagram_url],['YouTube',creator.youtube_url],['Vimeo',creator.vimeo_url],['Behance',creator.behance_url],['Dribbble',creator.dribbble_url],['Website',creator.website_url]].filter((item):item is [string,string]=>!!item[1]&&/^https:\/\//i.test(String(item[1]))):[];
 const body=<>
 {loading?<div className="fc-empty">Opening Creator Card…</div>:error?<div role="alert" className="fc-error">{error}</div>:!creator?<div className="fc-empty"><h2>Creator not found.</h2><p>Only completed creator profiles are publicly visible.</p></div>:
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))',gap:45,marginTop:35,alignItems:'start'}}>
  <CreatorCard creator={creator}/><div><p className="fc-eyebrow">MEET YOUR NEXT CREATIVE COLLABORATOR</p><h1 className="fc-display" style={{fontSize:'clamp(42px,5vw,75px)'}}>{nameOf(creator)}<em>.</em></h1><p className="fc-lead">{creator.headline||'A filmmaker in the LikeMinds community.'}</p>
  {creator.bio&&<><h2 className="fc-section-title">Their story.</h2><p className="fc-lead">{creator.bio}</p></>}
  <div className="fc-section-header"><h2 className="fc-section-title">The craft.</h2></div><div className="fc-card-tags">{(creator.categories||[]).map(r=><span key={r}>{r}</span>)}</div>
  <p className="fc-muted" style={{marginTop:20}}>{creator.location||'Location not listed'} · {creator.experience||'Creator'} · {creator.available_for_collaboration?'Open to collaborate':'Not currently available'}</p>
  {validLink&&<p><a href={validLink} target="_blank" rel="noopener noreferrer" style={{color:'#e3b879'}}>Explore portfolio ↗</a></p>}
  {socials.length>0&&<p className="lm-row">{socials.map(([label,href])=><a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}</p>}
  {error&&<p className="fc-error" role="alert">{error}</p>}
  <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:30}}>{creator.id!==viewer?<button className="fc-btn" onClick={connect}>Connect</button>:<Link className="fc-btn" href="/profile">Edit my card</Link>}
  <Link className="fc-btn fc-btn-alt" href={viewer?'/explore':'/auth'}>Find more creators ↗</Link></div>
  <p className="fc-muted" style={{fontSize:12,marginTop:26}}>Connecting asks why, and a team name only when that project requires one. Accepting opens a chat. It does not join a crew or a project.</p>
 </div></div>}
 {creator&&creator.id!==viewer&&<ConnectSheet open={open} onClose={()=>setOpen(false)} recipientId={creator.id} recipientName={nameOf(creator)} presetProjectId={params.get('project')||undefined}/>}
 </>;
 return viewer ? <PlatformShell><Link href="/explore">← Explore</Link>{body}</PlatformShell> : <main className="fc-app"><div className="fc-main"><Link href="/" style={{fontSize:13,color:'#e4b972'}}>← Home</Link>{body}</div></main>;
}
export default function CreatorPublicPage(){return <Suspense fallback={<main className="fc-app"><div className="fc-main">Loading creator…</div></main>}><CreatorDetail/></Suspense>}
