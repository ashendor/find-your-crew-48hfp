'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {getCrewSupabase} from '@/lib/crew-supabase';

export default function HeaderActions(){
  const [dot, setDot] = useState(false);
  useEffect(() => {
    const client = getCrewSupabase();
    if (!client) return;
    let active = true;
    void client.auth.getUser().then(({data}) => {
      if (!active || !data.user) return;
      void client.from('connections').select('id', {count:'exact', head:true}).eq('recipient_id', data.user.id).eq('status', 'pending').then(({count}) => {
        if (active) setDot((count || 0) > 0);
      });
    });
    return () => { active = false; };
  }, []);
  return <div className="lm-nav-actions lm-page-actions">
    <Link className="lm-iconbtn" href="/inbox" aria-label="Notifications"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>{dot && <span className="lm-dot"/>}</Link>
    <Link className="lm-iconbtn" href="/profile?tab=settings" aria-label="Settings"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></Link>
  </div>;
}
