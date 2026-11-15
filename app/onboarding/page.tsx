'use client';
import {ChangeEvent,FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {getCrewSupabase,CREW_AVATAR_BUCKET} from '@/lib/crew-supabase';
import {INTENTS,ROLES,type Creator} from '@/lib/crew-types';
import '../crew-app.css';
const steps=['Identity','Your craft','Your mission','Your story','Availability'];
const initial={username:'',display_name:'',avatar_url:'',primary_role:'',categories:[] as string[],intent:'both' as 'join'|'build'|'both',experience:'emerging',headline:'',bio:'',location:'Dubai',portfolio_url:'',available_for_collaboration:true,available_for_48hfp:true};
export default function Onboarding(){
 const router=useRouter(),client=getCrewSupabase();const [userId,setUserId]=useState('');const [loading,setLoading]=useState(true);
 const [step,setStep]=useState(0),[form,setForm]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reveal,setReveal]=useState(false);
 useEffect(()=>{if(!client){setLoading(false);return}let mounted=true;(async()=>{const {data:{user}}=await client.auth.getUser();if(!mounted)return;if(!user){router.replace('/auth');return}setUserId(user.id);
 const {data}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();if(!mounted)return;
 if(data?.onboarding_complete){router.replace('/dashboard');return}
 if(data){const p=data as Creator;setForm(v=>({...v,username:p.username||v.username,display_name:p.display_name||'',avatar_url:p.avatar_url||'',primary_role:p.primary_role||'',categories:p.categories||[],intent:p.intent||'both',experience:p.experience||'emerging',headline:p.headline||'',bio:p.bio||'',location:p.location||'Dubai',portfolio_url:p.portfolio_url||'',available_for_collaboration:p.available_for_collaboration||false,available_for_48hfp:!!p.available_for_48hfp}))}
 setLoading(false)})();return()=>{mounted=false}},[client,router]);
 function set<K extends keyof typeof initial>(key:K,value:(typeof initial)[K]){setForm(v=>({...v,[key]:value}));setError('')}
 async function upload(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!client||!userId||!file)return;setBusy(true);setError('');try{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728)throw new Error('Upload a JPG, PNG or WebP under 3 MB.');const ext=file.type.split('/')[1]==='jpeg'?'jpg':file.type.split('/')[1];const path=userId+'/'+crypto.randomUUID()+'.'+ext;const {error}=await client.storage.from(CREW_AVATAR_BUCKET).upload(path,file,{contentType:file.type});if(error)throw error;set('avatar_url',client.storage.from(CREW_AVATAR_BUCKET).getPublicUrl(path).data.publicUrl)}catch(e){setError(e instanceof Error?e.message:'Unable to upload')}finally{setBusy(false);e.target.value=''}}
 async function next(e?:FormEvent){e?.preventDefault();setError('');
 if(step===0&&(!form.display_name.trim()||!/^[a-z0-9_]{3,24}$/.test(form.username))){setError('Add your name and a username (3–24 lowercase letters, numbers or underscores).');return}
 if(step===1&&!form.primary_role){setError('Choose your primary filmmaking role.');return}
 if(step<4){setStep(s=>s+1);return}
 if(!client||!userId)return;setBusy(true);
 const data={id:userId,username:form.username.trim().toLowerCase(),display_name:form.display_name.trim().slice(0,80),avatar_url:form.avatar_url||null,primary_role:form.primary_role,categories:Array.from(new Set([form.primary_role,...form.categories])),intent:form.intent,experience:form.experience,headline:form.headline.trim().slice(0,120),bio:form.bio.trim().slice(0,600),location:form.location.trim().slice(0,80),portfolio_url:form.portfolio_url.trim().slice(0,300)||null,available_for_collaboration:form.available_for_collaboration,available_for_48hfp:form.available_for_48hfp,onboarding_complete:true,updated_at:new Date().toISOString()};
 const {error:saveError}=await client.from('profiles').upsert(data,{onConflict:'id'});setBusy(false);if(saveError){setError(saveError.code==='23505'?'That username is taken. Choose another.':saveError.message);return}
 setReveal(true);window.setTimeout(()=>router.replace('/dashboard'),1800)
 }
 if(loading)return <main className="fc-app"><div className="fc-main">Preparing your creative space…</div></main>;
 if(!client)return <main className="fc-app"><div className="fc-main">Sign-in configuration is missing. <Link href="/auth">Return to sign-in</Link></div></main>;
 return <main className="fc-onboarding">
  <aside className="fc-onboarding-art"><p className="fc-eyebrow">LIKEMINDS × FIND YOUR CREW</p><h1>Every great film starts with <em>your people.</em></h1><p className="fc-muted">A small introduction. A world of possibilities.</p><Link href="/" style={{marginTop:40,fontSize:12}}>← BACK TO THE FILM</Link></aside>
  <section className="fc-onboarding-form"><p className="fc-eyebrow">YOUR CREATOR STORY / {String(step+1).padStart(2,'0')} OF 05</p>
  <div className="fc-progress" aria-label={'Step '+(step+1)+' of 5'}>{steps.map((s,i)=><span key={s} className={i<=step?'active':''}/>)}</div>
  <form onSubmit={next}>
   {step===0&&<><h2 className="fc-display">First, <em>who are you?</em></h2><p style={{color:'#6f6255'}}>Give your creative identity a name. You can refine it anytime.</p>
    <div className="fc-field" style={{marginTop:28}}><label htmlFor="ob-name">Your name *</label><input id="ob-name" required autoComplete="name" maxLength={80} value={form.display_name} onChange={e=>set('display_name',e.target.value)} placeholder="Your creative name"/></div>
    <div className="fc-field" style={{marginTop:20}}><label htmlFor="ob-user">Creator handle *</label><input id="ob-user" required minLength={3} maxLength={24} value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="your_name"/></div>
    <div className="fc-field" style={{marginTop:20}}><label htmlFor="ob-photo">Your portrait (optional)</label><input type="file" id="ob-photo" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/>{form.avatar_url&&<p style={{color:'#426a43'}}>✓ Photo ready for your Creator Card</p>}</div>
   </>}
   {step===1&&<><h2 className="fc-display">What's your <em>superpower?</em></h2><p style={{color:'#6f6255'}}>Choose a primary role and any other ways you love to create.</p>
     <p style={{fontSize:12,fontWeight:800,marginTop:28}}>PRIMARY ROLE *</p><div className="fc-choices">{ROLES.map(r=><button type="button" className="fc-choice" aria-pressed={form.primary_role===r} key={r} onClick={()=>set('primary_role',r)}>{r}</button>)}</div>
     <p style={{fontSize:12,fontWeight:800,marginTop:26}}>OTHER ROLES (OPTIONAL)</p><div className="fc-choices">{ROLES.filter(r=>r!==form.primary_role).map(r=><button type="button" key={r} className="fc-choice" aria-pressed={form.categories.includes(r)} onClick={()=>set('categories',form.categories.includes(r)?form.categories.filter(x=>x!==r):[...form.categories,r])}>{r}</button>)}</div>
     <div className="fc-field" style={{marginTop:25}}><label htmlFor="ob-exp">Experience</label><select id="ob-exp" value={form.experience} onChange={e=>set('experience',e.target.value)}><option value="emerging">Emerging / learning</option><option value="experienced">Experienced</option><option value="professional">Professional</option></select></div>
   </>}
   {step===2&&<><h2 className="fc-display">What's your <em>mission?</em></h2><p style={{color:'#6f6255'}}>This helps us introduce you to relevant creators. It never limits what you can do.</p>
     <div style={{display:'grid',gap:12,marginTop:28}}>{INTENTS.map(x=><button type="button" key={x.value} onClick={()=>set('intent',x.value as typeof form.intent)} aria-pressed={form.intent===x.value} className="fc-choice" style={{borderRadius:5,textAlign:'left',padding:19,background:form.intent===x.value?'#24201b':'transparent',color:form.intent===x.value?'#fff':'#211b16'}}><strong style={{display:'block'}}>{x.title}</strong><span style={{display:'block',fontSize:12,marginTop:6,opacity:.78}}>{x.description}</span></button>)}</div>
   </>}
   {step===3&&<><h2 className="fc-display">Tell us your <em>story.</em></h2><p style={{color:'#6f6255'}}>Short and sweet. The best introductions feel personal.</p>
     <div className="fc-field" style={{marginTop:23}}><label htmlFor="ob-head">One-line creative introduction</label><input id="ob-head" value={form.headline} maxLength={120} onChange={e=>set('headline',e.target.value)} placeholder="Stories that stay with you after the credits"/></div>
     <div className="fc-field" style={{marginTop:18}}><label htmlFor="ob-bio">A little about you (optional)</label><textarea id="ob-bio" maxLength={600} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Your creative world, your influences, what you love making…"/></div>
     <div className="fc-field" style={{marginTop:18}}><label htmlFor="ob-city">City</label><input id="ob-city" maxLength={80} value={form.location} onChange={e=>set('location',e.target.value)}/></div>
     <div className="fc-field" style={{marginTop:18}}><label htmlFor="ob-link">Portfolio / Instagram / website (optional)</label><input id="ob-link" type="url" maxLength={300} value={form.portfolio_url} onChange={e=>set('portfolio_url',e.target.value)} placeholder="https://…"/></div>
   </>}
   {step===4&&<><h2 className="fc-display">Ready to <em>make something?</em></h2><p style={{color:'#6f6255'}}>Choose how you'd like to show up. You can change these preferences later.</p>
    <div style={{display:'grid',gap:22,marginTop:35}}>
      <label style={{display:'flex',alignItems:'center',gap:15}}><input type="checkbox" style={{width:23,height:23,accentColor:'#b4442e'}} checked={form.available_for_collaboration} onChange={e=>set('available_for_collaboration',e.target.checked)}/> Open to creative collaboration</label>
      <label style={{display:'flex',alignItems:'center',gap:15}}><input type="checkbox" style={{width:23,height:23,accentColor:'#b4442e'}} checked={form.available_for_48hfp} onChange={e=>set('available_for_48hfp',e.target.checked)}/> Available for the 27–29 Nov 48-hour film challenge</label>
    </div>
    <div style={{background:'#e2d5bd',padding:20,marginTop:35,borderLeft:'3px solid #b4442e',fontSize:13,lineHeight:1.6}}>Your Find Your Crew account does not register you for the official 48 Hour Film Project. Official event registration is separate.</div>
   </>}
   {error&&<p role="alert" style={{color:'#a32419',fontWeight:700,marginTop:18}}>{error}</p>}
   <div className="fc-onboarding-actions"><button className="fc-btn fc-btn-alt" style={{color:'#2a211b',borderColor:'#9e8a70'}} type="button" disabled={step===0||busy} onClick={()=>setStep(s=>s-1)}>← Back</button><button className="fc-btn" type="submit" disabled={busy}>{busy?'Saving…':step===4?'Create my Creator Card →':'Continue →'}</button></div>
  </form></section>
  {reveal&&<div className="fc-complete-overlay"><div><p>YOUR STORY STARTS HERE</p><h1>YOU'RE IN.</h1><p>WELCOME TO THE CREW · {form.display_name.toUpperCase()}</p></div></div>}
 </main>
}
