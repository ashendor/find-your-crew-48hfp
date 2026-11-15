'use client';
import {type PointerEvent as ReactPointerEvent,type WheelEvent as ReactWheelEvent,useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useCrewUser} from '@/lib/use-crew';
import CrewNav from '@/components/CrewNav';
import '../crew-app.css';
import '../spatial.css';

type Pan={x:number;y:number};
const nodes=[
 {id:'discover',x:-350,y:-175,w:390,category:'01 / GO EXPLORE',title:'Find your people.',description:'Swipe through filmmakers, find a creative spark, and connect.',href:'/discover',cta:'Discover creators',symbol:'✳'},
 {id:'crews',x:110,y:-235,w:305,category:'02 / BUILD TOGETHER',title:'My Crews',description:'The people who turn your ideas into films.',href:'/crews',cta:'Build a crew',symbol:'◎'},
 {id:'connections',x:175,y:135,w:335,category:'03 / KEEP TALKING',title:'Connections',description:'Your conversations and creative introductions.',href:'/connections',cta:'Open connections',symbol:'♡'},
 {id:'card',x:-350,y:190,w:305,category:'04 / YOUR IDENTITY',title:'Your Creator Card',description:'Your story, your craft, your creative identity.',href:'/profile',cta:'Edit your card',symbol:'▧'}
] as const;
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x));

