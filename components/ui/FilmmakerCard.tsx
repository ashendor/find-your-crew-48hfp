'use client';

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
    Available: { color: 'bg-rust', text: 'Available' },
    Maybe: { color: 'bg-mustard', text: 'Maybe' },
    Busy: { color: 'bg-ink/40', text: 'Busy' },
  };

  const config = availabilityConfig[availability];
  
  return (
    <div className="group relative bg-paper border border-ink hover:shadow-lg transition-shadow">
      {/* Demo badge */}
      {isDemo && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-4 h-4 bg-mustard border border-ink rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-ink" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Photo placeholder */}
      <Link href="/coming-soon" className="block">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-ink via-ink/90 to-rust/30 overflow-hidden">
          {/* Play button overlay for mobile */}
          <div className="sm:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-paper/90 flex items-center justify-center">
            <svg className="w-6 h-6 text-ink ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>

          {/* Viewfinder for desktop */}
          <div className="hidden sm:block absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-paper/30">
              <div className="w-full h-full flex items-center justify-center border border-paper/40">
                <div className="w-2 h-2 bg-rust rounded-full" />
              </div>
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-paper" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-paper" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-paper" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-paper" />
            </div>
          </div>
          
          {/* Film grain */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Bottom info overlay for mobile */}
          <div className="sm:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/95 to-transparent p-3">
            <div className={`inline-flex items-center gap-1.5 ${config.color} text-paper px-2 py-0.5 text-[10px] font-label font-semibold mb-2`}>
              <div className="w-1 h-1 bg-paper rounded-full" />
              {config.text}
            </div>
          </div>
        </div>
      </Link>

      {/* Info section */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-headline text-base sm:text-lg text-ink truncate">{name}</h3>
            <p className="text-ink/70 text-xs sm:text-sm font-label truncate">{role}</p>
          </div>
          {/* Bookmark icon */}
          <button className="flex-shrink-0 ml-2 w-6 h-6 flex items-center justify-center text-ink/40 hover:text-ink transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
