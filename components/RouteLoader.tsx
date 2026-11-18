'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FilmLoader } from '@/components/FilmLoader';

let armImpl = () => {};
let clearImpl = () => {};

export function armLoader() {
  armImpl();
}

export function clearLoader() {
  clearImpl();
}

const SHOW_AFTER = 600;

export function RouteLoader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [phase, setPhase] = useState<'off' | 'on' | 'out'>('off');
  const trip = useRef(0);
  const url = pathname + (search ? '?' + search : '');
  const seen = useRef('');

  useEffect(() => {
    armImpl = () => {
      trip.current += 1;
      const tripAt = trip.current;
      window.setTimeout(() => {
        if (trip.current !== tripAt) return;
        setPhase('on');
      }, SHOW_AFTER);
    };
    clearImpl = () => {
      trip.current += 1;
      setPhase('off');
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      let next: URL;
      try { next = new URL(anchor.href, window.location.href); } catch { return; }
      if (next.origin !== window.location.origin) return;
      const here = window.location.pathname + window.location.search;
      const dest = next.pathname + next.search;
      if (dest === here) return;
      armImpl();
    };
    const onPop = () => armImpl();
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    return () => {
      armImpl = () => {};
      clearImpl = () => {};
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  useEffect(() => {
    if (!seen.current) { seen.current = url; return; }
    if (seen.current === url) return;
    seen.current = url;
    trip.current += 1;
    setPhase(current => current === 'on' ? 'out' : current);
  }, [url]);

  useEffect(() => {
    if (phase !== 'on') return;
    const tripAt = trip.current;
    const timer = window.setTimeout(() => { if (trip.current === tripAt) setPhase('out'); }, 8000);
    return () => window.clearTimeout(timer);
  }, [phase, url]);

  useEffect(() => {
    if (phase !== 'out') return;
    const timer = window.setTimeout(() => setPhase('off'), 280);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'off') return null;
  return <FilmLoader leaving={phase === 'out'} />;
}
