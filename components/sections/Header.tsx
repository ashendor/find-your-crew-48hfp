'use client';

import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-ink/95 backdrop-blur-md border-b border-paper/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo area */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`px-3 py-1.5 border-2 transition-colors ${
              isScrolled 
                ? 'border-rust bg-rust text-paper' 
                : 'border-rust bg-rust text-paper'
            }`}>
              <span className="font-label font-semibold text-xs sm:text-sm tracking-wider">
                48HFP
              </span>
            </div>
            <div className={`hidden sm:flex flex-col leading-none ${
              isScrolled ? 'text-paper' : 'text-paper'
            }`}>
              <span className="font-label font-semibold text-xs tracking-wider">DUBAI</span>
              <span className="font-body text-[10px] text-paper/60">27-29 NOV 2026</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/coming-soon"
              className={`hidden sm:inline-block px-4 py-2 font-label text-sm transition-colors ${
                isScrolled 
                  ? 'text-paper/80 hover:text-paper' 
                  : 'text-paper/80 hover:text-paper'
              }`}
            >
              BROWSE
            </Link>
            <Link
              href="/coming-soon"
              className={`px-4 sm:px-6 py-2 sm:py-2.5 font-label text-xs sm:text-sm font-semibold tracking-wider border-2 transition-all ${
                isScrolled
                  ? 'bg-rust border-rust text-paper hover:bg-paper hover:border-paper hover:text-ink'
                  : 'bg-rust border-rust text-paper hover:bg-paper hover:border-paper hover:text-ink'
              }`}
            >
              JOIN
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
