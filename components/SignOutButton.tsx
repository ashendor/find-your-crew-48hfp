'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCrewSupabase } from '@/lib/crew-supabase';
import { armLoader } from '@/components/RouteLoader';

export default function SignOutButton({ className = '', onSuccess }: { className?: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError('');
    const client = getCrewSupabase();
    if (!client) { setError('Sign out is unavailable. Please reload.'); setBusy(false); return; }
    try {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) throw signOutError;
      onSuccess?.();
      armLoader();
      router.replace('/');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign out. Please retry.');
      setBusy(false);
    }
  }
  return <span className="fc-signout-wrap">
    <button type="button" className={className || 'fc-signout'} disabled={busy} onClick={() => void signOut()}>
      {busy ? 'Signing out…' : 'Log Out'}
    </button>
    {error && <span className="fc-signout-error" role="alert">{error}</span>}
  </span>;
}
