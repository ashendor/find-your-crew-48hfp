'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CircleBadge from '@/components/ui/CircleBadge';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-paper film-grain flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <div className="flex justify-center mb-8">
          <CircleBadge color="rust" size="large">
            !
          </CircleBadge>
        </div>
        
        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl text-ink mb-6">
          COMING SOON
        </h1>
        
        <p className="text-lg sm:text-xl text-ink/70 mb-8 leading-relaxed">
          This feature is currently in production.<br />
          We&apos;re building something special for the Dubai filmmaking community.
        </p>
        
        <div className="border-2 border-ink bg-paper p-6 mb-8">
          <p className="font-label font-semibold text-sm mb-2 text-ink/60">
            48 HOUR FILM PROJECT DUBAI
          </p>
          <p className="font-headline text-2xl text-ink">
            27–29 NOVEMBER 2026
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-block font-label font-semibold uppercase tracking-wider px-8 py-4 bg-rust text-paper border-2 border-rust hover:bg-ink hover:border-ink transition-all duration-200"
        >
          Back to Home
        </Link>
        
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-ink/20 border border-ink/30"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