export default function Dashboard(){
 const {client,user,userId,loading,error}=useCrewUser();
 const [crews,setCrews]=useState(0),[invites,setInvites]=useState(0),[requests,setRequests]=useState(0),[accepted,setAccepted]=useState(0);
 const [scale,setScale]=useState(1),[pan,setPan]=useState<Pan>({x:0,y:0}),[dragging,setDragging]=useState(false);
 const pointer=useRef<{id:number;startX:number;startY:number;x:number;y:number}|null>(null);
 const stage=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!client||!userId)return;let alive=true;(async()=>{
  const [a,b,c,d]=await Promise.all([
   client.from('crews').select('id',{count:'exact',head:true}).eq('owner_id',userId),
   client.from('crew_members').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('status','invited'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('recipient_id',userId).eq('status','pending'),
   client.from('connections').select('id',{count:'exact',head:true}).eq('status','accepted').or('requester_id.eq.'+userId+',recipient_id.eq.'+userId)
  ]);
  if(alive){setCrews(a.count||0);setInvites(b.count||0);setRequests(c.count||0);setAccepted(d.count||0)}
 })();return()=>{alive=false}},[client,userId]);
 const zoom=useCallback((next:number)=>setScale(s=>clamp(typeof next==='number'?next:s,.55,1.85)),[]);
 function pointerDown(e:ReactPointerEvent<HTMLDivElement>){
  if(e.button!==0||!(e.target instanceof Element)||e.target.closest('a,button,input,summary'))return;
  pointer.current={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:pan.x,y:pan.y};
  e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)
 }
 function pointerMove(e:ReactPointerEvent<HTMLDivElement>){
  if(pointer.current?.id!==e.pointerId)return;
  const p=pointer.current;setPan({x:p.x+e.clientX-p.startX,y:p.y+e.clientY-p.startY})
 }
 function pointerEnd(e:ReactPointerEvent<HTMLDivElement>){
  if(pointer.current?.id!==e.pointerId)return;pointer.current=null;setDragging(false);
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)
 }
 function wheel(e:ReactWheelEvent<HTMLDivElement>){
  if(e.ctrlKey||e.metaKey)return; // Leave pinch-to-zoom browser gestures intact.
  if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
   const factor=e.deltaY>0?.94:1.06;
   setScale(s=>clamp(s*factor,.55,1.85))
  }else setPan(p=>({x:p.x-e.deltaX*.55,y:p.y-e.deltaY*.55}))
 }
 function reset(){setPan({x:0,y:0});setScale(1)}
 if(loading||!user)return <main className="fc-app fc-space-loading"><div>Opening your creative universe<span className="fc-loading-dot">.</span></div></main>;
 const name=(user.display_name||user.username).trim().split(/\s+/)[0];
 const attention=invites+requests;
 return <main className="fc-app fc-space-app"><CrewNav userName={user.display_name}/>
  <div className="fc-space-workspace">
   <section className="fc-space-canvas-shell" aria-label="Interactive creative workspace">
    <div className="fc-space-topline">
     <div><span className="fc-space-overline"><span className="fc-live-dot"/> YOUR CREATIVE UNIVERSE / DUBAI '26</span>
      <h1>Make something <em>great.</em></h1>
      <p>Hey {name}. Your next collaboration is a connection away.</p></div>
     <div className="fc-space-hint">✥ DRAG TO EXPLORE <span>·</span> SCROLL TO ZOOM</div>
    </div>
    <div className={'fc-space-stage'+(dragging?' is-dragging':'')} ref={stage}
     onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onWheel={wheel}>
      <div className="fc-space-grid" aria-hidden="true" style={{backgroundPosition:(pan.x%32)+'px '+(pan.y%32)+'px',backgroundSize:(32*scale)+'px '+(32*scale)+'px'}}/>
      <div className="fc-space-aura" aria-hidden="true"/>
      <div className="fc-space-world" style={{transform:'translate(calc(-50% + '+pan.x+'px),calc(-50% + '+pan.y+'px)) scale('+scale+')'}}>
       <svg viewBox="0 0 1200 850" className="fc-space-paths" aria-hidden="true">
        <path d="M410 330 C 515 330, 535 280, 650 280" stroke="#c28c53" strokeWidth="1.2" strokeDasharray="6 9" fill="none" opacity=".48"/>
        <path d="M410 470 C 560 500, 580 570, 710 570" stroke="#c28c53" strokeWidth="1.2" strokeDasharray="6 9" fill="none" opacity=".48"/>
        <circle cx="600" cy="435" r="29" stroke="#dcaa5c" strokeWidth="1" fill="#211e19"/>
        <circle cx="600" cy="435" r="9" fill="#d6aa60"/>
       </svg>
       <span className="fc-space-canvas-caption" style={{left:480,top:380}}>YOUR NEXT FILM STARTS HERE</span>
       {nodes.map((item,i)=><Link key={item.id} href={item.href}
        className={'fc-space-node fc-space-node-'+item.id}
        style={{left:600+item.x,top:425+item.y,width:item.w,animationDelay:(i*100)+'ms'}}>
        <div className="fc-space-node-top"><span>{item.category}</span><span className="fc-space-node-arrow">↗</span></div>
        <div className="fc-space-node-body"><span className="fc-space-node-symbol">{item.symbol}</span><h2>{item.title}</h2><p>{item.id==='crews'&&crews>0?crews+' crew'+(crews===1?'':'s')+' in your space.':item.id==='connections'&&accepted>0?accepted+' collaborators connected.':item.description}</p></div>
        <div className="fc-space-node-bottom"><span>{item.cta}</span><span>↗</span></div>
       </Link>)}
       <div className="fc-space-sticker" style={{left:1010,top:215}} aria-hidden="true">CREATE<br/>CONNECT<br/>REPEAT <span>✳</span></div>
       <span className="fc-space-coordinate" style={{left:70,top:715}}>48 HOUR FILM PROJECT / 27–29 NOVEMBER</span>
      </div>
      <div className="fc-space-controls" aria-label="Canvas zoom controls">
       <button type="button" onClick={()=>setScale(s=>clamp(s-.15,.55,1.85))} aria-label="Zoom out">−</button>
       <span aria-live="polite">{Math.round(scale*100)}%</span>
       <button type="button" onClick={()=>setScale(s=>clamp(s+.15,.55,1.85))} aria-label="Zoom in">＋</button>
       <button type="button" onClick={reset} aria-label="Reset canvas view">↺</button>
      </div>
      <div className="fc-space-viewport-tag">OPEN CANVAS <span>✳</span></div>
    </div>
   </section>
   <aside className="fc-space-sidebar" aria-label="Your creative workspace sidebar">
    <div className="fc-space-side-head"><span>CREW CONTROL</span><span className="fc-space-side-star">✳</span></div>
    <div className="fc-space-side-profile"><div className="fc-space-side-avatar" style={user.avatar_url?{backgroundImage:'url("'+user.avatar_url+'")'}:{}}>{!user.avatar_url&&(name[0]||'C').toUpperCase()}</div><div><span>YOUR CREATOR PASS</span><h2>{user.display_name}</h2><p>{user.primary_role||'Creator'} · {user.location||'Dubai'}</p></div></div>
    <div className="fc-space-side-section"><span className="fc-space-side-label">QUICK MOVES</span>
     <Link href="/discover" className="fc-side-primary">✳ &nbsp; Discover people <span>↗</span></Link>
     <Link href="/crews">◎ &nbsp; Manage my crews <span>↗</span></Link>
     <Link href="/connections">♡ &nbsp; Open conversations <span>↗</span></Link>
     <Link href="/profile">▧ &nbsp; Edit Creator Card <span>↗</span></Link>
    </div>
    <div className="fc-space-side-section fc-space-activity"><div className="fc-space-side-section-head"><span className="fc-space-side-label">ON YOUR RADAR</span>{attention>0&&<span className="fc-space-count">{attention}</span>}</div>
     {attention>0?<><p>{requests>0?requests+' connection request'+(requests===1?'':'s')+' waiting.':''}</p><p>{invites>0?invites+' crew invitation'+(invites===1?'':'s')+' waiting.':''}</p><Link href={requests?'/connections':'/crews'} className="fc-space-activity-link">See what needs you ↗</Link></>:<p>All clear. The next connection is yours to make.</p>}
    </div>
    <div className="fc-space-side-footer"><div><span className="fc-live-dot"/> OPEN TO COLLABORATE</div><p>Great films don't happen alone.</p><span>BY LIKEMINDS · DUBAI 2026</span></div>
   </aside>
  </div>
 </main>
}
