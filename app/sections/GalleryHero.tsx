// app/sections/GalleryHero.tsx
'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function GalleryHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center pt-40 pb-20 px-4 overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent opacity-50" />
      
      {/* Animated Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-black uppercase tracking-[0.2em]">Visual Excellence</span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
          <span className="text-white drop-shadow-2xl">VISUAL</span>{' '}
          <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">EXCELLENCE</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Witness the art of automotive perfection. Browse through our portfolio of 
          premium installations, product showcases, and industry events.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}