'use client';
import {FormEvent,useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import HeaderActions from '@/components/HeaderActions';
import Tabs from '@/components/Tabs';
import {useCrewUser} from '@/lib/use-crew';
import {projectTitle,schemaMissing,type Connection,type Creator,type Project} from '@/lib/crew-types';
import ChatThread from '@/components/ChatThread';
import '../platform.css';

type Message = {id:string;connection_id?:string;project_id?:string;sender_id:string;body:string;created_at:string};
type Invite = {id:string;kind:'crew'|'project';label:string;role:string};
type ChatTarget = {kind:'dm'|'project';id:string;name:string};
const HIDE_KEY = 'lm:inbox-hidden';

function readHides(){
  try { return JSON.parse(localStorage.getItem(HIDE_KEY) || '{}') as Record<string,string>; }
  catch { return {}; }
}

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
  const [query,setQuery] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [pending,setPending] = useState<ChatTarget|null>(null);
  const [hides,setHides] = useState<Record<string,string>>({});
  const sending = useRef(false);

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
    for (const project of [...((ownedProjects.data || []) as Project[]), ...joinedProjects]) if (project.featured) chatMap.set(project.id, project);
    setProjectChats([...chatMap.values()]);
    const projectMap: Record<string, Message> = {};
    const chatIds = [...chatMap.keys()];
    if (chatIds.length) {
      const {data} = await client.from('project_messages').select('id,project_id,sender_id,body,created_at').in('project_id', chatIds).order('created_at', {ascending:false}).limit(200);
      for (const row of (data || []) as Message[]) if (row.project_id && !projectMap[row.project_id]) projectMap[row.project_id] = row;
    }
    setProjectLatest(projectMap);
    const [directHides, projectHides] = await Promise.all([
      client.from('direct_chat_hides').select('connection_id,hidden_at').eq('user_id', userId),
      client.from('project_inbox_hides').select('project_id,hidden_at').eq('user_id', userId),
    ]);
    const stored = readHides();
    if (!schemaMissing(directHides.error)) {
      for (const row of (directHides.data || []) as {connection_id:string;hidden_at:string}[]) stored['dm:' + row.connection_id] = row.hidden_at;
    }
    if (!schemaMissing(projectHides.error)) {
      for (const row of (projectHides.data || []) as {project_id:string;hidden_at:string}[]) stored['project:' + row.project_id] = row.hidden_at;
    }
    const openId = new URLSearchParams(window.location.search).get('chat');
    if (openId) delete stored['dm:' + openId];
    setHides(stored);
    setInvites([
      ...crewRows.map(row => ({id:row.id, kind:'crew' as const, label:nameOf(row.crews) || 'Team', role:row.role})),
      ...projectRows.map(row => ({id:row.id, kind:'project' as const, label:nameOf(row.projects) || 'Project', role:row.role})),
    ]);
  }, [client, userId]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { try { setSeen(JSON.parse(sessionStorage.getItem('lm:inbox-seen') || '{}')); } catch { setSeen({}); } }, []);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('chat');
    if (!id || !client || !userId) return;
    setThread(id);
    setHides(prev => {
      if (!prev['dm:' + id]) return prev;
      const next = {...prev};
      delete next['dm:' + id];
      localStorage.setItem(HIDE_KEY, JSON.stringify(next));
      return next;
    });
    void client.from('direct_chat_hides').delete().eq('user_id', userId).eq('connection_id', id);
  }, [client, userId]);

  const accepted = connections.filter(item => item.status === 'accepted');
  const requests = connections.filter(item => item.status === 'pending' && item.recipient_id === userId);
  const active = accepted.find(item => item.id === thread);

  useEffect(() => {
    if (!client || !active) { setMessages([]); return; }
    let cancelled = false;
    void client.from('messages').select('*').eq('connection_id', active.id).order('created_at').then(({data}) => {
      if (cancelled) return;
      const rows = (data || []) as Message[];
      setMessages(current => {
        const pendingLocal = current.filter(item => item.id.startsWith('local-') && item.connection_id === active.id);
        const newer = current.filter(item => !item.id.startsWith('local-') && item.connection_id === active.id && !rows.some(row => row.id === item.id));
        return [...rows, ...newer, ...pendingLocal];
      });
    });
    return () => { cancelled = true; };
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
    else { setNotice(status === 'accepted' ? (invite.kind === 'crew' ? 'You are part of the team.' : 'Invitation accepted.') : 'Invitation declined.'); void refresh(); }
  }
  async function send(e?:FormEvent){
    e?.preventDefault();
    const body = draft.trim().slice(0, 2000);
    if (!client || !active || !body || sending.current) return;
    sending.current = true;
    setBusy(true);
    setError('');
    const tempId = 'local-' + crypto.randomUUID();
    const optimistic: Message = {id:tempId, connection_id:active.id, sender_id:userId, body, created_at:new Date().toISOString()};
    setMessages(list => [...list, optimistic]);
    setDraft('');
    setLatest(prev => ({...prev, [active.id]: optimistic}));
    const {data,error:sendError} = await client.from('messages').insert({connection_id:active.id, sender_id:userId, body}).select().single();
    sending.current = false;
    setBusy(false);
    if (sendError || !data) {
      setMessages(list => list.filter(item => item.id !== tempId));
      setDraft(current => current || body);
      setError(sendError?.message || 'Message was not sent.');
      return;
    }
    const saved = data as Message;
    setMessages(list => list.map(item => item.id === tempId ? saved : item));
    setLatest(prev => ({...prev, [active.id]: saved}));
    setHides(prev => {
      if (!prev['dm:' + active.id]) return prev;
      const next = {...prev};
      delete next['dm:' + active.id];
      localStorage.setItem(HIDE_KEY, JSON.stringify(next));
      return next;
    });
    void client.from('direct_chat_hides').delete().eq('user_id', userId).eq('connection_id', active.id);
  }
  function rememberHide(key:string, stamp:string){
    setHides(prev => {
      const next = {...prev, [key]: stamp};
      localStorage.setItem(HIDE_KEY, JSON.stringify(next));
      return next;
    });
  }
  async function deleteChat(scope:'me'|'both'){
    if (!client || !pending || busy) return;
    setBusy(true); setError('');
    const stamp = new Date().toISOString();
    const key = pending.kind + ':' + pending.id;
    const url = new URL(window.location.href);
    url.searchParams.delete('chat');
    window.history.replaceState(null, '', url.pathname + url.search);
    if (pending.kind === 'project') {
      const {error:hideError} = await client.from('project_inbox_hides').upsert({user_id:userId, project_id:pending.id, hidden_at:stamp});
      setBusy(false);
      if (hideError && !schemaMissing(hideError)) { setError(hideError.message); return; }
      rememberHide(key, stamp);
      setPending(null);
      setNotice('Removed from your inbox. The project chat is still on the project.');
      return;
    }
    if (scope === 'both') {
      const {error:deleteError} = await client.rpc('delete_direct_chat', {p_connection:pending.id, p_both:true});
      setBusy(false);
      if (deleteError) { setError(schemaMissing(deleteError) ? 'Run the latest LikeMinds SQL update before deleting a chat for both people.' : deleteError.message); return; }
      rememberHide(key, stamp);
      setMessages([]);
      setThread(null);
      setPending(null);
      setNotice('Chat deleted for both of you. You are still connected.');
      void refresh();
      return;
    }
    const {error:hideError} = await client.from('direct_chat_hides').upsert({user_id:userId, connection_id:pending.id, hidden_at:stamp});
    setBusy(false);
    if (hideError && !schemaMissing(hideError)) { setError(hideError.message); return; }
    rememberHide(key, stamp);
    setThread(null);
    setPending(null);
    setNotice('Removed from your inbox. The other person still has the messages.');
  }
  if (loading || !user) return <FilmLoader delay={600} />;
  const other = (item:Connection) => people[item.requester_id === userId ? item.recipient_id : item.requester_id];
  const ago = (iso:string) => {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (minutes < 60) return minutes + 'm';
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours + 'h';
    return Math.round(hours / 24) + 'd';
  };
  const preview = (item:Connection) => item.note || (item.purpose === 'project' ? 'Let’s collaborate' + (projects[item.project_id || ''] ? ' on ' + projects[item.project_id || ''].name : '') : item.purpose === 'crew' ? 'About a team' : 'Wants to connect');
  const face = (person?:Creator) => person?.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="lm-avatar">{(person?.display_name || '?').slice(0,1)}</span>;
  const group = <span className="lm-avatar lm-group" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="9" r="2.2"/><circle cx="16" cy="10" r="1.8"/><path d="M4.5 17.5c.7-2.2 2.2-3.3 4.5-3.3s3.8 1.1 4.5 3.3M13 17.5c.5-1.6 1.6-2.5 3.2-2.5 1.4 0 2.5.7 3.1 2"/></svg></span>;
  const isUnread = (id:string, message?:Message) => !!message && message.sender_id !== userId && seen[id] !== message.created_at;
  const concealed = (key:string, at:string) => !!hides[key] && +new Date(at) <= +new Date(hides[key]);
  const conversations = [
    ...accepted.map(item => ({kind:'dm' as const, id:item.id, at: latest[item.id]?.created_at || item.created_at, item})),
    ...projectChats.map(project => ({kind:'project' as const, id:project.id, at: projectLatest[project.id]?.created_at || project.created_at, project})),
  ].filter(row => !concealed(row.kind + ':' + row.id, row.at)).sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const openThread = (id:string) => {
    setThread(id);
    const url = new URL(window.location.href);
    url.searchParams.set('chat', id);
    window.history.replaceState(null, '', url.pathname + url.search);
    const stamp = latest[id]?.created_at;
    if (!stamp) return;
    setSeen(prev => { const next = {...prev, [id]: stamp}; sessionStorage.setItem('lm:inbox-seen', JSON.stringify(next)); return next; });
  };
  const closeThread = () => {
    setThread(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('chat');
    window.history.replaceState(null, '', url.pathname + (url.search || ''));
  };
  const needle = query.trim().toLowerCase();
  const visible = conversations.filter(row => {
    if (!needle) return true;
    if (row.kind === 'dm') {
      const person = other(row.item);
      return (person?.display_name || '').toLowerCase().includes(needle) || (latest[row.id]?.body || '').toLowerCase().includes(needle);
    }
    return projectTitle(row.project).toLowerCase().includes(needle) || (projectLatest[row.id]?.body || '').toLowerCase().includes(needle);
  });
  const line = (last:Message|undefined, fallback:string) => !last ? fallback : (last.sender_id === userId ? 'You: ' : '') + last.body.replace(/\s+/g, ' ');
  const person = active ? other(active) : undefined;
  const threadOpen = tab === 'messages' && !!active;
  return <PlatformShell>
    <div className={'lm-inbox-screen' + (tab === 'messages' ? ' is-split' : '') + (threadOpen ? ' is-open' : '')}>
    <div className="lm-inbox-pane">
    <header className="lm-top lm-inbox-head"><h1>Inbox</h1><HeaderActions /></header>
    <Tabs label="Inbox" current={tab} onChange={item => { setTab(item as typeof tab); closeThread(); }} items={[{id:'messages', label:'Messages'},{id:'requests', label:'Requests', dot:requests.length > 0},{id:'invites', label:'Invites'}]} />
    {error && !threadOpen && <p className="fc-error" role="alert">{error}</p>}
    {notice && !threadOpen && <p className="lm-note" role="status">{notice}</p>}
    {tab === 'messages' && <div className="lm-inbox">
      {conversations.length > 0 && <label className="lm-find-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        <input aria-label="Search conversations" placeholder="Search conversations" value={query} onChange={e => setQuery(e.target.value)} />
      </label>}
      {visible.map(row => {
        if (row.kind === 'dm') {
          const person = other(row.item);
          const last = latest[row.id];
          const name = person?.display_name || 'Creator';
          const unread = isUnread(row.id, last);
          return <div className={'lm-inbox-row' + (unread ? ' is-unread' : '') + (thread === row.id ? ' is-active' : '')} key={row.id}><button className="lm-inbox-open" type="button" onClick={() => openThread(row.id)}>{face(person)}<div><strong>{name}</strong><p>{line(last, preview(row.item))}</p></div></button><div className="lm-inbox-meta"><time>{ago(row.at)}</time>{unread && <i className="lm-unread" aria-label="Unread"/>}<button className="lm-inbox-delete" type="button" aria-label={'Delete chat with ' + name} onClick={() => setPending({kind:'dm', id:row.id, name})}>×</button></div></div>;
        }
        const last = projectLatest[row.id];
        const title = projectTitle(row.project);
        const unread = isUnread('project:' + row.id, last);
        return <div className={'lm-inbox-row' + (unread ? ' is-unread' : '')} key={row.id}><Link className="lm-inbox-open" href={'/projects/' + row.id + '?tab=chat'} onClick={() => { if (!last) return; setSeen(prev => { const next = {...prev, ['project:' + row.id]: last.created_at}; sessionStorage.setItem('lm:inbox-seen', JSON.stringify(next)); return next; }); }}>{group}<div><strong>{title}</strong><p>{line(last, 'Project chat')}</p></div></Link><div className="lm-inbox-meta"><time>{ago(row.at)}</time>{unread && <i className="lm-unread" aria-label="Unread"/>}<button className="lm-inbox-delete" type="button" aria-label={'Remove ' + title} onClick={() => setPending({kind:'project', id:row.id, name:title})}>×</button></div></div>;
      })}
      {!conversations.length && <div className="lm-empty"><strong>No conversations yet</strong><p>Connect with someone first. Accepting a request opens a chat and nothing else.</p><Link className="lm-btn" href="/explore">Find people</Link></div>}
      {!!conversations.length && !visible.length && <p className="lm-muted">No conversation matches that search.</p>}
    </div>}
    {tab === 'requests' && <>
      {requests.map(item => <article className="lm-request" key={item.id}>
        <div className="lm-inbox-row">
          <div className="lm-inbox-open">{face(other(item))}<div><strong>{other(item)?.display_name || 'Creator'}</strong><p>{preview(item)}{item.team_name ? ' · ' + item.team_name : ''}</p></div></div>
          <div className="lm-inbox-meta"><time>{ago(item.created_at)}</time><i className="lm-unread" aria-label="New"/></div>
        </div>
        <div className="lm-actions lm-pair"><button className="lm-btn" type="button" disabled={busy} onClick={() => void respond(item.id,'accepted')}>Accept</button><button className="lm-btn-line" type="button" disabled={busy} onClick={() => void respond(item.id,'declined')}>Decline</button></div>
      </article>)}
      {!requests.length && <div className="lm-empty"><strong>No requests waiting</strong><p>When someone wants to connect, you can accept or decline it here.</p></div>}
    </>}
    {tab === 'invites' && <>
      {invites.map(invite => <article className="lm-request" key={invite.kind + invite.id}>
        <div className="lm-inbox-row">
          <div className="lm-inbox-open">{group}<div><strong>{invite.label}</strong><p>{invite.kind === 'crew' ? 'Team invitation' : 'Project invitation'} · {invite.role}</p></div></div>
        </div>
        <div className="lm-actions lm-pair"><button className="lm-btn" type="button" disabled={busy} onClick={() => void respondInvite(invite,'accepted')}>Accept</button><button className="lm-btn-line" type="button" disabled={busy} onClick={() => void respondInvite(invite,'declined')}>Decline</button></div>
      </article>)}
      {!invites.length && <div className="lm-empty"><strong>No invitations</strong><p>Team and project invites show up here. They are separate from connection requests.</p></div>}
    </>}
    </div>
    {threadOpen && active && <ChatThread
      title={person?.display_name || 'Creator'}
      subtitle={person?.primary_role || 'Direct message'}
      avatar={face(person)}
      messages={messages}
      mine={userId}
      draft={draft}
      onDraft={setDraft}
      onSend={() => void send()}
      busy={busy}
      onBack={closeThread}
      onMore={() => setPending({kind:'dm', id:active.id, name:person?.display_name || 'Creator'})}
      empty="Say hello. This chat does not add anyone to a team or a project."
      placeholder="Message"
      alert={error}
      note={notice}
    />}
    {tab === 'messages' && !threadOpen && <div className="lm-chat-placeholder"><div><strong>Your conversations</strong><p>Choose someone to continue the chat.</p></div></div>}
    </div>
    {pending && <div className="lm-sheet" role="presentation" onClick={() => setPending(null)}>
      <div className="lm-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="lm-delete-chat" onClick={e => e.stopPropagation()}>
        <div className="lm-grab" aria-hidden="true" />
        <h2 id="lm-delete-chat">Delete chat</h2>
        <p className="lm-muted">{pending.name}. This does not end the connection.</p>
        {pending.kind === 'dm' ? <>
          <button className="lm-choice" type="button" disabled={busy} onClick={() => void deleteChat('me')}><span><strong>Remove from my inbox</strong><p>The other person keeps the messages.</p></span></button>
          <button className="lm-choice" type="button" disabled={busy} onClick={() => void deleteChat('both')}><span><strong>Delete for both</strong><p>Messages are removed for both of you.</p></span></button>
        </> : <button className="lm-choice" type="button" disabled={busy} onClick={() => void deleteChat('me')}><span><strong>Remove from my inbox</strong><p>The messages stay on the project page.</p></span></button>}
        <button className="lm-btn-line" type="button" onClick={() => setPending(null)}>Cancel</button>
      </div>
    </div>}
  </PlatformShell>;
}
