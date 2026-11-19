'use client';

import {FormEvent, useEffect, useRef, type ReactNode} from 'react';

export type ChatLine = {id:string;sender_id:string;body:string;created_at:string};

function dayLabel(iso:string){
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(date);
  that.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', {day:'numeric', month:'short', year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'});
}

function clock(iso:string){
  return new Date(iso).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
}

export default function ChatThread({
  title, subtitle, avatar, messages, mine, names, draft, onDraft, onSend, busy, onBack, onMore, empty, placeholder, embed, note, alert,
}:{
  title:string;
  subtitle?:string;
  avatar?:ReactNode;
  messages:ChatLine[];
  mine:string;
  names?:Record<string,string>;
  draft:string;
  onDraft:(value:string)=>void;
  onSend:()=>void;
  busy?:boolean;
  onBack?:()=>void;
  onMore?:()=>void;
  empty:string;
  placeholder:string;
  embed?:boolean;
  note?:string;
  alert?:string;
}){
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const last = messages[messages.length - 1]?.id;
  useEffect(() => {
    const el = log.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [last, messages.length]);
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [draft]);
  useEffect(() => {
    if (embed) return;
    const view = window.visualViewport;
    if (!view) return;
    const root = document.documentElement;
    const phone = window.matchMedia('(max-width: 1179px)');
    const sync = () => {
      const keyboard = phone.matches && window.innerHeight - view.height > 80;
      root.classList.toggle('lm-keyboard', keyboard);
      root.style.setProperty('--lm-vvh', view.height + 'px');
      root.style.setProperty('--lm-vvt', view.offsetTop + 'px');
      const scroller = log.current;
      if (keyboard && scroller) scroller.scrollTop = scroller.scrollHeight;
    };
    sync();
    view.addEventListener('resize', sync);
    view.addEventListener('scroll', sync);
    phone.addEventListener('change', sync);
    return () => {
      root.classList.remove('lm-keyboard');
      root.style.removeProperty('--lm-vvh');
      root.style.removeProperty('--lm-vvt');
      view.removeEventListener('resize', sync);
      view.removeEventListener('scroll', sync);
      phone.removeEventListener('change', sync);
    };
  }, [embed]);

  function submit(e?:FormEvent){
    e?.preventDefault();
    if (!draft.trim() || busy) return;
    onSend();
  }

  return <section className={embed ? 'lm-chat lm-chat-embed' : 'lm-chat'} aria-label={title}>
    <header className="lm-chat-bar">
      {onBack && <button className="lm-chat-back" type="button" onClick={onBack} aria-label="Back to inbox">‹</button>}
      <div className="lm-chat-who">
        {avatar}
        <div>
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </div>
      </div>
      {onMore && <button className="lm-chat-more" type="button" onClick={onMore}>Delete</button>}
    </header>
    {alert && <p className="lm-alert" role="alert">{alert}</p>}
    {note && <p className="lm-note" role="status">{note}</p>}
    <div className="lm-chat-log" ref={log}>
      {!messages.length && <p className="lm-chat-empty">{empty}</p>}
      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const day = dayLabel(message.created_at);
        const showDay = !prev || dayLabel(prev.created_at) !== day;
        const own = message.sender_id === mine;
        const tail = !next || next.sender_id !== message.sender_id || dayLabel(next.created_at) !== day;
        const head = !prev || prev.sender_id !== message.sender_id || dayLabel(prev.created_at) !== day;
        const who = names?.[message.sender_id];
        return <div key={message.id}>
          {showDay && <p className="lm-chat-day">{day}</p>}
          <p className={'lm-bubble' + (own ? ' mine' : ' theirs') + (tail ? ' is-tail' : '') + (message.id.startsWith('local-') ? ' is-pending' : '')}>
            {!own && head && who && <b>{who}</b>}
            {message.body}
            {tail && <time dateTime={message.created_at}>{clock(message.created_at)}</time>}
          </p>
        </div>;
      })}
    </div>
    <form className="lm-chat-compose" onSubmit={submit}>
      <textarea
        ref={field}
        rows={1}
        value={draft}
        aria-label={placeholder}
        placeholder={placeholder}
        maxLength={2000}
        onChange={e => onDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button className="lm-chat-send" type="submit" disabled={busy || !draft.trim()} aria-label="Send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>
      </button>
    </form>
  </section>;
}
