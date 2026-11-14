'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Create',
    subtitle: 'Profile',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'bg-rust',
  },
  {
    title: 'Discover',
    subtitle: 'Filmmakers',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'bg-mustard',
  },
  {
    title: 'Connect',
    subtitle: '& Build',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
