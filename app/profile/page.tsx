'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CREW_AVATAR_BUCKET, CREW_LOOKING_FOR, CREW_ROLES, getCrewSupabase } from '@/lib/crew-supabase';
import './creator.css';

type Profile = { id:string; username:string; display_name:string|null; headline:string|null; bio:string|null; location:string|null; avatar_url:string|null; categories:string[]|null; skills_tags:string[]|null; looking_for:string[]|null; available_for_collaboration:boolean|null };
const initial = { username:'', display_name:'', headline:'', bio:'', location:'Dubai', avatar_url:'', categories:[] as string[], skills_tags:'', looking_for:[] as string[], available_for_collaboration:true };

export default function ProfilePage() {
  const router = useRouter();
  const client = getCrewSupabase();
  const [userId,setUserId] = useState('');
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [photoBusy,setPhotoBusy] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [form,setForm] = useState(initial);

  useEffect(()=>{
    if (!client) { setLoading(false); return; }
    let mounted = true;
    async function load(){
      const {data:{user},error:authError} = await client!.auth.getUser();
      if (!mounted) return;
      if (authError || !user) { router.replace('/auth'); return; }
      setUserId(user.id);
      const {data,error:profileError} = await client!.from('profiles').select('id,username,display_name,headline,bio,location,avatar_url,categories,skills_tags,looking_for,available_for_collaboration').eq('id',user.id).maybeSingle();
      if (!mounted) return;
      if (profileError) setError(profileError.message);
      if (data) {
        const p=data as Profile;
        setForm({username:p.username||'',display_name:p.display_name||'',headline:p.headline||'',bio:p.bio||'',location:p.location||'Dubai',avatar_url:p.avatar_url||'',categories:p.categories||[],skills_tags:(p.skills_tags||[]).join(', '),looking_for:p.looking_for||[],available_for_collaboration:!!p.available_for_collaboration});
      } else setForm(v=>({...v,username:'user_'+user.id.slice(0,8),display_name:user.user_metadata?.display_name||''}));
      setLoading(false);
    }
    void load();
    return ()=>{mounted=false};
  },[client,router]);

  function set<K extends keyof typeof initial>(key:K,value:(typeof initial)[K]){setForm(v=>({...v,[key]:value}));setSuccess('')}
  function toggle(key:'categories'|'looking_for',value:string){set(key,form[key].includes(value)?form[key].filter(v=>v!==value):[...form[key],value])}

  async function uploadPhoto(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];
    if(!file || !client || !userId) return;
    setError('');setPhotoBusy(true);
    try {
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use a JPG, PNG or WebP image.');
      if(file.size>3*1024*1024) throw new Error('Choose an image under 3 MB.');
      const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
      const path=userId+'/'+crypto.randomUUID()+'.'+ext;
      const {error:uploadError}=await client.storage.from(CREW_AVATAR_BUCKET).upload(path,file,{contentType:file.type,upsert:false});
      if(uploadError) throw uploadError;
      const {data}=client.storage.from(CREW_AVATAR_BUCKET).getPublicUrl(path);
      set('avatar_url',data.publicUrl);
    }catch(e){setError(e instanceof Error?e.message:'Photo upload failed.')}finally{setPhotoBusy(false);e.target.value=''}
  }

  async function save(e:FormEvent){
    e.preventDefault();
    if(!client || !userId || saving) return;
    setError('');setSuccess('');
    const username=form.username.trim().toLowerCase();
    if(!/^[a-z0-9_]{3,24}$/.test(username)){setError('Username must be 3–24 letters, numbers or underscores.');return}
    if(!form.display_name.trim()){setError('Please enter your name.');return}
    if(!form.categories.length){setError('Select at least one filmmaking role.');return}
    setSaving(true);
    const payload={id:userId,username,display_name:form.display_name.trim().slice(0,80),headline:form.headline.trim().slice(0,120),bio:form.bio.trim().slice(0,600),location:form.location.trim().slice(0,80),avatar_url:form.avatar_url||null,categories:form.categories,skills_tags:form.skills_tags.split(',').map(s=>s.trim()).filter(Boolean).slice(0,12),looking_for:form.looking_for,available_for_collaboration:form.available_for_collaboration,updated_at:new Date().toISOString()};
    const {error:saveError}=await client.from('profiles').upsert(payload,{onConflict:'id'});
    setSaving(false);
    if(saveError){setError(saveError.code==='23505'?'That username is already taken. Try another.':saveError.message);return}
    set('username',username);
    setSuccess('Profile saved! Your public creator page is ready.');
  }

  async function signOut(){await client?.auth.signOut();router.replace('/')}
  if(loading)return <main className="crew-page crew-profile-page"><div className="crew-shell">Loading your creator profile…</div></main>;
  if(!client)return <main className="crew-page"><div className="crew-shell"><Link href="/">← Home</Link><p>Supabase is not configured. Add the public environment variables in Vercel.</p></div></main>;

  return <main className="crew-page"><div className="crew-shell">
    <Link className="crew-back" href="/">← Back to Find Your Crew</Link>
    <p className="crew-eyebrow">LIKEMINDS / YOUR CREATOR SPACE</p>
    <h1 className="crew-heading">Show your <em>craft.</em></h1>
    <p className="crew-lead">Tell fellow filmmakers who you are and what you want to make. Your profile will help others find you when discovery goes live.</p>
    <form className="crew-form" onSubmit={save}>
      <div className="crew-avatar-row"><div className="crew-avatar-preview">{form.avatar_url?<img src={form.avatar_url} alt="Your profile" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>:'✦'}</div>
      <div className="crew-field"><label htmlFor="crew-photo">Profile photo (JPG, PNG or WebP, max 3 MB)</label><input id="crew-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={photoBusy}/><small>{photoBusy?'Uploading…':'Choose a photo that represents you.'}</small></div></div>
      <div className="crew-grid"><div className="crew-field"><label htmlFor="crew-name">Your name *</label><input id="crew-name" value={form.display_name} onChange={e=>set('display_name',e.target.value)} maxLength={80} required placeholder="How people should know you"/></div>
      <div className="crew-field"><label htmlFor="crew-username">Public username *</label><input id="crew-username" value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} maxLength={24} minLength={3} required/><small>likeminds / creators / {form.username||'yourname'}</small></div></div>
      <div className="crew-grid"><div className="crew-field"><label htmlFor="crew-headline">Creative headline</label><input id="crew-headline" value={form.headline} onChange={e=>set('headline',e.target.value)} maxLength={120} placeholder="Director & storyteller with a love for thrillers"/></div>
      <div className="crew-field"><label htmlFor="crew-location">City</label><input id="crew-location" value={form.location} onChange={e=>set('location',e.target.value)} maxLength={80}/></div></div>
      <div className="crew-field"><label>What do you do? * <small>Select all that apply.</small></label><div className="crew-chips">{CREW_ROLES.map(role=><button type="button" key={role} className="crew-chip" aria-pressed={form.categories.includes(role)} onClick={()=>toggle('categories',role)}>{role}</button>)}</div></div>
      <div className="crew-field"><label htmlFor="crew-bio">Your story</label><textarea id="crew-bio" value={form.bio} onChange={e=>set('bio',e.target.value)} maxLength={600} placeholder="What inspires you? What have you made? What kind of crew do you want to join?"/><small>{form.bio.length}/600 characters</small></div>
      <div className="crew-field"><label htmlFor="crew-skills">Skills</label><input id="crew-skills" value={form.skills_tags} onChange={e=>set('skills_tags',e.target.value)} placeholder="Premiere Pro, Lighting, Screenwriting"/><small>Separate skills with commas.</small></div>
      <div className="crew-field"><label>What are you looking for?</label><div className="crew-chips">{CREW_LOOKING_FOR.map(item=><button type="button" key={item} className="crew-chip" aria-pressed={form.looking_for.includes(item)} onClick={()=>toggle('looking_for',item)}>{item}</button>)}</div></div>
      <label className="crew-checkbox"><input type="checkbox" checked={form.available_for_collaboration} onChange={e=>set('available_for_collaboration',e.target.checked)}/> Open to collaborate / available for crew opportunities</label>
      {error&&<p className="crew-error" role="alert">{error}</p>}{success&&<p className="crew-success" role="status">{success} <Link href={'/creators/'+encodeURIComponent(form.username)}>View profile ↗</Link></p>}
      <div className="crew-actions"><button className="crew-primary" type="submit" disabled={saving||photoBusy}>{saving?'Saving…':'Save my profile →'}</button><button className="crew-text-button" type="button" onClick={signOut}>Sign out</button></div>
    </form>
  </div></main>;
}
