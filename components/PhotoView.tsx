'use client';
import {useEffect,useState} from 'react';

export default function PhotoView({src,alt}:{src:string;alt:string}){
  const [open,setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event:KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <>
    <button className="lm-photo-open" type="button" onClick={() => setOpen(true)} aria-label={'View photo of ' + alt}>
      <img src={src} alt="" />
    </button>
    {open && <div className="lm-photo-view" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)}>
      <img src={src} alt={alt} />
    </div>}
  </>;
}
