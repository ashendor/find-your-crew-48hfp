'use client';
import {ChangeEvent,FormEvent,Suspense,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import ProfilePanels from '@/components/ProfilePanels';
import ProjectBadges from '@/components/ProjectBadges';
import SocialIcon from '@/components/SocialIcon';
import PlatformBoard from '@/components/PlatformBoard';
import Tabs from '@/components/Tabs';
import BackButton, {useGoBack} from '@/components/BackButton';
import SignOutButton from '@/components/SignOutButton';
import HeaderActions from '@/components/HeaderActions';
import PhotoView from '@/components/PhotoView';
import ProfileBio from '@/components/ProfileBio';
import {FilmLoader} from '@/components/FilmLoader';
import {compressImage} from '@/lib/compress-image';
import {getCrewSupabase,CREW_AVATAR_BUCKET} from '@/lib/crew-supabase';
import {withBasePath} from '@/lib/base-path';
import {INTENTS,ROLES,schemaMissing,type Creator,type Work} from '@/lib/crew-types';
import '../crew-app.css';
import '../platform.css';
import '../brand-skin.css';

const initial={username:'',display_name:'',headline:'',bio:'',location:'Dubai',avatar_url:'',primary_role:'',categories:[] as string[],skills_tags:'',intent:'both' as 'join'|'build'|'both',experience:'emerging',portfolio_url:'',instagram_url:'',youtube_url:'',vimeo_url:'',behance_url:'',dribbble_url:'',website_url:'',available_for_48hfp:false,available_for_collaboration:false};
type LinkKey = 'instagram_url'|'youtube_url'|'vimeo_url'|'behance_url'|'dribbble_url'|'website_url';
const linkHosts: Record<string, RegExp> = {Instagram:/(^|\.)instagram\.com$/i,YouTube:/(^|\.)(youtube\.com|youtu\.be)$/i,Vimeo:/(^|\.)vimeo\.com$/i,Behance:/(^|\.)behance\.net$/i,Dribbble:/(^|\.)dribbble\.com$/i};
const linkBases: Record<string, string> = {Instagram:'https://instagram.com/',YouTube:'https://youtube.com/@',Vimeo:'https://vimeo.com/',Behance:'https://www.behance.net/',Dribbble:'https://dribbble.com/'};

function platformUrl(name:string, raw:string){
  let value = raw.trim();
  if (!value) return 'Paste a link to continue.';
  if (value.startsWith('@')) {
    const handle = value.slice(1).replace(/^\/+/, '');
    if (!handle || !linkBases[name]) return 'Paste the full website URL.';
    value = linkBases[name] + handle;
  } else if (!/^https?:\/\//i.test(value)) value = 'https://' + value.replace(/^\/+/, '');
  let url: URL;
  try { url = new URL(value); } catch { return 'That does not look like a link.'; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'Use an http or https link.';
  url.protocol = 'https:';
  const host = linkHosts[name];
  if (host && !host.test(url.hostname)) return 'Use a ' + name + ' link.';
  return url.toString();
}

function ProfilePage(){
 const router=useRouter(),params=useSearchParams(),client=getCrewSupabase(),leaveEdit=useGoBack('/profile?tab=settings');
 const [userId,setUserId]=useState(''),[loading,setLoading]=useState(true),[form,setForm]=useState(initial);
 const [saving,setSaving]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const [dirty,setDirty]=useState(false);
 const [linking,setLinking]=useState<null|{name:string;key:LinkKey}|{name:'Others'}>(null),[linkUrl,setLinkUrl]=useState(''),[otherName,setOtherName]=useState(''),[linkBusy,setLinkBusy]=useState(false),[linkError,setLinkError]=useState('');
 const [extras,setExtras]=useState<Work[]>([]);
 const photoRef=useRef<HTMLInputElement>(null);

 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{
  const {data:{user}}=await client.auth.getUser();if(!active)return;
  if(!user){router.replace('/auth');return}setUserId(user.id);
  const {data,error:e}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();
  if(!active)return;
  if(e){setError(e.message);setLoading(false);return}
  if(!data?.onboarding_complete){router.replace('/onboarding');return}
  // The existing approved /profile Google sign-in callback must remain intact.
  // A fresh sign-in should open My Space; deliberate visits to /profile still edit the card.
  const returnedFromSignIn = window.sessionStorage.getItem('fc:return-from-signin')==='1';
  const callbackQuery = new URLSearchParams(window.location.search);
  const isAuthCallback = callbackQuery.has('code') || callbackQuery.has('token_hash') || window.location.hash.includes('access_token=');
  if(returnedFromSignIn || isAuthCallback){
   window.sessionStorage.removeItem('fc:return-from-signin');
   router.replace('/home');
   return;
  }
  const p=data as Creator;
  setForm({username:p.username||'',display_name:p.display_name||'',headline:p.headline||'',bio:p.bio||'',location:p.location||'',avatar_url:p.avatar_url||'',primary_role:p.primary_role||'',categories:p.categories||[],skills_tags:(p.skills_tags||[]).join(', '),intent:p.intent||'both',experience:p.experience||'emerging',portfolio_url:p.portfolio_url||'',instagram_url:p.instagram_url||'',youtube_url:p.youtube_url||'',vimeo_url:p.vimeo_url||'',behance_url:p.behance_url||'',dribbble_url:p.dribbble_url||'',website_url:p.website_url||'',available_for_48hfp:!!p.available_for_48hfp,available_for_collaboration:!!p.available_for_collaboration});
  const extra=await client.from('works').select('*').eq('user_id',user.id).eq('platform','profile-link').order('created_at',{ascending:false});
  if(active)setExtras((extra.data||[]) as Work[]);
  setLoading(false)
 })();return()=>{active=false}},[client,router]);

 function set<K extends keyof typeof initial>(key:K,value:(typeof initial)[K]){setForm(v=>({...v,[key]:value}));setSuccess('');setDirty(true)}
 async function upload(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file||!client||!userId)return;
  setPhotoBusy(true);setError('');
  try{
   const image=await compressImage(file);
   const path=userId+'/'+crypto.randomUUID()+'.jpg';
   const {error:uploadError}=await client.storage.from(CREW_AVATAR_BUCKET).upload(path,image,{contentType:'image/jpeg'});
   if(uploadError)throw uploadError;
   set('avatar_url',client.storage.from(CREW_AVATAR_BUCKET).getPublicUrl(path).data.publicUrl);
   setSuccess('New portrait uploaded. Save your card to publish it.')
  }catch(e){setError(e instanceof Error?e.message:'Photo upload failed')}
  finally{setPhotoBusy(false);e.target.value=''}
 }
 async function save(e:FormEvent){
  e.preventDefault();if(!client||!userId||saving||photoBusy)return;setError('');setSuccess('');
  if(!/^[a-z0-9_]{3,24}$/.test(form.username)){setError('Creator handle must be 3–24 lowercase letters, numbers or underscores.');return}
  if(!form.display_name.trim()||!form.primary_role){setError('Your name and primary filmmaking role are required.');return}
  setSaving(true);
  const payload={id:userId,username:form.username,display_name:form.display_name.trim(),headline:form.headline.trim(),bio:form.bio.trim(),location:form.location.trim(),avatar_url:form.avatar_url||null,primary_role:form.primary_role,categories:Array.from(new Set([form.primary_role,...form.categories])),skills_tags:form.skills_tags.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12),intent:form.intent,experience:form.experience,portfolio_url:form.portfolio_url||null,available_for_48hfp:form.available_for_48hfp,available_for_collaboration:form.available_for_collaboration,onboarding_complete:true,updated_at:new Date().toISOString()};
  const links={instagram_url:form.instagram_url||null,youtube_url:form.youtube_url||null,vimeo_url:form.vimeo_url||null,behance_url:form.behance_url||null,dribbble_url:form.dribbble_url||null,website_url:form.website_url||null};
  let {error:saveError}=await client.from('profiles').upsert({...payload,...links},{onConflict:'id'});
  if(saveError&&schemaMissing(saveError)){({error:saveError}=await client.from('profiles').upsert(payload,{onConflict:'id'}))}
  setSaving(false);
  if(saveError)setError(saveError.code==='23505'?'This handle is already taken. Try another.':saveError.message);
  else{setDirty(false);leaveEdit()}
 }
 async function linkPlatform(e:FormEvent){
  e.preventDefault();if(!client||!userId||!linking||linkBusy)return;
  const next=platformUrl(linking.name==='Others'?'':linking.name,linkUrl);
  if(!/^https:\/\//i.test(next)){setLinkError(next);return}
  if(linking.name==='Others'&&otherName.trim().length<2){setLinkError('Add the platform name.');return}
  setLinkBusy(true);setLinkError('');
  if(linking.name==='Others'){
    const {data,error:insertError}=await client.from('works').insert({user_id:userId,title:otherName.trim().slice(0,40),url:next,platform:'profile-link'}).select('*').single();
    setLinkBusy(false);
    if(insertError){setLinkError(insertError.message);return}
    setExtras(v=>[data as Work,...v]);
    setLinking(null);
    return;
  }
  if(!('key' in linking))return;
  const key=linking.key;
  const {error:updateError}=await client.from('profiles').update({[key]:next,updated_at:new Date().toISOString()}).eq('id',userId);
  setLinkBusy(false);
  if(updateError){setLinkError(updateError.message);return}
  setForm(v=>({...v,[key]:next}));
  setLinking(null);
 }
 async function removeExtra(id:string){
  if(!client||!userId)return;
  const item=extras.find(row=>row.id===id);
  if(!item||!window.confirm('Remove '+item.title+' from your platforms?'))return;
  const {error:deleteError}=await client.from('works').delete().eq('id',id).eq('user_id',userId);
  if(deleteError){setError(deleteError.message);return}
  setExtras(v=>v.filter(row=>row.id!==id));
 }
 async function share(){
  const url=window.location.origin+withBasePath('/creators/'+encodeURIComponent(form.username));
  if(navigator.share){try{await navigator.share({title:'My Creator Card · Find Your Crew',url});return}catch{}}
  try{await navigator.clipboard.writeText(url);setSuccess('Profile link copied — ready to share.')}catch{setError('Could not copy automatically. Open your public card and copy its URL.')}
 }
 if(loading)return error ? <main className="fc-app"><div className="fc-main">{error}</div></main> : <FilmLoader delay={600} />;
 if(!client)return <main className="fc-app"><div className="fc-main">Sign-in configuration is unavailable.</div></main>;
 const asked=params.get('tab');
 const tab=asked==='crews'||asked==='teams'?'teams':asked==='edit'||asked==='settings'?asked:'work';
 const platforms: {name:string;key:LinkKey;href:string}[] = [{name:'Instagram',key:'instagram_url',href:form.instagram_url},{name:'YouTube',key:'youtube_url',href:form.youtube_url},{name:'Vimeo',key:'vimeo_url',href:form.vimeo_url},{name:'Behance',key:'behance_url',href:form.behance_url},{name:'Dribbble',key:'dribbble_url',href:form.dribbble_url},{name:'Website',key:'website_url',href:form.website_url}];
 return <PlatformShell>
  <header className="lm-top">{tab==='edit'?<><BackButton fallback="/profile?tab=settings" label="Back" /><h1 className="lm-bar-title">Edit profile</h1><div className="lm-nav-actions"><HeaderActions /><button className="lm-done" type="submit" form="lm-edit" disabled={saving||photoBusy}>{saving?'Saving':'Done'}</button></div></>:tab==='settings'?<><BackButton fallback="/profile" label="Back" /><h1 className="lm-bar-title">Settings</h1><HeaderActions /></>:<><div className="lm-brand"><BackButton fallback="/home" /><Link className="lm-word" href="/home">LikeMinds</Link></div><HeaderActions /></>}</header>
  {tab!=='edit'&&tab!=='settings'&&<>
    <div className="lm-identity">{form.avatar_url?<PhotoView src={form.avatar_url} alt={form.display_name||'Profile photo'}/>:<span className="lm-avatar">{(form.display_name||'L').slice(0,1)}</span>}
      <h2>{form.display_name||'Your profile'}</h2>
      <p className="lm-role">{form.primary_role||'Creator'}{form.location?' · '+form.location:''}</p>
      {userId&&<ProjectBadges userId={userId} />}
      {(form.bio||form.headline)&&<ProfileBio text={form.bio||form.headline||''} />}
    </div>
    <Tabs label="Profile" current={tab} items={[{id:'work', label:'Work', href:'/profile?tab=work'},{id:'teams', label:'Teams', href:'/profile?tab=teams'}]} />
    {tab==='work'&&<>
      <PlatformBoard items={platforms} extras={extras.map(item=>({id:item.id,name:item.title,href:item.url}))} mine onLink={item=>{const row=platforms.find(platform=>platform.name===item.name);if(!row)return;setLinking(row);setLinkUrl('');setOtherName('');setLinkError('')}} onAddOther={()=>{setLinking({name:'Others'});setLinkUrl('');setOtherName('');setLinkError('')}} onRemoveExtra={id=>void removeExtra(id)} />
    </>}
    <ProfilePanels userId={userId} tab={tab}/>
  </>}
  {tab==='settings'&&<nav className="lm-settings" aria-label="Settings"><Link className="lm-setrow" href="/profile?tab=edit"><span>Edit profile<small>Photo, name, roles, and links</small></span><em aria-hidden="true">›</em></Link><SignOutButton className="lm-setrow lm-setout" /></nav>}
  {tab==='edit'&&<form id="lm-edit" className="lm-edit" onSubmit={save}>
    <input ref={photoRef} hidden type="file" accept="image/*" onChange={upload} aria-label="Upload a profile photo"/>
    <div className="lm-edit-photo">
      <button className="lm-edit-avatar" type="button" onClick={()=>photoRef.current?.click()} disabled={photoBusy} aria-label="Change photo">{form.avatar_url?<img src={form.avatar_url} alt=""/>:<span>{(form.display_name||'L').slice(0,1)}</span>}</button>
      <button className="lm-edit-photo-btn" type="button" onClick={()=>photoRef.current?.click()} disabled={photoBusy}>{photoBusy?'Uploading…':'Change photo'}</button>
    </div>
    {error&&<p className="lm-alert" role="alert">{error}</p>}
    {success&&!error&&<p className="lm-note" role="status">{success}</p>}
    <section>
      <h2>Profile</h2>
      <div className="lm-edit-group">
        <label htmlFor="studio-name">Name<input id="studio-name" className="lm-field" required maxLength={80} value={form.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="Your name"/></label>
        <label htmlFor="studio-handle">Handle<input id="studio-handle" className="lm-field" required minLength={3} maxLength={24} value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="yourname"/></label>
        <label htmlFor="studio-role">Creative role<select id="studio-role" className="lm-field" required value={form.primary_role} onChange={e=>set('primary_role',e.target.value)}><option value="">Choose a role</option>{(form.primary_role && !ROLES.includes(form.primary_role) ? [form.primary_role, ...ROLES] : ROLES).map(r=><option key={r} value={r}>{r}</option>)}</select></label>
        <label htmlFor="studio-city">City<input id="studio-city" className="lm-field" maxLength={80} value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Dubai"/></label>
        <label htmlFor="studio-headline">One-liner<input id="studio-headline" className="lm-field" maxLength={120} value={form.headline} onChange={e=>set('headline',e.target.value)} placeholder="What you make"/></label>
        <label htmlFor="studio-bio">Bio<textarea id="studio-bio" className="lm-field" maxLength={600} rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="A short introduction"/></label>
      </div>
    </section>
    <section>
      <h2>Availability</h2>
      <div className="lm-edit-group">
        <label className="lm-switch"><span>Open to collaborate</span><input type="checkbox" checked={form.available_for_collaboration} onChange={e=>set('available_for_collaboration',e.target.checked)}/></label>
        <label className="lm-switch"><span>Available for 48HFP, 27–29 November</span><input type="checkbox" checked={form.available_for_48hfp} onChange={e=>set('available_for_48hfp',e.target.checked)}/></label>
      </div>
    </section>
    <section>
      <h2>Also works as</h2>
      <div className="lm-pills">{[...form.categories.filter(r=>r!==form.primary_role && !ROLES.includes(r)), ...ROLES.filter(r=>r!==form.primary_role)].map(r=><button type="button" key={r} aria-pressed={form.categories.includes(r)} onClick={()=>set('categories',form.categories.includes(r)?form.categories.filter(x=>x!==r):[...form.categories,r])}>{r}</button>)}</div>
      <div className="lm-edit-group">
        <label htmlFor="studio-exp">Experience<select id="studio-exp" className="lm-field" value={form.experience} onChange={e=>set('experience',e.target.value)}><option value="emerging">Emerging</option><option value="experienced">Experienced</option><option value="professional">Professional</option></select></label>
        <label htmlFor="studio-intent">Here to<select id="studio-intent" className="lm-field" value={form.intent} onChange={e=>set('intent',e.target.value as typeof form.intent)}>{INTENTS.map(i=><option key={i.value} value={i.value}>{i.title}</option>)}</select></label>
        <label htmlFor="studio-skills">Other skills<input id="studio-skills" className="lm-field" value={form.skills_tags} onChange={e=>set('skills_tags',e.target.value)} placeholder="Lighting, editing, sound"/></label>
      </div>
    </section>
    <section>
      <h2>Links</h2>
      <div className="lm-edit-group">
        <label htmlFor="studio-ig">Instagram<input id="studio-ig" className="lm-field" type="url" maxLength={300} value={form.instagram_url} onChange={e=>set('instagram_url',e.target.value)} placeholder="Add Instagram"/></label>
        <label htmlFor="studio-yt">YouTube<input id="studio-yt" className="lm-field" type="url" maxLength={300} value={form.youtube_url} onChange={e=>set('youtube_url',e.target.value)} placeholder="Add YouTube"/></label>
        <label htmlFor="studio-vimeo">Vimeo<input id="studio-vimeo" className="lm-field" type="url" maxLength={300} value={form.vimeo_url} onChange={e=>set('vimeo_url',e.target.value)} placeholder="Add Vimeo"/></label>
        <label htmlFor="studio-behance">Behance<input id="studio-behance" className="lm-field" type="url" maxLength={300} value={form.behance_url} onChange={e=>set('behance_url',e.target.value)} placeholder="Add Behance"/></label>
        <label htmlFor="studio-dribbble">Dribbble<input id="studio-dribbble" className="lm-field" type="url" maxLength={300} value={form.dribbble_url} onChange={e=>set('dribbble_url',e.target.value)} placeholder="Add Dribbble"/></label>
        <label htmlFor="studio-site">Website<input id="studio-site" className="lm-field" type="url" maxLength={300} value={form.website_url} onChange={e=>set('website_url',e.target.value)} placeholder="Add a website"/></label>
        <label htmlFor="studio-link">Other portfolio<input id="studio-link" className="lm-field" type="url" maxLength={300} value={form.portfolio_url} onChange={e=>set('portfolio_url',e.target.value)} placeholder="Add a portfolio link"/></label>
      </div>
    </section>
    <button type="button" className="lm-edit-copy" onClick={()=>void share()} disabled={dirty}>Copy profile link</button>
  </form>}
  {linking&&<div className="lm-sheet" role="presentation" onClick={()=>!linkBusy&&setLinking(null)}>
    <form className="lm-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="lm-link-title" onClick={e=>e.stopPropagation()} onSubmit={e=>void linkPlatform(e)}>
      <div className="lm-link-head"><SocialIcon name={linking.name} brand={linking.name!=='Others'}/><div><h2 id="lm-link-title">{linking.name==='Others'?'Add a platform':'Add '+linking.name}</h2><p>{linking.name==='Others'?'Name the platform, then paste its link.':'Paste the link. It is saved straight to your profile.'}</p></div><button className="lm-iconbtn" type="button" onClick={()=>setLinking(null)} aria-label="Close">✕</button></div>
      {linking.name==='Others'&&<label htmlFor="lm-link-name">Platform name<input id="lm-link-name" className="lm-field" autoFocus maxLength={40} placeholder="TikTok" value={otherName} onChange={e=>{setOtherName(e.target.value);setLinkError('')}}/></label>}
      <label htmlFor="lm-link-url">URL<input id="lm-link-url" className="lm-field" inputMode="url" autoFocus={linking.name!=='Others'} autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={300} placeholder={linking.name==='Website'||linking.name==='Others'?'https://yoursite.com':linking.name.toLowerCase()+'.com/you'} value={linkUrl} onChange={e=>{setLinkUrl(e.target.value);setLinkError('')}}/></label>
      {linkError&&<p className="lm-alert" role="alert">{linkError}</p>}
      <button className="lm-btn" type="submit" disabled={linkBusy||!linkUrl.trim()||(linking.name==='Others'&&otherName.trim().length<2)}>{linkBusy?'Linking…':'Link'}</button>
    </form>
  </div>}
 </PlatformShell>
}
export default function ProfileRoute(){return <Suspense fallback={<FilmLoader delay={600} />}><ProfilePage/></Suspense>}
