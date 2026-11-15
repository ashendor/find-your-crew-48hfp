'use client';
import {Suspense,useEffect} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';

const KEY = 'lm:trail';

function read(){
  try { return JSON.parse(sessionStorage.getItem(KEY) || '[]') as string[]; }
  catch { return []; }
}
function write(trail:string[]){
  sessionStorage.setItem(KEY, JSON.stringify(trail.slice(-30)));
}

let fromPop = false;
if (typeof window !== 'undefined') window.addEventListener('popstate', () => { fromPop = true; });

export function useGoBack(fallback = '/home'){
  const router = useRouter();
  return () => {
    const trail = read();
    const current = window.location.pathname + window.location.search;
    if (trail.at(-1) === current) trail.pop();
    const previous = trail.at(-1);
    write(trail);
    router.push(previous && previous !== current ? previous : fallback);
  };
}

function TrailInner(){
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    const url = pathname + (params.toString() ? '?' + params.toString() : '');
    const trail = read();
    if (trail.at(-1) === url) { fromPop = false; return; }
    if (fromPop && trail.at(-2) === url) trail.pop();
    else trail.push(url);
    fromPop = false;
    write(trail);
  }, [pathname, params]);
  return null;
}

export function NavigationTrail(){
  return <Suspense fallback={null}><TrailInner /></Suspense>;
}

export default function BackButton({fallback = '/home', label = 'Back'}:{fallback?:string; label?:string}){
  const go = useGoBack(fallback);
  return <button className="lm-iconbtn" type="button" onClick={go} aria-label={label}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 6 9 12l6 6"/></svg></button>;
}
