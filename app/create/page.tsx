'use client';
import {FormEvent,useEffect,useState} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import {useGoBack} from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,schemaMissing} from '@/lib/crew-types';
import '../platform.css';

type Mode = 'menu' | 'work' | 'project' | 'crew' | 'featured';

export default function CreatePage(){
  const {client,user,userId,loading} = useCrewUser();
  const leave = useGoBack('/home');
  const [mode,setMode] = useState<Mode>('menu');
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get('mode');
    if (asked === 'work' || asked === 'project' || asked === 'crew' || asked === 'featured') setMode(asked);
  }, []);
  const [admin,setAdmin] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => {
    if (!client || !userId) return;
    void client.from('platform_admins').select('user_id').eq('user_id', userId).maybeSingle().then(({data,error:adminError}) => {
      if (!schemaMissing(adminError)) setAdmin(!!data);
    });
  }, [client, userId]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening Create…</div></main>;

  async function shareWork(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('works').insert({user_id:userId, title:String(form.get('title')||'').trim(), url:String(form.get('url')||'').trim(), platform:String(form.get('platform')||'')});
    setBusy(false);
    if (insertError) setError(schemaMissing(insertError) ? 'Run the LikeMinds SQL migration before sharing work.' : insertError.message);
    else leave();
  }
  async function createProject(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    const roles = form.getAll('roles').map(String);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('projects').insert({
      owner_id:userId, name:String(form.get('name')||'').trim(), description:String(form.get('description')||'').trim(),
      kind:'member', status:'published', featured:false, team_name_required:false, required_roles:roles,
    });
    setBusy(false);
    if (insertError) setError(schemaMissing(insertError) ? 'Run the LikeMinds SQL migration before creating a project.' : insertError.message);
    else leave();
  }
  async function createCrew(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('crews').insert({owner_id:userId, name:String(form.get('name')||'').trim().slice(0,70), description:String(form.get('description')||'').trim()});
    setBusy(false);
    if (insertError) setError(insertError.message);
    else leave();
  }
  async function createFeatured(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId || !admin) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('projects').insert({
      owner_id:userId, name:String(form.get('name')||'').trim(), description:String(form.get('description')||'').trim(),
      kind:'featured', status:'published', featured:true, team_name_required:form.get('team') === 'on',
      required_roles:form.getAll('roles').map(String), starts_on:String(form.get('starts')||'') || null, ends_on:String(form.get('ends')||'') || null,
    });
    setBusy(false);
    if (insertError) setError(insertError.message);
    else leave();
  }

  const title = mode === 'menu' ? 'Create' : mode === 'work' ? 'Share work' : mode === 'project' ? 'Create project' : mode === 'crew' ? 'Create crew' : 'Featured project';
  const back = <button className="lm-iconbtn" type="button" onClick={() => setMode('menu')} aria-label="Back">←</button>;
  return <PlatformShell>
    <div className="lm-create-bg" aria-hidden="true" />
    <div className="lm-sheet" role="presentation" onClick={() => mode === 'menu' ? leave() : setMode('menu')}>
    <div className="lm-sheet-panel lm-create-card" role="dialog" aria-modal="true" aria-labelledby="lm-create-title" key={mode} onClick={e => e.stopPropagation()}>
    <div className="lm-grab" aria-hidden="true" />
    <div className="lm-create-head"><h1 id="lm-create-title">{title}</h1><div className="lm-nav-actions"><HeaderActions />{mode === 'menu' ? <button className="lm-iconbtn" type="button" onClick={leave} aria-label="Close">✕</button> : back}</div></div>
    {error && <p className="fc-error" role="alert">{error}</p>}
    {mode === 'menu' && <>
      <button className="lm-choice" type="button" onClick={() => setMode('work')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg><span><strong>Share Work</strong><p>Add a link to your creative work (Instagram, YouTube, Vimeo, etc.)</p></span><em>›</em></button>
      <button className="lm-choice" type="button" onClick={() => setMode('project')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2M10 12h4"/></svg><span><strong>Create Project</strong><p>Start a new creative project and find collaborators.</p></span><em>›</em></button>
      <button className="lm-choice" type="button" onClick={() => setMode('crew')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M3.5 18c.8-2.4 2.4-3.5 4.5-3.5s3.7 1.1 4.5 3.5M12 18c.7-2 2-3 4-3s3.3 1 4 3"/></svg><span><strong>Create Crew</strong><p>Form a team for one or more projects.</p></span><em>›</em></button>
      {admin && <button className="lm-choice" type="button" onClick={() => setMode('featured')}><span><strong>Featured project</strong><p>Admin only. Set whether a team name is mandatory.</p></span><em>›</em></button>}
    </>}
    {mode === 'work' && <form onSubmit={e => void shareWork(e)}>
      <label>Title<input className="lm-field" name="title" required maxLength={80} /></label>
      <label>URL<input className="lm-field" name="url" type="url" required placeholder="https://" /></label>
      <label>Platform<select className="lm-field" name="platform"><option>Instagram</option><option>YouTube</option><option>Vimeo</option><option>Behance</option><option>Dribbble</option><option>Website</option><option>Other</option></select></label>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Save link</button></div>
    </form>}
    {mode === 'project' && <form onSubmit={e => void createProject(e)}>
      <label>Name<input className="lm-field" name="name" required maxLength={80} /></label>
      <label>Short description<textarea className="lm-field" name="description" required maxLength={400} rows={3} /></label>
      <fieldset><legend>Roles needed</legend><div className="lm-chips">{ROLES.map(role => <label key={role}><input type="checkbox" name="roles" value={role} />{role}</label>)}</div></fieldset>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Create project</button></div>
    </form>}
    {mode === 'crew' && <form onSubmit={e => void createCrew(e)}>
      <label>Crew name<input className="lm-field" name="name" required minLength={2} maxLength={70} /></label>
      <label>Description (optional)<textarea className="lm-field" name="description" maxLength={300} rows={3} /></label>
      <p className="lm-muted">This is the only place a crew is created. A connection request never creates one.</p>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Create crew</button></div>
    </form>}
    {mode === 'featured' && admin && <form onSubmit={e => void createFeatured(e)}>
      <label>Name<input className="lm-field" name="name" required maxLength={80} /></label>
      <label>Description<textarea className="lm-field" name="description" required maxLength={500} rows={3} /></label>
      <label>Starts<input className="lm-field" name="starts" type="date" /></label>
      <label>Ends<input className="lm-field" name="ends" type="date" /></label>
      <label className="lm-switch">Team name is mandatory when connecting for this project<input type="checkbox" name="team" /></label>
      <fieldset><legend>Roles</legend><div className="lm-chips">{ROLES.map(role => <label key={role}><input type="checkbox" name="roles" value={role} />{role}</label>)}</div></fieldset>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Publish</button></div>
    </form>}
    </div></div>
  </PlatformShell>;
}
