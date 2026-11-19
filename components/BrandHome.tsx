'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCrewSupabase } from '@/lib/crew-supabase';
import SignOutButton from '@/components/SignOutButton';
import { withBasePath } from '@/lib/base-path';

const people: { name: string; role: string; image: string; locked?: boolean }[] = [
  { name: 'Alex R.', role: 'Director', image: withBasePath('/brand/avatar-alex.jpg') },
  { name: 'Maya C.', role: 'DOP', image: withBasePath('/brand/avatar-maya.jpg') },
  { name: 'Jordan B.', role: 'Editor', image: withBasePath('/brand/avatar-jordan.jpg') },
];
const list = [
  ...people,
  { name: 'Priya N.', role: 'Producer', image: withBasePath('/brand/avatar-priya.jpg'), locked: true },
  { name: 'Ethan C.', role: 'Sound', image: withBasePath('/brand/avatar-ethan.jpg'), locked: true },
];
const genres = [
  [withBasePath('/brand/poster-heist.jpg'), 'Heist genre poster: a figure inside a keyhole of light beside a rust vault door'],
  [withBasePath('/brand/poster-disaster.jpg'), 'Disaster genre poster: a black sun ringed in gold over burning towers'],
  [withBasePath('/brand/poster-scifi.jpg'), 'Sci fi genre poster: an astronaut beneath a ringed planet'],
  [withBasePath('/brand/poster-silent-film.jpg'), 'Silent film genre poster: a figure tied to a railway track as a train approaches'],
  [withBasePath('/brand/poster-documentary.jpg'), 'Documentary genre poster: round glasses over lines of text'],
];
const chips = ['All', 'Directors', 'DOPs', 'Editors', 'Actors', 'Sound'];

function Arrow() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
function ConnectIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1817" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-7 7-7s7 3 7 7" /><path d="M19 8v6M16 11h6" /></svg>;
}
function Trio({ className }: { className?: string }) {
  return <div className={className}><div className="lp-trio"><div className="lp-trio-row">{people.map(person => <div className="lp-person" key={person.name}><img src={person.image} alt={'Example profile photo of ' + person.name} /><strong>{person.name}</strong><span>{person.role}</span></div>)}</div><p className="lp-example">Example profiles</p></div></div>;
}

