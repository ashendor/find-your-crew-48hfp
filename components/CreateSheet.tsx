'use client';
import Link from 'next/link';

export default function CreateSheet({open, onClose}:{open:boolean; onClose:()=>void}){
  if (!open) return null;
  return <div className="lm-sheet" role="presentation" onClick={onClose}>
    <div className="lm-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="lm-create-choices" onClick={e => e.stopPropagation()}>
      <div className="lm-grab" aria-hidden="true" />
      <h2 id="lm-create-choices">Create</h2>
      <Link className="lm-choice" href="/create" onClick={onClose}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 20v-2a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2"/><circle cx="10" cy="8" r="3"/><path d="M19 8v6M16 11h6"/></svg>
        <span><strong>Create team</strong><p>Start a team, then register it for a project.</p></span>
        <em aria-hidden="true">›</em>
      </Link>
      <Link className="lm-choice" href="/profile?tab=work" onClick={onClose}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></svg>
        <span><strong>Link your work</strong><p>Add Instagram, YouTube, Vimeo, or a site.</p></span>
        <em aria-hidden="true">›</em>
      </Link>
    </div>
  </div>;
}
