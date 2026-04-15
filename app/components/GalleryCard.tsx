// app/components/GalleryCard.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GalleryImage } from '@/types/gallery';
import { ZoomIn } from 'lucide-react';

interface GalleryCardProps {
  image: GalleryImage;
  onClick: () => void;
  index: number;
}

export default function GalleryCard({ image, onClick, index }: GalleryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      onClick={onClick}
      className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 backdrop-blur-sm"
    >
      {/* Image Layer */}
      <Image
        src={image.url}
        alt={image.title}
        fill
        className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Gradient Overlay - Enhanced */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500" />
      
      {/* Glass Border Glow on Hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-cyan-400/30 shadow-[inset_0_0_30px_rgba(6,182,212,0.2)]" />

      {/* Animated Corner Accents */}
      <motion.div 
        className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-400/0 rounded-tr-xl group-hover:border-cyan-400/50 transition-all duration-500"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
      />
      <motion.div 
        className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-400/0 rounded-bl-xl group-hover:border-cyan-400/50 transition-all duration-500"
      />

      {/* Content Overlay - Glassmorphism Bottom Bar */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <motion.div className="space-y-3">
          {/* Category Badge */}
          <motion.span 
            className="inline-block px-4 py-1.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-cyan-400 text-xs font-black uppercase tracking-widest group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30 transition-all duration-300"
          >
            {image.category}
          </motion.span>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg">
            {image.title}
          </h3>
          
          {/* Description - Reveal on Hover */}
          {image.description && (
            <p className="text-sm text-neutral-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
              {image.description}
            </p>
          )}

          {/* View Button - Glass Effect */}
          <div className="pt-4 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150 transform translate-y-2 group-hover:translate-y-0">
            <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30 transition-all">
              <ZoomIn className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">View</span>
          </div>
        </motion.div>
      </div>

      {/* Shine Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out skew-x-12 pointer-events-none" />
    </motion.div>
  );
}