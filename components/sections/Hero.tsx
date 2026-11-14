'use client';

import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-paper film-grain relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1A1817_1px,_transparent_1px)] bg-[length:24px_24px]"
      />
      
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-ink mb-6 leading-none tracking-tight">
            FIND YOUR<br />CREW.
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-ink/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Two days. Two nights. One film.<br />
            Your team starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button href="/coming-soon" variant="primary" size="large">
              Create Your Profile
            </Button>
            <Button href="/coming-soon" variant="secondary" size="large">
              Explore Filmmakers
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 flex justify-center gap-2"
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-12 bg-ink/20 border border-ink/30"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
