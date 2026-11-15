'use client';
import {type FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import type {Connection,Creator} from '@/lib/crew-types';
type Message={id:string;connection_id:string;sender_id:string;body:string;created_at:string};
type Invitation={id:string;crew_id:string;role:string;status:string;crews?:{name:string}|null};
export default function CrewInboxDrawer({open,onClose}:{open:boolean;onClose:()=>void}){
 const client=getCrewSupabase();
 const [userId,setUserId]=useState(''),[connections,setConnections]=useState<Connection[]>([]),[people,setPeople]=useState<Record<string,Creator>>({}),[invites,setInvites]=useState<Invitation[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const refresh=useCallback(async()=>{if(!client)return;setLoading(true);setError('');
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user){setLoading(false);setError('Please sign in to see conversations.');return}
  setUserId(user.id);
  const [a,b]=await Promise.all([
   client.from('connections').select('*').or('requester_id.eq.'+user.id+',recipient_id.eq.'+user.id).order('created_at',{ascending:false}),
   client.from('crew_members').select('id,crew_id,role,status,crews(name)').eq('user_id',user.id).eq('status','invited')
  ]);
  if(a.error)setError(a.error.message);
  const list=(a.data||[]) as Connection[];
  setConnections(list);
  if(b.error)setError(b.error.message);
  setInvites((b.data||[]) as unknown as Invitation[]);
  const ids=Array.from(new Set(list.flatMap(x=>[x.requester_id,x.recipient_id]).filter(x=>x!==user.id)));
  if(ids.length){const {data:p}=await client.from('profiles').select('*').in('id',ids);setPeople(Object.fromEntries(((p||[]) as Creator[]).map(x=>[x.id,x])))}
  else setPeople({});
  setLoading(false)
 },[client]);
 useEffect(()=>{if(open)void refresh()},[open,refresh]);
 useEffect(()=>{if(!open)return;const handle=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',handle);return()=>document.removeEventListener('keydown',handle)},[open,onClose]);
 const thread=connections.find(c=>c.id===selected&&c.status==='accepted');
 const loadMessages=useCallback(async(id:string)=>{if(!client)return;const {data,error:e}=await client.from('messages').select('*').eq('connection_id',id).order('created_at',{ascending:true}).limit(100);if(e)setError(e.message);else setMessages((data||[]) as Message[])},[client]);
 useEffect(()=>{if(open&&thread)void loadMessages(thread.id);else setMessages([])},[open,thread?.id,loadMessages]);
 async function respond(id:string,status:'accepted'|'declined'){if(!client||!userId||busy)return;setBusy(true);setError('');
  const {error:e}=await client.from('connections').update({status}).eq('id',id).eq('recipient_id',userId);setBusy(false);
  if(e)setError(e.message);else{setNotice(status==='accepted'?'You’re connected. Say hello!':'Request declined.');if(status==='accepted')setSelected(id);void refresh()}
 }
 async function respondInvite(id:string,status:'accepted'|'declined'){if(!client||!userId||busy)return;setBusy(true);setError('');
  const {error:e}=await client.from('crew_members').update({status}).eq('id',id).eq('user_id',userId);setBusy(false);
  if(e)setError(e.message);else{setNotice(status==='accepted'?'You joined the crew!':'Invitation declined.');void refresh()}
 }
 async function send(e:FormEvent){e.preventDefault();if(!client||!userId||!thread||!draft.trim()||busy)return;setBusy(true);setError('');
  const {data,error:e2}=await client.from('messages').insert({connection_id:thread.id,sender_id:userId,body:draft.trim().slice(0,2000)}).select().single();setBusy(false);
  if(e2)setError(e2.message);else{setMessages(v=>[...v,data as Message]);setDraft('')}
 }
 const other=(c:Connection)=>people[c.requester_id===userId?c.recipient_id:c.requester_id];
 const pending=connections.filter(c=>c.status==='pending'&&c.recipient_id===userId);
 const conversations=connections.filter(c=>c.status==='accepted');
 if(!open)return null;
 return <div className="fc-inbox-layer">
  <button className="fc-inbox-scrim" aria-label="Close chats and activity" onClick={onClose}/>
  <aside className="fc-inbox-drawer" role="dialog" aria-modal="true" aria-label="Chats and activity">
   <div className="fc-inbox-drawer-head"><div><span>YOUR CREATIVE WORLD</span><h2>Chats <em>&</em> Activity.</h2></div><button type="button" onClick={onClose} aria-label="Close drawer">✕</button></div>
   {error&&<p className="fc-inbox-error" role="alert">{error}</p>}{notice&&<p className="fc-inbox-notice" role="status">{notice}</p>}
   {loading?<p className="fc-inbox-empty">Opening your conversations…</p>:thread?<div className="fc-inbox-thread">
      <div className="fc-inbox-thread-head"><button type="button" onClick={()=>setSelected(null)}>← All conversations</button><strong>{other(thread)?.display_name||'Creator'}</strong></div>
      <div className="fc-inbox-messages" aria-live="polite">{messages.length?messages.map(m=><div className={'fc-inbox-bubble'+(m.sender_id===userId?' is-mine':'')} key={m.id}>{m.body}</div>):<p className="fc-inbox-empty">Start with a hello. Great films start somewhere.</p>}</div>
      <form className="fc-inbox-compose" onSubmit={send}><input aria-label="Write a message" placeholder="Say hello…" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000} required/><button disabled={busy||!draft.trim()} type="submit">Send ↗</button></form>
      <button className="fc-inbox-refresh" type="button" onClick={()=>void loadMessages(thread.id)}>Refresh messages ↻</button>
     </div>:<div className="fc-inbox-overview">
       <section><div className="fc-inbox-section-title"><span>01 / NEEDS YOUR RESPONSE</span><span>{pending.length+invites.length}</span></div>
         {pending.map(c=><div className="fc-inbox-entry" key={c.id}><div><strong>{other(c)?.display_name||'Creator'}</strong><small>Wants to connect with you</small></div><div className="fc-inbox-entry-actions"><button disabled={busy} type="button" onClick={()=>void respond(c.id,'accepted')}>Accept</button><button disabled={busy} type="button" onClick={()=>void respond(c.id,'declined')}>Decline</button></div></div>)}
         {invites.map(i=><div className="fc-inbox-entry" key={i.id}><div><strong>{i.crews?.name||'Film crew'}</strong><small>Invited you as {i.role}</small></div><div className="fc-inbox-entry-actions"><button disabled={busy} type="button" onClick={()=>void respondInvite(i.id,'accepted')}>Join</button><button disabled={busy} type="button" onClick={()=>void respondInvite(i.id,'declined')}>Decline</button></div></div>)}
         {!pending.length&&!invites.length&&<p className="fc-inbox-empty">All caught up. Your next collaboration awaits.</p>}
       </section>
       <section><div className="fc-inbox-section-title"><span>02 / YOUR CONVERSATIONS</span><span>{conversations.length}</span></div>
         {conversations.map(c=><button className="fc-inbox-conversation" type="button" key={c.id} onClick={()=>{setSelected(c.id);setNotice('')}}><span className="fc-inbox-face">{(other(c)?.display_name||'C').charAt(0)}</span><span><strong>{other(c)?.display_name||'Creator'}</strong><small>{other(c)?.primary_role||'Connected creator'}</small></span><span>↗</span></button>)}
         {!conversations.length&&<p className="fc-inbox-empty">No conversations yet. <Link href="/discover" onClick={onClose}>Discover creators ↗</Link></p>}
       </section>
       <section><div className="fc-inbox-section-title"><span>03 / SENT REQUESTS</span><span>{connections.filter(c=>c.status==='pending'&&c.requester_id===userId).length}</span></div>
         {connections.filter(c=>c.status==='pending'&&c.requester_id===userId).map(c=><div className="fc-inbox-entry" key={c.id}><div><strong>{other(c)?.display_name||'Creator'}</strong><small>Waiting for their reply</small></div><span>↗</span></div>)}
       </section>
      </div>}
   <footer className="fc-inbox-drawer-footer"><Link href="/discover" onClick={onClose}>Discover people ↗</Link><Link href="/crews" onClick={onClose}>My Crews ↗</Link></footer>
  </aside>
 </div>
}
