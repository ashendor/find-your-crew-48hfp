'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import HeaderActions from '@/components/HeaderActions';
import Tabs from '@/components/Tabs';
import {useCrewUser} from '@/lib/use-crew';
import type {Connection,Creator,Project} from '@/lib/crew-types';
import '../platform.css';

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
  const [latest,setLatest] = useState<Record<string,Message>>({});
  const [projectLatest,setProjectLatest] = useState<Record<string,Message>>({});
  const [seen,setSeen] = useState<Record<string,string>>({});
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
    const acceptedIds = list.filter(item => item.status === 'accepted').map(item => item.id);
    const latestMap: Record<string, Message> = {};
    if (acceptedIds.length) {
      const {data} = await client.from('messages').select('id,connection_id,sender_id,body,created_at').in('connection_id', acceptedIds).order('created_at', {ascending:false}).limit(400);
      for (const row of (data || []) as Message[]) if (row.connection_id && !latestMap[row.connection_id]) latestMap[row.connection_id] = row;
    }
    setLatest(latestMap);
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
    const projectMap: Record<string, Message> = {};
    const chatIds = [...chatMap.keys()];
    if (chatIds.length) {
      const {data} = await client.from('project_messages').select('id,project_id,sender_id,body,created_at').in('project_id', chatIds).order('created_at', {ascending:false}).limit(200);
      for (const row of (data || []) as Message[]) if (row.project_id && !projectMap[row.project_id]) projectMap[row.project_id] = row;
    }
    setProjectLatest(projectMap);
    setInvites([
      ...crewRows.map(row => ({id:row.id, kind:'crew' as const, label:nameOf(row.crews) || 'Crew', role:row.role})),
      ...projectRows.map(row => ({id:row.id, kind:'project' as const, label:nameOf(row.projects) || 'Project', role:row.role})),
    ]);
  }, [client, userId]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { try { setSeen(JSON.parse(sessionStorage.getItem('lm:inbox-seen') || '{}')); } catch { setSeen({}); } }, []);

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
  const ago = (iso:string) => {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (minutes < 60) return minutes + 'm';
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours + 'h';
    return Math.round(hours / 24) + 'd';
  };
  const preview = (item:Connection) => item.note || (item.purpose === 'project' ? 'Let’s collaborate' + (projects[item.project_id || ''] ? ' on ' + projects[item.project_id || ''].name : '') : item.purpose === 'crew' ? 'About a crew' : 'Wants to connect');
  const face = (person?:Creator) => person?.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="lm-avatar">{(person?.display_name || '?').slice(0,1)}</span>;
  const group = <span className="lm-avatar lm-group" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="9" r="2.2"/><circle cx="16" cy="10" r="1.8"/><path d="M4.5 17.5c.7-2.2 2.2-3.3 4.5-3.3s3.8 1.1 4.5 3.3M13 17.5c.5-1.6 1.6-2.5 3.2-2.5 1.4 0 2.5.7 3.1 2"/></svg></span>;
  const isUnread = (id:string, message?:Message) => !!message && message.sender_id !== userId && seen[id] !== message.created_at;
  const openThread = (id:string) => {
    setThread(id);
    const stamp = latest[id]?.created_at;
    if (!stamp) return;
    setSeen(prev => { const next = {...prev, [id]: stamp}; sessionStorage.setItem('lm:inbox-seen', JSON.stringify(next)); return next; });
  };
  const conversations = [
    ...accepted.map(item => ({kind:'dm' as const, id:item.id, at: latest[item.id]?.created_at || item.created_at, item})),
    ...projectChats.map(project => ({kind:'project' as const, id:project.id, at: projectLatest[project.id]?.created_at || project.created_at, project})),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return <PlatformShell>
    <header className="lm-top lm-inbox-head"><h1>Inbox</h1><HeaderActions /></header>
    <Tabs label="Inbox" current={tab} onChange={item => { setTab(item as typeof tab); setThread(null); }} items={[{id:'messages', label:'Messages'},{id:'requests', label:'Requests', dot:requests.length > 0},{id:'invites', label:'Invites'}]} />
    {error && <p className="fc-error" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    {tab === 'messages' && !active && <div className="lm-inbox">
      {conversations.map(row => {
        if (row.kind === 'dm') {
          const person = other(row.item);
          const last = latest[row.id];
          return <button className="lm-inbox-row" key={row.id} type="button" onClick={() => openThread(row.id)}>{face(person)}<div><strong>{person?.display_name || 'Creator'}</strong><p>{last?.body || preview(row.item)}</p></div><span className="lm-inbox-meta"><time>{ago(row.at)}</time>{isUnread(row.id, last) && <i className="lm-unread" aria-label="Unread"/>}</span></button>;
        }
        const last = projectLatest[row.id];
        return <Link className="lm-inbox-row" key={row.id} href={'/projects/' + row.id} onClick={() => { if (!last) return; setSeen(prev => { const next = {...prev, ['project:' + row.id]: last.created_at}; sessionStorage.setItem('lm:inbox-seen', JSON.stringify(next)); return next; }); }}>{group}<div><strong>{row.project.name}</strong><p>{last?.body || 'Project chat'}</p></div><span className="lm-inbox-meta"><time>{ago(row.at)}</time>{isUnread('project:' + row.id, last) && <i className="lm-unread" aria-label="Unread"/>}</span></Link>;
      })}
      {!conversations.length && <div className="lm-empty"><strong>No conversations yet</strong><p>Connect with a creator first. Accepting a request opens a chat and nothing else.</p><Link className="lm-btn" href="/explore">Find creators</Link></div>}
    </div>}
    {tab === 'messages' && active && <div className="lm-thread">
      <button className="lm-choice" type="button" onClick={() => setThread(null)} style={{border:0}}>‹ {other(active)?.display_name}</button>
      {messages.map(message => <p key={message.id} className={message.sender_id === userId ? 'lm-bubble mine' : 'lm-bubble'}>{message.body}</p>)}
      {!messages.length && <p className="lm-muted">Say hello. This chat does not add anyone to a crew or a project.</p>}
      <form onSubmit={e => void send(e)} className="lm-row"><input className="lm-field" value={draft} onChange={e => setDraft(e.target.value)} aria-label="Message" placeholder="Message" /><button className="lm-btn" disabled={busy || !draft.trim()}>Send</button></form>
    </div>}
    {tab === 'requests' && <>
      {requests.map(item => <article key={item.id}>
        <div className="lm-inbox-row">{face(other(item))}<div><strong>{other(item)?.display_name || 'Creator'}</strong><p>{preview(item)}{item.team_name ? ' · ' + item.team_name : ''}</p></div><span className="lm-inbox-meta"><time>{ago(item.created_at)}</time><i className="lm-unread" aria-label="New"/></span></div>
        <div className="lm-actions lm-pair" style={{margin:'0 0 12px 60px'}}><button className="lm-btn" type="button" disabled={busy} onClick={() => void respond(item.id,'accepted')}>Accept</button><button className="lm-btn-line" type="button" disabled={busy} onClick={() => void respond(item.id,'declined')}>Decline</button></div>
      </article>)}
      {!requests.length && <div className="lm-empty"><strong>No requests waiting</strong><p>When someone wants to connect, you can accept or decline it here.</p></div>}
    </>}
    {tab === 'invites' && <>
      {invites.map(invite => <article key={invite.kind + invite.id}>
        <div className="lm-inbox-row">{group}<div><strong>{invite.label}</strong><p>{invite.kind === 'crew' ? 'Crew invitation' : 'Project invitation'} · {invite.role}</p></div></div>
        <div className="lm-actions lm-pair" style={{margin:'0 0 12px 60px'}}><button className="lm-btn" type="button" disabled={busy} onClick={() => void respondInvite(invite,'accepted')}>Accept</button><button className="lm-btn-line" type="button" disabled={busy} onClick={() => void respondInvite(invite,'declined')}>Decline</button></div>
      </article>)}
      {!invites.length && <div className="lm-empty"><strong>No invitations</strong><p>Crew and project invites show up here. They are separate from connection requests.</p></div>}
    </>}
  </PlatformShell>;
}
