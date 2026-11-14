'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden sm:block sticky top-0 z-50 bg-paper border-b-2 border-ink"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left - Event branding */}
            <Link href="/" className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-label font-semibold text-ink text-sm tracking-wider">
                  DUBAI
                </span>
                <div className="h-6 w-px bg-ink/30" />
              </div>
              {/* 48HFP Logo placeholder */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center">
                  <span className="text-paper font-heading text-xs">48</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-heading text-xs text-ink">The 48 Hour</span>
                  <span className="font-heading text-xs text-ink">Film Project</span>
                </div>
              </div>
            </Link>

            {/* Center Navigation */}
            <nav className="flex items-center gap-8">
              <Link href="/" className="font-label font-semibold text-ink text-sm hover:text-rust transition-colors">
                HOME
              </Link>
              <Link href="/coming-soon" className="font-label font-semibold text-ink text-sm hover:text-rust transition-colors">
                DISCOVER
              </Link>
              <Link href="/coming-soon" className="font-label font-semibold text-ink text-sm hover:text-rust transition-colors">
                HOW IT WORKS
              </Link>
              <Link href="/coming-soon" className="font-label font-semibold text-ink text-sm hover:text-rust transition-colors">
                ABOUT
              </Link>
            </nav>

            {/* Right - CTA */}
            <Link
              href="/coming-soon"
              className="px-6 py-2.5 bg-rust text-paper font-label font-semibold text-sm tracking-wider hover:bg-ink transition-colors"
            >
              JOIN NOW
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:hidden sticky top-0 z-50 bg-paper border-b border-ink/20"
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left - Event branding */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-label font-semibold text-ink text-xs tracking-wider">
              DUBAI
            </span>
            <div className="h-4 w-px bg-ink/30" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-ink rounded-full flex items-center justify-center">
                <span className="text-paper font-heading text-[10px]">48</span>
              </div>
              <span className="font-heading text-[10px] text-ink leading-tight">
                The 48 Hour<br />Film Project
              </span>
            </div>
          </Link>

          {/* Right - Icons */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center text-ink">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
              <svg className="w-4 h-4 text-paper" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
