'use client';
import {FormEvent,useState} from 'react';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import {useGoBack} from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import '../platform.css';

export default function CreatePage(){
  const {client,user,userId,loading} = useCrewUser();
  const leave = useGoBack('/home');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  if (loading || !user) return <FilmLoader delay={600} />;

  async function createCrew(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !userId) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const {error:insertError} = await client.from('crews').insert({owner_id:userId, name:String(form.get('name')||'').trim().slice(0,70), description:String(form.get('description')||'').trim()});
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
      <p className="lm-muted">This is the only place a team is created. Register it for the featured project from the team page.</p>
      <div className="lm-row"><button className="lm-btn" disabled={busy}>Create team</button></div>
    </form>
    </div></div>
  </PlatformShell>;
}
