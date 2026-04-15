// app/components/GalleryFilter.tsx
'use client';

import { motion } from 'framer-motion';
import { GalleryCategory } from '@/types/gallery';

interface GalleryFilterProps {
  categories: { value: GalleryCategory; label: string }[];
  activeCategory: GalleryCategory;
  onCategoryChange: (category: GalleryCategory) => void;
}

export default function GalleryFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: GalleryFilterProps) {
  return (
    <div className="flex justify-center mb-16 px-4">
      {/* Glassmorphism Container */}
      <div className="relative inline-flex flex-wrap justify-center gap-1 p-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50">
        {/* Ambient Glow Background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className="relative px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10"
          >
            {/* Active Background with Layout Animation */}
            {activeCategory === cat.value && (
              <motion.div
                layoutId="activeGlassFilter"
                className="absolute inset-0 bg-primary-blue rounded-xl shadow-lg shadow-cyan-500/30"
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  mass: 0.8
                }}
              >
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>
            )}
            
            {/* Text Label */}
            <span className={`relative z-10 transition-colors duration-300 ${
              activeCategory === cat.value 
                ? 'text-black' 
                : 'text-neutral-400 hover:text-white'
            }`}>
              {cat.label}
            </span>
            
            {/* Hover Glass Effect for Inactive Items */}
            {activeCategory !== cat.value && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}