'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FilmmakerCardProps {
  name: string;
  role: string;
  skills: string[];
  availability: 'Available' | 'Maybe' | 'Busy';
  isDemo?: boolean;
}

export default function FilmmakerCard({
  name,
  role,
  skills,
  availability,
  isDemo = false,
}: FilmmakerCardProps) {
  const availabilityConfig = {
    Available: { color: 'bg-rust', text: 'Available Now' },
    Maybe: { color: 'bg-mustard', text: 'Open to Offers' },
    Busy: { color: 'bg-ink/40', text: 'Unavailable' },
  };

  const config = availabilityConfig[availability];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative bg-paper border-2 border-ink overflow-hidden"
    >
      {/* Demo badge */}
      {isDemo && (
        <div className="absolute top-3 right-3 z-20 bg-mustard text-ink px-2 py-1 text-[10px] font-label font-semibold border border-ink">
          DEMO PROFILE
        </div>
      )}

      {/* Portrait photo placeholder - Using abstract geometric pattern */}
      <div className="relative aspect-[3/4] bg-ink overflow-hidden">
        {/* Abstract filmmaker representation with geometric shapes */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink via-ink to-rust/20">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Camera viewfinder motif */}
            <div className="absolute w-32 h-32 border-4 border-paper/30 flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-paper/50 flex items-center justify-center">
                <div className="w-3 h-3 bg-rust rounded-full" />
              </div>
              {/* Corner marks */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-paper" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-paper" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-paper" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-paper" />
            </div>
          </div>
          {/* Film grain */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />
        </div>
        
        {/* Availability badge overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/90 to-transparent pt-12 pb-3 px-3">
          <div className={`inline-flex items-center gap-2 ${config.color} text-paper px-2 py-1 text-xs font-label font-semibold`}>
            <div className="w-1.5 h-1.5 bg-paper rounded-full animate-pulse" />
            {config.text}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <h3 className="font-headline text-xl text-ink mb-1 leading-tight">{name}</h3>
        <p className="text-ink/60 text-sm mb-3 font-label">{role}</p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-paper border border-ink/20 text-[11px] font-label text-ink/70"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Connect CTA */}
        <Link
          href="/coming-soon"
          className="block w-full py-2.5 text-center bg-rust text-paper font-label font-semibold text-sm border-2 border-rust hover:bg-ink hover:border-ink transition-colors duration-200"
        >
          CONNECT
        </Link>
      </div>
    </motion.div>
  );
}
