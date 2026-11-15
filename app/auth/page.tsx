'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCrewSupabase } from '@/lib/crew-supabase';
import '../profile/creator.css';

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

  return <main className="crew-page crew-auth-page"><div className="crew-shell">
    <Link className="crew-back" href="/">← Find Your Crew</Link>
    <div className="crew-auth-layout">
      <div className="crew-auth-art"><p>LIKEMINDS PRESENTS</p><h1>Good films start with <em>great crews.</em></h1><span>48 HOUR FILM PROJECT · DUBAI</span></div>
      <section className="crew-paper">
        <p className="crew-eyebrow">JOIN THE CREATIVE COMMUNITY</p>
        <h2>{sent ? 'Check your inbox.' : 'Find your people.'}</h2>
        {sent ? <>
          <p>We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to start your creator journey.</p>
          <button type="button" className="crew-text-button" onClick={() => setSent(false)}>Use another email</button>
        </> : <>
          <p>One creative identity. A world of new collaborators.</p>
          {googleEnabled && <div className="crew-oauth">
            <button type="button" className="crew-google-button" onClick={() => void signInWithGoogle()} disabled={busy || !client}>
              <GoogleMark/> <span>{busy ? 'Connecting…' : 'Continue with Google'}</span>
            </button>
            <p className="crew-oauth-note">Fast sign-in, without another password or verification email.</p>
          </div>}
          {googleEnabled && <div className="crew-auth-separator"><span>OR</span></div>}
          {googleEnabled && !emailOpen && <button type="button" className="crew-email-toggle" onClick={() => setEmailOpen(true)}>
            Continue with email instead
          </button>}
          {emailOpen && <form onSubmit={signInWithEmail}>
            {!googleEnabled && <p>Sign in or create an account with your email. No password needed.</p>}
            <label htmlFor="crew-email">Email address</label>
            <input id="crew-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254}/>
            <button className="crew-primary" type="submit" disabled={busy || !client}>
              {busy ? 'Sending…' : 'Send me a sign-in link →'}
            </button>
            {googleEnabled && <small>Email sign-in uses Supabase's limited built-in email allowance.</small>}
          </form>}
          {error && <p className="crew-error" role="alert">{error}</p>}
          {!client && <p className="crew-error" role="alert">Sign-in is not configured. The public Supabase environment variables are missing.</p>}
          <p className="crew-oauth-disclaimer">Creating a Find Your Crew profile does not register you for the official film challenge.</p>
        </>}
      </section>
    </div>
  </div></main>;
}
