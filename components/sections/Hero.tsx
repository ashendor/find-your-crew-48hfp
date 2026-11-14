'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../ui/Button';
import { useRef } from 'react';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-ink">
      {/* Cinematic background with film texture */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-b from-ink via-ink to-paper"
      >
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Spotlight effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(26,24,23,0.4)_100%)]" />
      </motion.div>

      {/* Film strip decoration - top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-ink border-b-2 border-paper/20 z-10">
        <div className="flex h-full items-center justify-around max-w-7xl mx-auto px-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-4 h-4 border-2 border-paper/30" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <motion.div 
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 z-20"
      >
        <div className="max-w-5xl w-full mx-auto text-center">
          {/* Event badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block mb-8"
          >
            <div className="px-4 py-2 border-2 border-mustard bg-mustard/10 backdrop-blur-sm">
              <span className="text-mustard font-label font-semibold text-sm tracking-widest">
                48 HOUR FILM PROJECT • DUBAI • 27–29 NOV 2026
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-paper mb-6 leading-[0.9] tracking-tighter"
          >
            FIND YOUR<br />
            <span className="text-rust">CREW.</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl text-paper/90 mb-12 font-body max-w-3xl mx-auto"
          >
            Two days. Two nights. One film.<br />
            <span className="text-paper/70">Connect with filmmakers. Build your team. Create cinema.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button href="/coming-soon" variant="primary" size="large" className="min-w-[220px]">
              Join the Community
            </Button>
            <Button href="/coming-soon" variant="secondary" size="large" className="min-w-[220px] !bg-transparent !text-paper !border-paper hover:!bg-paper hover:!text-ink">
              Explore Filmmakers
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-paper/60"
            >
              <span className="text-xs font-label tracking-wider">SCROLL</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-paper/60 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Film strip decoration - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-ink border-t-2 border-paper/20 z-10">
        <div className="flex h-full items-center justify-around max-w-7xl mx-auto px-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-4 h-4 border-2 border-paper/30" />
          ))}
        </div>
      </div>
    </section>
  );
}
