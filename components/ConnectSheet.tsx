'use client';
import {FormEvent,useEffect,useState} from 'react';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Crew,Project} from '@/lib/crew-types';

export default function ConnectSheet({open,onClose,recipientId,recipientName,presetProjectId}:{open:boolean;onClose:()=>void;recipientId:string;recipientName:string;presetProjectId?:string}){
  const client = getCrewSupabase();
  const [purpose,setPurpose] = useState<'network'|'project'|'crew'>('network');
  const [projects,setProjects] = useState<Project[]>([]);
  const [crews,setCrews] = useState<Crew[]>([]);
  const [projectId,setProjectId] = useState(presetProjectId || '');
  const [crewId,setCrewId] = useState('');
  const [teamName,setTeamName] = useState('');
  const [note,setNote] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [sent,setSent] = useState(false);
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!open || !client) return;
    setPurpose(presetProjectId ? 'project' : 'network');
    setProjectId(presetProjectId || '');
    setCrewId(''); setTeamName(''); setNote(''); setError(''); setSent(false);
    void (async () => {
      const {data:{user}} = await client.auth.getUser();
      const [p,c] = await Promise.all([
        client.from('projects').select('*').eq('status','published').order('featured',{ascending:false}),
        user ? client.from('crews').select('*').eq('owner_id', user.id) : Promise.resolve({data:[]}),
      ]);
      setProjects((p.data || []) as Project[]);
      setCrews((c.data || []) as Crew[]);
    })();
  }, [open, client, presetProjectId]);

  if (!open) return null;
  const needsTeam = purpose === 'project' && !!project?.team_name_required;

  async function send(e:FormEvent){
    e.preventDefault();
    if (!client || busy) return;
    const {data:{user}} = await client.auth.getUser();
    if (!user) { setError('Sign in to connect.'); return; }
    if (purpose === 'project' && !projectId) { setError('Choose a project.'); return; }
    if (needsTeam && !crewId && teamName.trim().length < 2) { setError('This project needs a team name, or an existing crew.'); return; }
    setBusy(true); setError('');
    const chosen = crews.find(c => c.id === crewId);
    const {error:insertError} = await client.from('connections').insert({
      requester_id: user.id,
      recipient_id: recipientId,
      status: 'pending',
      purpose,
      project_id: purpose === 'project' ? projectId : null,
      crew_id: crewId || null,
      team_name: (chosen?.name || teamName.trim() || null),
      note: note.trim() || null,
    });
    setBusy(false);
    if (insertError) setError(insertError.code === '23505' ? 'A connection already exists or is waiting for a reply.' : insertError.message);
    else setSent(true);
  }

  return <div className="lm-sheet" role="presentation" onClick={onClose}>
    <form onClick={e => e.stopPropagation()} onSubmit={e => void send(e)} aria-label={'Connect with ' + recipientName}>
      <p className="lm-kicker">Connect</p>
      <h2>{recipientName}</h2>
      {sent ? <>
        <p>Request sent. Nothing is added to a crew or a project until someone invites them and they accept.</p>
        <button className="fc-btn" type="button" onClick={onClose}>Done</button>
      </> : <>
        <label>Why are you connecting?
          <select value={purpose} onChange={e => setPurpose(e.target.value as typeof purpose)}>
            <option value="network">Just connect / Network</option>
            <option value="project">Collaborate on a project</option>
            <option value="crew">Join or build a crew</option>
          </select>
        </label>
        {purpose === 'project' && <label>Project
          <select value={projectId} onChange={e => setProjectId(e.target.value)} required>
            <option value="">Choose a project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.team_name_required ? ' · team name required' : ''}</option>)}
          </select>
        </label>}
        {purpose !== 'network' && crews.length > 0 && <label>Existing crew
          <select value={crewId} onChange={e => setCrewId(e.target.value)}>
            <option value="">None — don’t create one</option>
            {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>}
        {purpose === 'project' && !crewId && <label>{needsTeam ? 'Team name' : 'Team name (optional)'}
          <input value={teamName} onChange={e => setTeamName(e.target.value)} maxLength={70} required={needsTeam} placeholder={needsTeam ? 'Required for this project' : 'Only if you already have a name in mind'} />
        </label>}
        <label>Note (optional)
          <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={280} rows={3} placeholder="A short hello" />
        </label>
        <p className="lm-muted">Sending this request does not create a crew or add anyone to a team.</p>
        {error && <p className="fc-error" role="alert">{error}</p>}
        <div className="lm-row">
          <button className="fc-btn" disabled={busy} type="submit">{busy ? 'Sending…' : 'Send request'}</button>
          <button className="fc-btn fc-btn-alt" type="button" onClick={onClose}>Cancel</button>
        </div>
      </>}
    </form>
  </div>;
}