export default function BrandHome() {
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const client = getCrewSupabase();
    if (!client) { setAuthReady(true); return; }
    let mounted = true;
    client.auth.getSession().then(({ data }) => { if (mounted) { setSignedIn(!!data.session); setAuthReady(true); } });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => { if (mounted) { setSignedIn(!!session); setAuthReady(true); } });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);
  const profileHref = signedIn ? '/home' : '/auth';
  const discoverHref = signedIn ? '/explore' : '/auth';

  return <div className="lp">
    <header className="lp-wrap lp-header">
      <p className="lp-city">DUBAI<span className="lp-dots" aria-hidden="true"><span /><span /><span /></span></p>
      <div className="lp-mid">
        <img className="lp-logo-48" src={withBasePath("/brand/logo-48hfp-ink.png")} alt="The 48 Hour Film Project" />
        <p className="lp-date">27 TO 29 NOV 2026</p>
      </div>
      <img className="lp-logo-lm" src={withBasePath("/brand/logo-like-minds.png")} alt="Like Minds, UAE's Creative Community" />
    </header>
    <div className="lp-wrap lp-tools">
      <a href="#about">About</a>
      {authReady && (signedIn ? <><Link href="/home">My Space</Link><SignOutButton className="lp-logout" onSuccess={() => setSignedIn(false)} /></> : <Link href="/auth">Sign in</Link>)}
    </div>

    <section className="lp-wrap lp-hero">
      <div className="lp-hero-grid">
        <div className="lp-copy">
          <p className="lp-kicker">Dubai 2026. Crew finder</p>
          <h1>Every film needs a crew.</h1>
          <p className="lp-lead">Looking for a team? You&apos;re in the right place. First film or fiftieth, everyone here wants the same thing. A story worth telling and the right people beside you. Find your crew and make it happen.</p>
          <div className="lp-actions"><Link className="lp-btn lp-btn-ink" href={profileHref}>Create your profile <Arrow /></Link></div>
          <Trio className="lp-trio-mob" />
        </div>
        <figure className="lp-figure">
          <Trio className="lp-trio-desk" />
          <img className="lp-poster" src={withBasePath("/brand/poster-sadu-whos-in-your-team.jpg")} alt="Sadu series poster: the Dubai skyline woven in Sadu inside a rust sun" />
          <figcaption className="lp-caption">Dubai. 27 to 29 November 2026</figcaption>
        </figure>
      </div>
    </section>

    <section className="lp-band">
      <div className="lp-wrap">
        <p className="lp-kicker">How it works</p>
        <div className="lp-steps">
          <div className="lp-step"><p className="lp-time">00:01</p><h3>Build your profile</h3><p>Your role, your experience and what you&apos;re looking for. Pro or first film, all welcome.</p></div>
          <div className="lp-step"><p className="lp-time">00:02</p><h3>See who&apos;s out there</h3><p>Profiles are only visible to people who&apos;ve made one. Everyone in the room is up for it.</p></div>
          <div className="lp-step"><p className="lp-time">00:03</p><h3>Make your team</h3><p>Reach out, lock in your crew and register your team for the weekend.</p></div>
        </div>
      </div>
    </section>

    <section className="lp-ink">
      <div className="lp-wrap">
        <div className="lp-split">
          <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">One scene. Any genre. 48 hours.</p><h2>Luck of the draw.</h2></div>
          <p className="lp-note">Your genre is drawn at kick-off. Heist, sci fi, silent film. Whatever you get, your crew makes it work.</p>
        </div>
        <div className="lp-posters">{genres.map(([src, alt]) => <img key={src} src={src} alt={alt} />)}</div>
      </div>
    </section>

    <section className="lp-wrap lp-profiles">
      <div className="lp-split">
        <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">Example profiles</p><h2>Who&apos;s looking.</h2></div>
        <p className="lp-note">Examples only. Real profiles unlock the moment you make yours.</p>
      </div>
      <div className="lp-crew">
        <div className="lp-panel lp-discover">
          <h3>Discover</h3>
          <div className="lp-chips">{chips.map(chip => <span className={'lp-chip' + (chip === 'All' ? ' on' : '')} key={chip}>{chip}</span>)}</div>
          <div className="lp-lock">
            {list.map(person => <div className={'lp-row' + (person.locked ? ' lp-locked' : '')} key={person.name}><img className="lp-avatar" src={person.image} alt="" /><div><strong>{person.name}</strong><p>{person.role} · Dubai</p></div><Link className="lp-connect" href={discoverHref} aria-label={'Connect with ' + person.name}><ConnectIcon /></Link></div>)}
            <div className="lp-lock-cta"><Link className="lp-btn lp-btn-ink lp-btn-small" href={discoverHref}>Create a profile to see everyone</Link></div>
          </div>
        </div>
        <div className="lp-panel lp-profile">
          <img src={withBasePath("/brand/avatar-maya.jpg")} alt="Example profile photo of Maya C." />
          <div><h3>Maya C.</h3><p className="lp-role">DOP · Dubai</p></div>
          <p className="lp-bio">Shoots short films and music videos. Has her own camera kit. Looking for a director with a story.</p>
          <div className="lp-chip-row"><span className="lp-chip">Camera</span><span className="lp-chip">Lighting</span><span className="lp-chip">Colour</span></div>
          <div className="lp-facts"><div><strong>First film</strong><span>Experience</span></div><div><strong>EN · AR</strong><span>Languages</span></div></div>
          <div className="lp-pair">
            <Link className="lp-pill lp-pill-ink" href={discoverHref}>Connect</Link>
            <Link className="lp-pill lp-pill-line" href={discoverHref}>Message</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="lp-rust">
      <div className="lp-float" aria-hidden="true">
        <img src={withBasePath("/brand/poster-horror.jpg")} alt="" />
        <img src={withBasePath("/brand/poster-western.jpg")} alt="" />
        <img src={withBasePath("/brand/poster-noir.jpg")} alt="" />
      </div>
      <div className="lp-wrap">
        <p className="lp-kicker">Early crew bonus</p>
        <h2>Two months of Like Minds. Free.</h2>
        <p className="lp-lead">Build your profile now and get two months of free access to the Like Minds portal.</p>
        <Link className="lp-btn lp-btn-paper" href={profileHref} style={{ alignSelf: 'flex-start', marginTop: 8 }}>Create your profile <Arrow /></Link>
      </div>
    </section>

    <section className="lp-wrap lp-hero" id="about">
      <div className="lp-about-hero">
        <div className="lp-copy">
          <p className="lp-kicker">About. Dubai 2026</p>
          <h1>One weekend. One film.</h1>
          <p className="lp-lead">The 48 Hour Film Project is a filmmaking challenge run in cities around the world. Teams write, shoot and edit a short film in one weekend. After a long break, it&apos;s back in Dubai, run by Like Minds.</p>
          <div className="lp-actions"><Link className="lp-btn lp-btn-ink" href={profileHref}>Find your crew <Arrow /></Link></div>
        </div>
        <img className="lp-poster" src={withBasePath("/brand/poster-western.jpg")} alt="Western genre poster: a rider on a camel against a white sun" style={{ maxWidth: 520, justifySelf: 'end' }} />
      </div>
    </section>

    <section className="lp-ink">
      <div className="lp-wrap">
        <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">How it works</p><h2>The weekend.</h2></div>
        <div className="lp-steps lp-steps-4">
          <div className="lp-step lp-rule"><p className="lp-time">FRI 27 NOV</p><h3>Kick-off</h3><p>You draw a genre. Every team gets the same character, prop and line of dialogue to use.</p></div>
          <div className="lp-step lp-rule"><p className="lp-time">FRI TO SUN</p><h3>Make it</h3><p>Write, shoot, edit and score your film. Everything is made inside the 48 hours.</p></div>
          <div className="lp-step lp-rule"><p className="lp-time">SUN 29 NOV, 7PM</p><h3>Hand it in</h3><p>Hard deadline. Late films are disqualified from the competition but still screen.</p></div>
          <div className="lp-step lp-rule"><p className="lp-time">5 TO 13 DEC</p><h3>Premiere</h3><p>Every film plays on the big screen. The best go to a finals night and awards.</p></div>
        </div>
      </div>
    </section>

    <section className="lp-wrap lp-profiles">
      <div className="lp-split">
        <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">Awards</p><h2>What&apos;s at stake.</h2></div>
        <p className="lp-note">The Best Film winner goes to Filmapalooza, the international festival of 48 Hour Film Project winners, in March 2027. It&apos;s also eligible for a screening at the Cannes Film Festival Short Film Corner.</p>
      </div>
      <div className="lp-steps">
        <div className="lp-step lp-rule lp-rule-ink"><p className="lp-time">THE TOP PRIZE</p><h3>Best Film</h3><p>First, second and third place.</p></div>
        <div className="lp-step lp-rule lp-rule-ink"><p className="lp-time">CRAFT</p><h3>Best Director, Cinematography, Actor, Actress</h3><p>Individual awards for the people behind and in front of the camera.</p></div>
        <div className="lp-step lp-rule lp-rule-ink"><p className="lp-time">THE ELEMENTS</p><h3>Best Use of Character, Prop, Line</h3><p>For the team that does the most with the required elements. Plus an Audience Award.</p></div>
      </div>
    </section>

    <section className="lp-band">
      <div className="lp-wrap lp-photos">
        <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">Dubai has done this before</p><h2>Back on the big screen.</h2></div>
        <div className="lp-steps">
          <figure><img src={withBasePath("/brand/past-jbr-finals.jpg")} alt="Our films on the big screen at the 48 Hour Film Project finals, JBR Beach" /><figcaption>Finals night, JBR Beach</figcaption></figure>
          <figure><img src={withBasePath("/brand/past-calltime-winners-2019.jpg")} alt="Team CallTime holding their winner certificates, Dubai 2019" /><figcaption>Team CallTime, winners, 2019</figcaption></figure>
          <figure><img src={withBasePath("/brand/past-crew-at-monitor-2019.jpg")} alt="A Dubai crew checking a shot on the camera monitor, 2019" /><figcaption>On set, 2019</figcaption></figure>
        </div>
      </div>
    </section>

    <section className="lp-rust">
      <div className="lp-wrap">
        <div className="lp-copy" style={{ gap: 16 }}><p className="lp-kicker">Enter your team</p><h2>Team fees.</h2></div>
        <div className="lp-steps">
          <div className="lp-step lp-rule"><p className="lp-time">CLOSED 5 NOV</p><h3>Early bird: AED 700</h3><p>Closed. Thanks to everyone who got in early.</p></div>
          <div className="lp-step lp-rule"><p className="lp-time">UNTIL SUN 22 NOV</p><h3>Regular: AED 800</h3><p>Per team, not per person. Register now.</p></div>
          <div className="lp-step lp-rule"><p className="lp-time">UNTIL THU 26 NOV</p><h3>Late: AED 1,000</h3><p>Last call before kick-off.</p></div>
        </div>
        <div className="lp-actions">
          <a className="lp-btn lp-btn-paper" href="https://www.48hourfilm.com/dubai/48hfp">Register your team <Arrow /></a>
          <p className="lp-lead" style={{ maxWidth: 'none' }}>No team yet? <Link href={profileHref} style={{ color: '#EFE6D2' }}>Create your crew profile</Link>.</p>
        </div>
      </div>
    </section>

    <section className="lp-wrap" style={{ paddingTop: 100, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p className="lp-kicker">Who runs it</p>
      <p className="lp-who">48 Hour Film Project Dubai is a Like Minds initiative, run with the full support of the Dubai Films and Games Commission. Questions? Email <a href="mailto:dubai@48hourfilm.com">dubai@48hourfilm.com</a>.</p>
    </section>

    <footer className="lp-wrap lp-footer">
      <p>00:01:48</p>
      <p>A LIKE MINDS INITIATIVE</p>
      <p>CREW FINDER /26</p>
    </footer>
    <div className="lp-grain" aria-hidden="true" />
    <div className="lp-wear" aria-hidden="true" />
  </div>;
}
