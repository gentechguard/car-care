// app/components/ImageLightbox.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GalleryImage } from '@/types/gallery';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useBackButton } from '@/hooks/useBackButton';

interface ImageLightboxProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  totalImages: number;
  currentIndex: number;
}

export default function ImageLightbox({
  image,
  isOpen,
  onClose,
  onNavigate,
  totalImages,
  currentIndex,
}: ImageLightboxProps) {
  // Browser back button closes the lightbox
  useBackButton(isOpen, onClose);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate('prev');
    if (e.key === 'ArrowRight') onNavigate('next');
  }, [onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Navigation Buttons */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1, x: -5 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="absolute left-4 md:left-8 z-50 p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1, x: 5 }}
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="absolute right-4 md:right-8 z-50 p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all backdrop-blur-md"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Main Image Container */}
          <motion.div
            layoutId={`image-${image.id}`}
            className="relative w-full max-w-6xl mx-4 aspect-video max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl shadow-cyan-500/10">
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
              
              {/* Top Info Bar */}
              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div>
                  <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
                    {image.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {image.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-sm">
                    {currentIndex + 1} / {totalImages}
                  </span>
                </div>
              </div>

              {/* Description Bar */}
              {image.description && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                >
                  <p className="text-neutral-200 max-w-3xl">
                    {image.description}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Thumbnails Strip */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] px-4 pb-2">
            {/* Thumbnail indicators could be mapped here */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}