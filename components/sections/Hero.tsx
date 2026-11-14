'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-ink overflow-hidden">
      {/* Film strip perforations - left */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-4 bg-ink z-10">
        <div className="flex flex-col h-full justify-around py-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-full h-3 bg-paper/20" />
          ))}
        </div>
      </div>

      {/* Desktop & Tablet Hero */}
      <div className="hidden sm:block relative">
        <div className="relative min-h-[70vh] lg:min-h-[600px]">
          {/* Gradient background with Dubai skyline simulation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513] via-[#CD853F] to-[#CD5C5C]">
            {/* Layered atmosphere effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink/80" />
            
            {/* Dubai skyline silhouette - simplified geometric shapes */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2">
              <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                {/* Burj Khalifa-style tower */}
                <polygon points="550,0 570,150 580,150 585,400 565,400 560,150 570,150" fill="rgba(26,24,23,0.9)" />
                {/* Other towers */}
                <rect x="400" y="200" width="40" height="200" fill="rgba(26,24,23,0.85)" />
                <rect x="460" y="180" width="35" height="220" fill="rgba(26,24,23,0.8)" />
                <rect x="510" y="220" width="30" height="180" fill="rgba(26,24,23,0.75)" />
                <rect x="600" y="190" width="38" height="210" fill="rgba(26,24,23,0.8)" />
                <rect x="650" y="210" width="32" height="190" fill="rgba(26,24,23,0.85)" />
                <rect x="700" y="170" width="45" height="230" fill="rgba(26,24,23,0.9)" />
                <rect x="760" y="200" width="35" height="200" fill="rgba(26,24,23,0.8)" />
              </svg>
            </div>

            {/* Filmmaker silhouette - right side */}
            <div className="absolute right-0 bottom-0 h-[80%] w-1/3 opacity-90">
              <svg viewBox="0 0 300 500" className="h-full w-full" preserveAspectRatio="xMaxYMax slice">
                {/* Simplified filmmaker with camera on tripod */}
                <ellipse cx="150" cy="450" rx="60" ry="15" fill="rgba(26,24,23,0.4)" />
                <rect x="140" y="350" width="8" height="100" fill="#1A1817" />
                <rect x="155" y="350" width="8" height="100" fill="#1A1817" />
                <rect x="135" y="340" width="40" height="15" fill="#1A1817" />
                <polygon points="155,280 170,340 140,340" fill="#1A1817" />
                <rect x="130" y="260" width="50" height="25" fill="#1A1817" />
                <circle cx="155" cy="245" r="18" fill="#1A1817" />
                <rect x="145" y="200" width="20" height="50" fill="#1A1817" />
                <polygon points="145,200 155,180 165,200" fill="#1A1817" />
              </svg>
            </div>

            {/* Sun/Moon circle */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-gradient-radial from-[#CD5C5C] to-transparent opacity-80" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="font-heading text-6xl lg:text-7xl xl:text-8xl text-paper mb-6 leading-none">
                FIND<br />YOUR<br />CREW.
              </h1>
              
              <p className="font-editorial text-paper text-base lg:text-lg mb-8 leading-relaxed max-w-md">
                Two days. Two nights. One film.<br />
                Your team starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/coming-soon"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-rust text-paper font-label font-semibold text-sm tracking-wider hover:bg-rust/90 transition-colors"
                >
                  CREATE YOUR PROFILE →
                </Link>
                <Link
                  href="/coming-soon"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent border-2 border-paper text-paper font-label font-semibold text-sm tracking-wider hover:bg-paper hover:text-ink transition-colors"
                >
                  EXPLORE FILMMAKERS
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Hero */}
      <div className="sm:hidden relative min-h-[85vh]">
        {/* Mobile gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B4513] via-[#CD853F] to-ink">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />
          {/* Sun circle */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-radial from-[#CD5C5C] to-transparent opacity-70" />
        </div>

        {/* Mobile content */}
        <div className="relative z-10 px-4 py-12 flex flex-col justify-center min-h-[85vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl text-paper mb-4 leading-none">
              FIND<br />YOUR<br />CREW.
            </h1>
            
            <p className="font-editorial text-paper/90 text-sm mb-8 leading-relaxed">
              Two days. Two nights.<br />
              One film. Your team<br />
              starts here.
            </p>

            <div className="flex flex-col gap-3 max-w-xs">
              <Link
                href="/coming-soon"
                className="inline-flex items-center justify-center px-6 py-3 bg-rust text-paper font-label font-semibold text-sm tracking-wide hover:bg-rust/90 transition-colors"
              >
                Create Profile →
              </Link>
              <Link
                href="/coming-soon"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-paper text-paper font-label font-semibold text-sm tracking-wide hover:bg-paper/10 transition-colors"
              >
                Explore Filmmakers
              </Link>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-mustard" />
              <div className="w-2 h-2 rounded-full bg-paper/30" />
              <div className="w-2 h-2 rounded-full bg-paper/30" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Film strip perforations - right */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-4 bg-ink z-10">
        <div className="flex flex-col h-full justify-around py-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-full h-3 bg-paper/20" />
          ))}
        </div>
      </div>
    </section>
  );
}
