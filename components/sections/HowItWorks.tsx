'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'CREATE',
    subtitle: 'Build a profile and showcase your craft.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a6 6 0 0112 0v2H4z" />
      </svg>
    ),
    color: 'bg-rust',
  },
  {
    number: '02',
    title: 'DISCOVER',
    subtitle: 'Find filmmakers, creatives and talent.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
    color: 'bg-mustard',
  },
  {
    number: '03',
    title: 'CONNECT',
    subtitle: 'Collaborate, form your crew and make a film in 48 hours.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    color: 'bg-dubai-blue',
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* Desktop - Horizontal strip */}
      <section className="hidden sm:block relative bg-paper py-12 border-y-4 border-ink">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <h2 className="font-heading text-3xl lg:text-4xl text-ink">HOW IT WORKS.</h2>
          </div>

          <div className="grid grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`${step.color} w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-paper">
                    {step.icon}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="font-headline text-2xl lg:text-3xl text-ink">
                    {step.number} {step.title}
                  </span>
                </div>

                <p className="font-editorial text-ink/80 text-sm lg:text-base leading-snug max-w-xs mx-auto">
                  {step.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile - Skip on mobile since we have MobileFeatures */}
    </>
  );
}

