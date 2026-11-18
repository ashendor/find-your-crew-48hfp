'use client';
import {Suspense,useCallback,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {useParams,useRouter} from 'next/navigation';
import {PlatformShell} from '@/components/PlatformNav';
import {FilmLoader} from '@/components/FilmLoader';
import BackButton from '@/components/BackButton';
import HeaderActions from '@/components/HeaderActions';
import {armLoader} from '@/components/RouteLoader';
import {useCrewUser} from '@/lib/use-crew';
import {ROLES,projectTitle,schemaMissing,type Connection,type Crew,type Creator,type Project} from '@/lib/crew-types';
import '../../platform.css';

const SHARE_URL = 'https://likeminds.ae/48hrproject';
type Member = {id:string;user_id:string;role:string;status:string};

function PersonRow({person,fallback,detail}:{person?:Creator;fallback:string;detail:string}){
  const body = <>{person?.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="lm-avatar">{(person?.display_name || fallback).slice(0,1)}</span>}<div><strong>{person?.display_name || fallback}</strong><p>{detail}</p></div></>;
  if (person?.username) return <Link className="lm-rowitem" href={'/creators/' + encodeURIComponent(person.username)}>{body}</Link>;
  return <article className="lm-rowitem">{body}</article>;
}

function TeamScreen(){
  const {id} = useParams<{id:string}>();
  const router = useRouter();
  const {client,user,userId,loading} = useCrewUser();
  const [team,setTeam] = useState<Crew|null>(null);
  const [members,setMembers] = useState<Member[]>([]);
  const [people,setPeople] = useState<Record<string,Creator>>({});
  const [projects,setProjects] = useState<Project[]>([]);
  const [featured,setFeatured] = useState<Project[]>([]);
  const [directory,setDirectory] = useState<Creator[]>([]);
  const [links,setLinks] = useState<Connection[]>([]);
  const [query,setQuery] = useState('');
  const [role,setRole] = useState('Producer');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [missing,setMissing] = useState(false);
  const load = useCallback(async () => {
    if (!client || !id) return;
    const {data,error:teamError} = await client.from('crews').select('*').eq('id', id).maybeSingle();
    if (teamError || !data) { setMissing(true); setError(teamError?.message || 'Team not found.'); return; }
    setTeam(data as Crew);
    const [memberRows, links, openProjects] = await Promise.all([
      client.from('crew_members').select('id,user_id,role,status').eq('crew_id', id),
      client.from('crew_projects').select('projects(id,name,description,owner_id,kind,status,featured,team_name_required,required_roles,starts_on,ends_on,created_at)').eq('crew_id', id),
      client.from('projects').select('*').eq('status','published').eq('featured', true).order('created_at', {ascending:false}),
    ]);
    const list = (memberRows.data || []) as Member[];
    setMembers(list);
    const linked = ((links.data || []) as {projects:Project|Project[]|null}[]).map(row => Array.isArray(row.projects) ? row.projects[0] : row.projects).filter(Boolean) as Project[];
    setProjects(linked.filter(project => project.featured));
    setFeatured((openProjects.data || []) as Project[]);
    const ids = Array.from(new Set([data.owner_id, ...list.map(member => member.user_id)]));
    if (ids.length) {
      const {data:profiles} = await client.from('profiles').select('*').in('id', ids);
      setPeople(Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person])));
    }
  }, [client, id]);
  useEffect(() => { void load(); }, [load]);
  const owner = team?.owner_id === userId;
  useEffect(() => {
    if (!client || !owner || !userId) return;
    void Promise.all([
      client.from('profiles').select('*').eq('onboarding_complete', true).neq('id', userId).order('display_name').limit(200),
      client.from('connections').select('id,requester_id,recipient_id,status').or('requester_id.eq.' + userId + ',recipient_id.eq.' + userId),
    ]).then(([profiles, connections]) => {
      setDirectory((profiles.data || []) as Creator[]);
      setLinks((connections.data || []) as Connection[]);
    });
  }, [client, owner, userId]);
  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return directory.filter(person => (person.display_name + ' ' + person.username + ' ' + (person.primary_role || '')).toLowerCase().includes(needle)).slice(0, 8);
  }, [directory, query]);
  if (loading || !user) return <FilmLoader delay={600} />;
  if (!team) return missing ? <PlatformShell><header className="lm-top"><BackButton fallback="/teams" /><HeaderActions /></header><p className="fc-error">{error || 'Team not found.'}</p></PlatformShell> : <FilmLoader delay={600} />;

  function membership(personId:string){
    return members.find(member => member.user_id === personId && member.status !== 'declined');
  }
  function connectionWith(personId:string){
    return links.find(link => (link.requester_id === userId && link.recipient_id === personId) || (link.recipient_id === userId && link.requester_id === personId));
  }

  async function invitePerson(person:Creator){
    if (!client || !owner || busy || membership(person.id)) return;
    setBusy(true); setError(''); setNotice('');
    const {error:insertError} = await client.from('crew_members').insert({crew_id:id, user_id:person.id, invited_by:userId, role, status:'invited'});
    setBusy(false);
    if (insertError) setError(insertError.code === '23505' ? 'They already have an invitation.' : insertError.message);
    else { setNotice('Invitation sent. They become part of the team only after they accept.'); void load(); }
  }

  async function connectPerson(person:Creator){
    if (!client || !owner || busy || connectionWith(person.id)) return;
    setBusy(true); setError(''); setNotice('');
    const {data,error:insertError} = await client.from('connections').insert({
      requester_id:userId, recipient_id:person.id, status:'pending', purpose:'network', project_id:null, crew_id:null, team_name:null, note:null,
    }).select('id,requester_id,recipient_id,status').single();
    setBusy(false);
    if (insertError) setError(insertError.code === '23505' ? 'A connection already exists or is waiting for a reply.' : insertError.message);
    else { setLinks(list => [...list, data as Connection]); setNotice('Connection request sent. Accepting it opens a chat. It does not add them to the team.'); }
  }

  async function shareInvite(){
    const payload = {title:(team?.name || 'Team') + ' · LikeMinds', text:'Join me on LikeMinds for the 48 Hour Film Project.', url:SHARE_URL};
    if (typeof navigator.share === 'function') {
      try { await navigator.share(payload); return; } catch (shareError) { if (shareError instanceof DOMException && shareError.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(SHARE_URL); setNotice('Link copied.'); }
    catch { setError('Could not open sharing. The link is ' + SHARE_URL); }
  }

  async function removeTeam(){
    if (!client || !owner || busy) return;
    if (!team || !window.confirm('Delete ' + team.name + '? This removes the team. It does not delete anyone’s profile.')) return;
    setBusy(true); setError('');
    const {error:rpcError} = await client.rpc('delete_own_team', {p_crew:id});
    if (!rpcError) { armLoader(); router.replace('/teams'); return; }
    if (!schemaMissing(rpcError)) { setBusy(false); setError(rpcError.message); return; }
    await client.from('crew_projects').delete().eq('crew_id', id);
    await client.from('crew_members').delete().eq('crew_id', id);
    const {data,error:deleteError} = await client.from('crews').delete().eq('id', id).eq('owner_id', userId).select('id');
    setBusy(false);
    if (deleteError || !data?.length) { setError('Run the latest LikeMinds SQL update before a team can be deleted.'); return; }
    armLoader(); router.replace('/teams');
  }

  async function leaveTeam(){
    const mine = members.find(member => member.user_id === userId && member.status === 'accepted');
    if (!client || !team || owner || !mine || busy) return;
    if (!window.confirm('Leave ' + team.name + '? You can be invited again later.')) return;
    setBusy(true); setError(''); setNotice('');
    const {error:rpcError} = await client.rpc('leave_team', {p_crew:id});
    if (!rpcError) { armLoader(); router.replace('/teams'); return; }
    if (!schemaMissing(rpcError)) { setBusy(false); setError(rpcError.message); return; }
    const {data,error:deleteError} = await client.from('crew_members').delete().eq('id', mine.id).eq('user_id', userId).select('id');
    setBusy(false);
    if (deleteError || !data?.length) { setError('Run the latest LikeMinds SQL update before you can leave a team.'); return; }
    armLoader(); router.replace('/teams');
  }

  async function register(projectId:string){
    if (!client || !owner) return;
    setError(''); setNotice('');
    const {error:insertError} = await client.from('crew_projects').insert({crew_id:id, project_id:projectId});
    if (insertError) setError(insertError.message);
    else { setNotice('Registered for the featured project. People are not added automatically.'); void load(); }
  }

  return <PlatformShell>
    <header className="lm-top"><BackButton fallback="/teams" /><HeaderActions /></header>
    <header className="lm-pagehead">
      <p className="lm-kicker">Team</p>
      <h1>{team.name}</h1>
    </header>
    <div className="lm-card" style={{marginTop:16}}><p>{team.description || 'A team can register for the featured project. People join only when they accept an invitation.'}</p></div>
    {error && <p className="lm-alert" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    <section>
      <div className="lm-section"><h2>People</h2></div>
      <PersonRow person={people[team.owner_id]} fallback="Owner" detail="Owner" />
      {members.filter(member => member.status === 'accepted' || member.status === 'invited').map(member => <PersonRow key={member.id} person={people[member.user_id]} fallback="Member" detail={member.status === 'invited' ? 'Invited · ' + member.role : member.role || 'Member'} />)}
      {!members.some(member => member.status === 'accepted') && <p className="lm-muted">No one else is on this team yet. An invitation adds someone only after they accept.</p>}
    </section>
    {owner && <section>
      <div className="lm-section"><h2>Find someone</h2></div>
      <div className="lm-find">
        <label className="lm-find-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8178" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          <input aria-label="Search people on LikeMinds" placeholder="Search by name or role" value={query} onChange={e => setQuery(e.target.value)} />
        </label>
        <label className="lm-block">Invite as<select className="lm-field" value={role} onChange={e => setRole(e.target.value)}>{ROLES.map(item => <option key={item}>{item}</option>)}</select></label>
        <p className="lm-muted">Connect only starts a request. Invite adds them to this team after they accept in their inbox.</p>
        {hits.map(person => {
          const spot = membership(person.id);
          const link = connectionWith(person.id);
          return <div key={person.id}>
            <PersonRow person={person} fallback="Person" detail={person.primary_role || person.username} />
            <div className="lm-actions lm-pair">
              <button className="lm-btn-line" type="button" disabled={busy || !!link} onClick={() => void connectPerson(person)}>{link?.status === 'accepted' ? 'Connected' : link ? 'Request sent' : 'Connect'}</button>
              <button className="lm-btn" type="button" disabled={busy || !!spot} onClick={() => void invitePerson(person)}>{spot?.status === 'accepted' ? 'On this team' : spot ? 'Invited' : 'Invite'}</button>
            </div>
          </div>;
        })}
        {query.trim().length >= 2 && !hits.length && <p className="lm-muted">No one on LikeMinds matches that search.</p>}
      </div>
    </section>}
    <section className="lm-share">
      <div className="lm-section"><h2>Share</h2></div>
      <div className="lm-share-card">
        <p>Invite someone who is not here yet.</p>
        <a className="lm-linkrow" href={SHARE_URL} target="_blank" rel="noopener noreferrer">
          <span className="lm-linkmark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/></svg></span>
          <span><strong>Invite link</strong><small>likeminds.ae/48hrproject</small></span>
          <em aria-hidden="true">↗</em>
        </a>
        <button className="lm-btn" type="button" onClick={() => void shareInvite()}>Share invite link</button>
      </div>
    </section>
    <section>
      <div className="lm-section"><h2>Featured project</h2></div>
      {(featured.length ? featured : projects).map(project => {
        const registered = projects.some(item => item.id === project.id);
        return <div key={project.id}>
          <Link className="lm-rowitem" href={'/projects/' + project.id}><span className="lm-avatar">{projectTitle(project).slice(0,1)}</span><div><strong>{projectTitle(project)}</strong><p>{registered ? 'Registered' : 'Featured project'}</p></div></Link>
          {owner && !registered && <button className="lm-btn" type="button" style={{marginTop:8}} onClick={() => void register(project.id)}>Register this team</button>}
        </div>;
      })}
      {!featured.length && !projects.length && <div className="lm-empty"><strong>No featured project yet</strong><p>When a featured project is open, this team can register for it.</p></div>}
    </section>
    {owner && <button className="lm-danger" type="button" disabled={busy} onClick={() => void removeTeam()}>Delete this team</button>}
    {!owner && members.some(member => member.user_id === userId && member.status === 'accepted') && <button className="lm-danger" type="button" disabled={busy} onClick={() => void leaveTeam()}>Leave this team</button>}
  </PlatformShell>;
}

export default function TeamPage(){
  return <Suspense fallback={<FilmLoader delay={600} />}><TeamScreen /></Suspense>;
}
