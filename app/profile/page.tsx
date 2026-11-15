'use client';
import {ChangeEvent,FormEvent,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import CrewNav from '@/components/CrewNav';
import CreatorCard from '@/components/CreatorCard';
import {getCrewSupabase,CREW_AVATAR_BUCKET} from '@/lib/crew-supabase';
import {INTENTS,ROLES,type Creator} from '@/lib/crew-types';
import '../crew-app.css';

const initial={username:'',display_name:'',headline:'',bio:'',location:'Dubai',avatar_url:'',primary_role:'',categories:[] as string[],skills_tags:'',intent:'both' as 'join'|'build'|'both',experience:'emerging',portfolio_url:'',available_for_48hfp:false,available_for_collaboration:false};

export default function ProfilePage(){
 const router=useRouter(),client=getCrewSupabase();
 const [userId,setUserId]=useState(''),[loading,setLoading]=useState(true),[form,setForm]=useState(initial);
 const [saving,setSaving]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const [optionalOpen,setOptionalOpen]=useState(false),[dirty,setDirty]=useState(false);
 const photoRef=useRef<HTMLInputElement>(null);

 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{
  const {data:{user}}=await client.auth.getUser();if(!active)return;
  if(!user){router.replace('/auth');return}setUserId(user.id);
  const {data,error:e}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();
  if(!active)return;
  if(e){setError(e.message);setLoading(false);return}
  if(!data?.onboarding_complete){router.replace('/onboarding');return}
  // The existing approved /profile OAuth and magic-link callback must remain intact.
  // A fresh sign-in should open My Space; deliberate visits to /profile still edit the card.
  const returnedFromSignIn = window.sessionStorage.getItem('fc:return-from-signin')==='1';
  const callbackQuery = new URLSearchParams(window.location.search);
  const isAuthCallback = callbackQuery.has('code') || callbackQuery.has('token_hash') || window.location.hash.includes('access_token=');
  if(returnedFromSignIn || isAuthCallback){
   window.sessionStorage.removeItem('fc:return-from-signin');
   router.replace('/dashboard');
   return;
  }
  const p=data as Creator;
  setForm({username:p.username||'',display_name:p.display_name||'',headline:p.headline||'',bio:p.bio||'',location:p.location||'',avatar_url:p.avatar_url||'',primary_role:p.primary_role||'',categories:p.categories||[],skills_tags:(p.skills_tags||[]).join(', '),intent:p.intent||'both',experience:p.experience||'emerging',portfolio_url:p.portfolio_url||'',available_for_48hfp:!!p.available_for_48hfp,available_for_collaboration:!!p.available_for_collaboration});
  setLoading(false)
 })();return()=>{active=false}},[client,router]);

 function set<K extends keyof typeof initial>(key:K,value:(typeof initial)[K]){setForm(v=>({...v,[key]:value}));setSuccess('');setDirty(true)}
 async function upload(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file||!client||!userId)return;
  setPhotoBusy(true);setError('');
  try{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728)throw new Error('Choose a JPG, PNG or WebP under 3 MB.');
   const path=userId+'/'+crypto.randomUUID()+'.'+(file.type==='image/jpeg'?'jpg':file.type.split('/')[1]);
   const {error:uploadError}=await client.storage.from(CREW_AVATAR_BUCKET).upload(path,file,{contentType:file.type});
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
  const {error:saveError}=await client.from('profiles').upsert(payload,{onConflict:'id'});
  setSaving(false);
  if(saveError)setError(saveError.code==='23505'?'This handle is already taken. Try another.':saveError.message);
  else{setDirty(false);setSuccess('Creator Card saved and updated.');router.refresh()}
 }
 async function share(){
  const url=window.location.origin+'/creators/'+encodeURIComponent(form.username);
  if(navigator.share){try{await navigator.share({title:'My Creator Card · Find Your Crew',url});return}catch{}}
  try{await navigator.clipboard.writeText(url);setSuccess('Profile link copied — ready to share.')}catch{setError('Could not copy automatically. Open your public card and copy its URL.')}
 }
 if(loading)return <main className="fc-app"><div className="fc-main">{error||'Opening your Creator Studio…'}</div></main>;
 if(!client)return <main className="fc-app"><div className="fc-main">Sign-in configuration is unavailable.</div></main>;
 const preview:Creator={id:userId,username:form.username||'creator',display_name:form.display_name,headline:form.headline,bio:form.bio,location:form.location,avatar_url:form.avatar_url,categories:Array.from(new Set([form.primary_role,...form.categories].filter(Boolean))),skills_tags:form.skills_tags.split(',').map(x=>x.trim()).filter(Boolean),looking_for:[],available_for_collaboration:form.available_for_collaboration,primary_role:form.primary_role,intent:form.intent,experience:form.experience,portfolio_url:form.portfolio_url,available_for_48hfp:form.available_for_48hfp,onboarding_complete:true};
 return <main className="fc-app fc-app--cinematic"><CrewNav userName={form.display_name}/><div className="fc-studio-shell">
  <div className="fc-studio-head"><div><p className="fc-eyebrow">YOUR CREATIVE IDENTITY / THE CREATOR STUDIO</p><h1>Make your <em>mark.</em></h1><p>Every great collaboration begins with an introduction. Make yours unforgettable.</p></div><Link href="/dashboard" className="fc-studio-back">← My Space</Link></div>
  <div className="fc-studio-layout">
   <aside className="fc-studio-preview">
    <div className="fc-studio-preview-heading"><span>LIVE PREVIEW</span><span>THIS IS HOW CREATORS SEE YOU ↘</span></div>
    <CreatorCard creator={preview}/>
    <div className="fc-studio-preview-actions"><button type="button" onClick={()=>photoRef.current?.click()} disabled={photoBusy}>{photoBusy?'Uploading…':'↗ Change portrait'}</button><button type="button" onClick={()=>void share()} disabled={dirty} title={dirty?'Save your changes before sharing':'Share your public creator profile'}>↗ Share my card</button></div>
   </aside>
   <form className="fc-studio-editor" onSubmit={save}>
    <div className="fc-studio-editor-top"><div><p className="fc-eyebrow">THE DETAILS</p><h2>Your story, your way.</h2></div><span className="fc-studio-status">{dirty?'● Unsaved changes':'✓ Up to date'}</span></div>
    <input ref={photoRef} className="fc-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} aria-label="Upload a creator portrait"/>
    <div className="fc-studio-fields">
      <div className="fc-field"><label htmlFor="studio-name">Your name *</label><input id="studio-name" required maxLength={80} value={form.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="How should we introduce you?"/></div>
      <div className="fc-field"><label htmlFor="studio-handle">Creator handle *</label><div className="fc-handle-wrap"><span>@</span><input id="studio-handle" required minLength={3} maxLength={24} value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}/></div></div>
      <div className="fc-field"><label htmlFor="studio-role">Your main creative role *</label><select id="studio-role" required value={form.primary_role} onChange={e=>set('primary_role',e.target.value)}><option value="">Choose a role</option>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
      <div className="fc-field"><label htmlFor="studio-city">Your city</label><input id="studio-city" maxLength={80} value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Dubai"/></div>
      <div className="fc-field fc-studio-wide"><label htmlFor="studio-headline">Your creative one-liner</label><input id="studio-headline" maxLength={120} value={form.headline} onChange={e=>set('headline',e.target.value)} placeholder="Stories that stay with you after the credits"/><span className="fc-field-hint">A little personality goes a long way.</span></div>
      <div className="fc-studio-wide fc-studio-toggles"><label><input type="checkbox" checked={form.available_for_collaboration} onChange={e=>set('available_for_collaboration',e.target.checked)}/> Open to collaborate</label><label><input type="checkbox" checked={form.available_for_48hfp} onChange={e=>set('available_for_48hfp',e.target.checked)}/> Available for 48HFP · 27–29 November</label></div>
    </div>
    <details className="fc-studio-more" open={optionalOpen} onToggle={e=>setOptionalOpen(e.currentTarget.open)}><summary>+ More about you <span>Optional details ↗</span></summary>
      <div className="fc-studio-more-content">
       <div className="fc-field"><label htmlFor="studio-bio">Your story</label><textarea id="studio-bio" maxLength={600} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="The kinds of films you love and the people you want to work with…"/></div>
       <div className="fc-field"><label>Other filmmaking roles</label><div className="fc-choices">{ROLES.filter(r=>r!==form.primary_role).map(r=><button type="button" key={r} className="fc-choice" aria-pressed={form.categories.includes(r)} onClick={()=>set('categories',form.categories.includes(r)?form.categories.filter(x=>x!==r):[...form.categories,r])}>{r}</button>)}</div></div>
       <div className="fc-studio-fields">
        <div className="fc-field"><label htmlFor="studio-exp">Experience</label><select id="studio-exp" value={form.experience} onChange={e=>set('experience',e.target.value)}><option value="emerging">Emerging</option><option value="experienced">Experienced</option><option value="professional">Professional</option></select></div>
        <div className="fc-field"><label htmlFor="studio-intent">I’m here to</label><select id="studio-intent" value={form.intent} onChange={e=>set('intent',e.target.value as typeof form.intent)}>{INTENTS.map(i=><option key={i.value} value={i.value}>{i.title}</option>)}</select></div>
       </div>
       <div className="fc-field"><label htmlFor="studio-link">Portfolio or Instagram</label><input id="studio-link" type="url" maxLength={300} value={form.portfolio_url} onChange={e=>set('portfolio_url',e.target.value)} placeholder="https://…"/></div>
       <div className="fc-field"><label htmlFor="studio-skills">Other skills (comma separated)</label><input id="studio-skills" value={form.skills_tags} onChange={e=>set('skills_tags',e.target.value)} placeholder="Lighting, editing, sound"/></div>
      </div>
    </details>
    <div className="fc-studio-savebar">
      <div aria-live="polite">{error&&<p className="fc-error" role="alert">{error}</p>}{success&&!error&&<p className="fc-notice" role="status">{success}</p>}{!error&&!success&&<small>Changes appear instantly in your preview.</small>}</div>
      <button type="submit" className="fc-btn" disabled={saving||photoBusy}>{saving?'Saving…':'Save my Creator Card ↗'}</button>
    </div>
   </form>
  </div>
 </div></main>
}
