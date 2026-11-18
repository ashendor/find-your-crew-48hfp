'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Creator, Crew, Project} from '@/lib/crew-types';
import {nameOf} from '@/lib/crew-types';
import PlatformBoard, {type PlatformCard} from '@/components/PlatformBoard';
import Tabs from '@/components/Tabs';

export default function CreatorDesk({creator, viewer, onConnect, platforms, extras}:{creator:Creator; viewer:string; onConnect:()=>void; platforms: PlatformCard[]; extras: (PlatformCard & {id: string})[]}){
  const [tab, setTab] = useState<'work'|'projects'|'teams'>('work');
  const [projects, setProjects] = useState<Project[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1180px)');
    const client = getCrewSupabase();
    if (!client) return;
    let active = true;
    const load = () => {
      if (!desktop.matches) return;
      void (async () => {
      const [projectRows, crewRows, link] = await Promise.all([
        client.from('projects').select('*').eq('owner_id', creator.id).order('created_at', {ascending:false}),
        client.from('crews').select('*').eq('owner_id', creator.id).order('created_at', {ascending:false}),
        client.from('connections').select('status').or('and(requester_id.eq.' + viewer + ',recipient_id.eq.' + creator.id + '),and(requester_id.eq.' + creator.id + ',recipient_id.eq.' + viewer + ')').eq('status', 'accepted').limit(1),
      ]);
      if (!active) return;
      setProjects((projectRows.data || []) as Project[]);
      setCrews((crewRows.data || []) as Crew[]);
      setConnected((link.data || []).length > 0);
      })();
    };
    load();
    desktop.addEventListener('change', load);
    return () => { active = false; desktop.removeEventListener('change', load); };
  }, [creator.id, viewer]);
  const cover = creator.avatar_url || '/brand/past-jbr-finals.jpg';
  return <section className="lm-desk lm-desk-profile">
    <div className="lm-desk-cover" style={{backgroundImage:'url(' + JSON.stringify(cover) + ')'}} />
    <div className="lm-desk-id">
      {creator.avatar_url ? <img src={creator.avatar_url} alt="" /> : <span>{nameOf(creator).slice(0,1)}</span>}
      <div>
        <h2>{nameOf(creator)}</h2>
        <p>{creator.primary_role || 'Creator'}{creator.location ? ' · ' + creator.location : ''}</p>
        {(creator.bio || creator.headline) && <p className="lm-desk-bio">{creator.bio || creator.headline}</p>}
        <div className="lm-desk-cta">
          {creator.id === viewer ? <Link className="lm-btn" href="/profile">Edit profile</Link> : <button className="lm-btn" type="button" onClick={onConnect}>Connect</button>}
          {creator.id !== viewer && connected && <Link className="lm-btn-line" href="/inbox">Message</Link>}
        </div>
      </div>
    </div>
    <Tabs label="Creator" current={tab} onChange={item => setTab(item as typeof tab)} items={[{id:'work', label:'Work'},{id:'teams', label:'Teams'}]} />
    {tab === 'work' && <PlatformBoard items={platforms} extras={extras} mine={false} />}
    {tab === 'projects' && (projects.length ? <div>{projects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{project.name.slice(0,1)}</span><div><strong>{project.name}</strong><p>{project.description || 'Project'}</p></div></Link>)}</div> : <div className="lm-empty"><strong>No projects yet</strong><p>Projects this creator starts will show up here.</p></div>)}
    {tab === 'teams' && (crews.length ? <div>{crews.map(crew => <Link className="lm-rowitem" key={crew.id} href={'/teams/' + crew.id}><span className="lm-avatar">{crew.name.slice(0,1)}</span><div><strong>{crew.name}</strong><p>{crew.description || 'Team'}</p></div></Link>)}</div> : <div className="lm-empty"><strong>No teams yet</strong><p>A team appears here only after this creator creates one.</p></div>)}
  </section>;
}
