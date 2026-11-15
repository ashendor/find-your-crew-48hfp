'use client';
import {ChangeEvent,FormEvent,useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import CrewNav from '@/components/CrewNav';
import {getCrewSupabase,CREW_AVATAR_BUCKET} from '@/lib/crew-supabase';
import {INTENTS,ROLES,type Creator} from '@/lib/crew-types';
import '../crew-app.css';
const initial={username:'',display_name:'',headline:'',bio:'',location:'Dubai',avatar_url:'',primary_role:'',categories:[] as string[],skills_tags:'',intent:'both' as 'join'|'build'|'both',experience:'emerging',portfolio_url:'',available_for_48hfp:false,available_for_collaboration:false};
export default function ProfilePage(){
 const router=useRouter(),client=getCrewSupabase();
 const [userId,setUserId]=useState(''),[loading,setLoading]=useState(true),[form,setForm]=useState(initial),[saving,setSaving]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{if(!client){setLoading(false);return}let active=true;(async()=>{const {data:{user}}=await client.auth.getUser();if(!active)return;if(!user){router.replace('/auth');return}setUserId(user.id);
 const {data,error:e}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();if(!active)return;
 if(e){setError(e.message);setLoading(false);return}
 if(!data?.onboarding_complete){router.replace('/onboarding');return}
 const p=data as Creator;setForm({username:p.username||'',display_name:p.display_name||'',headline:p.headline||'',bio:p.bio||'',location:p.location||'',avatar_url:p.avatar_url||'',primary_role:p.primary_role||'',categories:p.categories||[],skills_tags:(p.skills_tags||[]).join(', '),intent:p.intent||'both',experience:p.experience||'emerging',portfolio_url:p.portfolio_url||'',available_for_48hfp:!!p.available_for_48hfp,available_for_collaboration:!!p.available_for_collaboration});setLoading(false)})();return()=>{active=false}},[client,router]);
 function set<K extends keyof typeof initial>(key:K,value:(typeof initial)[K]){setForm(v=>({...v,[key]:value}));setSuccess('')}
 async function upload(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file||!client||!userId)return;setPhotoBusy(true);setError('');try{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728)throw new Error('Use JPG, PNG or WebP under 3 MB.');const path=userId+'/'+crypto.randomUUID()+'.'+(file.type==='image/jpeg'?'jpg':file.type.split('/')[1]);const {error:e2}=await client.storage.from(CREW_AVATAR_BUCKET).upload(path,file,{contentType:file.type});if(e2)throw e2;set('avatar_url',client.storage.from(CREW_AVATAR_BUCKET).getPublicUrl(path).data.publicUrl)}catch(e){setError(e instanceof Error?e.message:'Upload failed')}finally{setPhotoBusy(false);e.target.value=''}}
 async function save(e:FormEvent){e.preventDefault();if(!client||!userId||saving)return;setError('');setSuccess('');
 if(!/^[a-z0-9_]{3,24}$/.test(form.username)){setError('Username must be 3–24 lowercase letters, numbers or underscores.');return}
 if(!form.display_name.trim()||!form.primary_role){setError('Add a name and primary role.');return}
 setSaving(true);const payload={id:userId,username:form.username,display_name:form.display_name.trim(),headline:form.headline.trim(),bio:form.bio.trim(),location:form.location.trim(),avatar_url:form.avatar_url||null,primary_role:form.primary_role,categories:Array.from(new Set([form.primary_role,...form.categories])),skills_tags:form.skills_tags.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12),intent:form.intent,experience:form.experience,portfolio_url:form.portfolio_url||null,available_for_48hfp:form.available_for_48hfp,available_for_collaboration:form.available_for_collaboration,onboarding_complete:true,updated_at:new Date().toISOString()};
 const {error:e2}=await client.from('profiles').upsert(payload,{onConflict:'id'});setSaving(false);if(e2)setError(e2.code==='23505'?'That username is already taken.':e2.message);else setSuccess('Your Creator Card is updated!')}
 async function signOut(){await client?.auth.signOut();router.replace('/')}
 if(loading)return <main className="fc-app"><div className="fc-main">{error||'Preparing your Creator Card…'}</div></main>;
 if(!client)return <main className="fc-app"><div className="fc-main">Supabase configuration missing.</div></main>;
 return <main className="fc-app"><CrewNav userName={form.display_name}/><div className="fc-main">
 <p className="fc-eyebrow">YOUR CREATIVE IDENTITY</p><h1 className="fc-display">Make your <em>mark.</em></h1><p className="fc-lead">Your Creator Card is how the filmmaking community sees you. Keep it authentic and make it yours.</p>
 <div className="fc-two-col" style={{marginTop:35,alignItems:'start'}}><form className="fc-panel" onSubmit={save} style={{display:'grid',gap:20}}>
 <div className="fc-field"><label htmlFor="p-photo">Your portrait</label><input id="p-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={photoBusy}/>{form.avatar_url&&<img src={form.avatar_url} alt="Your Creator Card portrait" style={{width:90,height:90,objectFit:'cover',borderRadius:8}}/>}</div>
 <div className="fc-two-col"><div className="fc-field"><label htmlFor="p-name">Your name *</label><input id="p-name" required maxLength={80} value={form.display_name} onChange={e=>set('display_name',e.target.value)}/></div><div className="fc-field"><label htmlFor="p-user">Creator handle *</label><input id="p-user" required maxLength={24} value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}/></div></div>
 <div className="fc-two-col"><div className="fc-field"><label htmlFor="p-role">Primary role *</label><select id="p-role" value={form.primary_role} onChange={e=>set('primary_role',e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div><div className="fc-field"><label htmlFor="p-exp">Experience</label><select id="p-exp" value={form.experience} onChange={e=>set('experience',e.target.value)}><option value="emerging">Emerging</option><option value="experienced">Experienced</option><option value="professional">Professional</option></select></div></div>
 <div className="fc-field"><label>Additional creative roles</label><div className="fc-choices">{ROLES.filter(r=>r!==form.primary_role).map(r=><button className="fc-choice" type="button" key={r} aria-pressed={form.categories.includes(r)} onClick={()=>set('categories',form.categories.includes(r)?form.categories.filter(x=>x!==r):[...form.categories,r])}>{r}</button>)}</div></div>
 <div className="fc-field"><label htmlFor="p-intent">What are you here for?</label><select id="p-intent" value={form.intent} onChange={e=>set('intent',e.target.value as typeof form.intent)}>{INTENTS.map(x=><option key={x.value} value={x.value}>{x.title}</option>)}</select></div>
 <div className="fc-field"><label htmlFor="p-head">Your creative one-liner</label><input id="p-head" maxLength={120} value={form.headline} onChange={e=>set('headline',e.target.value)}/></div>
 <div className="fc-field"><label htmlFor="p-bio">Your story</label><textarea id="p-bio" maxLength={600} value={form.bio} onChange={e=>set('bio',e.target.value)}/></div>
 <div className="fc-two-col"><div className="fc-field"><label htmlFor="p-city">City</label><input id="p-city" maxLength={80} value={form.location} onChange={e=>set('location',e.target.value)}/></div><div className="fc-field"><label htmlFor="p-link">Portfolio or Instagram URL</label><input id="p-link" type="url" maxLength={300} value={form.portfolio_url} onChange={e=>set('portfolio_url',e.target.value)}/></div></div>
 <div className="fc-field"><label htmlFor="p-skills">Additional skills (comma-separated)</label><input id="p-skills" value={form.skills_tags} onChange={e=>set('skills_tags',e.target.value)} placeholder="Lighting, Editing, Sound design"/></div>
 <label><input type="checkbox" checked={form.available_for_collaboration} onChange={e=>set('available_for_collaboration',e.target.checked)}/> Open to collaboration</label>
 <label><input type="checkbox" checked={form.available_for_48hfp} onChange={e=>set('available_for_48hfp',e.target.checked)}/> Available for the 48-hour film challenge</label>
 {error&&<p className="fc-error" role="alert" style={{color:'#b4442e'}}>{error}</p>}{success&&<p style={{color:'#2f7540'}} role="status">{success} <Link href={'/creators/'+form.username}>View profile ↗</Link></p>}
 <button className="fc-btn" type="submit" disabled={saving||photoBusy}>{saving?'Saving…':'Save Creator Card →'}</button>
 <button type="button" style={{background:'transparent',border:0,color:'#a7472e'}} onClick={()=>void signOut()}>Sign out</button>
 </form><aside style={{position:'sticky',top:25}}><p className="fc-eyebrow">YOUR CARD IN THE WILD</p><h2 className="fc-section-title">Make it <em>memorable.</em></h2><p className="fc-muted">Your profile travels with you across Find Your Crew. Add a portrait and one strong line about your craft.</p><Link href="/dashboard" className="fc-btn fc-btn-alt">← Back to My Space</Link></aside></div>
 </div></main>;
}
