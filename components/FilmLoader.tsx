'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './film-loader.css';

gsap.registerPlugin(useGSAP);

const MARK = 'LIKEMINDS'.split('');
const HOLES = Array.from({ length: 36 }, (_, i) => i);

function Sprocket({ id }: { id: string }) {
  return <div className="fl-reel" aria-hidden="true"><div className="fl-sprocket">{HOLES.concat(HOLES).map((_, index) => <i key={id + index} />)}</div></div>;
}

export function FilmLoader({ leaving = false, delay = 0 }: { leaving?: boolean; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);
  useGSAP(() => {
    if (!ready) return;
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.fl-sprocket', { xPercent: -50, duration: 1.1, ease: 'none', repeat: -1 });
      gsap.to('.fl-iris', { rotation: 360, duration: 2.8, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      gsap.from('.fl-mark span', { y: 18, autoAlpha: 0, stagger: 0.045, duration: 0.42, ease: 'power3.out' });
      gsap.fromTo('.fl-bar span', { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power1.inOut', repeat: -1, yoyo: true, transformOrigin: '0% 50%' });
    });
    return () => motion.revert();
  }, { scope: root, dependencies: [ready], revertOnUpdate: true });

  if (!ready) return <main className="fl-wait" aria-busy="true" />;
  return <div ref={root} className={leaving ? 'fl-screen is-out' : 'fl-screen'} role="status" aria-live="polite" aria-label="Loading">
    <Sprocket id="top" />
    <div className="fl-stage">
      <svg className="fl-iris" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#C44832" strokeWidth="2" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#F6F1E7" strokeWidth="6" strokeDasharray="14 18" strokeLinecap="butt" />
        <circle cx="60" cy="60" r="18" fill="#C44832" />
      </svg>
      <p className="fl-mark">{MARK.map((letter, index) => <span key={index}>{letter}</span>)}</p>
      <p className="fl-kicker">FIND YOUR CREW</p>
      <div className="fl-bar" aria-hidden="true"><span /></div>
    </div>
    <Sprocket id="bottom" />
  </div>;
}
