'use client';
import {ChangeEvent,FormEvent,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import {getCrewSupabase,CREW_AVATAR_BUCKET} from '@/lib/crew-supabase';
import {compressImage} from '@/lib/compress-image';
import {FilmLoader} from '@/components/FilmLoader';
import {INTENTS,ROLES,schemaMissing,type Creator} from '@/lib/crew-types';
import TermsDocument from '@/components/TermsDocument';
import '../platform.css';

const steps = ['Terms', 'You', 'Roles', 'Intent', 'Story', 'Availability'];
const initial = {username:'', display_name:'', avatar_url:'', primary_role:'', categories:[] as string[], intent:'both' as 'join'|'build'|'both', experience:'emerging', headline:'', bio:'', location:'Dubai', portfolio_url:'', available_for_collaboration:true, available_for_48hfp:true};

export default function Onboarding(){
  const router = useRouter();
  const client = getCrewSupabase();
  const photoRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      const {data:{user}} = await client.auth.getUser();
      if (!mounted) return;
      if (!user) { router.replace('/auth'); return; }
      setUserId(user.id);
      const {data} = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!mounted) return;
      if (data?.onboarding_complete) { router.replace('/home'); return; }
      if (data) {
        const p = data as Creator;
        setForm(v => ({...v, username:p.username||v.username, display_name:p.display_name||'', avatar_url:p.avatar_url||'', primary_role:p.primary_role||'', categories:p.categories||[], intent:p.intent||'both', experience:p.experience||'emerging', headline:p.headline||'', bio:p.bio||'', location:p.location||'Dubai', portfolio_url:p.portfolio_url||'', available_for_collaboration:p.available_for_collaboration||false, available_for_48hfp:!!p.available_for_48hfp}));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [client, router]);

  function set<K extends keyof typeof initial>(key:K, value:(typeof initial)[K]){ setForm(v => ({...v, [key]:value})); setError(''); }
  function chosenRoles(current = form){
    return Array.from(new Set([...(current.categories || []), current.primary_role].filter(Boolean)));
  }
  function toggleRole(role:string){
    setForm(current => {
      const selected = chosenRoles(current);
      const next = selected.includes(role) ? selected.filter(item => item !== role) : [...selected, role];
      return {...current, categories: next, primary_role: next[0] || ''};
    });
    setError('');
  }

  async function upload(e:ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if (!client || !userId || !file) return;
    setBusy(true);
    setError('');
    try {
      const image = await compressImage(file);
      const path = userId + '/' + crypto.randomUUID() + '.jpg';
      const {error:uploadError} = await client.storage.from(CREW_AVATAR_BUCKET).upload(path, image, {contentType:'image/jpeg'});
      if (uploadError) throw uploadError;
      set('avatar_url', client.storage.from(CREW_AVATAR_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function next(e?:FormEvent){
    e?.preventDefault();
    setError('');
    if (step === 0 && !accepted) { setError('Accept the Terms before a profile can be created.'); return; }
    if (step === 1 && (!form.display_name.trim() || !/^[a-z0-9_]{3,24}$/.test(form.username))) { setError('Add your name and a username (3–24 lowercase letters, numbers or underscores).'); return; }
    if (step === 2 && !chosenRoles().length) { setError('Choose at least one role.'); return; }
    if (step < 5) { setStep(s => s + 1); return; }
    if (!client || !userId || !accepted) { setError('Accept the Terms before a profile can be created.'); return; }
    setBusy(true);
    const roles = chosenRoles();
    const data = {id:userId, username:form.username.trim().toLowerCase(), display_name:form.display_name.trim().slice(0,80), avatar_url:form.avatar_url||null, primary_role:roles[0] || null, categories:roles, intent:form.intent, experience:form.experience, headline:form.headline.trim().slice(0,120), bio:form.bio.trim().slice(0,600), location:form.location.trim().slice(0,80), portfolio_url:form.portfolio_url.trim().slice(0,300)||null, available_for_collaboration:form.available_for_collaboration, available_for_48hfp:form.available_for_48hfp, onboarding_complete:true, terms_accepted_at:new Date().toISOString(), updated_at:new Date().toISOString()};
    let {error:saveError} = await client.from('profiles').upsert(data, {onConflict:'id'});
    if (saveError && schemaMissing(saveError)) {
      const {terms_accepted_at:_, ...rest} = data;
      ({error:saveError} = await client.from('profiles').upsert(rest, {onConflict:'id'}));
    }
    setBusy(false);
    if (saveError) { setError(saveError.code === '23505' ? 'That username is taken. Choose another.' : saveError.message); return; }
    setReveal(true);
    window.setTimeout(() => router.replace('/home'), 1800);
  }

  if (loading) return <FilmLoader delay={600} />;
  if (!client) return <main className="lm-join"><div className="lm-join-card"><p>Sign-in configuration is missing. <Link href="/auth">Return to sign-in</Link></p></div></main>;

  return <main className="lm-join">
    <div className="lm-join-card">
      <header className="lm-join-top">
        <Link className="lm-word" href="/">LikeMinds</Link>
        <SignOutButton className="lm-join-out" />
      </header>
      <p className="lm-kicker">{steps[step]} · {step + 1} of 6</p>
      <div className="lm-join-bar" aria-hidden="true"><span style={{width:`${((step + 1) / 6) * 100}%`}} /></div>
      <form onSubmit={next}>
        {step === 0 && <>
          <h1 className="lm-join-title">Read the terms</h1>
          <p className="lm-muted">A profile is created only after you accept. You join, and you share details, only if you want to.</p>
          <div className="lm-join-terms"><TermsDocument /></div>
          <p className="lm-muted"><Link href="/terms">Open the terms on their own page</Link></p>
          <label className="lm-join-check"><input type="checkbox" checked={accepted} onChange={e => { setAccepted(e.target.checked); setError(''); }} /> I have read these terms. I join and share details only because I want to.</label>
        </>}
        {step === 1 && <>
          <h1 className="lm-join-title">Who are you?</h1>
          <p className="lm-muted">This is the name people see. You can change it later.</p>
          <div className="lm-join-photo">
            <button className="lm-edit-avatar" type="button" onClick={() => photoRef.current?.click()} disabled={busy} aria-label="Profile photo">{form.avatar_url ? <img src={form.avatar_url} alt="" /> : <span>{(form.display_name || 'You').slice(0, 1)}</span>}</button>
            <div>
              <button className="lm-join-photo-btn" type="button" onClick={() => photoRef.current?.click()} disabled={busy}>{busy ? 'Uploading…' : form.avatar_url ? 'Change photo' : 'Add a photo'}</button>
              <p>Optional</p>
            </div>
            <input ref={photoRef} type="file" accept="image/*" hidden onChange={upload} />
          </div>
          <label className="lm-join-label" htmlFor="ob-name">Your name<input className="lm-field" id="ob-name" required autoComplete="name" maxLength={80} value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Your name" /></label>
          <label className="lm-join-label" htmlFor="ob-user">Username<input className="lm-field" id="ob-user" required minLength={3} maxLength={24} value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="your_name" /></label>
        </>}
        {step === 2 && <>
          <h1 className="lm-join-title">Your roles</h1>
          <p className="lm-muted">Choose every way you work. Each role counts the same.</p>
          <div className="lm-pills">{ROLES.map(role => <button type="button" key={role} aria-pressed={chosenRoles().includes(role)} onClick={() => toggleRole(role)}>{role}</button>)}</div>
          <label className="lm-join-label" htmlFor="ob-exp">Experience<select className="lm-field" id="ob-exp" value={form.experience} onChange={e => set('experience', e.target.value)}><option value="emerging">Emerging</option><option value="experienced">Experienced</option><option value="professional">Professional</option></select></label>
        </>}
        {step === 3 && <>
          <h1 className="lm-join-title">What are you here for?</h1>
          <p className="lm-muted">This helps people understand you. It does not limit what you can do.</p>
          <div className="lm-join-intents">{INTENTS.map(item => <button type="button" key={item.value} aria-pressed={form.intent === item.value} onClick={() => set('intent', item.value as typeof form.intent)}><strong>{item.title}</strong><span>{item.description}</span></button>)}</div>
        </>}
        {step === 4 && <>
          <h1 className="lm-join-title">Your story</h1>
          <p className="lm-muted">A short introduction is enough.</p>
          <label className="lm-join-label" htmlFor="ob-head">One line<input className="lm-field" id="ob-head" value={form.headline} maxLength={120} onChange={e => set('headline', e.target.value)} placeholder="Stories that stay with you" /></label>
          <label className="lm-join-label" htmlFor="ob-bio">About you<textarea className="lm-field" id="ob-bio" maxLength={600} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="What you love making" /></label>
          <label className="lm-join-label" htmlFor="ob-city">City<input className="lm-field" id="ob-city" maxLength={80} value={form.location} onChange={e => set('location', e.target.value)} /></label>
          <label className="lm-join-label" htmlFor="ob-link">A link<input className="lm-field" id="ob-link" type="url" maxLength={300} value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://" /></label>
        </>}
        {step === 5 && <>
          <h1 className="lm-join-title">How you show up</h1>
          <p className="lm-muted">You can change these later.</p>
          <label className="lm-switch"><span>Open to collaboration</span><input type="checkbox" checked={form.available_for_collaboration} onChange={e => set('available_for_collaboration', e.target.checked)} /></label>
          <label className="lm-switch"><span>Available for the 27–29 Nov challenge</span><input type="checkbox" checked={form.available_for_48hfp} onChange={e => set('available_for_48hfp', e.target.checked)} /></label>
          <p className="lm-note">Your account does not register you for the official 48 Hour Film Project. That registration is separate.</p>
        </>}
        {error && <p className="lm-join-error" role="alert">{error}</p>}
        <div className="lm-join-actions">
          {step > 0 && <button className="lm-btn-line" type="button" disabled={busy} onClick={() => setStep(s => s - 1)}>Back</button>}
          <button className="lm-btn" type="submit" disabled={busy || (step === 0 && !accepted)}>{busy ? 'Saving…' : step === 5 ? 'Create profile' : 'Continue'}</button>
        </div>
      </form>
    </div>
    {reveal && <div className="lm-join-done"><div><p className="lm-kicker">Welcome</p><h1 className="lm-join-title">You’re in.</h1><p className="lm-muted">{form.display_name}</p></div></div>}
  </main>;
}
