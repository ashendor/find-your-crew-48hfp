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
import {ROLES,projectTitle,schemaMissing,type Crew,type Creator,type Project} from '@/lib/crew-types';
import {parseNeeds,roleSeats,type RoleNeed} from '@/lib/team-roles';
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
  const [directoryReady,setDirectoryReady] = useState(false);
  const [finding,setFinding] = useState(false);
  const [seekRole,setSeekRole] = useState('');
  const [seatNote,setSeatNote] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [missing,setMissing] = useState(false);
  const [myRequest,setMyRequest] = useState(false);
  const [applications,setApplications] = useState<{id:string;user_id:string}[]>([]);
  const [editingRoles,setEditingRoles] = useState(false);
  const [draft,setDraft] = useState<RoleNeed[]>([]);
  const [addRole,setAddRole] = useState('');
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
      setPeople(current => ({...current, ...Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person]))}));
    }
  }, [client, id]);
  useEffect(() => { void load(); }, [load]);
  const reloadJoins = useCallback(async () => {
    if (!client || !id || !userId || !team) return;
    const {data, error:joinError} = await client.from('team_join_requests').select('id,user_id,status').eq('crew_id', id).eq('status','pending');
    if (schemaMissing(joinError)) { setMyRequest(false); setApplications([]); return; }
    const rows = (data || []) as {id:string;user_id:string;status:string}[];
    setMyRequest(rows.some(row => row.user_id === userId));
    const waiting = team.owner_id === userId ? rows.filter(row => row.user_id !== userId) : [];
    setApplications(waiting);
    if (!waiting.length) return;
    const {data:profiles} = await client.from('profiles').select('*').in('id', waiting.map(row => row.user_id));
    setPeople(current => ({...current, ...Object.fromEntries(((profiles || []) as Creator[]).map(person => [person.id, person]))}));
  }, [client, id, userId, team]);
  useEffect(() => { void reloadJoins(); }, [reloadJoins]);
  const owner = team?.owner_id === userId;
  useEffect(() => {
    if (!client || !owner || !userId) return;
    void client.from('profiles').select('*').eq('onboarding_complete', true).neq('id', userId).order('display_name').limit(200).then(({data}) => {
      setDirectory((data || []) as Creator[]);
      setDirectoryReady(true);
    });
  }, [client, owner, userId]);
  const seekers = useMemo(() => {
    if (!seekRole) return [];
    const taken = new Set(members.filter(member => member.status === 'accepted' || member.status === 'invited').map(member => member.user_id));
    return directory.filter(person => {
      if (taken.has(person.id)) return false;
      const roles = [person.primary_role, ...(person.categories || [])].filter(Boolean);
      return roles.includes(seekRole);
    });
  }, [directory, members, seekRole]);
  if (loading || !user) return <FilmLoader delay={600} />;
  if (!team) return missing ? <PlatformShell><header className="lm-top"><BackButton fallback="/teams" /><HeaderActions /></header><p className="fc-error">{error || 'Team not found.'}</p></PlatformShell> : <FilmLoader delay={600} />;

  function membership(personId:string){
    return members.find(member => member.user_id === personId && member.status !== 'declined');
  }
  async function invitePerson(person:Creator, role?:string){
    if (!client || !owner || busy || membership(person.id)) return;
    const seat = role || person.primary_role || 'Member';
    setBusy(true); setError(''); setNotice('');
    const {error:insertError} = await client.from('crew_members').insert({crew_id:id, user_id:person.id, invited_by:userId, role:seat, status:'invited'});
    setBusy(false);
    if (insertError) setError(insertError.code === '23505' ? 'They already have an invitation.' : insertError.message);
    else { setNotice('Invited as ' + seat + '. They join this team only after they accept.'); void load(); }
  }

  function article(role:string){ return /^[aeiou]/i.test(role) ? 'an' : 'a'; }
  function seatCopy(role:string){
    return [
      (team?.name || 'This team') + ' is looking for ' + article(role) + ' ' + role + '.',
      (team?.description || '').trim(),
      'Come make it with them on LikeMinds.',
    ].filter(Boolean).join('\n\n');
  }

  async function shareText(title:string, text:string, copied:string){
    const payload = {title, text, url:SHARE_URL};
    if (typeof navigator.share === 'function') {
      try { await navigator.share(payload); return; } catch (shareError) { if (shareError instanceof DOMException && shareError.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text + '\n\n' + SHARE_URL); setNotice(copied); }
    catch { setError('Could not open sharing. The link is ' + SHARE_URL); }
  }

  async function shareInvite(){
    await shareText((team?.name || 'Team') + ' · LikeMinds', 'Join me on LikeMinds for the 48 Hour Film Project.', 'Link copied.');
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

  async function requestJoin(){
    if (!client || owner || busy || myRequest) return;
    setBusy(true); setError(''); setNotice('');
    const {error:rpcError} = await client.rpc('request_team_join', {p_crew:id});
    setBusy(false);
    if (rpcError) setError(schemaMissing(rpcError) ? 'Run the latest LikeMinds SQL update before you can request to join a team.' : rpcError.message);
    else { setMyRequest(true); setNotice('Request sent. You join this team only after the team lead approves it.'); }
  }

  async function answerJoin(requestId:string, accept:boolean){
    if (!client || !owner || busy) return;
    setBusy(true); setError(''); setNotice('');
    const {error:rpcError} = await client.rpc('respond_team_join', {p_request:requestId, p_accept:accept});
    setBusy(false);
    if (rpcError) setError(schemaMissing(rpcError) ? 'Run the latest LikeMinds SQL update before you can approve a team request.' : rpcError.message);
    else { setNotice(accept ? 'They’re on the team.' : 'Request declined.'); void load(); }
  }

  function openRoles(){
    setDraft(parseNeeds(team?.role_needs));
    setAddRole('');
    setError('');
    setEditingRoles(true);
  }
  function changeCount(role:string, count:number){
    const next = Math.max(1, Math.min(12, count));
    setDraft(current => current.map(item => item.role === role ? {...item, count:next} : item));
  }
  function addDraftRole(){
    if (!addRole || draft.some(item => item.role === addRole)) return;
    setDraft(current => [...current, {role:addRole, count:1}]);
    setAddRole('');
  }
  async function saveNeeds(){
    if (!client || !owner || busy) return;
    setBusy(true); setError(''); setNotice('');
    const {error:updateError} = await client.from('crews').update({role_needs:draft}).eq('id', id).eq('owner_id', userId);
    setBusy(false);
    if (updateError) { setError(schemaMissing(updateError) ? 'Run the latest LikeMinds SQL update before a team can list the roles it needs.' : updateError.message); return; }
    setTeam(current => current ? {...current, role_needs:draft} : current);
    setEditingRoles(false);
    setNotice('Roles updated.');
  }

  const needs = parseNeeds(team.role_needs);
  const seatRows = roleSeats(needs, members.filter(member => member.status === 'accepted'), team.owner_id, people[team.owner_id]?.primary_role);
  const seatTotal = seatRows.reduce((total, role) => total + role.count, 0);

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
    <div className="lm-card" style={{marginTop:16}}><p>{team.description || 'People join this team when an invitation is accepted, or when the team lead approves a request.'}</p></div>
    {(owner || needs.length > 0) && <section>
      <div className="lm-section"><h2>Roles</h2>{owner && <button className="lm-textbtn" type="button" onClick={openRoles}>{needs.length ? 'Edit' : 'Add'}</button>}</div>
      {seatTotal > 0 && <>
        <ul className="lm-seats">
          {seatRows.map(role => {
            const body = <>
              <div className="lm-seat-top">
                <strong>{role.role}</strong>
                <em className={role.open ? '' : 'full'}>{role.open ? role.open + ' open' : 'Filled'}{owner && role.open > 0 && <span className="go" aria-hidden="true">›</span>}</em>
              </div>
              <p>{role.filled} of {role.count} filled</p>
              <span className="pips" aria-hidden="true">{Array.from({length:role.count}, (_, index) => <i key={index} className={index < role.filled ? 'on' : ''} />)}</span>
            </>;
            const label = role.role + ', ' + (role.open ? role.open + ' open' : 'filled') + ', ' + role.filled + ' of ' + role.count;
            return <li key={role.role}>{owner && role.open > 0
              ? <button className="lm-seat" type="button" aria-label={label + '. Find people'} onClick={() => { setError(''); setSeekRole(role.role); setFinding(true); }}>{body}</button>
              : <div className="lm-seat" aria-label={label}>{body}</div>}</li>;
          })}
        </ul>
      </>}
      {!needs.length && owner && <p className="lm-muted">No roles yet. Add the ones this team needs.</p>}
    </section>}
    {editingRoles && <div className="lm-sheet" role="presentation" onClick={() => { if (!busy) setEditingRoles(false); }}>
      <div className="lm-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="lm-edit-roles" onClick={e => e.stopPropagation()}>
        <div className="lm-rolehead"><h2 id="lm-edit-roles">Edit roles</h2><button type="button" aria-label="Close" onClick={() => { if (!busy) setEditingRoles(false); }}>×</button></div>
        <p className="lm-muted">Add a role, change how many people it needs, or remove it.</p>
        <div className="lm-role-edit">
          {draft.map(item => <div className="row" key={item.role}>
            <strong>{item.role}</strong>
            <div className="step">
              <button type="button" aria-label={'Fewer ' + item.role} disabled={item.count <= 1} onClick={() => changeCount(item.role, item.count - 1)}>−</button>
              <b>{item.count}</b>
              <button type="button" aria-label={'More ' + item.role} disabled={item.count >= 12} onClick={() => changeCount(item.role, item.count + 1)}>+</button>
            </div>
            <button className="remove" type="button" onClick={() => setDraft(current => current.filter(role => role.role !== item.role))}>Remove</button>
          </div>)}
          {!draft.length && <p className="lm-muted">No roles yet.</p>}
        </div>
        {ROLES.some(role => !draft.some(item => item.role === role)) && <div className="lm-role-add">
          <select aria-label="Role to add" value={addRole} onChange={e => setAddRole(e.target.value)}>
            <option value="">Choose a role</option>
            {ROLES.filter(role => !draft.some(item => item.role === role)).map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <button className="lm-btn" type="button" disabled={!addRole} onClick={addDraftRole}>Add</button>
        </div>}
        {error && <p className="lm-alert" role="alert">{error}</p>}
        <div className="lm-actions">
          <button className="lm-btn" type="button" disabled={busy} onClick={() => void saveNeeds()}>{busy ? 'Saving…' : 'Save roles'}</button>
          <button className="lm-btn-line" type="button" disabled={busy} onClick={() => setEditingRoles(false)}>Cancel</button>
        </div>
      </div>
    </div>}
    {finding && <div className="lm-sheet lm-sheet-people" role="presentation" onClick={() => { if (!busy) { setFinding(false); setSeekRole(''); } }}>
      <div className="lm-sheet-panel lm-sheet-tall" role="dialog" aria-modal="true" aria-labelledby="lm-find-role" onClick={e => e.stopPropagation()}>
        <div className="lm-rolehead"><h2 id="lm-find-role">{seekRole}</h2><button type="button" aria-label="Close" onClick={() => { if (!busy) { setFinding(false); setSeekRole(''); } }}>×</button></div>
        <p className="lm-muted">Free profiles who work as {article(seekRole)} {seekRole}.</p>
        <div className="lm-find">
          {!directoryReady && <p className="lm-muted">Looking…</p>}
          {directoryReady && seekers.length > 0 && <div className="lm-hits">
            {seekers.map(person => {
              const spot = membership(person.id);
              const place = [seekRole, person.location].filter(Boolean).join(' · ');
              const who = <>{person.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="lm-avatar">{(person.display_name || 'P').slice(0,1)}</span>}<span><strong>{person.display_name || 'Person'}</strong><p>{place}</p></span></>;
              return <div className="lm-hit" key={person.id}>
                {person.username ? <Link href={'/creators/' + encodeURIComponent(person.username)}>{who}</Link> : <div className="who">{who}</div>}
                <button className="lm-btn" type="button" disabled={busy || !!spot} onClick={() => void invitePerson(person, seekRole)}>{spot?.status === 'accepted' ? 'On team' : spot ? 'Invited' : 'Invite'}</button>
              </div>;
            })}
          </div>}
          {directoryReady && !seekers.length && <div className="lm-empty"><strong>No free profiles</strong><p>No one free works as {article(seekRole)} {seekRole} yet.</p></div>}
        </div>
        {error && <p className="lm-alert" role="alert">{error}</p>}
        {directoryReady && <button className="lm-btn-line" type="button" onClick={() => { setFinding(false); setSeatNote(seekRole); setSeekRole(''); }}>Share this seat</button>}
      </div>
    </div>}
    {seatNote && <div className="lm-sheet" role="presentation" onClick={() => setSeatNote('')}>
      <div className="lm-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="lm-share-role" onClick={e => e.stopPropagation()}>
        <div className="lm-rolehead"><h2 id="lm-share-role">Share this seat</h2><button type="button" aria-label="Close" onClick={() => setSeatNote('')}>×</button></div>
        <div className="lm-seatnote">
          <p className="kicker">Open seat</p>
          <h3>{seatNote}</h3>
          <p>{team.name} is looking for {article(seatNote)} {seatNote}.</p>
          {team.description?.trim() && <p>{team.description}</p>}
          <p>Come make it with them on LikeMinds.</p>
        </div>
        <a className="lm-linkrow" href={SHARE_URL} target="_blank" rel="noopener noreferrer">
          <span className="lm-linkmark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/></svg></span>
          <span><strong>Invite link</strong><small>likeminds.ae/48hrproject</small></span>
          <em aria-hidden="true">↗</em>
        </a>
        <button className="lm-btn" type="button" onClick={() => void shareText(team.name + ' needs ' + seatNote, seatCopy(seatNote), 'Note copied.')}>Share</button>
      </div>
    </div>}
    {error && !editingRoles && !finding && !seatNote && <p className="lm-alert" role="alert">{error}</p>}
    {notice && <p className="lm-note" role="status">{notice}</p>}
    <section>
      <div className="lm-section"><h2>People</h2></div>
      <PersonRow person={people[team.owner_id]} fallback="Owner" detail="Owner" />
      {members.filter(member => member.status === 'accepted' || (owner && member.status === 'invited')).map(member => <PersonRow key={member.id} person={people[member.user_id]} fallback="Member" detail={member.status === 'invited' ? 'Invited · ' + member.role : member.role || 'Member'} />)}
      {!members.some(member => member.status === 'accepted') && <p className="lm-muted">No one else is on this team yet.</p>}
      {!owner && !members.some(member => member.user_id === userId && member.status === 'accepted') && <button className="lm-btn" type="button" style={{marginTop:12}} disabled={busy || myRequest} onClick={() => void requestJoin()}>{myRequest ? 'Requested' : 'Request to join'}</button>}
    </section>
    {owner && applications.length > 0 && <section>
      <div className="lm-section"><h2>Requests to join</h2></div>
      {applications.map(application => <div key={application.id}>
        <PersonRow person={people[application.user_id]} fallback="Creator" detail="Wants to join this team" />
        <div className="lm-actions lm-pair">
          <button className="lm-btn" type="button" disabled={busy} onClick={() => void answerJoin(application.id, true)}>Approve</button>
          <button className="lm-btn-line" type="button" disabled={busy} onClick={() => void answerJoin(application.id, false)}>Decline</button>
        </div>
      </div>)}
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
