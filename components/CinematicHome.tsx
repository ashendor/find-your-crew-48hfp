'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getCrewSupabase } from '@/lib/crew-supabase';
import SignOutButton from '@/components/SignOutButton';

const sections = ['home','discover','how','challenge','join'] as const;
const roles = ['All','Directors','Camera','Actors','Editors','Writers','Sound'];
const samples = [
  {name:'Arjun M.',role:'Director',other:'Writer',image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=560&q=80'},
  {name:'Maya K.',role:'Camera',other:'Cinematographer',image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=560&q=80'},
  {name:'Rami S.',role:'Editor',other:'Colourist',image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=560&q=80'},
  {name:'Leena A.',role:'Writers',other:'Screenwriter',image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=560&q=80'},
  {name:'Karan P.',role:'Sound',other:'Sound Designer',image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=560&q=80'},
  {name:'Nadia R.',role:'Actors',other:'Performer',image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=560&q=80'},
];
const backgrounds = {
  hero:'/hero-filmset.webp',
  discover:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1800&q=80',
  how:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1800&q=80',
  challenge:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=85',
  join:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1800&q=85',
};
function Icon({name,size=20}:{name:'search'|'plus'|'arrow'|'down'|'user'|'menu'|'close'|'heart'|'chevron'|'film'|'users'|'camera',size?:number}){
  const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true as const};
  const paths:Record<string,React.ReactNode>={search:<><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,plus:<path d="M12 4v16M4 12h16"/>,arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,down:<path d="m6 9 6 6 6-6"/>,user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>,menu:<path d="M4 7h16M4 12h16M4 17h16"/>,close:<path d="M5 5l14 14M19 5 5 19"/>,heart:<path d="M20.8 8.6c0 4.4-8.8 10.3-8.8 10.3S3.2 13 3.2 8.6a4.5 4.5 0 0 1 8.8-1.3 4.5 4.5 0 0 1 8.8 1.3Z"/>,chevron:<path d="m9 5 7 7-7 7"/>,film:<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4"/></>,users:<><circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M16 5a3 3 0 0 1 0 6m2 3a6 6 0 0 1 4 6"/></>,camera:<><rect x="2" y="7" width="15" height="12" rx="2"/><path d="m17 11 5-3v10l-5-3M6 7l2-3h4l2 3"/></>};
  return <svg {...common}>{paths[name]}</svg>;
}
export default function CinematicHome(){
  const [active,setActive]=useState(0);
  const [signedIn,setSignedIn]=useState(false);
  const [authReady,setAuthReady]=useState(false);
  const [role,setRole]=useState('All');
  const [saved,setSaved]=useState<string[]>([]);
  const [menu,setMenu]=useState(false);
  const [query,setQuery]=useState('');
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const client=getCrewSupabase();
    if(!client){setAuthReady(true);return;}
    let mounted=true;
    client.auth.getSession().then(({data})=>{if(mounted){setSignedIn(!!data.session);setAuthReady(true)}});
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{if(mounted){setSignedIn(!!session);setAuthReady(true)}});
    return()=>{mounted=false;subscription.unsubscribe()};
  },[]);
  const reduce=useReducedMotion();
  const go=useCallback((index:number)=>{document.getElementById(sections[index])?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});setMenu(false)},[reduce]);
  useEffect(()=>{const nodes=sections.map(id=>document.getElementById(id)).filter(Boolean) as HTMLElement[];const obs=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>.5){const i=sections.indexOf(e.target.id as typeof sections[number]);if(i>=0)setActive(i)}}},{root:root.current,threshold:[.5,.75]});nodes.forEach(n=>obs.observe(n));return()=>obs.disconnect()},[]);
  const filtered=samples.filter(p=>(role==='All'||p.role===role)&&(p.name+' '+p.role+' '+p.other).toLowerCase().includes(query.toLowerCase()));
  const enter={initial:reduce?false:{opacity:0,y:22},whileInView:{opacity:1,y:0},viewport:{once:false,amount:.35},transition:{duration:.65,ease:[.22,1,.36,1] as const}};
  return <div className="cinematic" ref={root}>
    <header className="cin-header"><button className="cin-brand" onClick={()=>go(0)} aria-label="Find Your Crew home"><Image className="cin-likeminds-logo" src="/likeminds-mark.svg" alt="LikeMinds" width={90} height={54}/><span className="cin-brand-divider" aria-hidden="true"/><span className="cin-official-logo"><Image src="https://commons.wikimedia.org/wiki/Special:FilePath/48HFP.jpg" alt="The 48 Hour Film Project" width={80} height={60} unoptimized /></span><span className="cin-site-name">FIND YOUR CREW<small>DUBAI · 2026</small></span></button><nav className={'cin-header-nav '+(menu?'is-open':'')} aria-label="Primary">{sections.map((s,i)=><button key={s} onClick={()=>go(i)} className={active===i?'selected':''}>{['Home','Discover','How it works','The challenge','Join'][i]}</button>)}<div className="cin-mobile-auth">{authReady && (signedIn ? <><Link href="/dashboard" onClick={()=>setMenu(false)}>My Space ↗</Link><SignOutButton className="cin-mobile-logout" onSuccess={()=>setMenu(false)}/></> : <Link href="/auth" onClick={()=>setMenu(false)}>Sign In ↗</Link>)}</div></nav><div className="cin-account-actions">{authReady && (signedIn ? <><Link className="cin-account-link" href="/dashboard">My Space ↗</Link><SignOutButton className="cin-logout" onSuccess={()=>setSignedIn(false)}/></> : <Link className="cin-account-link cin-signin" href="/auth">Sign In ↗</Link>)}</div><button className="cin-menu" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(v=>!v)}><Icon name={menu?'close':'menu'} size={24}/></button></header>
    <div className="cin-scroll">
      <section className={`cin-panel cin-hero ${active === 0 ? "cin-hero-playing" : ""}`} id="home" style={{'--cin-image':`url("${backgrounds.hero}")`} as React.CSSProperties}>
        <div className="cin-panel-shade"/><div className="cin-filmset-motion" aria-hidden="true"><div className="cin-filmset-beam cin-filmset-beam-one"/><div className="cin-filmset-beam cin-filmset-beam-two"/><div className="cin-filmset-haze"/><div className="cin-filmset-flares"/><div className="cin-filmset-grain"/></div><div className="cin-hero-frame" aria-hidden="true"><span className="cin-rec-dot"/> REC <span>48H / DUBAI</span></div><motion.div {...enter} className="cin-content cin-hero-content"><p className="cin-overline">LIKEMINDS × THE 48 HOUR FILM PROJECT</p><h1>Find your<br/><em>film crew.</em></h1><p className="cin-description">Meet filmmakers. Build your crew. Make something unforgettable in 48 hours. Brought together by LikeMinds.</p><div className="cin-buttons"><Link className="cin-button cin-primary" href="/discover"><Icon name="search"/> Find Creatives</Link><Link className="cin-button cin-secondary" href={signedIn?"/dashboard":"/auth"}><Icon name="user"/> {signedIn?"My Space":"Create Profile"}</Link></div></motion.div><button className="cin-next" onClick={()=>go(1)} aria-label="Next: discover filmmakers">SCROLL TO DISCOVER <Icon name="down" size={17}/></button>
      </section>
      <section className="cin-panel cin-discover" id="discover" style={{'--cin-image':`url("${backgrounds.discover}")`} as React.CSSProperties}>
        <div className="cin-panel-shade"/><div className="cin-discover-inner"><motion.div {...enter} className="cin-discover-heading"><div><p className="cin-overline">02 / THE LIKEMINDS COMMUNITY</p><h2>Discover <em>creatives.</em></h2><p>Discover creative people through LikeMinds. Find your next collaborator, not just a contact.</p></div><label className="cin-search"><Icon name="search" size={18}/><input aria-label="Search sample creatives" placeholder="Search names or roles" value={query} onChange={e=>setQuery(e.target.value)}/></label></motion.div><div className="cin-role-row" role="group" aria-label="Filter creative roles">{roles.map(r=><button key={r} aria-pressed={role===r} onClick={()=>setRole(r)} className={role===r?'active':''}>{r}</button>)}</div><div className="cin-card-row" aria-label="Sample filmmaker profiles">{filtered.map(p=><article className="cin-card" key={p.name}><div className="cin-card-image" style={{backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.9),transparent 62%),url("${p.image}")`}}><button className={'cin-heart '+(saved.includes(p.name)?'on':'')} aria-label={saved.includes(p.name)?`Unsave ${p.name}`:`Save ${p.name}`} aria-pressed={saved.includes(p.name)} onClick={()=>setSaved(old=>old.includes(p.name)?old.filter(n=>n!==p.name):[...old,p.name])}><Icon name="heart" size={18}/></button><div className="cin-card-copy"><h3>{p.name}</h3><p>{p.role} · {p.other}</p><span><i/> Open to collaborate</span></div></div></article>)}</div>{filtered.length===0&&<p className="cin-no-results">No sample profiles found. Try another role.</p>}<div className="cin-discover-foot"><span>LikeMinds discovery preview · illustrative profiles</span><Link href="/discover">Discover real creatives <Icon name="arrow" size={17}/></Link></div></div>
      </section>
      <section className="cin-panel cin-how" id="how" style={{'--cin-image':`url("${backgrounds.how}")`} as React.CSSProperties}><div className="cin-panel-shade"/><motion.div {...enter} className="cin-content cin-how-content"><p className="cin-overline">03 / CONNECT THROUGH LIKEMINDS</p><h2>Create. Connect.<br/><em>Collaborate.</em></h2><div className="cin-steps">{[{icon:'user' as const,title:'Show your craft',desc:'Introduce yourself and the kind of projects you love.'},{icon:'users' as const,title:'Meet your people',desc:'Discover like-minded creators across filmmaking roles.'},{icon:'film' as const,title:'Make it together',desc:'Build a crew and bring a story to life in 48 hours.'}].map((s,i)=><div className="cin-step" key={s.title}><span className="cin-step-number">0{i+1}</span><Icon name={s.icon} size={31}/><h3>{s.title}</h3><p>{s.desc}</p></div>)}</div></motion.div></section>
      <section className="cin-panel cin-challenge" id="challenge" style={{'--cin-image':`url("${backgrounds.challenge}")`} as React.CSSProperties}><div className="cin-panel-shade"/><motion.div {...enter} className="cin-content cin-challenge-content"><p className="cin-overline">04 / THE 48 HOUR CHALLENGE</p><h2>The 48 Hour<br/><em>Film Project.</em></h2><p className="cin-description">One weekend. One team. One original short film.</p><p className="cin-date">27—29 NOVEMBER 2026</p><p className="cin-fineprint">LikeMinds brings creatives together around the challenge. Official event registration is managed separately by the 48 Hour Film Project.</p><button onClick={()=>go(4)} className="cin-button cin-primary">Ready to join? <Icon name="arrow"/></button></motion.div></section>
      <section className="cin-panel cin-join" id="join" style={{'--cin-image':`url("${backgrounds.join}")`} as React.CSSProperties}><div className="cin-panel-shade"/><motion.div {...enter} className="cin-content cin-join-content"><p className="cin-overline">05 / MORE THAN ONE FILM</p><h2>Find your crew.<br/><em>Find your people.</em></h2><p className="cin-description">The 48-hour challenge is the beginning. LikeMinds is where creative connections can grow beyond the weekend.</p><div className="cin-buttons"><Link href={signedIn?"/dashboard":"/auth"} className="cin-button cin-primary"><Icon name="user"/> {signedIn?"Open My Space":"Create Your Profile"}</Link><Link className="cin-button cin-secondary" href="/discover"><Icon name="search"/> Find Filmmakers</Link></div><p className="cin-fineprint">Join the community. Meet creators. Build your crew.</p></motion.div><footer className="cin-footer">A LIKEMINDS CREATIVE INITIATIVE · DUBAI 2026 <span>CREATE · CONNECT · EDUCATE</span></footer></section>
    </div>
    <nav className="cin-dots" aria-label="Page sections">{sections.map((s,i)=><button key={s} onClick={()=>go(i)} className={active===i?'active':''} aria-label={['Hero','Discover','How it works','The challenge','Join'][i]} aria-current={active===i?'step':undefined}/>)}</nav>
  </div>;
}
