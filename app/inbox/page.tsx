'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import {useCrewUser} from '@/lib/use-crew';
import type {Connection,Creator,Project} from '@/lib/crew-types';
import '../crew-app.css';
import '../platform.css';
import '../brand-skin.css';

type Message = {id:string;connection_id?:string;project_id?:string;sender_id:string;body:string;created_at:string};
type Invite = {id:string;kind:'crew'|'project';label:string;role:string};

export default function InboxPage(){
  const {client,user,userId,loading} = useCrewUser();
  const [tab,setTab] = useState<'messages'|'requests'|'invites'>('messages');
  const [connections,setConnections] = useState<Connection[]>([]);
  const [people,setPeople] = useState<Record<string,Creator>>({});
  const [projects,setProjects] = useState<Record<string,Project>>({});
  const [invites,setInvites] = useState<Invite[]>([]);
  const [projectChats,setProjectChats] = useState<Project[]>([]);
  const [thread,setThread] = useState<string|null>(null);
  const [messages,setMessages] = useState<Message[]>([]);
  const [draft,setDraft] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');

  const refresh = useCallback(async () => {
    if (!client || !userId) return;
    const [cons, crewInvites, projectInvites] = await Promise.all([
      client.from('connections').select('*').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId).order('created_at',{ascending:false}),
      client.from('crew_members').select('id,role,crews(name)').eq('user_id',userId).eq('status','invited'),
      client.from('project_members').select('id,role,projects(name)').eq('user_id',userId).eq('status','invited'),
    ]);
    const list = (cons.data || []) as Connection[];
    setConnections(list);
    const ids = Array.from(new Set(list.flatMap(item => [item.requester_id, item.recipient_id]).filter(id => id !== userId)));
    if (ids.length) {
      const {data} = await client.from('profiles').select('*').in('id', ids);
      setPeople(Object.fromEntries(((data || []) as Creator[]).map(person => [person.id, person])));
    }
    const projectIds = list.map(item => item.project_id).filter(Boolean) as string[];
    if (projectIds.length) {
      const {data} = await client.from('projects').select('*').in('id', projectIds);
      setProjects(Object.fromEntries(((data || []) as Project[]).map(project => [project.id, project])));
    }
    const crewRows = ((crewInvites.data || []) as {id:string;role:string;crews:{name:string}|{name:string}[]|null}[]);
    const projectRows = ((projectInvites.data || []) as {id:string;role:string;projects:{name:string}|{name:string}[]|null}[]);
    const nameOf = (value:{name:string}|{name:string}[]|null) => Array.isArray(value) ? value[0]?.name : value?.name;
    const [ownedProjects, memberProjects] = await Promise.all([
      client.from('projects').select('*').eq('owner_id', userId),
      client.from('project_members').select('projects(*)').eq('user_id', userId).eq('status','accepted'),
    ]);
    const joinedProjects = ((memberProjects.data || []) as {projects:Project|Project[]|null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
    const chatMap = new Map<string,Project>();
    for (const project of [...((ownedProjects.data || []) as Project[]), ...joinedProjects]) chatMap.set(project.id, project);
    setProjectChats([...chatMap.values()]);
    setInvites([
      ...crewRows.map(row => ({id:row.id, kind:'crew' as const, label:nameOf(row.crews) || 'Crew', role:row.role})),
      ...projectRows.map(row => ({id:row.id, kind:'project' as const, label:nameOf(row.projects) || 'Project', role:row.role})),
    ]);
  }, [client, userId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const accepted = connections.filter(item => item.status === 'accepted');
  const requests = connections.filter(item => item.status === 'pending' && item.recipient_id === userId);
  const active = accepted.find(item => item.id === thread);

  useEffect(() => {
    if (!client || !active) { setMessages([]); return; }
    void client.from('messages').select('*').eq('connection_id', active.id).order('created_at').then(({data}) => setMessages((data || []) as Message[]));
  }, [client, active]);

  async function respond(id:string, status:'accepted'|'declined'){
    if (!client || busy) return;
    setBusy(true); setError('');
    const {error:updateError} = await client.from('connections').update({status}).eq('id', id).eq('recipient_id', userId);
    setBusy(false);
    if (updateError) setError(updateError.message);
    else { setNotice(status === 'accepted' ? 'You’re connected. Chat is open. No team or project was joined.' : 'Request declined.'); void refresh(); }
  }
  async function respondInvite(invite:Invite, status:'accepted'|'declined'){
    if (!client || busy) return;
    setBusy(true);
    const table = invite.kind === 'crew' ? 'crew_members' : 'project_members';
    const {error:updateError} = await client.from(table).update({status}).eq('id', invite.id).eq('user_id', userId);
    setBusy(false);
    if (updateError) setError(updateError.message);
    else { setNotice(status === 'accepted' ? 'Invitation accepted.' : 'Invitation declined.'); void refresh(); }
  }
  async function send(e:FormEvent){
    e.preventDefault();
    if (!client || !active || !draft.trim()) return;
    setBusy(true);
    const {data,error:sendError} = await client.from('messages').insert({connection_id:active.id, sender_id:userId, body:draft.trim().slice(0,2000)}).select().single();
    setBusy(false);
    if (sendError) setError(sendError.message);
    else { setMessages(list => [...list, data as Message]); setDraft(''); }
  }
  if (loading || !user) return <main className="lm-page"><div className="lm-main">Opening Inbox…</div></main>;
  const other = (item:Connection) => people[item.requester_id === userId ? item.recipient_id : item.requester_id];
  return <PlatformShell>
    <p className="lm-kicker">Inbox</p>
    <h1>Messages and requests.</h1>
    <div className="lm-tabs">
      {(['messages','requests','invites'] as const).map(item => <button key={item} className={tab === item ? 'on' : ''} type="button" onClick={() => setTab(item)}>{item}</button>)}
    </div>
    {error && <p className="fc-error" role="alert">{error}</p>}
    {notice && <p className="fc-notice" role="status">{notice}</p>}
    {tab === 'messages' && <div className="lm-grid">
      <div>{accepted.map(item => <button className="lm-card" key={item.id} type="button" onClick={() => setThread(item.id)}><strong>{other(item)?.display_name || 'Creator'}</strong><p>{item.purpose === 'project' ? 'Project chat context' : 'Direct message'}</p></button>)}
      {!accepted.length && <p className="lm-muted">No conversations yet. Connect with someone first.</p>}
      {projectChats.map(project => <Link className="lm-card" key={project.id} href={'/projects/' + project.id}><span className="lm-kicker">Project chat</span><strong>{project.name}</strong></Link>)}
      <Link href="/explore">Find creators</Link></div>
      {active && <div className="lm-card">
        <strong>{other(active)?.display_name}</strong>
        {messages.map(message => <p key={message.id}><b>{message.sender_id === userId ? 'You' : 'Them'}: </b>{message.body}</p>)}
        <form onSubmit={e => void send(e)} className="lm-row"><input className="lm-field" value={draft} onChange={e => setDraft(e.target.value)} aria-label="Message" /><button className="fc-btn" disabled={busy || !draft.trim()}>Send</button></form>
      </div>}
    </div>}
    {tab === 'requests' && <div className="lm-grid">{requests.map(item => <article className="lm-card" key={item.id}>
      <strong>{other(item)?.display_name || 'Creator'}</strong>
      <p>{item.purpose === 'project' ? 'Collaborate on a project' : item.purpose === 'crew' ? 'Join or build a crew' : 'Just connect'}</p>
      {item.project_id && <p>Project: {projects[item.project_id]?.name || 'Project'}</p>}
      {item.team_name && <p>Team name: {item.team_name}</p>}
      {item.note && <p>{item.note}</p>}
      <div className="lm-row"><button className="fc-btn" type="button" disabled={busy} onClick={() => void respond(item.id,'accepted')}>Accept</button><button className="fc-btn fc-btn-alt" type="button" disabled={busy} onClick={() => void respond(item.id,'declined')}>Decline</button></div>
    </article>)}
    {!requests.length && <p className="lm-muted">No connection requests waiting.</p>}</div>}
    {tab === 'invites' && <div className="lm-grid">{invites.map(invite => <article className="lm-card" key={invite.kind + invite.id}>
      <strong>{invite.label}</strong>
      <p>{invite.kind === 'crew' ? 'Crew invitation' : 'Project invitation'} · {invite.role}</p>
      <div className="lm-row"><button className="fc-btn" type="button" disabled={busy} onClick={() => void respondInvite(invite,'accepted')}>Accept</button><button className="fc-btn fc-btn-alt" type="button" disabled={busy} onClick={() => void respondInvite(invite,'declined')}>Decline</button></div>
    </article>)}
    {!invites.length && <p className="lm-muted">No team or project invitations.</p>}</div>}
  </PlatformShell>;
}
