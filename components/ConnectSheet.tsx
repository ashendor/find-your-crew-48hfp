'use client';
import {FormEvent,useEffect,useState} from 'react';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Crew,Project} from '@/lib/crew-types';

export default function ConnectSheet({open,onClose,recipientId,recipientName,recipientAvatar,presetProjectId}:{open:boolean;onClose:()=>void;recipientId:string;recipientName:string;recipientAvatar?:string;presetProjectId?:string}){
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
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!open || !client) return;
    setPurpose(presetProjectId ? 'project' : 'network');
    setProjectId(presetProjectId || '');
    setCrewId(''); setTeamName(''); setNote(''); setError('');
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
    if (needsTeam && !crewId && teamName.trim().length < 2) { setError('This project needs a team name, or a team you already have.'); return; }
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
    else onClose();
  }

  return <div className="lm-sheet lm-connect" role="presentation" onClick={onClose}>
    <div className="lm-sheet-panel" role="dialog" aria-modal="true" aria-label={'Connect with ' + recipientName} onClick={e => e.stopPropagation()}>
    <div className="lm-grab" aria-hidden="true" />
    <form onSubmit={e => void send(e)}>
      <p className="lm-kicker">Connect</p>
      <button className="lm-desk lm-connect-x" type="button" onClick={onClose} aria-label="Close">×</button>
      <h2>{recipientName}</h2>
      <div className="lm-desk lm-connect-who">
        {recipientAvatar ? <img src={recipientAvatar} alt="" /> : <span>{recipientName.slice(0,1)}</span>}
        <p><span>You're connecting with</span><strong>{recipientName}</strong></p>
      </div>
      <label className="lm-purpose-native">Why would you like to connect?
          <select value={purpose} onChange={e => { setPurpose(e.target.value as typeof purpose); if (e.target.value !== 'project') setProjectId(''); }}>
            <option value="network">Just connect</option>
            <option value="project">Collaborate on a project</option>
            <option value="crew">Build / join a team</option>
          </select>
        </label>
        <div className="lm-desk lm-purpose-web">
          <p>Why would you like to connect?</p>
          <button type="button" className={purpose === 'network' ? 'on' : ''} onClick={() => { setPurpose('network'); setProjectId(''); }}>Just connect</button>
          <button type="button" className={purpose === 'project' ? 'on' : ''} onClick={() => setPurpose('project')}>Collaborate on a project</button>
          <button type="button" className={purpose === 'crew' ? 'on' : ''} onClick={() => { setPurpose('crew'); setProjectId(''); }}>Build / join a team</button>
        </div>
        {purpose === 'project' && <label>Project
          <select value={projectId} onChange={e => setProjectId(e.target.value)} required>
            <option value="">Choose a project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.team_name_required ? ' · team name required' : ''}</option>)}
          </select>
        </label>}
        {purpose !== 'network' && crews.length > 0 && <label>Team you already have
          <select value={crewId} onChange={e => setCrewId(e.target.value)}>
            <option value="">None</option>
            {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>}
        {purpose === 'project' && !crewId && <label>{needsTeam ? 'Team name' : 'Team name (optional)'}
          <input value={teamName} onChange={e => setTeamName(e.target.value)} maxLength={70} required={needsTeam} placeholder={needsTeam ? 'Required for this project' : 'Only if this project asks for one'} />
        </label>}
        <label>
          <span className="lm-phone-label">Message (optional)</span>
          <span className="lm-desk">Add a message (optional)</span>
          <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={280} rows={3} placeholder="A short hello" />
        </label>
        <p className="lm-muted">Sending this request does not create a team or add anyone to a project.</p>
        {error && <p className="fc-error" role="alert">{error}</p>}
        <div className="lm-actions">
          <button className="lm-btn" disabled={busy} type="submit">{busy ? 'Sending…' : 'Send request'}</button>
          <button className="lm-btn-line" type="button" onClick={onClose}>Cancel</button>
        </div>
    </form>
    </div>
  </div>;
}
