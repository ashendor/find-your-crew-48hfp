'use client';
import {Suspense,useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Creator} from '@/lib/crew-types';
import {nameOf} from '@/lib/crew-types';
import CreatorCard from '@/components/CreatorCard';
import ConnectSheet from '@/components/ConnectSheet';
import {PlatformShell} from '@/components/PlatformNav';
import PlatformBoard, {profilePlatforms} from '@/components/PlatformBoard';
import ProfilePanels from '@/components/ProfilePanels';
import ProjectBadges from '@/components/ProjectBadges';
import PhotoView from '@/components/PhotoView';
import Tabs from '@/components/Tabs';
import type {Work} from '@/lib/crew-types';
import BackButton from '@/components/BackButton';
import {FilmLoader} from '@/components/FilmLoader';
import {armLoader} from '@/components/RouteLoader';
import HeaderActions from '@/components/HeaderActions';
import ProfileBio from '@/components/ProfileBio';
import '../../crew-app.css';
import '../../platform.css';
import '../../brand-skin.css';
function CreatorDetail(){
 const {username}=useParams<{username:string}>(),router=useRouter(),client=getCrewSupabase();
 const [creator,setCreator]=useState<Creator|null>(null),[viewer,setViewer]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[open,setOpen]=useState(false),[extras,setExtras]=useState<Work[]>([]),[connected,setConnected]=useState(false),[connectionId,setConnectionId]=useState(''),[tab,setTab]=useState<'work'|'teams'>('work');
 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{
  const [p,u]=await Promise.all([client.from('profiles').select('*').eq('username',username).eq('onboarding_complete',true).maybeSingle(),client.auth.getUser()]);
  if(!active)return;if(p.error)setError(p.error.message);const person=p.data as Creator|null;const me=u.data.user?.id||'';setCreator(person);setViewer(me);
  if(person&&client){const [extra,link]=await Promise.all([
    client.from('works').select('*').eq('user_id',person.id).eq('platform','profile-link').order('created_at',{ascending:false}),
    me&&me!==person.id?client.from('connections').select('id,status').or('and(requester_id.eq.'+me+',recipient_id.eq.'+person.id+'),and(requester_id.eq.'+person.id+',recipient_id.eq.'+me+')').eq('status','accepted').limit(1):Promise.resolve({data:[]}),
  ]);if(active){const rows=(link.data||[]) as {id?:string;status:string}[];setExtras((extra.data||[]) as Work[]);setConnected(rows.length>0);setConnectionId(rows[0]?.id||'')}}
  setLoading(false)
 })();return()=>{active=false}},[client,username]);
 function connect(){if(!creator)return;if(!viewer){armLoader();router.push('/auth');return}if(creator.id===viewer){armLoader();router.push('/profile');return}setOpen(true)}
 const validLink=creator?.portfolio_url&&/^https:\/\//i.test(creator.portfolio_url)?creator.portfolio_url:null;
 const socials=creator?[['Instagram',creator.instagram_url],['YouTube',creator.youtube_url],['Vimeo',creator.vimeo_url],['Behance',creator.behance_url],['Dribbble',creator.dribbble_url],['Website',creator.website_url]].filter((item):item is [string,string]=>!!item[1]&&/^https:\/\//i.test(String(item[1]))):[];
 if(loading)return <FilmLoader delay={600} />;
 if(viewer&&creator) return <PlatformShell>
  <header className="lm-top"><BackButton fallback="/explore" label="Back" /><HeaderActions /></header>
  <div className="lm-identity">{creator.avatar_url?<PhotoView src={creator.avatar_url} alt={nameOf(creator)}/>:<span className="lm-avatar">{nameOf(creator).slice(0,1)}</span>}
    <h2>{nameOf(creator)}</h2>
    <p className="lm-role">{creator.primary_role||'Creator'}{creator.location?' · '+creator.location:''}</p>
    <ProjectBadges userId={creator.id} />
    {creator.id!==viewer&&<div className="lm-identity-actions"><button className="lm-btn" type="button" onClick={connect}>Connect</button>{connected&&<Link className="lm-btn-line" href={connectionId?'/inbox?chat='+connectionId:'/inbox'}>Message</Link>}</div>}
    {(creator.bio||creator.headline)&&<ProfileBio text={creator.bio||creator.headline||''} />}
  </div>
  <Tabs label="Creator" current={tab} onChange={item=>setTab(item as typeof tab)} items={[{id:'work',label:'Work'}]} />
  {tab==='work'&&<PlatformBoard items={profilePlatforms(creator)} extras={extras.map(item=>({id:item.id,name:item.title,href:item.url}))} mine={false} />}
  <ProfilePanels userId={creator.id} tab="work" owner={false} />
  <ConnectSheet open={open} onClose={()=>setOpen(false)} recipientId={creator.id} recipientName={nameOf(creator)} recipientAvatar={creator.avatar_url||undefined}/>
 </PlatformShell>;
 const body=<>
 {error?<div role="alert" className="fc-error">{error}</div>:!creator?<div className="fc-empty"><h2>Creator not found.</h2><p>Only completed creator profiles are publicly visible.</p></div>:
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
  <p className="fc-muted" style={{fontSize:12,marginTop:26}}>Connecting asks why, and a team name only when that project requires one. Accepting opens a chat. It does not join a team or a project.</p>
 </div></div>}
 {creator&&creator.id!==viewer&&<ConnectSheet open={open} onClose={()=>setOpen(false)} recipientId={creator.id} recipientName={nameOf(creator)}/>}
 </>;
 return viewer ? <PlatformShell><header className="lm-top"><BackButton fallback="/explore" label="Back" /><HeaderActions /></header>{body}</PlatformShell> : <main className="fc-app"><div className="fc-main"><Link href="/" style={{fontSize:13,color:'#e4b972'}}>← Home</Link>{body}</div></main>;
}
export default function CreatorPublicPage(){return <Suspense fallback={<FilmLoader delay={600} />}><CreatorDetail/></Suspense>}
