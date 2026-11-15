'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew} from '@/lib/crew-types';
import '../platform.css';

export default function TeamsPage(){
  const {client,user,userId,loading} = useCrewUser();
  const [teams,setTeams] = useState<Crew[]>([]);
  useEffect(() => {
    if (!client || !userId) return;
    void Promise.all([
      client.from('crews').select('*').eq('owner_id', userId).order('created_at', {ascending:false}),
      client.from('crew_members').select('crews(*)').eq('user_id', userId).eq('status','accepted'),
    ]).then(([owned, joined]) => {
      const map = new Map<string, Crew>();
      for (const team of (owned.data || []) as Crew[]) map.set(team.id, team);
      for (const row of (joined.data || []) as {crews:Crew|Crew[]|null}[]) {
        const team = Array.isArray(row.crews) ? row.crews[0] : row.crews;
        if (team?.id) map.set(team.id, team);
      }
      setTeams([...map.values()]);
    });
  }, [client, userId]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening teams…</div></main>;
  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/profile?tab=teams" /><h1 className="lm-bar-title">Teams</h1><HeaderActions /></header>
    {teams.map(team => <Link className="lm-rowitem" key={team.id} href={'/teams/' + team.id}><span className="lm-avatar">{team.name.slice(0,1)}</span><div><strong>{team.name}</strong><p>{team.description || 'Team'}</p></div></Link>)}
    {!teams.length && <div className="lm-empty"><strong>No teams yet</strong><p>Create one when you are ready to work together. A name on a connection request does not make a team.</p><Link className="lm-btn" href="/create?mode=team">Create a team</Link></div>}
    {teams.length > 0 && <Link className="lm-addline" href="/create?mode=team">Add a team</Link>}
  </PlatformShell>;
}
