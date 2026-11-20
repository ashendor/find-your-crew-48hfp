'use client';
import {FormEvent,useState} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import {useGoBack} from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import {schemaMissing} from '@/lib/crew-types';
import {type RoleNeed} from '@/lib/team-roles';
import RoleNeeds from '@/components/RoleNeeds';
import '../platform.css';

export default function CreatePage(){
  const {client,user,userId,loading} = useCrewUser();
  const leave = useGoBack('/home');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [needs,setNeeds] = useState<RoleNeed[]>([]);
  if (loading || !user) return <FilmLoader delay={600} />;

  async function createCrew(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const row = {owner_id:userId, name:String(form.get('name')||'').trim().slice(0,70), description:String(form.get('description')||'').trim(), role_needs:needs};
    let {error:insertError} = await client.from('crews').insert(row);
    if (insertError && schemaMissing(insertError)) {
      if (needs.length) { setBusy(false); setError('Run the latest LikeMinds SQL update before a team can list the roles it needs.'); return; }
      ({error:insertError} = await client.from('crews').insert({owner_id:row.owner_id, name:row.name, description:row.description}));
    }
    setBusy(false);
    if (insertError) setError(insertError.message);
    else leave();
  }
  return <PlatformShell>
    <div className="lm-create-bg" aria-hidden="true" />
    <div className="lm-sheet" role="presentation" onClick={leave}>
    <div className="lm-sheet-panel lm-create-card" role="dialog" aria-modal="true" aria-labelledby="lm-create-title" onClick={e => e.stopPropagation()}>
    <div className="lm-grab" aria-hidden="true" />
    <div className="lm-create-head"><h1 id="lm-create-title">Create team</h1><div className="lm-nav-actions"><HeaderActions /><button className="lm-iconbtn" type="button" onClick={leave} aria-label="Close">✕</button></div></div>
    {error && <p className="fc-error" role="alert">{error}</p>}
    <form onSubmit={e => void createCrew(e)}>
      <label>Team name<input className="lm-field" name="name" required minLength={2} maxLength={70} /></label>
      <label>Description (optional)<textarea className="lm-field" name="description" maxLength={300} rows={3} /></label>
      <div>
        <p className="lm-kicker">Roles needed</p>
        <p className="lm-muted">Pick a role, then set how many people it needs. Each role counts the same.</p>
        <RoleNeeds value={needs} onChange={setNeeds} />
      </div>
      <p className="lm-muted">After the team exists, register it on the featured project. People can then open it and request to join.</p>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Create team</button></div>
    </form>
    </div></div>
  </PlatformShell>;
}
