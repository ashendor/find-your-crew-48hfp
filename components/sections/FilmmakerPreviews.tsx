'use client';

import { motion } from 'framer-motion';
import FilmmakerCard from '../ui/FilmmakerCard';
import Link from 'next/link';

const demoFilmmakers = [
  {
    name: 'Ali R.',
    role: 'Director / Writer',
    skills: ['Narrative', 'Documentary', 'Team Leadership'],
    availability: 'Available' as const,
  },
  {
    name: 'Sara M.',
    role: 'Cinematographer',
    skills: ['ARRI', 'Lighting', 'Camera Operation'],
    availability: 'Available' as const,
  },
  {
    name: 'Omar K.',
    role: 'Editor',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Sound Design'],
    availability: 'Available' as const,
  },
  {
    name: 'Lina F.',
    role: 'Sound Designer',
    skills: ['Field Recording', 'Mixing', 'Foley'],
    availability: 'Maybe' as const,
  },
  {
    name: 'Karim S.',
    role: 'Actor',
    skills: ['Improv', 'Method Acting', 'Voice'],
    availability: 'Available' as const,
  },
];

export default function FilmmakerPreviews() {
  return (
    <section className="relative bg-ink overflow-hidden">
      {/* Desktop */}
      <div className="hidden sm:block py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-10"
          >
            <h2 className="font-heading text-4xl lg:text-5xl text-paper">
              MEET FILMMAKERS.
            </h2>
            <p className="font-editorial text-paper/70 text-sm lg:text-base max-w-md text-right">
              Browse creative talent and find your people.
            </p>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-full border-2 border-paper/30 flex items-center justify-center text-paper/70 hover:border-paper hover:text-paper transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full border-2 border-paper/30 flex items-center justify-center text-paper/70 hover:border-paper hover:text-paper transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-5 gap-4 lg:gap-6">
            {demoFilmmakers.map((filmmaker, index) => (
              <motion.div
                key={filmmaker.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <FilmmakerCard {...filmmaker} isDemo={true} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile - Horizontal scroll */}
      <div className="sm:hidden py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="px-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading text-2xl text-paper">
              Featured Filmmakers
            </h2>
            <Link
              href="/coming-soon"
              className="font-label text-mustard text-xs tracking-wider flex items-center gap-1 hover:text-mustard/80 transition-colors"
            >
              View All →
            </Link>
          </div>
        </motion.div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 pb-4">
            {demoFilmmakers.slice(0, 3).map((filmmaker, index) => (
              <motion.div
                key={filmmaker.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-shrink-0 w-40"
              >
                <FilmmakerCard {...filmmaker} isDemo={true} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

