'use client';
import {FormEvent,Suspense,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew,Creator,Project} from '@/lib/crew-types';
import '../../platform.css';

type Member = {id:string;user_id:string;role:string;status:string};

function PersonRow({person,fallback,detail}:{person?:Creator;fallback:string;detail:string}){
  const body = <>{person?.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="lm-avatar">{(person?.display_name || fallback).slice(0,1)}</span>}<div><strong>{person?.display_name || fallback}</strong><p>{detail}</p></div></>;
  if (person?.username) return <Link className="lm-rowitem" href={'/creators/' + encodeURIComponent(person.username)}>{body}</Link>;
  return <article className="lm-rowitem">{body}</article>;
}

function TeamScreen(){
  const {id} = useParams<{id:string}>();
  const {client,user,userId,loading} = useCrewUser();
  const [team,setTeam] = useState<Crew|null>(null);
  const [members,setMembers] = useState<Member[]>([]);
  const [people,setPeople] = useState<Record<string,Creator>>({});
  const [projects,setProjects] = useState<Project[]>([]);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [missing,setMissing] = useState(false);
  const load = useCallback(async () => {
    if (!client || !id) return;
    const {data,error:teamError} = await client.from('crews').select('*').eq('id', id).maybeSingle();
    if (teamError || !data) { setMissing(true); setError(teamError?.message || 'Team not found.'); return; }
    setTeam(data as Crew);
    const [memberRows, links] = await Promise.all([
      client.from('crew_members').select('id,user_id,role,status').eq('crew_id', id),
      client.from('crew_projects').select('projects(id,name,description,owner_id,kind,status,featured,team_name_required,required_roles,starts_on,ends_on,created_at)').eq('crew_id', id),
    ]);
    const list = (memberRows.data || []) as Member[];
    setMembers(list);
    const linked = ((links.data || []) as {projects:Project|Project[]|null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
    setProjects(linked);
    const ids = Array.from(new Set([data.owner_id, ...list.map(member => member.user_id)]));
    if (ids.length) {
      const {data:profiles} = await client.from('profiles').select('*').in('id', ids);
      setPeople(Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person])));
    }
  }, [client, id]);
  useEffect(() => { void load(); }, [load]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening team…</div></main>;
  if (!team) return <PlatformShell><header className="lm-top"><BackButton fallback="/teams" /><HeaderActions /></header><p className="fc-error">{missing ? error || 'Team not found.' : 'Opening team…'}</p></PlatformShell>;
  const owner = team.owner_id === userId;

  async function invite(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if (!client || !owner) return;
    const form = new FormData(e.currentTarget);
    const handle = String(form.get('handle') || '').trim().toLowerCase();
    const {data:person} = await client.from('profiles').select('id').eq('username', handle).maybeSingle();
    if (!person) { setError('No one with that handle.'); return; }
    setError(''); setNotice('');
    const {error:insertError} = await client.from('crew_members').insert({crew_id:id, user_id:person.id, invited_by:userId, role:String(form.get('role') || 'Member'), status:'invited'});
    if (insertError) setError(insertError.message);
    else { setNotice('Invitation sent. They join only if they accept.'); e.currentTarget.reset(); void load(); }
  }

  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/teams" /><HeaderActions /></header>
    <header className="lm-pagehead">
      <p className="lm-kicker">Team</p>
      <h1>{team.name}</h1>
    </header>
    <div className="lm-card" style={{marginTop:16}}><p>{team.description || 'A team can work on more than one project. People join only when they accept an invitation.'}</p></div>
    {error && <p className="lm-alert" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    <section>
      <div className="lm-section"><h2>People</h2></div>
      <PersonRow person={people[team.owner_id]} fallback="Owner" detail="Owner" />
      {members.filter(member => member.status === 'accepted' || member.status === 'invited').map(member => <PersonRow key={member.id} person={people[member.user_id]} fallback="Member" detail={member.status === 'invited' ? 'Invited · ' + member.role : member.role || 'Member'} />)}
      {owner && <form className="lm-card lm-form" style={{marginTop:18}} onSubmit={e => void invite(e)}>
        <h2>Invite someone</h2>
        <label>Handle<input className="lm-field" name="handle" required placeholder="username" /></label>
        <label>Role<input className="lm-field" name="role" defaultValue="Member" /></label>
        <button className="lm-btn" type="submit">Send invitation</button>
      </form>}
    </section>
    <section>
      <div className="lm-section"><h2>Projects</h2></div>
      {projects.map(project => <Link className="lm-rowitem" key={project.id} href={'/projects/' + project.id}><span className="lm-avatar">{project.name.slice(0,1)}</span><div><strong>{project.name}</strong><p>{project.featured ? 'Featured project' : 'Project'}</p></div></Link>)}
      {!projects.length && <div className="lm-empty"><strong>No projects yet</strong><p>Link this team from a project when you are working on it. Members are not added automatically.</p></div>}
    </section>
  </PlatformShell>;
}

export default function TeamPage(){
  return <Suspense fallback={<main className="lm-page"><div className="lm-frame"><div className="lm-main">Opening team…</div></div></main>}><TeamScreen /></Suspense>;
}
