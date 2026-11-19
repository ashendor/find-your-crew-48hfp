'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCrewSupabase } from '@/lib/crew-supabase';
import { armLoader, clearLoader } from '@/components/RouteLoader';
import { publicUrl } from '@/lib/base-path';
import '../profile/creator.css';
import './auth-modern.css';
import '../brand-skin.css';

// Production offers Google only. Local `next dev` can still use a password.
const localPasswordAuth = process.env.NODE_ENV === 'development';

function GoogleMark() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.2 3-7.3Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/>
    <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6A6 6 0 0 1 12 6Z"/>
  </svg>;
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const router = useRouter();
  const client = getCrewSupabase();

  useEffect(() => {
    if (!client) return;
    client.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/home');
    });
  }, [client, router]);

  async function signInWithGoogle() {
    if (!client || busy) return;
    setBusy(true);
    setError('');
    // The existing return route is /profile. Supabase sends the session back
    // there, and this page sends new accounts onward. Production always uses
    // the public origin so the return is not the Vercel hostname.
    window.sessionStorage.setItem('fc:return-from-signin', '1');
    armLoader();
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: publicUrl('/profile'),
        queryParams: { prompt: 'select_account' },
      },
    });
    if (oauthError) {
      clearLoader();
      window.sessionStorage.removeItem('fc:return-from-signin');
      setBusy(false);
      setError(oauthError.message);
    }
  }

  async function signInWithPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!client || busy || !localPasswordAuth) return;
    setBusy(true);
    setError('');
    window.sessionStorage.setItem('fc:return-from-signin', '1');
    const { error: authError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (authError) {
      window.sessionStorage.removeItem('fc:return-from-signin');
      setError(authError.message);
      return;
    }
    armLoader();
    router.push('/profile');
  }

  return <main className="crew-page crew-auth-page crew-auth-reimagined">
    <div className="crew-auth-scene" aria-hidden="true"><div className="crew-auth-scene-image"/><div className="crew-auth-scene-wash"/><div className="crew-auth-scene-grid"/></div>
    <header className="crew-auth-topbar"><Link href="/" className="crew-auth-brand">FIND YOUR CREW <span>BY LIKEMINDS · DUBAI 2026</span></Link><Link href="/" className="crew-auth-exit">BACK TO HOME <span>↗</span></Link></header>
    <div className="crew-auth-body">
      <section className="crew-auth-editorial" aria-label="Welcome">
        <div className="crew-auth-edition"><span className="crew-auth-rec"/> THE CREATIVE CONNECTION / ISSUE 001</div>
        <div className="crew-auth-editorial-main"><h1 className="crew-auth-main-heading"><span>GOOD FILMS</span><span>AREN'T MADE</span><em>ALONE.</em></h1><p>Discover the people who make your next big idea possible.</p>
          <div className="crew-auth-collage" aria-hidden="true"><span>◈ DIRECTORS</span><span>✳ CREATORS</span><span>◎ DREAMERS</span></div>
        </div>
        <div className="crew-auth-editorial-footer"><span>CREATE <i>✳</i> CONNECT <i>✳</i> COLLABORATE</span><span>48HFP / NOV 27—29</span></div>
      </section>
      <section className="crew-auth-glass" aria-label="Continue with Google">
        <div className="crew-auth-panel-top"><span>✳ &nbsp; YOUR PASS TO THE CREW</span><span>001 / 001</span></div>
        <div className="crew-auth-panel-main">
          <p className="crew-auth-panel-eyebrow">WELCOME TO YOUR CREATIVE WORLD</p>
          <p className="crew-auth-message">Continue with your Google account.</p>
          <button type="button" className="crew-auth-google" disabled={busy||!client} onClick={()=>void signInWithGoogle()}>
            <GoogleMark/><span>{busy?'Opening Google…':'Continue with Google'}</span>
          </button>
          {localPasswordAuth&&!emailOpen&&<button type="button" className="crew-auth-email-link" onClick={()=>setEmailOpen(true)}>Local test? Use a password <span>↗</span></button>}
          {localPasswordAuth&&emailOpen&&<form className="crew-auth-email-form" onSubmit={signInWithPassword}>
            <label htmlFor="crew-email">YOUR EMAIL</label>
            <input id="crew-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>
            <label htmlFor="crew-password">PASSWORD</label>
            <input id="crew-password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
            <button type="submit" disabled={busy||!client}>{busy?'Continuing…':'Continue'}</button>
            <button type="button" className="crew-auth-back-email" onClick={()=>setEmailOpen(false)}>← Back</button>
          </form>}
          {error&&<p className="crew-auth-error" role="alert">{error}</p>}
          {!client&&<p className="crew-auth-error" role="alert">Google is unavailable right now. Please try again later.</p>}
        </div>
        <footer className="crew-auth-panel-footer"><span>INDEPENDENT FILM. UNLIMITED CONNECTIONS.</span><p>Creating a profile doesn't register you for the official film challenge. A profile is created only after you accept the <Link href="/terms">Terms</Link>.</p></footer>
      </section>
    </div>
    <div className="crew-auth-corner-code" aria-hidden="true">LIKEMINDS PRESENTS / 48 HOUR FILM PROJECT DUBAI</div>
  </main>;
}
