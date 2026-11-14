'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-ink overflow-hidden">
      {/* Film strip perforations - left */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-3 bg-ink z-10">
        <div className="flex flex-col h-full justify-around py-2">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-full h-2 bg-paper/20" />
          ))}
        </div>
      </div>

      {/* Desktop & Tablet Hero */}
      <div className="hidden sm:block relative">
        <div className="relative min-h-[70vh] lg:min-h-[600px]">
          {/* Cinematic sunset background matching reference */}
          <div className="absolute inset-0">
            {/* Layered sunset gradient - brown to orange to red */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#654321] via-[#B87333] to-[#CD5C5C]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#8B4513]/40 via-transparent to-ink/90" />
            
            {/* Dubai skyline silhouette */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5">
              <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                {/* Burj Khalifa */}
                <polygon points="580,0 590,80 595,80 598,300 582,300 585,80 590,80" fill="rgba(26,24,23,0.95)" />
                {/* Building cluster left of Burj */}
                <rect x="450" y="150" width="35" height="150" fill="rgba(26,24,23,0.9)" />
                <rect x="490" y="130" width="30" height="170" fill="rgba(26,24,23,0.92)" />
                <rect x="525" y="140" width="28" height="160" fill="rgba(26,24,23,0.88)" />
                <rect x="558" y="120" width="20" height="180" fill="rgba(26,24,23,0.93)" />
                {/* Buildings right of Burj */}
                <rect x="602" y="140" width="32" height="160" fill="rgba(26,24,23,0.91)" />
                <rect x="640" y="155" width="28" height="145" fill="rgba(26,24,23,0.89)" />
                <rect x="672" y="135" width="38" height="165" fill="rgba(26,24,23,0.94)" />
                <rect x="715" y="160" width="30" height="140" fill="rgba(26,24,23,0.87)" />
                <rect x="750" y="145" width="35" height="155" fill="rgba(26,24,23,0.90)" />
              </svg>
            </div>

            {/* Filmmaker with camera silhouette - right side, more detailed */}
            <div className="absolute right-[5%] bottom-0 h-[75%] w-[30%] opacity-95">
              <svg viewBox="0 0 300 600" className="h-full w-full" preserveAspectRatio="xMaxYMax meet">
                {/* Ground shadow */}
                <ellipse cx="150" cy="580" rx="70" ry="12" fill="rgba(26,24,23,0.3)" />
                
                {/* Tripod legs */}
                <line x1="145" y1="420" x2="100" y2="580" stroke="#1A1817" strokeWidth="6" />
                <line x1="155" y1="420" x2="200" y2="580" stroke="#1A1817" strokeWidth="6" />
                <line x1="150" y1="420" x2="150" y2="580" stroke="#1A1817" strokeWidth="6" />
                
                {/* Tripod head */}
                <rect x="135" y="410" width="30" height="12" fill="#1A1817" />
                
                {/* Camera body */}
                <rect x="125" y="380" width="60" height="35" fill="#1A1817" />
                <polygon points="185,395 220,380 220,410 185,410" fill="#1A1817" />
                
                {/* Person - filmmaker operating camera */}
                {/* Head */}
                <circle cx="120" cy="320" r="22" fill="#1A1817" />
                {/* Neck */}
                <rect x="115" y="340" width="10" height="15" fill="#1A1817" />
                {/* Body */}
                <rect x="100" y="355" width="40" height="65" fill="#1A1817" />
                {/* Arms - one reaching to camera */}
                <polygon points="140,365 180,390 175,400 135,375" fill="#1A1817" />
                <rect x="100" y="365" width="35" height="12" fill="#1A1817" />
                {/* Legs */}
                <polygon points="105,420 115,420 120,500 105,500" fill="#1A1817" />
                <polygon points="125,420 135,420 140,500 125,500" fill="#1A1817" />
              </svg>
            </div>

            {/* Large sunset circle */}
            <div className="absolute top-[15%] right-[20%] w-40 h-40 lg:w-56 lg:h-56 rounded-full bg-gradient-radial from-[#FF6347] via-[#FF7F50] to-transparent opacity-85" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="font-heading text-6xl lg:text-7xl xl:text-8xl text-paper mb-6 leading-none drop-shadow-lg">
                FIND<br />YOUR<br />CREW.
              </h1>
              
              <p className="font-editorial text-paper text-base lg:text-lg mb-8 leading-relaxed max-w-md drop-shadow">
                Two days. Two nights. One film.<br />
                Your team starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/coming-soon"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-rust text-paper font-label font-semibold text-sm tracking-wider hover:bg-rust/90 transition-colors shadow-lg"
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
      <div className="sm:hidden relative min-h-[75vh]">
        {/* Mobile sunset background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#CD5C5C]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/70" />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />
          {/* Sun */}
          <div className="absolute top-[20%] right-[25%] w-32 h-32 rounded-full bg-gradient-radial from-[#FF6347] via-[#FF7F50]/70 to-transparent" />
        </div>

        {/* Mobile content */}
        <div className="relative z-10 px-4 py-16 flex flex-col justify-center min-h-[75vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl text-paper mb-4 leading-none drop-shadow-lg">
              FIND<br />YOUR<br />CREW.
            </h1>
            
            <p className="font-editorial text-paper/90 text-sm mb-8 leading-relaxed drop-shadow">
              Two days. Two nights.<br />
              One film. Your team<br />
              starts here.
            </p>

            <div className="flex flex-col gap-3 max-w-xs">
              <Link
                href="/coming-soon"
                className="inline-flex items-center justify-center px-6 py-3 bg-rust text-paper font-label font-semibold text-sm tracking-wide hover:bg-rust/90 transition-colors shadow-md"
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
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-3 bg-ink z-10">
        <div className="flex flex-col h-full justify-around py-2">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-full h-2 bg-paper/20" />
          ))}
        </div>
      </div>
    </section>
  );
}
