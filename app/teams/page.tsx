'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew} from '@/lib/crew-types';
import {openingsByCrew,type Opening} from '@/lib/team-openings';
import TeamCopy from '@/components/TeamCopy';
import OpenRoles from '@/components/OpenRoles';
import '../platform.css';

export default function TeamsPage(){
  const {client,user,userId,loading} = useCrewUser();
  const [teams,setTeams] = useState<Crew[]>([]);
  const [openings,setOpenings] = useState<Record<string, Opening[]>>({});
  useEffect(() => {
    if (!client || !userId) return;
    void Promise.all([
      client.from('crews').select('*').eq('owner_id', userId).order('created_at', {ascending:false}),
      client.from('crew_members').select('crews(*)').eq('user_id', userId).eq('status','accepted'),
    ]).then(async ([owned, joined]) => {
      const map = new Map<string, Crew>();
      for (const team of (owned.data || []) as Crew[]) map.set(team.id, team);
      for (const row of (joined.data || []) as {crews:Crew|Crew[]|null}[]) {
        const team = Array.isArray(row.crews) ? row.crews[0] : row.crews;
        if (team?.id) map.set(team.id, team);
      }
      const list = [...map.values()];
      setTeams(list);
      setOpenings(await openingsByCrew(client, list));
    });
  }, [client, userId]);
  if (loading || !user) return <FilmLoader delay={600} />;
  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/profile?tab=teams" /><h1 className="lm-bar-title">Teams</h1><HeaderActions /></header>
    {!teams.length && <div className="lm-empty"><strong>No teams yet</strong><p>Create one when you are ready to work together. A name on a connection request does not make a team.</p><Link className="lm-btn" href="/create?mode=team">Create a team</Link></div>}
    {teams.length > 0 && <section className="lm-teamlist" aria-label="Your teams">
      <div className="lm-teamhead">
        <div><h2>Your teams</h2><p>{teams.length === 1 ? '1 team' : teams.filter(team => team.owner_id === userId).length === teams.length ? 'You lead ' + teams.length : teams.length + ' teams'}</p></div>
        <Link className="lm-addchip" href="/create?mode=team"><span aria-hidden="true">+</span>Add</Link>
      </div>
      <div className="lm-xcards">
        {teams.map(team => <Link className="lm-xcard" key={team.id} href={'/teams/' + team.id}><span className="lm-avatar lm-mark" aria-hidden="true">{team.name.slice(0,1)}</span><span className="lm-xcard-copy"><TeamCopy name={team.name} description={team.description} /></span><OpenRoles items={openings[team.id] || []} /></Link>)}
      </div>
    </section>}
  </PlatformShell>;
}
