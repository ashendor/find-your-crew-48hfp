'use client';

import { motion } from 'framer-motion';
import CircleBadge from './CircleBadge';

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
  const availabilityColors = {
    Available: 'dubai-blue' as const,
    Maybe: 'mustard' as const,
    Busy: 'rust' as const,
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-paper border-2 border-ink p-6 relative film-grain hover:shadow-[8px_8px_0px_0px_rgba(26,24,23,1)] transition-shadow duration-200"
    >
      {isDemo && (
        <div className="absolute top-3 right-3 bg-mustard text-ink px-2 py-1 text-xs font-label font-semibold border border-ink">
          DEMO
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <CircleBadge color={availabilityColors[availability]} size="medium">
          {availability[0]}
        </CircleBadge>
        
        <div className="flex-1">
          <h3 className="font-headline text-xl mb-1">{name}</h3>
          <p className="text-ink/70 text-sm mb-3">{role}</p>
          
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-paper border border-ink text-xs font-label"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
