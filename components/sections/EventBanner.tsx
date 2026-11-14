'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EventBanner() {
  return (
    <>
      {/* Desktop banner */}
      <section className="hidden sm:block relative bg-mustard py-12 lg:py-16 overflow-hidden">
        {/* Filmmaking silhouettes background */}
        <div className="absolute left-0 bottom-0 w-1/3 h-full opacity-20">
          <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMinYMax slice">
            <ellipse cx="80" cy="180" rx="30" ry="8" fill="#1A1817" />
            <ellipse cx="180" cy="180" rx="25" ry="7" fill="#1A1817" />
            <ellipse cx="280" cy="180" rx="28" ry="8" fill="#1A1817" />
            <rect x="75" y="120" width="10" height="60" fill="#1A1817" />
            <circle cx="80" cy="105" r="12" fill="#1A1817" />
            <rect x="70" y="115" width="20" height="30" fill="#1A1817" />
            <rect x="175" y="130" width="10" height="50" fill="#1A1817" />
            <polygon points="180,90 195,130 165,130" fill="#1A1817" />
            <rect x="270" y="110" width="12" height="70" fill="#1A1817" />
            <rect x="265" y="100" width="22" height="15" fill="#1A1817" />
          </svg>
        </div>

        {/* Film reel decoration - right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#1A1817" strokeWidth="3" />
            <circle cx="60" cy="60" r="35" fill="none" stroke="#1A1817" strokeWidth="2" />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = 60 + 45 * Math.cos(rad);
              const y = 60 + 45 * Math.sin(rad);
              return <circle key={angle} cx={x} cy={y} r="8" fill="#1A1817" />;
            })}
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="font-heading text-4xl lg:text-5xl xl:text-6xl text-ink mb-4 leading-none">
                48 HOUR<br />
                FILM PROJECT
              </div>
              <div className="font-label font-semibold text-ink text-lg lg:text-xl mb-2">
                DUBAI EDITION
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3 text-ink/80">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="font-editorial text-base lg:text-lg">27 – 29 NOV 2026</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/coming-soon"
                className="inline-flex items-center justify-center px-8 py-4 bg-rust text-paper font-label font-semibold text-sm tracking-wider hover:bg-ink transition-colors"
              >
                JOIN THE CREW →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile banner */}
      <section className="sm:hidden relative bg-mustard py-10 overflow-hidden border-t-2 border-ink">
        {/* Film reel decoration - right corner */}
        <div className="absolute right-2 bottom-2 w-24 h-24 opacity-25">
          <svg width="100%" height="100%" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1A1817" strokeWidth="4" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#1A1817" strokeWidth="3" />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = 60 + 40 * Math.cos(rad);
              const y = 60 + 40 * Math.sin(rad);
              return <circle key={angle} cx={x} cy={y} r="6" fill="#1A1817" />;
            })}
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative px-4 text-center"
        >
          <div className="font-heading text-4xl text-ink mb-3 leading-none tracking-tight">
            48 HOUR<br />
            FILM PROJECT
          </div>
          <div className="font-label font-semibold text-ink text-base mb-3 tracking-wider">
            DUBAI EDITION
          </div>
          <div className="flex items-center justify-center gap-2 text-ink mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-editorial text-base font-semibold">27 – 29 NOV 2026</span>
          </div>
          <div className="font-heading text-lg text-ink/80 tracking-widest">
            LIKEMINDS
          </div>
        </motion.div>
      </section>
    </>
  );
}
