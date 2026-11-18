'use client';

import { useEffect, useRef, useState } from 'react';

export default function ProfileBio({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    setLong(el.scrollHeight > el.clientHeight + 2);
  }, [text, open]);

  return <div className={open ? 'lm-bio-block is-open' : 'lm-bio-block'}>
    <p ref={ref} className="lm-bio">{text}</p>
    {long && <button type="button" className="lm-bio-more" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Show less' : 'Show more'}</button>}
  </div>;
}
