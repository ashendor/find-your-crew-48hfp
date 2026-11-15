'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

const people = [
  { id: 1, name: 'Ali R.', role: 'Director', secondary: 'Writer', skills: 'Storytelling · Direction', color: '#B4442E', initials: 'AR' },
  { id: 2, name: 'Sara M.', role: 'Camera', secondary: 'Cinematographer', skills: 'Lighting · Cinematography', color: '#2E86C1', initials: 'SM' },
  { id: 3, name: 'Omar K.', role: 'Editor', secondary: 'Sound', skills: 'Post-production · Colour', color: '#776849', initials: 'OK' },
  { id: 4, name: 'Lina F.', role: 'Sound', secondary: 'Composer', skills: 'Recording · Mixing', color: '#68715B', initials: 'LF' },
  { id: 5, name: 'Karim S.', role: 'Actor', secondary: 'Writer', skills: 'Acting · Improvisation', color: '#9B5A50', initials: 'KS' },
];
const filters = ['All roles', 'Director', 'Camera', 'Editor', 'Actor', 'Sound', 'Writer'];
const ease = [0.22, 1, 0.36, 1] as const;

export default function CrewExperience() {
  const [filter, setFilter] = useState('All roles');
  const [saved, setSaved] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const reduceMotion = useReducedMotion();
  const visible = useMemo(() => people.filter(p => (filter === 'All roles' || p.role === filter || p.secondary === filter) && (p.name + ' ' + p.role + ' ' + p.secondary + ' ' + p.skills).toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const reveal = (delay = 0) => reduceMotion ? {} : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.65, delay, ease } };
  const toggleSaved = (id: number) => setSaved(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return (
    <div className="crew-app">
      <header className="crew-header">
        <Link href="/" className="crew-brand" aria-label="Find Your Crew home"><span className="crew-brand-mark">48<span>H</span></span><span>FIND YOUR CREW<small>DUBAI · 2026</small></span></Link>
        <nav className="crew-top-links" aria-label="Main navigation"><a href="#how">How it works</a><a href="#discover">Discover</a><Link href="/coming-soon" className="crew-header-join">Join the crew ↗</Link></nav>
        <a className="crew-mobile-top" href="#discover">EXPLORE ↗</a>
      </header>

      <main>
        <section className="crew-hero" id="home">
          <div className="crew-hero-orbit" aria-hidden="true"><span>48</span><small>HOURS</small></div>
          <div className="crew-hero-inner">
            <motion.div {...reveal()}><div className="crew-eyebrow"><span className="crew-live-dot" /> THE 48 HOUR FILM PROJECT · DUBAI</div>
              <h1>GOOD FILMS<br />START WITH<br /><em>GREAT CREWS.</em></h1>
              <p className="crew-hero-sub">Looking for filmmakers to team up with? Meet local creatives, find your people, and make a short film together in just 48 hours.</p>
              <div className="crew-actions"><Link href="/coming-soon" className="crew-btn crew-btn-primary">CREATE YOUR PROFILE <span>↗</span></Link><a href="#discover" className="crew-btn crew-btn-outline">FIND COLLABORATORS <span>↓</span></a></div>
              <p className="crew-hero-note">Find Your Crew helps you connect. Official challenge registration is separate.</p>
            </motion.div>
          </div>
          <div className="crew-hero-bottom"><span>01 / YOUR NEXT COLLABORATION STARTS HERE</span><a href="#how">SCROLL TO EXPLORE ↓</a></div>
        </section>

        <section className="crew-steps" id="how">
          <motion.div {...reveal()} className="crew-section-heading"><span className="crew-kicker">THE SIMPLE PART</span><h2>THREE STEPS.<br /><em>ONE CREW.</em></h2><p>No team yet? No problem. This is your place to meet the people who want to make something with you.</p></motion.div>
          <div className="crew-steps-grid">
            {[{n:'01',symbol:'✳',title:'CREATE A PROFILE',text:'Tell people who you are, what you do, and which roles you want to work with.'},{n:'02',symbol:'↗',title:'FIND & CONNECT',text:'Explore filmmakers by role, discover shared interests, and reach out to collaborate.'},{n:'03',symbol:'▶',title:'MAKE YOUR FILM',text:'Bring your crew together and take on the 48-hour filmmaking challenge.'}].map((s,i)=><motion.div {...reveal(i*.08)} className="crew-step" key={s.n}><div className="crew-step-top"><span>{s.n} / 03</span><span className="crew-step-symbol">{s.symbol}</span></div><h3>{s.title}</h3><p>{s.text}</p></motion.div>)}
          </div>
        </section>

        <section className="crew-discover" id="discover">
          <div className="crew-discover-head"><motion.div {...reveal()}><span className="crew-kicker">MEET YOUR PEOPLE</span><h2>FIND YOUR<br /><em>COLLABORATORS.</em></h2><p>Directors, actors, editors, sound designers and everyone in between. Start with the role you need.</p></motion.div><span className="crew-discover-stamp" aria-hidden="true">CREATIVE<br />PEOPLE<br />WELCOME ✳</span></div>
          <div className="crew-discover-tools"><div className="crew-filters" role="group" aria-label="Filter by filmmaking role">{filters.map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)} className={'crew-filter '+(filter===f?'active':'')}>{f}</button>)}</div><label className="crew-search"><span aria-hidden="true">⌕</span><input aria-label="Search filmmakers" placeholder="Search filmmakers" value={search} onChange={e=>setSearch(e.target.value)} /></label></div>
          <div className="crew-results-label"><span>{visible.length} {visible.length===1?'CREATIVE':'CREATIVES'} TO DISCOVER</span><span>PREVIEW PROFILES · EXAMPLES ONLY</span></div>
          <div className="crew-people-grid">{visible.map((p,i)=><motion.article {...reveal(Math.min(i*.07,.28))} key={p.id} className="crew-person">
            <div className="crew-person-photo" style={{backgroundColor:p.color}}><div className="crew-person-graphic" aria-hidden="true"><span className="crew-person-initials">{p.initials}</span><span className="crew-person-circle" /></div><span className="crew-person-index">CREATIVE / 0{p.id}</span><button type="button" className={'crew-save '+(saved.includes(p.id)?'saved':'')} onClick={()=>toggleSaved(p.id)} aria-label={(saved.includes(p.id)?'Remove ':'Save ')+p.name} aria-pressed={saved.includes(p.id)}>{saved.includes(p.id)?'♥':'♡'}</button></div>
            <div className="crew-person-info"><div className="crew-person-name"><h3>{p.name}</h3><span className="crew-available"><i /> OPEN TO CREW</span></div><p className="crew-person-role">{p.role} <span>· {p.secondary}</span></p><p className="crew-person-skills">{p.skills}</p><Link href="/coming-soon" className="crew-person-link">VIEW PROFILE <span>↗</span></Link></div>
          </motion.article>)}</div>
          {visible.length===0&&<div className="crew-empty">No preview profiles match that search. Try another role or keyword.</div>}
          <div className="crew-discover-foot"><p>These are sample profiles showing how discovery will work. Real filmmaker profiles and connection requests are coming soon.</p><Link href="/coming-soon" className="crew-btn crew-btn-dark">GET YOUR PROFILE READY ↗</Link></div>
        </section>

        <section className="crew-event"><motion.div {...reveal()} className="crew-event-inner"><div><span className="crew-kicker">SAVE THE DATES · DUBAI</span><h2>48 HOURS.<br /><em>ENDLESS STORIES.</em></h2><p>27—29 NOVEMBER 2026</p></div><div className="crew-event-side"><span className="crew-event-number">48<span>H</span></span><p>Find your collaborators here. Register for the official challenge separately through the event organiser.</p><Link href="/coming-soon" className="crew-btn crew-btn-light">EVENT DETAILS ↗</Link></div></motion.div></section>
      </main>
      <footer className="crew-footer"><strong>FIND YOUR CREW<span> ✳</span></strong><p>Made for the filmmakers who haven’t met yet.</p><span>DUBAI · 2026</span></footer>
      <nav className="crew-bottom-nav" aria-label="Mobile navigation"><a href="#home"><span>⌂</span>Home</a><a href="#discover"><span>⌕</span>Discover</a><Link className="crew-nav-plus" href="/coming-soon" aria-label="Create profile">＋</Link><Link href="/coming-soon"><span>✉</span>Messages</Link><Link href="/coming-soon"><span>◯</span>Profile</Link></nav>
    </div>
  );
}
