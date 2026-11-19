'use client';
import {FormEvent,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import Tabs from '@/components/Tabs';
import {useCrewUser} from '@/lib/use-crew';
import {OFFICIAL_TEAM_URL,ROLES,projectTitle,schemaMissing,type Crew,type Creator,type Project} from '@/lib/crew-types';
import ChatThread from '@/components/ChatThread';
import TeamCopy from '@/components/TeamCopy';
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
  const [registered,setRegistered] = useState<Crew[]>([]);
  const [joined,setJoined] = useState<Set<string>>(new Set());
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const [chatDraft,setChatDraft] = useState('');
  const [registerOpen,setRegisterOpen] = useState(false);
  const sending = useRef(false);
  const load = useCallback(async () => {
    if (!client || !id) return;
    const {data,error:projectError} = await client.from('projects').select('*').eq('id', id).maybeSingle();
    if (projectError || !data) { setError(projectError?.message || 'Project not found.'); return; }
    setProject(data as Project);
    const [memberRows, linkRows, crewRows, association, joinedRows] = await Promise.all([
      client.from('project_members').select('*').eq('project_id', id),
      client.from('project_links').select('id,title,url').eq('project_id', id),
      client.from('crews').select('*').eq('owner_id', userId),
      client.from('crew_projects').select('crews(id,name,description,owner_id,created_at)').eq('project_id', id),
      client.from('crew_members').select('crew_id').eq('user_id', userId).eq('status', 'accepted'),
    ]);
    const list = (memberRows.data || []) as Member[];
    const owned = (crewRows.data || []) as Crew[];
    setMembers(list); setLinks(linkRows.data || []); setCrews(owned);
    const onProject = ((association.data || []) as {crews:Crew|Crew[]|null}[])
      .map(row => Array.isArray(row.crews) ? row.crews[0] : row.crews)
      .filter((crew): crew is Crew => !!crew);
    setRegistered(onProject);
    const mine = new Set(((joinedRows.data || []) as {crew_id:string}[]).map(row => row.crew_id));
    for (const crew of owned) mine.add(crew.id);
    setJoined(mine);
    const ids = list.map(member => member.user_id);
    if (ids.length) {
      const {data:profiles} = await client.from('profiles').select('*').in('id', ids);
      setPeople(Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person])));
    }
  }, [client, id, userId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get('tab');
    if (asked === 'overview' || asked === 'team' || asked === 'links' || asked === 'chat') setTab(asked);
  }, []);
  const member = members.find(item => item.user_id === userId);
  const canChat = project?.owner_id === userId || member?.status === 'accepted';
  useEffect(() => {
    if (!client || !canChat) return;
    let cancelled = false;
    void client.from('project_messages').select('*').eq('project_id', id).order('created_at').then(({data}) => {
      if (cancelled) return;
      const rows = (data || []) as Chat[];
      setChats(current => {
        const pendingLocal = current.filter(item => item.id.startsWith('local-'));
        const newer = current.filter(item => !item.id.startsWith('local-') && !rows.some(row => row.id === item.id));
        return [...rows, ...newer, ...pendingLocal];
      });
    });
    return () => { cancelled = true; };
  }, [client, canChat, id, tab]);
  if (loading || !user) return <FilmLoader delay={600} />;
  if (!project) return error ? <PlatformShell><header className="lm-top"><BackButton fallback="/home" /><HeaderActions /></header><p className="fc-error">{error}</p></PlatformShell> : <FilmLoader delay={600} />;

  async function requestJoin(){
    if (!client || !project) return; setBusy(true); setError('');
    if (project.featured) {
      const result = member
        ? await client.from('project_members').update({status:'accepted'}).eq('id', member.id).eq('user_id', userId).select('status').maybeSingle()
        : await client.from('project_members').insert({project_id:id, user_id:userId, invited_by:userId, role:user?.primary_role || 'Member', status:'accepted'}).select('status').maybeSingle();
      setBusy(false);
      const joinError = result.error;
      const blocked = !joinError && result.data?.status !== 'accepted';
      if (joinError || blocked) setError(!joinError || schemaMissing(joinError) || joinError.code === '42501' || /row-level security/i.test(joinError.message || '') ? 'Run the latest LikeMinds SQL update before joining a featured project.' : joinError.message);
      else { setNotice('You joined. This featured project now shows on your profile.'); void load(); }
      return;
    }
    const {error:insertError} = await client.from('project_members').insert({project_id:id, user_id:userId, invited_by:userId, role:user?.primary_role || 'Member', status:'invited'});
    setBusy(false);
    if (insertError) setError(insertError.message); else { setNotice('Join request sent. You are not on the team until it is accepted.'); void load(); }
  }
  async function leaveProject(){
    if (!client || !project || !member || member.status !== 'accepted' || project.owner_id === userId || busy) return;
    if (!window.confirm('Leave ' + projectTitle(project) + '? You can join again later.')) return;
    setBusy(true); setError(''); setNotice('');
    const {error:rpcError} = await client.rpc('leave_project', {p_project:id});
    if (!rpcError) { setMembers(list => list.filter(item => item.user_id !== userId)); setBusy(false); setNotice('You left this project.'); return; }
    if (!schemaMissing(rpcError)) { setBusy(false); setError(rpcError.message); return; }
    const {data,error:deleteError} = await client.from('project_members').delete().eq('id', member.id).eq('user_id', userId).select('id');
    setBusy(false);
    if (deleteError || !data?.length) { setError('Run the latest LikeMinds SQL update before you can leave a project.'); return; }
    setMembers(list => list.filter(item => item.user_id !== userId));
    setNotice('You left this project.');
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
  async function sendChat(){
    if (!client || !canChat || sending.current) return;
    const body = chatDraft.trim().slice(0, 2000);
    if (!body) return;
    sending.current = true;
    setBusy(true);
    setError('');
    setChatDraft('');
    const tempId = 'local-' + crypto.randomUUID();
    setChats(list => [...list, {id:tempId, sender_id:userId, body, created_at:new Date().toISOString()}]);
    const {data,error:insertError} = await client.from('project_messages').insert({project_id:id, sender_id:userId, body}).select('id,sender_id,body,created_at').single();
    sending.current = false;
    setBusy(false);
    if (insertError || !data) {
      setChats(list => list.filter(item => item.id !== tempId));
      setChatDraft(current => current || body);
      setError(insertError?.message || 'Message was not sent.');
      return;
    }
    setChats(list => list.map(item => item.id === tempId ? data as Chat : item));
  }
  async function linkCrew(crewId:string){
    if (!client || !crewId) return;
    const {error:insertError} = await client.from('crew_projects').insert({crew_id:crewId, project_id:id});
    if (insertError) setError(insertError.message);
    else { setRegisterOpen(false); setNotice(project?.name ? 'Team registered. It now shows on this project, and people can request to join it.' : 'Team registered.'); void load(); }
  }

  const stamp = (value?:string|null) => {
    if (!value) return null;
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: date.toLocaleDateString('en-GB', {month:'short'}),
      day: String(date.getDate()),
      year: String(date.getFullYear()),
      full: date.toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'}),
    };
  };
  const start = stamp(project.starts_on);
  const end = stamp(project.ends_on);
  const lines = (project.description || '')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\b42HR Project\b/g, projectTitle(project))
    .split(/(?<=[.!?])\s+/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const about = lines.filter(line => !/official link|register the team|48hourfilm|team name|accepting the request|does not add|not add anyone/i.test(line));
  const joining = lines.filter(line => /accepting the request|does not add|not add anyone/i.test(line));
  const officialHost = OFFICIAL_TEAM_URL.replace(/^https?:\/\/(?:www\.)?/, '');
  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/home" /><HeaderActions /></header>
    <header className="lm-pagehead">
      <p className="lm-kicker">{project.featured ? 'Featured project' : 'Project'}</p>
      <h1>{projectTitle(project)}</h1>
    </header>
    <Tabs label="Project" current={tab} onChange={item => setTab(item as typeof tab)} items={[{id:'overview', label:'Overview'},{id:'team', label:'Teams'},{id:'links', label:'Links'},{id:'chat', label:'Chat'}]} />
    {error && <p className="lm-alert" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    {tab === 'overview' && <div className="lm-card lm-brief">
      <section className="lm-when">
        <h2>Dates</h2>
        {start ? <div className="lm-dates">
          <div className="lm-datechip" aria-hidden="true"><b>{start.month}</b><strong>{start.day}</strong><small>{start.year}</small></div>
          {end && end.full !== start.full && <><span className="lm-date-to">to</span><div className="lm-datechip" aria-hidden="true"><b>{end.month}</b><strong>{end.day}</strong><small>{end.year}</small></div></>}
          <p>{end && end.full !== start.full ? start.full + ' to ' + end.full : start.full}</p>
        </div> : <p>Dates to be confirmed</p>}
      </section>
      {!!about.length && <section>
        <h2>About</h2>
        <ul className="lm-points">{about.map(line => <li key={line}>{line}</li>)}</ul>
      </section>}
      {project.featured && <section>
        <h2>Official registration</h2>
        <p>When the team is ready, register it on the official site.</p>
        <a className="lm-linkrow" href={OFFICIAL_TEAM_URL} target="_blank" rel="noopener noreferrer">
          <span className="lm-linkmark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/></svg></span>
          <span><strong>Continue on the official site</strong><small>{officialHost}</small></span>
          <em aria-hidden="true">↗</em>
        </a>
      </section>}
      <section>
        <h2>Team name</h2>
        <p>{project.team_name_required ? 'Required for this project.' : 'Optional for this project.'}</p>
      </section>
      {!!joining.length && <section>
        <h2>Joining</h2>
        <ul className="lm-points">{joining.map(line => <li key={line}>{line}</li>)}</ul>
      </section>}
      {!!project.required_roles?.length && <section>
        <h2>Roles</h2>
        <div className="lm-pills">{project.required_roles.map(role => <span key={role}>{role}</span>)}</div>
      </section>}
      <div className="lm-actions">
        <Link className="lm-btn" href="/explore">Find people</Link>
        {project.featured && <button className="lm-btn" type="button" onClick={() => setRegisterOpen(true)}>Register your team</button>}
        {project.featured && member?.status !== 'accepted' && project.owner_id !== userId && <button className="lm-btn-line" type="button" disabled={busy} onClick={() => void requestJoin()}>Join</button>}
      </div>
      {member?.status === 'accepted' && project.owner_id !== userId && <button className="lm-danger" type="button" disabled={busy} onClick={() => void leaveProject()}>Leave this project</button>}
    </div>}
    {tab === 'team' && <div>
      {project.featured && <>
        {registered.map(crew => <Link className="lm-rowitem lm-teamline" key={crew.id} href={'/teams/' + crew.id}><span className="lm-avatar">{crew.name.slice(0,1)}</span><div><TeamCopy name={crew.name} description={crew.description} member={joined.has(crew.id)} /></div></Link>)}
        {!registered.length && <div className="lm-empty"><strong>No teams registered yet</strong><p>Register a team and it will show here. People can open it and request to join.</p></div>}
      </>}
      {members.map(item => <article className="lm-rowitem" key={item.id}>{people[item.user_id]?.avatar_url ? <img src={people[item.user_id].avatar_url || ''} alt="" /> : <span className="lm-avatar">{(people[item.user_id]?.display_name || 'C').slice(0,1)}</span>}<div><strong>{people[item.user_id]?.display_name || 'Creator'}</strong><p>{item.role} · {item.status}</p></div></article>)}
      {!project.featured && !members.length && <div className="lm-empty"><strong>No one on the team yet</strong><p>Invitations stay pending until someone accepts. A connection alone does not add them.</p></div>}
      {project.owner_id === userId && <form className="lm-card lm-form" style={{marginTop:18}} onSubmit={e => void invite(e)}>
        <h2>Invite a creator</h2>
        <label>Handle<input className="lm-field" name="handle" required placeholder="username" /></label>
        <label>Role<select className="lm-field" name="role" defaultValue="Producer">{ROLES.map(role => <option key={role}>{role}</option>)}</select></label>
        <button className="lm-btn" type="submit">Send invitation</button>
      </form>}
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
    {tab === 'chat' && (canChat ? <ChatThread embed title={projectTitle(project)} subtitle="Project chat" avatar={<span className="lm-avatar">{projectTitle(project).slice(0,1)}</span>} messages={chats} mine={userId} names={Object.fromEntries(Object.entries(people).map(([key, person]) => [key, person.display_name]))} draft={chatDraft} onDraft={setChatDraft} onSend={() => void sendChat()} busy={busy} empty="No messages yet. This chat is only for people already on the project." placeholder="Message" /> : <div className="lm-empty"><strong>Chat is for the team</strong><p>You can read and write here after a join request is accepted.</p></div>)}
    {registerOpen && <div className="lm-sheet" role="presentation" onClick={() => setRegisterOpen(false)}>
      <div className="lm-sheet-panel lm-register" role="dialog" aria-modal="true" aria-labelledby="lm-register-team" onClick={e => e.stopPropagation()}>
        <div className="lm-grab" aria-hidden="true" />
        <h2 id="lm-register-team">Register your team?</h2>
        <p>Your team will show on this project. People can open it, see who is on it, and request to join.</p>
        {crews.filter(crew => !registered.some(item => item.id === crew.id)).map(crew => <button className="lm-btn" type="button" key={crew.id} disabled={busy} onClick={() => void linkCrew(crew.id)}>Register {crew.name}</button>)}
        {!!crews.length && crews.every(crew => registered.some(item => item.id === crew.id)) && <p>Your team is already registered for this project.</p>}
        <Link className={crews.length ? 'lm-btn-line' : 'lm-btn'} href="/create" onClick={() => setRegisterOpen(false)}>{crews.length ? 'Create another team' : 'Create a team'}</Link>
        <button className="lm-btn-line" type="button" onClick={() => setRegisterOpen(false)}>Not now</button>
      </div>
    </div>}
  </PlatformShell>;
}

export default function ProjectPage(){
  return <Suspense fallback={<FilmLoader delay={600} />}><ProjectScreen /></Suspense>;
}
