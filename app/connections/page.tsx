'use client';
import {FormEvent,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import CrewNav from '@/components/CrewNav';
import {FilmLoader} from '@/components/FilmLoader';
import {useCrewUser} from '@/lib/use-crew';
import type {Connection,Creator} from '@/lib/crew-types';
import '../crew-app.css';
import '../brand-skin.css';
type Message={id:string;connection_id:string;sender_id:string;body:string;created_at:string};
export default function Connections(){
 const {client,user,userId,loading}=useCrewUser();
 const [connections,setConnections]=useState<Connection[]>([]),[people,setPeople]=useState<Record<string,Creator>>({}),[selected,setSelected]=useState<string|null>(null),[messages,setMessages]=useState<Message[]>([]),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const refresh=useCallback(async()=>{if(!client||!userId)return;
 const {data,error:e}=await client.from('connections').select('*').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId).order('created_at',{ascending:false});
 if(e){setError(e.message);return}
 const list=(data||[]) as Connection[];setConnections(list);
 const ids=Array.from(new Set(list.flatMap(x=>[x.requester_id,x.recipient_id]).filter(x=>x!==userId)));
 if(ids.length){const {data:p}=await client.from('profiles').select('*').in('id',ids);setPeople(Object.fromEntries(((p||[]) as Creator[]).map(x=>[x.id,x])))}
 },[client,userId]);
 useEffect(()=>{void refresh()},[refresh]);
 const thread=connections.find(c=>c.id===selected&&c.status==='accepted');
 useEffect(()=>{if(!client||!thread){setMessages([]);return}let running=true;
 const load=async()=>{const {data}=await client.from('messages').select('*').eq('connection_id',thread.id).order('created_at',{ascending:true}).limit(100);if(running)setMessages((data||[]) as Message[])};
 void load();return()=>{running=false}
 },[client,thread?.id,thread?.status]);
 async function respond(id:string,status:'accepted'|'declined'){if(!client||busy)return;setBusy(true);setError('');
 const {error:e}=await client.from('connections').update({status}).eq('id',id).eq('recipient_id',userId);
 setBusy(false);if(e)setError(e.message);else{setNotice(status==='accepted'?'You are now connected. Say hello!':'Request declined.');void refresh();if(status==='accepted')setSelected(id)}}
 async function send(e:FormEvent){e.preventDefault();if(!client||!thread||!body.trim()||busy)return;setBusy(true);setError('');
 const {data,error:e2}=await client.from('messages').insert({connection_id:thread.id,sender_id:userId,body:body.trim().slice(0,2000)}).select().single();
 setBusy(false);if(e2)setError(e2.message);else{setMessages(v=>[...v,data as Message]);setBody('')}}
 if(loading||!user)return <FilmLoader delay={600} />;
 const other=(c:Connection)=>people[c.requester_id===userId?c.recipient_id:c.requester_id];
 return <main className="fc-app fc-app--cinematic fc-workspace-page"><CrewNav userName={user.display_name}/><div className="fc-main"><p className="fc-eyebrow">COLLABORATION STARTS WITH HELLO</p><h1 className="fc-display">Your <em>connections.</em></h1><p className="fc-lead">Good films need good people. Accept connection requests, follow up with creators and make plans to collaborate.</p>
 {error&&<p className="fc-error" role="alert">{error}</p>}{notice&&<p className="fc-notice" role="status">{notice}</p>}
 <div className="fc-two-col" style={{marginTop:34}}><section className="fc-panel"><p className="fc-eyebrow">YOUR NETWORK</p><h2>People & requests.</h2>
 {connections.length?<div className="fc-list">{connections.map(c=><div className="fc-list-item" key={c.id}><div><strong>{other(c)?.display_name||'Creator'}</strong><p style={{margin:'5px 0',fontSize:12}}>{c.status==='pending'?(c.recipient_id===userId?'Wants to connect with you':'Waiting for their reply'):c.status==='accepted'?"You're connected":'Request declined'}</p>{other(c)&&<Link href={'/creators/'+encodeURIComponent(other(c)!.username)} style={{fontSize:12}}>View profile ↗</Link>}</div>
 {c.status==='pending'&&c.recipient_id===userId?<div style={{display:'flex',gap:7}}><button className="fc-btn fc-btn-small" disabled={busy} onClick={()=>void respond(c.id,'accepted')}>Accept</button><button style={{color:'#271d16',borderColor:'#8e765b'}} className="fc-btn fc-btn-alt fc-btn-small" disabled={busy} onClick={()=>void respond(c.id,'declined')}>Decline</button></div>:c.status==='accepted'?<button className="fc-btn fc-btn-small" onClick={()=>setSelected(c.id)}>Message ↗</button>:<span className="fc-pill">{c.status}</span>}
 </div>)}</div>:<p style={{color:'#73644f'}}>No connections yet. Head to Discover to meet your first collaborator.</p>}
 </section>
 <section className="fc-panel"><p className="fc-eyebrow">CREATIVE CONVERSATIONS</p><h2>{thread?'Your conversation.':'Say hello.'}</h2>
 {thread?<><div style={{height:300,overflow:'auto',background:'#e3d8c4',padding:15,borderRadius:5,display:'flex',flexDirection:'column',gap:12}}>
 {messages.length?messages.map(m=><div key={m.id} style={{padding:'11px 14px',background:m.sender_id===userId?'#2b261e':'#fffaf0',color:m.sender_id===userId?'#fff':'#261f18',borderRadius:8,maxWidth:'85%',alignSelf:m.sender_id===userId?'flex-end':'flex-start',wordBreak:'break-word'}}>{m.body}</div>):<p style={{fontSize:13,color:'#655b4c'}}>No messages yet. Start the conversation.</p>}
 </div><form onSubmit={send} style={{display:'flex',gap:8,marginTop:15}}><input className="fc-filter-input" maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Say hello…" aria-label="Your message" required style={{flex:1,minWidth:0}}/><button className="fc-btn" disabled={busy||!body.trim()}>Send ↗</button></form><button style={{marginTop:12,color:'#8b442b',background:'none',border:0}} onClick={async()=>{if(!client)return;const {data}=await client.from('messages').select('*').eq('connection_id',thread.id).order('created_at',{ascending:true}).limit(100);setMessages((data||[]) as Message[])}}>Refresh messages ↻</button></>:<p style={{color:'#73644f'}}>Once a connection is accepted, you can message each other privately here.</p>}
 </section></div><div style={{marginTop:35}}><Link href="/discover" className="fc-btn fc-btn-alt">Discover more creatives →</Link></div>
 </div></main>;
}
