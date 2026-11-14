'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Create',
    subtitle: 'Profile',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a6 6 0 0112 0v2H4z" />
      </svg>
    ),
    color: 'bg-rust',
  },
  {
    title: 'Discover',
    subtitle: 'Filmmakers',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
    color: 'bg-mustard',
  },
  {
    title: 'Connect',
    subtitle: '& Build',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    color: 'bg-dubai-blue',
  },
];

export default function MobileFeatures() {
  return (
    <section className="sm:hidden bg-ink py-6 px-4">
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href="/coming-soon"
              className="block bg-ink border border-paper/20 p-4 hover:border-paper/40 transition-colors"
            >
              <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto`}>
                <span className="text-paper">
                  {feature.icon}
                </span>
              </div>
              <div className="text-center">
                <div className="font-label font-semibold text-paper text-xs leading-tight">
                  {feature.title}
                </div>
                <div className="font-editorial text-paper/70 text-[10px]">
                  {feature.subtitle}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
