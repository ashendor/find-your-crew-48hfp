'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Share your skills and experience',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Discover Crew',
    description: 'Browse filmmakers by role and availability',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Build Team',
    description: 'Connect and form your perfect crew',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-12 sm:py-16 bg-ink overflow-hidden">
      {/* Film strip decoration */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-rust flex items-center justify-around">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-paper/30" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-block px-3 py-1 bg-rust text-paper font-label text-xs tracking-widest mb-3">
            HOW IT WORKS
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl text-paper">
            THREE STEPS TO YOUR CREW
          </h2>
        </motion.div>

        {/* Steps - Horizontal editorial strip */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative bg-paper/5 border border-paper/20 p-6 backdrop-blur-sm group hover:bg-paper/10 transition-colors duration-300"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-rust border-2 border-paper flex items-center justify-center">
                <span className="font-headline text-paper text-sm">{step.number}</span>
              </div>

              {/* Icon */}
              <div className="text-rust mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="font-headline text-xl text-paper mb-2">
                {step.title}
              </h3>
              <p className="text-paper/70 text-sm font-body leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom film strip */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-rust flex items-center justify-around">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-paper/30" />
        ))}
      </div>
    </section>
  );
}
