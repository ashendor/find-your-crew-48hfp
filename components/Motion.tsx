'use client';
import {useRef, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function Motion({children}:{children:ReactNode}){
  const root = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useGSAP(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const scope = root.current;
      if (!scope) return;
      const head = scope.querySelector('.lm-pagehead, .lm-top h1, .lm-inbox-head h1');
      const rows = [...scope.querySelectorAll('.lm-hit, .lm-rowitem, .lm-inbox-row, .lm-feature, .lm-person')].slice(0, 12);
      const tl = gsap.timeline({defaults:{ease:'power2.out'}});
      if (head) tl.from(head, {y:8, autoAlpha:0, duration:0.28, clearProps:'transform,opacity,visibility'}, 0);
      if (rows.length) tl.from(rows, {y:12, autoAlpha:0, duration:0.34, stagger:{each:0.035}, clearProps:'transform,opacity,visibility'}, 0.04);
    });
    return () => motion.revert();
  }, {scope:root, dependencies:[path], revertOnUpdate:true});
  return <div className="lm-motion" ref={root}>{children}</div>;
}
