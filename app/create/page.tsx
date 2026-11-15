'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,schemaMissing} from '@/lib/crew-types';
import '../crew-app.css';
import '../platform.css';
import '../brand-skin.css';

type Mode = 'menu' | 'work' | 'project' | 'crew' | 'featured';

export default function CreatePage(){
  const {client,user,userId,loading} = useCrewUser();
  const router = useRouter();
  const [mode,setMode] = useState<Mode>('menu');
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
    else router.push('/profile?tab=work');
  }
  async function createProject(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    const roles = form.getAll('roles').map(String);
    setBusy(true); setError('');
    const {data,error:insertError} = await client.from('projects').insert({
      owner_id:userId, name:String(form.get('name')||'').trim(), description:String(form.get('description')||'').trim(),
      kind:'member', status:'published', featured:false, team_name_required:false, required_roles:roles,
    }).select('id').single();
    setBusy(false);
    if (insertError) setError(schemaMissing(insertError) ? 'Run the LikeMinds SQL migration before creating a project.' : insertError.message);
    else router.push('/projects/' + data.id);
  }
  async function createCrew(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('crews').insert({owner_id:userId, name:String(form.get('name')||'').trim().slice(0,70), description:String(form.get('description')||'').trim()});
    setBusy(false);
    if (insertError) setError(insertError.message);
    else router.push('/profile?tab=crews');
  }
  async function createFeatured(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId || !admin) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {data,error:insertError} = await client.from('projects').insert({
      owner_id:userId, name:String(form.get('name')||'').trim(), description:String(form.get('description')||'').trim(),
      kind:'featured', status:'published', featured:true, team_name_required:form.get('team') === 'on',
      required_roles:form.getAll('roles').map(String), starts_on:String(form.get('starts')||'') || null, ends_on:String(form.get('ends')||'') || null,
    }).select('id').single();
    setBusy(false);
    if (insertError) setError(insertError.message);
    else router.push('/projects/' + data.id);
  }

  return <PlatformShell>
    <p className="lm-kicker">Create</p>
    <h1>{mode === 'menu' ? 'What do you want to make?' : mode === 'work' ? 'Share work' : mode === 'project' ? 'Create project' : mode === 'crew' ? 'Create crew' : 'Featured project'}</h1>
    {error && <p className="fc-error" role="alert">{error}</p>}
    {mode === 'menu' && <div className="lm-grid">
      <button className="lm-card" type="button" onClick={() => setMode('work')}><strong>Share work</strong><p>Add a link to Instagram, YouTube, Vimeo, Behance or another site. No file uploads.</p></button>
      <button className="lm-card" type="button" onClick={() => setMode('project')}><strong>Create project</strong><p>A name, a short description and the roles you need.</p></button>
      <button className="lm-card" type="button" onClick={() => setMode('crew')}><strong>Create crew</strong><p>A reusable team you can invite people into later.</p></button>
      {admin && <button className="lm-card" type="button" onClick={() => setMode('featured')}><strong>Publish featured project</strong><p>Admin only. Set whether a team name is mandatory.</p></button>}
    </div>}
    {mode === 'work' && <form className="lm-card" onSubmit={e => void shareWork(e)}>
      <label>Title<input className="lm-field" name="title" required maxLength={80} /></label>
      <label>URL<input className="lm-field" name="url" type="url" required placeholder="https://" /></label>
      <label>Platform<select className="lm-field" name="platform"><option>Instagram</option><option>YouTube</option><option>Vimeo</option><option>Behance</option><option>Dribbble</option><option>Website</option><option>Other</option></select></label>
      <div className="lm-row"><button className="fc-btn" disabled={busy}>Save link</button><button className="fc-btn fc-btn-alt" type="button" onClick={() => setMode('menu')}>Back</button></div>
    </form>}
    {mode === 'project' && <form className="lm-card" onSubmit={e => void createProject(e)}>
      <label>Name<input className="lm-field" name="name" required maxLength={80} /></label>
      <label>Short description<textarea className="lm-field" name="description" required maxLength={400} rows={3} /></label>
      <fieldset><legend>Roles needed</legend><div className="lm-row">{ROLES.map(role => <label key={role}><input type="checkbox" name="roles" value={role} /> {role}</label>)}</div></fieldset>
      <div className="lm-row"><button className="fc-btn" disabled={busy}>Create project</button><button className="fc-btn fc-btn-alt" type="button" onClick={() => setMode('menu')}>Back</button></div>
    </form>}
    {mode === 'crew' && <form className="lm-card" onSubmit={e => void createCrew(e)}>
      <label>Crew name<input className="lm-field" name="name" required minLength={2} maxLength={70} /></label>
      <label>Description (optional)<textarea className="lm-field" name="description" maxLength={300} rows={3} /></label>
      <p className="lm-muted">This is the only place a crew is created. A connection request never creates one.</p>
      <div className="lm-row"><button className="fc-btn" disabled={busy}>Create crew</button><button className="fc-btn fc-btn-alt" type="button" onClick={() => setMode('menu')}>Back</button></div>
    </form>}
    {mode === 'featured' && admin && <form className="lm-card" onSubmit={e => void createFeatured(e)}>
      <label>Name<input className="lm-field" name="name" required maxLength={80} /></label>
      <label>Description<textarea className="lm-field" name="description" required maxLength={500} rows={3} /></label>
      <label>Starts<input className="lm-field" name="starts" type="date" /></label>
      <label>Ends<input className="lm-field" name="ends" type="date" /></label>
      <label><input type="checkbox" name="team" /> Team name is mandatory when connecting for this project</label>
      <fieldset><legend>Roles</legend><div className="lm-row">{ROLES.map(role => <label key={role}><input type="checkbox" name="roles" value={role} /> {role}</label>)}</div></fieldset>
      <div className="lm-row"><button className="fc-btn" disabled={busy}>Publish</button><button className="fc-btn fc-btn-alt" type="button" onClick={() => setMode('menu')}>Back</button></div>
    </form>}
  </PlatformShell>;
}
