// app/sections/GalleryGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryCategory, GalleryImage } from '@/types/gallery';
import { fetchGalleryImages } from '@/lib/gallery-service';
import GalleryCard from '@/app/components/GalleryCard';
import GalleryFilter from '@/app/components/GalleryFilter';
import ImageLightbox from '@/app/components/ImageLightbox';
import { Loader2, ImageOff } from 'lucide-react';

const categories: { value: GalleryCategory; label: string }[] = [
  { value: 'all', label: 'All Works' },
  { value: 'installations', label: 'Installations' },
  { value: 'products', label: 'Products' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'events', label: 'Events' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    loadImages();
  }, [activeCategory]);

  const loadImages = async () => {
    setLoading(true);
    // Simulate slight delay for animation smoothness
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = await fetchGalleryImages(activeCategory);
    setImages(data);
    setLoading(false);
  };

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? (selectedIndex - 1 + images.length) % images.length
      : (selectedIndex + 1) % images.length;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  return (
    <section className="relative px-4 md:px-8 lg:px-16 xl:px-24 pb-32 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Glass Filter Bar */}
        <GalleryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Content Area with Animation */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center items-center py-32"
            >
              <div className="flex flex-col items-center gap-4 p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <span className="text-neutral-400 text-sm uppercase tracking-widest">Loading Gallery</span>
              </div>
            </motion.div>
          ) : images.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={itemVariants}
                  layoutId={`image-${image.id}`}
                >
                  <GalleryCard
                    image={image}
                    onClick={() => openLightbox(image, index)}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center py-32"
            >
              <div className="text-center p-12 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <ImageOff className="w-10 h-10 text-neutral-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Images Found</h3>
                <p className="text-neutral-400 mb-6">No images available in this category yet.</p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="px-6 py-3 rounded-full bg-cyan-500 text-black font-bold uppercase tracking-wider text-sm hover:bg-cyan-400 transition-colors"
                >
                  View All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onNavigate={navigateLightbox}
        totalImages={images.length}
        currentIndex={selectedIndex}
      />
    </section>
  );
}