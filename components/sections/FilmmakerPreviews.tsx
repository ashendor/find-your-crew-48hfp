'use client';

import { motion } from 'framer-motion';
import FilmmakerCard from '../ui/FilmmakerCard';
import Link from 'next/link';

const demoFilmmakers = [
  {
    name: 'Sarah Al-Mansoori',
    role: 'Director / Producer',
    skills: ['Narrative', 'Documentary', 'Team Leadership'],
    availability: 'Available' as const,
  },
  {
    name: 'James Chen',
    role: 'Cinematographer',
    skills: ['ARRI', 'Lighting', 'Camera Operation'],
    availability: 'Available' as const,
  },
  {
    name: 'Layla Hassan',
    role: 'Editor',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Sound Design'],
    availability: 'Maybe' as const,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Actor',
    skills: ['Improv', 'Stunts', 'Voice Acting'],
    availability: 'Available' as const,
  },
];

export default function FilmmakerPreviews() {
  return (
    <section className="relative py-16 sm:py-24 bg-paper overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A1817' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-block px-3 py-1 border-2 border-ink mb-4">
            <span className="text-ink/60 font-label text-xs tracking-widest">
              DISCOVERY PREVIEW
            </span>
          </div>
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl text-ink mb-4 leading-tight">
            CONNECT WITH<br />FILMMAKERS
          </h2>
          <p className="text-lg text-ink/70 max-w-2xl mx-auto font-body">
            Browse demo profiles. Real filmmakers join when registration opens.
          </p>
        </motion.div>

        {/* Filmmaker grid - portrait cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {demoFilmmakers.map((filmmaker, index) => (
            <motion.div
              key={filmmaker.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FilmmakerCard {...filmmaker} isDemo={true} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/coming-soon"
            className="inline-block px-8 py-4 bg-rust text-paper font-label font-semibold text-sm tracking-wider border-2 border-rust hover:bg-ink hover:border-ink transition-all duration-200"
          >
            EXPLORE ALL FILMMAKERS
          </Link>
          <p className="mt-4 text-sm text-ink/50 font-body">
            Registration opens soon
          </p>
        </motion.div>
      </div>
    </section>
  );
}
