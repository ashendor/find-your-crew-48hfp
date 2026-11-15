'use client';
import {type FormEvent,useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Connection,Creator} from '@/lib/crew-types';

type Message={id:string;connection_id:string;sender_id:string;body:string;created_at:string};
type Invite={id:string;crew_id:string;role:string;status:string;crews?:{name:string}|null};
type InboxTab='chats'|'requests'|'invites';
const timeLabel=(value:string)=>{
 const t=Date.parse(value);if(!Number.isFinite(t))return '';
 const mins=Math.max(0,Math.floor((Date.now()-t)/60000));
 return mins<1?'Now':mins<60?mins+'m':mins<1440?Math.floor(mins/60)+'h':Math.floor(mins/1440)+'d';
};
export default function CrewInboxDrawer({open,onClose,initialTab='chats'}:{open:boolean;onClose:()=>void;initialTab?:InboxTab}){
 const client=getCrewSupabase();
 const [tab,setTab]=useState<InboxTab>(initialTab),[userId,setUserId]=useState('');
 const [connections,setConnections]=useState<Connection[]>([]),[people,setPeople]=useState<Record<string,Creator>>({}),[invites,setInvites]=useState<Invite[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[messages,setMessages]=useState<Message[]>([]),[recent,setRecent]=useState<Record<string,Message>>({});
 const [draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const closeRef=useRef<HTMLButtonElement>(null),messagesEnd=useRef<HTMLDivElement>(null);
 const refresh=useCallback(async()=>{if(!client)return;setLoading(true);setError('');
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user){setLoading(false);setError('Sign in to see your conversations.');return}
  setUserId(user.id);
  const [a,b]=await Promise.all([
   client.from('connections').select('*').or('requester_id.eq.'+user.id+',recipient_id.eq.'+user.id).order('created_at',{ascending:false}),
   client.from('crew_members').select('id,crew_id,role,status,crews(name)').eq('user_id',user.id).eq('status','invited')
  ]);
  if(a.error)setError(a.error.message);
  if(b.error)setError(b.error.message);
  const list=(a.data||[]) as Connection[];setConnections(list);
  setInvites((b.data||[]) as unknown as Invite[]);
  const ids=Array.from(new Set(list.flatMap(x=>[x.requester_id,x.recipient_id]).filter(x=>x!==user.id)));
  if(ids.length){const {data:profiles}=await client.from('profiles').select('*').in('id',ids);setPeople(Object.fromEntries(((profiles||[]) as Creator[]).map(x=>[x.id,x])))}else setPeople({});
  const accepted=list.filter(x=>x.status==='accepted');
  if(accepted.length){
   const {data:msgs}=await client.from('messages').select('*').in('connection_id',accepted.map(x=>x.id)).order('created_at',{ascending:false}).limit(100);
   const last:Record<string,Message>={};
   for(const m of (msgs||[]) as Message[]){if(!last[m.connection_id])last[m.connection_id]=m}
   setRecent(last);
  }else setRecent({});
  setLoading(false);
 },[client]);
 useEffect(()=>{if(open){setTab(initialTab);setSelected(null);void refresh()}},[open,initialTab,refresh]);
 useEffect(()=>{if(!open)return;closeRef.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[open,onClose]);
 const thread=connections.find(c=>c.id===selected&&c.status==='accepted');
 const loadMessages=useCallback(async(id:string)=>{if(!client)return;const {data,error:e}=await client.from('messages').select('*').eq('connection_id',id).order('created_at',{ascending:true}).limit(100);if(e)setError(e.message);else setMessages((data||[]) as Message[])},[client]);
 useEffect(()=>{if(open&&thread){void loadMessages(thread.id)}else setMessages([])},[open,thread?.id,loadMessages]);
 useEffect(()=>{if(thread&&messages.length)messagesEnd.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[thread?.id,messages.length]);
 useEffect(()=>{if(!open||!thread)return;const id=window.setInterval(()=>void loadMessages(thread.id),12000);return()=>window.clearInterval(id)},[open,thread?.id,loadMessages]);
 const changed=()=>window.dispatchEvent(new Event('fc:activity-changed'));
 async function respond(id:string,status:'accepted'|'declined'){if(!client||!userId||busy)return;setBusy(true);setError('');
  const {error:e}=await client.from('connections').update({status}).eq('id',id).eq('recipient_id',userId);
  setBusy(false);if(e)setError(e.message);else{setNotice(status==='accepted'?'You’re connected. Start a conversation!':'Request declined.');if(status==='accepted'){setSelected(id);setTab('chats')}changed();void refresh()}
 }
 async function respondInvite(id:string,status:'accepted'|'declined'){if(!client||!userId||busy)return;setBusy(true);setError('');
  const {error:e}=await client.from('crew_members').update({status}).eq('id',id).eq('user_id',userId);
  setBusy(false);if(e)setError(e.message);else{setNotice(status==='accepted'?'You joined the crew!':'Invitation declined.');changed();void refresh()}
 }
 async function send(e:FormEvent){e.preventDefault();if(!client||!userId||!thread||!draft.trim()||busy)return;setBusy(true);setError('');
  const {data,error:e}=await client.from('messages').insert({connection_id:thread.id,sender_id:userId,body:draft.trim().slice(0,2000)}).select().single();
  setBusy(false);if(e)setError(e.message);else{setMessages(v=>[...v,data as Message]);setRecent(v=>({...v,[thread.id]:data as Message}));setDraft('');changed()}
 }
 const other=(c:Connection)=>people[c.requester_id===userId?c.recipient_id:c.requester_id];
 const pending=connections.filter(c=>c.status==='pending'&&c.recipient_id===userId);
 const outgoing=connections.filter(c=>c.status==='pending'&&c.requester_id===userId);
 const accepted=connections.filter(c=>c.status==='accepted').sort((a,b)=>(recent[b.id]?.created_at||b.created_at).localeCompare(recent[a.id]?.created_at||a.created_at));
 const selectThread=(id:string)=>{setSelected(id);setDraft('');setNotice('')};
 function goTab(value:InboxTab){setTab(value);setSelected(null);setNotice('')}
 if(!open)return null;
 return <div className="fc-inbox-layer">
  <button className="fc-inbox-scrim" aria-label="Close chats and activity" type="button" onClick={onClose}/>
  <aside className="fc-inbox-drawer fc-inbox-v2" role="dialog" aria-modal="true" aria-label="Chats and activity">
   <header className="fc-inbox-v2-header"><div><span>FIND YOUR CREW / YOUR NETWORK</span><h2>Let's <em>connect.</em></h2></div><button type="button" ref={closeRef} onClick={onClose} aria-label="Close chats and activity">✕</button></header>
   <nav className="fc-inbox-tabs" aria-label="Chats and activity sections">
    <button type="button" onClick={()=>goTab('chats')} aria-current={tab==='chats'?'page':undefined}>Chats <span>{accepted.length}</span></button>
    <button type="button" onClick={()=>goTab('requests')} aria-current={tab==='requests'?'page':undefined}>Requests {pending.length>0&&<span className="fc-inbox-alert-count">{pending.length}</span>}</button>
    <button type="button" onClick={()=>goTab('invites')} aria-current={tab==='invites'?'page':undefined}>Invites {invites.length>0&&<span className="fc-inbox-alert-count">{invites.length}</span>}</button>
   </nav>
   {error&&<p className="fc-inbox-error" role="alert">{error}</p>}{notice&&<p className="fc-inbox-notice" role="status">{notice}</p>}
   {loading?<div className="fc-inbox-v2-empty">Loading your creative connections…</div>:
    tab==='chats'?(thread?<div className="fc-inbox-v2-thread">
      <header className="fc-inbox-v2-thread-header"><button type="button" onClick={()=>setSelected(null)} aria-label="Back to conversations">←</button><span className="fc-inbox-v2-face" style={other(thread)?.avatar_url?{backgroundImage:'url("'+other(thread)!.avatar_url+'")'}:{}}>{!other(thread)?.avatar_url&&(other(thread)?.display_name||'C').charAt(0)}</span><div><strong>{other(thread)?.display_name||'Creator'}</strong><small>{other(thread)?.primary_role||'Filmmaker'} · Connected</small></div><button type="button" onClick={()=>void loadMessages(thread.id)} aria-label="Refresh conversation">↻</button></header>
      <div className="fc-inbox-v2-messages" aria-live="polite">{messages.length?messages.map(m=><div key={m.id} className={'fc-inbox-v2-bubble'+(m.sender_id===userId?' is-mine':'')}><span>{m.body}</span><time>{timeLabel(m.created_at)}</time></div>):<div className="fc-inbox-v2-empty">Every great film begins with a conversation. Say hello.</div>}<div ref={messagesEnd}/></div>
      <form className="fc-inbox-v2-compose" onSubmit={send}><input autoComplete="off" aria-label="Message" placeholder="Write a message…" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000} required/><button disabled={busy||!draft.trim()} type="submit" aria-label="Send message">➤</button></form>
     </div>:<div className="fc-inbox-v2-list">
       <div className="fc-inbox-v2-section-line"><strong>YOUR CONVERSATIONS</strong><span>{accepted.length} connected</span></div>
       {accepted.map(c=><button className="fc-inbox-v2-chat-row" key={c.id} type="button" onClick={()=>selectThread(c.id)}>
        <span className="fc-inbox-v2-face" style={other(c)?.avatar_url?{backgroundImage:'url("'+other(c)!.avatar_url+'")'}:{}}>{!other(c)?.avatar_url&&(other(c)?.display_name||'C').charAt(0)}</span>
        <span className="fc-inbox-v2-chat-copy"><strong>{other(c)?.display_name||'Creator'}</strong><small>{recent[c.id]?.body||'You’re connected. Say hello!'}</small></span>
        <span className="fc-inbox-v2-chat-meta">{recent[c.id]?timeLabel(recent[c.id].created_at):'↗'}</span>
       </button>)}
       {!accepted.length&&<div className="fc-inbox-v2-empty"><strong>No chats yet.</strong><p>Discover filmmakers and start a connection.</p><Link href="/discover" onClick={onClose}>Discover creators ↗</Link></div>}
      </div>):
    tab==='requests'?<div className="fc-inbox-v2-list">
      <div className="fc-inbox-v2-section-line"><strong>CONNECTION REQUESTS</strong><span>{pending.length} to review</span></div>
      {pending.map(c=><div key={c.id} className="fc-inbox-v2-request"><div className="fc-inbox-v2-request-user"><span className="fc-inbox-v2-face" style={other(c)?.avatar_url?{backgroundImage:'url("'+other(c)!.avatar_url+'")'}:{}}>{!other(c)?.avatar_url&&(other(c)?.display_name||'C').charAt(0)}</span><div><strong>{other(c)?.display_name||'Creator'}</strong><small>{other(c)?.primary_role||'Filmmaker'} · Wants to connect</small></div></div><div className="fc-inbox-v2-request-actions"><button disabled={busy} type="button" onClick={()=>void respond(c.id,'accepted')}>Accept ↗</button><button disabled={busy} type="button" onClick={()=>void respond(c.id,'declined')}>Decline</button></div></div>)}
      {!pending.length&&<div className="fc-inbox-v2-empty">No requests waiting for you.</div>}
      <div className="fc-inbox-v2-section-line fc-inbox-v2-outgoing"><strong>REQUESTS YOU SENT</strong><span>{outgoing.length}</span></div>
      {outgoing.map(c=><div key={c.id} className="fc-inbox-v2-sent"><strong>{other(c)?.display_name||'Creator'}</strong><span>Waiting for a reply</span></div>)}
      {!outgoing.length&&<p className="fc-inbox-v2-muted">No outstanding requests.</p>}
     </div>:
    <div className="fc-inbox-v2-list"><div className="fc-inbox-v2-section-line"><strong>CREW INVITATIONS</strong><span>{invites.length} to review</span></div>
      {invites.map(i=><div className="fc-inbox-v2-request" key={i.id}><div className="fc-inbox-v2-request-user"><span className="fc-inbox-v2-face">◎</span><div><strong>{i.crews?.name||'Film crew'}</strong><small>Invited you as {i.role}</small></div></div><div className="fc-inbox-v2-request-actions"><button disabled={busy} type="button" onClick={()=>void respondInvite(i.id,'accepted')}>Join crew ↗</button><button disabled={busy} type="button" onClick={()=>void respondInvite(i.id,'declined')}>Decline</button></div></div>)}
      {!invites.length&&<div className="fc-inbox-v2-empty">No crew invitations waiting. <Link href="/crews" onClick={onClose}>Explore My Crews ↗</Link></div>}
     </div>}
   <footer className="fc-inbox-v2-footer"><span>GREAT FILMS DON'T HAPPEN ALONE.</span><div><Link href="/discover" onClick={onClose}>Discover ↗</Link><Link href="/crews" onClick={onClose}>My Crews ↗</Link></div></footer>
  </aside>
 </div>;
}
