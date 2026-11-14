'use client';

import { motion } from 'framer-motion';
import FilmmakerCard from '../ui/FilmmakerCard';
import Button from '../ui/Button';

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
    <section className="py-20 bg-ink text-paper">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl mb-4">
            MEET THE CREW
          </h2>
          <p className="text-lg text-paper/70 max-w-2xl mx-auto">
            Preview of filmmakers ready to collaborate
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {demoFilmmakers.map((filmmaker) => (
            <FilmmakerCard
              key={filmmaker.name}
              {...filmmaker}
              isDemo={true}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button href="/coming-soon" variant="primary" size="large">
            Browse All Filmmakers
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
