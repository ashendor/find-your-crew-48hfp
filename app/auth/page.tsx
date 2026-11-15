'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCrewSupabase } from '@/lib/crew-supabase';
import '../profile/creator.css';
import './auth-modern.css';

// Do not advertise Google sign-in until the Google Cloud OAuth application
// and the Supabase Google provider have both been configured.
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';

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
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailOpen, setEmailOpen] = useState(!googleEnabled);
  const router = useRouter();
  const client = getCrewSupabase();

  useEffect(() => {
    if (!client) return;
    client.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [client, router]);

  async function signInWithGoogle() {
    if (!client || busy || !googleEnabled) return;
    setBusy(true);
    setError('');
    // /profile is already on the production Supabase redirect allowlist.
    // It sends incomplete profiles to onboarding and completed profiles to
    // their editor. Existing accounts and profile IDs are preserved.
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/profile',
        queryParams: { prompt: 'select_account' },
      },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
    }
  }

  async function signInWithEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    setError('');
    const { error: authError } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + '/profile',
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (authError) setError(authError.message);
    else setSent(true);
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
      <section className="crew-auth-glass" aria-label="Sign in to your crew">
        <div className="crew-auth-panel-top"><span>✳ &nbsp; YOUR PASS TO THE CREW</span><span>001 / 001</span></div>
        <div className="crew-auth-panel-main">
          <p className="crew-auth-panel-eyebrow">WELCOME TO YOUR CREATIVE WORLD</p>
          <h2>{sent ? 'Check your inbox.' : <>Enter the<br/><em>crew.</em></>}</h2>
          {sent ? <>
            <p className="crew-auth-message">We sent a secure sign-in link to <strong>{email}</strong>. Open it to join your creative space.</p>
            <button type="button" className="crew-auth-back-email" onClick={()=>setSent(false)}>← Use another email</button>
          </> : <>
            <p className="crew-auth-message">One tap and you're in. No passwords. Just possibility.</p>
            {googleEnabled&&<button type="button" className="crew-auth-google" disabled={busy||!client} onClick={()=>void signInWithGoogle()}>
              <GoogleMark/><span>{busy?'Opening Google…':'Continue with Google'}</span><span className="crew-auth-google-arrow" aria-hidden="true">↗</span>
            </button>}
            {googleEnabled&&!emailOpen&&<button type="button" className="crew-auth-email-link" onClick={()=>setEmailOpen(true)}>Prefer email? Use a sign-in link <span>↗</span></button>}
            {emailOpen&&<form className="crew-auth-email-form" onSubmit={signInWithEmail}>
              <label htmlFor="crew-email">YOUR EMAIL</label>
              <input id="crew-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>
              <button type="submit" disabled={busy||!client}>{busy?'Sending…':'Send sign-in link ↗'}</button>
              {googleEnabled&&<button type="button" className="crew-auth-back-email" onClick={()=>setEmailOpen(false)}>← Back to Google sign-in</button>}
            </form>}
            {error&&<p className="crew-auth-error" role="alert">{error}</p>}
            {!client&&<p className="crew-auth-error" role="alert">Sign-in is unavailable. Please try again later.</p>}
          </>}
        </div>
        <footer className="crew-auth-panel-footer"><span>INDEPENDENT FILM. UNLIMITED CONNECTIONS.</span><p>Creating a profile doesn't register you for the official film challenge.</p></footer>
      </section>
    </div>
    <div className="crew-auth-corner-code" aria-hidden="true">LIKEMINDS PRESENTS / 48 HOUR FILM PROJECT DUBAI</div>
  </main>;
}
