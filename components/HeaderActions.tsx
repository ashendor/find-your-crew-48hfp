'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';
import {leadJoinRequests} from '@/lib/team-joins';

export default function HeaderActions(){
  const [dot, setDot] = useState(false);
  useEffect(() => {
    const client = getCrewSupabase();
    if (!client) return;
    let active = true;
    const load = () => {
      void client.auth.getUser().then(({data}) => {
        if (!active || !data.user) return;
        const id = data.user.id;
        void (async () => {
          const waiting = await client.from('connections').select('id', {count:'exact', head:true}).eq('recipient_id', id).eq('status', 'pending');
          const joins = await leadJoinRequests(client, id);
          if (active) setDot((waiting.count || 0) + joins.length > 0);
        })();
      });
    };
    load();
    const poke = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener('focus', poke);
    document.addEventListener('visibilitychange', poke);
    const timer = window.setInterval(poke, 15000);
    return () => { active = false; window.removeEventListener('focus', poke); document.removeEventListener('visibilitychange', poke); window.clearInterval(timer); };
  }, []);
  return <div className="lm-nav-actions lm-page-actions">
    <Link className="lm-iconbtn" href="/inbox?tab=requests" aria-label="Notifications" onClick={() => window.dispatchEvent(new Event('lm:requests'))}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>{dot && <span className="lm-dot"/>}</Link>
    <Link className="lm-iconbtn" href="/profile?tab=settings" aria-label="Settings"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></Link>
  </div>;
}
