'use client';
import {useEffect, useState, type ReactNode} from 'react';
import {directThumb} from '@/lib/work-thumb';

const memory = new Map<string, string | null>();

function probe(src: string) {
  return new Promise<boolean>(resolve => {
    const image = new Image();
    const timer = window.setTimeout(() => resolve(false), 6000);
    image.onload = () => { window.clearTimeout(timer); resolve(true); };
    image.onerror = () => { window.clearTimeout(timer); resolve(false); };
    image.src = src;
  });
}

export default function WorkShot({url, fallback, children}:{url: string; fallback: string; children: ReactNode}) {
  const [image, setImage] = useState(fallback);
  useEffect(() => {
    let gone = false;
    void (async () => {
      let candidate = directThumb(url);
      if (!candidate) {
        if (memory.has(url)) candidate = memory.get(url) || null;
        else {
          try {
            const response = await fetch('/api/link-preview?url=' + encodeURIComponent(url));
            const data = await response.json() as {image?: string | null};
            candidate = data.image || null;
          } catch {
            candidate = null;
          }
          memory.set(url, candidate);
        }
      }
      if (!candidate || gone) return;
      if (await probe(candidate) && !gone) setImage(candidate);
    })();
    return () => { gone = true; };
  }, [url]);
  return <a className="lm-shot" href={url} target="_blank" rel="noopener noreferrer" style={{backgroundImage: 'url(' + JSON.stringify(image) + ')'}}>{children}</a>;
}
