'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import {useCrewUser} from '@/lib/use-crew';
import type {Crew,Creator,Project} from '@/lib/crew-types';
import '../../crew-app.css';
import '../../platform.css';
import '../../brand-skin.css';

type Member = {id:string;user_id:string;role:string;status:string;invited_by:string|null};
type Chat = {id:string;sender_id:string;body:string;created_at:string};

export default function ProjectPage(){
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
  if (!project) return <PlatformShell><p className="fc-error">{error || 'Project not found.'}</p></PlatformShell>;

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
    if (insertError) setError(insertError.message); else { setNotice('Crew linked to this project. Members were not added automatically.'); void load(); }
  }

  return <PlatformShell>
    <p className="lm-kicker">{project.featured ? 'Featured project' : 'Project'}</p>
    <h1>{project.name}</h1>
    <div className="lm-tabs">{(['overview','team','links','chat'] as const).map(item => <button key={item} className={tab === item ? 'on' : ''} type="button" onClick={() => setTab(item)}>{item}</button>)}</div>
    {error && <p className="fc-error" role="alert">{error}</p>}
    {notice && <p className="fc-notice" role="status">{notice}</p>}
    {tab === 'overview' && <div className="lm-card">
      <p>{project.description}</p>
      <p>{project.starts_on || 'Dates to be confirmed'}{project.ends_on ? ' — ' + project.ends_on : ''}</p>
      <p>{project.team_name_required ? 'Team name is mandatory when you connect for this project.' : 'Team name is optional.'}</p>
      {!!project.required_roles?.length && <p>Roles: {project.required_roles.join(', ')}</p>}
      <div className="lm-row">
        <Link className="fc-btn" href={'/explore?project=' + project.id}>Find creators</Link>
        {!member && project.owner_id !== userId && <button className="fc-btn fc-btn-alt" type="button" disabled={busy} onClick={() => void requestJoin()}>Request to join</button>}
      </div>
    </div>}
    {tab === 'team' && <div>
      <div className="lm-grid">{members.map(item => <article className="lm-card" key={item.id}><strong>{people[item.user_id]?.display_name || 'Creator'}</strong><p>{item.role} · {item.status}</p></article>)}</div>
      {(project.owner_id === userId) && <form className="lm-card" style={{marginTop:16}} onSubmit={e => void invite(e)}>
        <label>Invite by handle<input className="lm-field" name="handle" required placeholder="username" /></label>
        <label>Role<input className="lm-field" name="role" defaultValue="Member" /></label>
        <button className="fc-btn">Send invitation</button>
      </form>}
      {crews.length > 0 && <label style={{display:'grid',gap:8,marginTop:16}}>Associate a crew you own
        <select className="lm-field" defaultValue="" onChange={e => void linkCrew(e.target.value)}>
          <option value="">Choose a crew</option>
          {crews.filter(crew => !linked.includes(crew.id)).map(crew => <option key={crew.id} value={crew.id}>{crew.name}</option>)}
        </select>
      </label>}
    </div>}
    {tab === 'links' && <div>
      {links.map(link => <p key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a></p>)}
      {canChat && <form className="lm-card" onSubmit={e => void addLink(e)}><input className="lm-field" name="title" required placeholder="Title" /><input className="lm-field" name="url" type="url" required placeholder="https://" /><button className="fc-btn">Add link</button></form>}
      {!canChat && <p className="lm-muted">External links are visible here. Participants can add them.</p>}
    </div>}
    {tab === 'chat' && <div className="lm-card">
      {canChat ? <>
        {chats.map(chat => <p key={chat.id}><b>{people[chat.sender_id]?.display_name || (chat.sender_id === userId ? 'You' : 'Member')}: </b>{chat.body}</p>)}
        <form onSubmit={e => void sendChat(e)} className="lm-row"><input className="lm-field" name="body" aria-label="Group message" /><button className="fc-btn">Send</button></form>
      </> : <p>Group chat opens after you are an accepted participant.</p>}
    </div>}
  </PlatformShell>;
}
