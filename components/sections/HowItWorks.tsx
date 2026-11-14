'use client';

import { motion } from 'framer-motion';
import CircleBadge from '../ui/CircleBadge';
import FilmstripDivider from '../ui/FilmstripDivider';

const steps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description: 'Share your role, skills, and what you bring to a team. Let filmmakers know what makes you unique.',
    color: 'rust' as const,
  },
  {
    number: '2',
    title: 'Discover Filmmakers',
    description: 'Browse profiles of directors, writers, editors, actors, and crew members looking to collaborate.',
    color: 'mustard' as const,
  },
  {
    number: '3',
    title: 'Connect & Build Your Team',
    description: 'Reach out, form your crew, and get ready to make a film in 48 hours.',
    color: 'dubai-blue' as const,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-paper">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl text-ink mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-lg text-ink/70 max-w-2xl mx-auto">
            Three simple steps to find your film crew
          </p>
        </motion.div>
        
        <FilmstripDivider />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <CircleBadge color={step.color} size="large">
                  {step.number}
                </CircleBadge>
              </div>
              
              <h3 className="font-headline text-2xl text-ink mb-4">
                {step.title}
              </h3>
              
              <p className="text-ink/70 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
