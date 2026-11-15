'use client';
import {FormEvent,Suspense,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import Tabs from '@/components/Tabs';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew,Creator,Project} from '@/lib/crew-types';
import '../../platform.css';

type Member = {id:string;user_id:string;role:string;status:string;invited_by:string|null};
type Chat = {id:string;sender_id:string;body:string;created_at:string};

function ProjectScreen(){
  const {id} = useParams<{id:string}>();
  const {client,user,userId,loading} = useCrewUser();
  const [tab,setTab] = useState<'overview'|'team'|'links'|'chat'>('overview');
  const [project,setProject] = useState<Project|null>(null);
  const [members,setMembers] = useState<Member[]>([]);
  const [people,setPeople] = useState<Record<string,Creator>>({});
  const [links,setLinks] = useState<{id:string;title:string;url:string}[]>([]);
  const [chats,setChats] = useState<Chat[]>([]);
  const [crews,setCrews] = useState<Crew[]>([]);
  const [linked,setLinked] = useState<string[]>([]);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!client || !id) return;
    const {data,error:projectError} = await client.from('projects').select('*').eq('id', id).maybeSingle();
    if (projectError || !data) { setError(projectError?.message || 'Project not found.'); return; }
    setProject(data as Project);
    const [memberRows, linkRows, crewRows, association] = await Promise.all([
      client.from('project_members').select('*').eq('project_id', id),
      client.from('project_links').select('id,title,url').eq('project_id', id),
      client.from('crews').select('*').eq('owner_id', userId),
      client.from('crew_projects').select('crew_id').eq('project_id', id),
    ]);
    const list = (memberRows.data || []) as Member[];
    setMembers(list); setLinks(linkRows.data || []); setCrews((crewRows.data || []) as Crew[]);
    setLinked((association.data || []).map(row => row.crew_id));
    const ids = list.map(member => member.user_id);
    if (ids.length) {
      const {data:profiles} = await client.from('profiles').select('*').in('id', ids);
      setPeople(Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person])));
    }
  }, [client, id, userId]);
  useEffect(() => { void load(); }, [load]);
  const member = members.find(item => item.user_id === userId);
  const canChat = project?.owner_id === userId || member?.status === 'accepted';
  useEffect(() => {
    if (!client || !canChat) return;
    void client.from('project_messages').select('*').eq('project_id', id).order('created_at').then(({data}) => setChats((data || []) as Chat[]));
  }, [client, canChat, id, tab]);
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening project…</div></main>;
  if (!project) return <PlatformShell><header className="lm-top"><BackButton fallback="/home" /><HeaderActions /></header><p className="fc-error">{error || 'Project not found.'}</p></PlatformShell>;

  async function requestJoin(){
    if (!client) return; setBusy(true); setError('');
    const {error:insertError} = await client.from('project_members').insert({project_id:id, user_id:userId, invited_by:userId, role:user?.primary_role || 'Member', status:'invited'});
    setBusy(false);
    if (insertError) setError(insertError.message); else { setNotice('Join request sent. You are not on the team until it is accepted.'); void load(); }
  }
  async function invite(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client) return;
    const form = new FormData(e.currentTarget);
    const handle = String(form.get('handle') || '').trim().toLowerCase();
    const {data:person} = await client.from('profiles').select('id').eq('username', handle).maybeSingle();
    if (!person) { setError('No creator with that handle.'); return; }
    const {error:insertError} = await client.from('project_members').insert({project_id:id, user_id:person.id, invited_by:userId, role:String(form.get('role') || 'Member'), status:'invited'});
    if (insertError) setError(insertError.message); else { setNotice('Invitation sent. They join only if they accept.'); void load(); }
  }
  async function addLink(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !canChat) return;
    const form = new FormData(e.currentTarget);
    const {error:insertError} = await client.from('project_links').insert({project_id:id, title:String(form.get('title')), url:String(form.get('url')), created_by:userId});
    if (insertError) setError(insertError.message); else { e.currentTarget.reset(); void load(); }
  }
  async function sendChat(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if (!client || !canChat) return;
    const form = new FormData(e.currentTarget);
    const body = String(form.get('body') || '').trim();
    if (!body) return;
    const {error:insertError} = await client.from('project_messages').insert({project_id:id, sender_id:userId, body});
    if (insertError) setError(insertError.message); else { e.currentTarget.reset(); const {data} = await client.from('project_messages').select('*').eq('project_id', id).order('created_at'); setChats((data || []) as Chat[]); }
  }
  async function linkCrew(crewId:string){
    if (!client || !crewId) return;
    const {error:insertError} = await client.from('crew_projects').insert({crew_id:crewId, project_id:id});
    if (insertError) setError(insertError.message); else { setNotice('Team linked to this project. Members were not added automatically.'); void load(); }
  }

  const when = (start?:string|null, end?:string|null) => {
    if (!start) return 'Dates to be confirmed';
    const fmt = (value:string) => new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
    return !end || end === start ? fmt(start) : fmt(start) + ' – ' + fmt(end);
  };
  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/home" /><HeaderActions /></header>
    <header className="lm-pagehead">
      <p className="lm-kicker">{project.featured ? 'Featured project' : 'Project'}</p>
      <h1>{project.name}</h1>
    </header>
    <Tabs label="Project" current={tab} onChange={item => setTab(item as typeof tab)} items={[{id:'overview', label:'Overview'},{id:'team', label:'Team'},{id:'links', label:'Links'},{id:'chat', label:'Chat'}]} />
    {error && <p className="lm-alert" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    {tab === 'overview' && <div className="lm-card">
      <p>{project.description}</p>
      <div className="lm-facts">
        <div><span>Dates</span><p>{when(project.starts_on, project.ends_on)}</p></div>
        <div><span>Team name</span><p>{project.team_name_required ? 'Required when you connect for this project.' : 'Optional.'}</p></div>
        {!!project.required_roles?.length && <div><span>Roles</span><div className="lm-pills">{project.required_roles.map(role => <span key={role}>{role}</span>)}</div></div>}
      </div>
      <div className="lm-actions">
        <Link className="lm-btn" href={'/explore?tab=people&project=' + project.id}>Find people</Link>
        {!member && project.owner_id !== userId && <button className="lm-btn-line" type="button" disabled={busy} onClick={() => void requestJoin()}>Request to join</button>}
      </div>
    </div>}
    {tab === 'team' && <div>
      {members.map(item => <article className="lm-rowitem" key={item.id}>{people[item.user_id]?.avatar_url ? <img src={people[item.user_id].avatar_url || ''} alt="" /> : <span className="lm-avatar">{(people[item.user_id]?.display_name || 'C').slice(0,1)}</span>}<div><strong>{people[item.user_id]?.display_name || 'Creator'}</strong><p>{item.role} · {item.status}</p></div></article>)}
      {!members.length && <div className="lm-empty"><strong>No one on the team yet</strong><p>Invitations stay pending until someone accepts. A connection alone does not add them.</p></div>}
      {project.owner_id === userId && <form className="lm-card lm-form" style={{marginTop:18}} onSubmit={e => void invite(e)}>
        <h2>Invite a creator</h2>
        <label>Handle<input className="lm-field" name="handle" required placeholder="username" /></label>
        <label>Role<input className="lm-field" name="role" defaultValue="Member" /></label>
        <button className="lm-btn" type="submit">Send invitation</button>
      </form>}
      {crews.length > 0 && <label className="lm-block" style={{marginTop:16}}>Link a team you own
        <select className="lm-field" defaultValue="" onChange={e => void linkCrew(e.target.value)}>
          <option value="">Choose a team</option>
          {crews.filter(crew => !linked.includes(crew.id)).map(crew => <option key={crew.id} value={crew.id}>{crew.name}</option>)}
        </select>
      </label>}
    </div>}
    {tab === 'links' && <div>
      {links.map(link => <a className="lm-rowitem" key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><span className="lm-avatar">↗</span><div><strong>{link.title}</strong><p>{link.url.replace(/^https?:\/\//, '')}</p></div></a>)}
      {!links.length && <div className="lm-empty"><strong>No links yet</strong><p>Add a Drive folder, script, or reference. Files stay on the original site.</p></div>}
      {canChat && <form className="lm-card lm-form" style={{marginTop:18}} onSubmit={e => void addLink(e)}>
        <h2>Add a link</h2>
        <label>Title<input className="lm-field" name="title" required placeholder="Shot list" /></label>
        <label>URL<input className="lm-field" name="url" type="url" required placeholder="https://" /></label>
        <button className="lm-btn" type="submit">Add link</button>
      </form>}
    </div>}
    {tab === 'chat' && <div>
      {canChat ? <>
        {chats.map(chat => <p key={chat.id} className={chat.sender_id === userId ? 'lm-bubble mine' : 'lm-bubble'}><b>{people[chat.sender_id]?.display_name || (chat.sender_id === userId ? 'You' : 'Member')}</b><br/>{chat.body}</p>)}
        {!chats.length && <div className="lm-empty"><strong>No messages yet</strong><p>This chat is only for people already on the project.</p></div>}
        <form onSubmit={e => void sendChat(e)} className="lm-row" style={{marginTop:14}}><input className="lm-field" name="body" aria-label="Group message" placeholder="Message the team" /><button className="lm-btn" type="submit">Send</button></form>
      </> : <div className="lm-empty"><strong>Chat is for the team</strong><p>You can read and write here after a join request is accepted.</p></div>}
    </div>}
  </PlatformShell>;
}

export default function ProjectPage(){
  return <Suspense fallback={<main className="lm-page"><div className="lm-frame"><div className="lm-main">Opening project…</div></div></main>}><ProjectScreen /></Suspense>;
}
