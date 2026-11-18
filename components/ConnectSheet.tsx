'use client';
import {FormEvent,useEffect,useState} from 'react';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Crew} from '@/lib/crew-types';

export default function ConnectSheet({open,onClose,recipientId,recipientName,recipientAvatar}:{open:boolean;onClose:()=>void;recipientId:string;recipientName:string;recipientAvatar?:string}){
  const client = getCrewSupabase();
  const [purpose,setPurpose] = useState<'network'|'crew'>('network');
  const [crews,setCrews] = useState<Crew[]>([]);
  const [crewId,setCrewId] = useState('');
  const [note,setNote] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  useEffect(() => {
    if (!open || !client) return;
    setPurpose('network');
    setCrewId(''); setNote(''); setError('');
    void (async () => {
      const {data:{user}} = await client.auth.getUser();
      const {data} = user ? await client.from('crews').select('*').eq('owner_id', user.id) : {data:[]};
      setCrews((data || []) as Crew[]);
    })();
  }, [open, client]);

  if (!open) return null;

  async function send(e:FormEvent){
    e.preventDefault();
    if (!client || busy) return;
    const {data:{user}} = await client.auth.getUser();
    if (!user) { setError('Sign in to connect.'); return; }
    setBusy(true); setError('');
    const chosen = crews.find(c => c.id === crewId);
    const {error:insertError} = await client.from('connections').insert({
      requester_id: user.id,
      recipient_id: recipientId,
      status: 'pending',
      purpose,
      project_id: null,
      crew_id: purpose === 'crew' ? crewId || null : null,
      team_name: purpose === 'crew' ? chosen?.name || null : null,
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
          <select value={purpose} onChange={e => setPurpose(e.target.value as typeof purpose)}>
            <option value="network">Just connect</option>
            <option value="crew">Build / join a team</option>
          </select>
        </label>
        <div className="lm-desk lm-purpose-web">
          <p>Why would you like to connect?</p>
          <button type="button" className={purpose === 'network' ? 'on' : ''} onClick={() => setPurpose('network')}>Just connect</button>
          <button type="button" className={purpose === 'crew' ? 'on' : ''} onClick={() => setPurpose('crew')}>Build / join a team</button>
        </div>
        {purpose === 'crew' && crews.length > 0 && <label>Team you already have
          <select value={crewId} onChange={e => setCrewId(e.target.value)}>
            <option value="">None</option>
            {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
