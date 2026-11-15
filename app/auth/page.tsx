'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCrewSupabase } from '@/lib/crew-supabase';
import '../profile/creator.css';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const client = getCrewSupabase();
  useEffect(() => {
    if (!client) return;
    client.auth.getUser().then(({data}) => { if (data.user) router.replace('/dashboard'); });
  }, [client, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!client || busy) return;
    setBusy(true); setError('');
    const { error: authError } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/profile', shouldCreateUser: true }
    });
    setBusy(false);
    if (authError) setError(authError.message);
    else setSent(true);
  }

  return <main className="crew-page crew-auth-page"><div className="crew-shell">
    <Link className="crew-back" href="/">← Find Your Crew</Link>
    <div className="crew-auth-layout"><div className="crew-auth-art"><p>LIKEMINDS PRESENTS</p><h1>Good films start with <em>great crews.</em></h1><span>48 HOUR FILM PROJECT · DUBAI</span></div>
    <section className="crew-paper"><p className="crew-eyebrow">JOIN THE CREATIVE COMMUNITY</p><h2>{sent ? 'Check your inbox.' : 'Find your people.'}</h2>
      {sent ? <><p>We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to start your creator journey.</p><button className="crew-text-button" onClick={()=>setSent(false)}>Use another email</button></> :
      <form onSubmit={submit}><p>Sign in or create an account with your email. No password needed.</p>
      <label htmlFor="crew-email">Email address</label><input id="crew-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>
      {error && <p className="crew-error" role="alert">{error}</p>}
      {!client && <p className="crew-error" role="alert">Sign-in is not configured yet. Add the public Supabase environment variables in Vercel.</p>}
      <button className="crew-primary" type="submit" disabled={busy || !client}>{busy ? 'Sending…' : 'Continue with email →'}</button>
      <small>Creating a Find Your Crew profile does not register you for the official film challenge.</small></form>}
    </section></div>
  </div></main>;
}
