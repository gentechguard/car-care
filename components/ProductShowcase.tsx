'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ShieldCheck, Zap } from 'lucide-react';
import { useGlobalStore, Product } from '@/context/GlobalStore';
import Image from 'next/image';

// Helper to get Supabase image URL - SAME AS GALLERY
const getProductImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set');
    return null;
  }
  
  // Handle different path formats
  let cleanPath = imagePath;
  
  // Remove leading slashes
  cleanPath = cleanPath.replace(/^\/+/, '');
  
  // Remove 'products/' or 'product/' prefix if present
  cleanPath = cleanPath.replace(/^(products?|gallery)\//, '');
  
  // Construct full URL - use 'products' bucket
  return `${supabaseUrl}/storage/v1/object/public/product/${cleanPath}`;
};

// Helper to safely parse specs
const parseSpecs = (specs: any): Array<{ label: string, value: string }> => {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.map(s => ({
      label: s.label || s.key || String(s).split(':')[0] || 'Spec',
      value: String(s.value || s.val || s)
    }));
  }
  if (typeof specs === 'object') {
    return Object.entries(specs).map(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
      let displayValue: string;
      if (Array.isArray(value)) displayValue = value.join(', ');
      else if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
      else displayValue = String(value);
      return { label, value: displayValue };
    });
  }
  if (typeof specs === 'string') {
    try { return parseSpecs(JSON.parse(specs)); } catch { return []; }
  }
  return [];
};

const parseFeatures = (features: any): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try { return JSON.parse(features); } catch { return features ? [features] : []; }
  }
  return [];
};

export default function ProductShowcase() {
  const { products, loading } = useGlobalStore();
  const [selectedParent, setSelectedParent] = useState<Product | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Mobile accordion expansion state
  const [expandedMobileIndex, setExpandedMobileIndex] = useState<number | null>(null);

  // Track if we're on mobile - with proper SSR handling
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  // Client-side only detection to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayedProducts = selectedParent
    ? products.filter(p => p.parent_id === selectedParent.id)
    : products.filter(p => !p.parent_id);

  // Reset expanded index when switching to desktop, and auto-expand first on mobile
  useEffect(() => {
    if (!isClient) return;
    
    if (!isMobile) {
      setExpandedMobileIndex(null);
    } else if (isMobile && displayedProducts.length > 0 && expandedMobileIndex === null) {
      setExpandedMobileIndex(0);
    }
  }, [isMobile, displayedProducts.length, expandedMobileIndex, isClient]);

  // Reset expanded index when products change, then auto-expand first
  useEffect(() => {
    if (!isClient) return;
    
    if (isMobile) {
      setExpandedMobileIndex(0);
    } else {
      setExpandedMobileIndex(null);
    }
  }, [selectedParent, isMobile, isClient]);

  // Desktop-only background sync
  const syncBackgrounds = useCallback(() => {
    if (!isSyncingRef.current || isMobile) return;

    const container = containerRef.current;
    if (!container || cardsRef.current.length === 0) {
      rafIdRef.current = requestAnimationFrame(syncBackgrounds);
      return;
    }

    const containerRect = container.getBoundingClientRect();

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const xOffset = containerRect.left - cardRect.left;

      card.style.backgroundSize = `${containerRect.width}px ${containerRect.height}px`;
      card.style.backgroundPositionX = `${xOffset}px`;
      card.style.backgroundPositionY = 'center';
    });

    rafIdRef.current = requestAnimationFrame(syncBackgrounds);
  }, [isMobile]);

  useEffect(() => {
    if (!isClient) return;
    
    if (!isTransitioning && !loading && displayedProducts.length > 0 && !isMobile) {
      const timeoutId = setTimeout(() => {
        isSyncingRef.current = true;
        rafIdRef.current = requestAnimationFrame(syncBackgrounds);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        isSyncingRef.current = false;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      };
    } else {
      isSyncingRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }
  }, [displayedProducts.length, loading, isTransitioning, syncBackgrounds, isMobile, isClient]);

  useEffect(() => {
    return () => {
      isSyncingRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Handle card click - unified for mobile and desktop
  const handleCardClick = (product: Product, index: number) => {
    const hasChildren = products.some(p => p.parent_id === product.id);

    if (isMobile && isClient) {
      // Mobile: Accordion behavior
      if (expandedMobileIndex === index) {
        // Card is already expanded - navigate
        if (hasChildren) {
          navigateToChildren(product);
        } else {
          setActiveProduct(product);
        }
      } else {
        // Expand this card
        setExpandedMobileIndex(index);
      }
    } else {
      // Desktop: Direct navigation
      if (hasChildren) {
        navigateToChildren(product);
      } else {
        setActiveProduct(product);
      }
    }
  };

  const navigateToChildren = (product: Product) => {
    setIsTransitioning(true);
    isSyncingRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    cardsRef.current = [];
    setExpandedMobileIndex(null);

    setTimeout(() => {
      setSelectedParent(product);
      setIsTransitioning(false);
    }, 100);
  };

  const handleBackClick = () => {
    setIsTransitioning(true);
    isSyncingRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    cardsRef.current = [];
    setExpandedMobileIndex(null);

    setTimeout(() => {
      setSelectedParent(null);
      setIsTransitioning(false);
    }, 100);
  };

  // Animation variants - optimized for mobile performance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.08,
        delayChildren: isMobile ? 0.05 : 0.1
      }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 15 : 30,
      scale: isMobile ? 0.98 : 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.3 : 0.5,
        ease: [0.25, 1, 0.5, 1] as const
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <section id="product-showcase" className="bg-black py-12 md:py-20">
        <div className="h-[400px] md:h-[500px] flex items-center justify-center text-white">
          <div className="animate-pulse">Loading Products...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="product-showcase" className="bg-black py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-6 md:mb-8 min-h-[60px] md:h-16 flex items-center justify-between relative">
          <AnimatePresence mode="wait">
            {selectedParent ? (
              <motion.div
                key="back-button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-white active:text-white transition-colors group p-2 -ml-2 rounded-lg active:bg-white/10"
                >
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" size={20} />
                  <span className="uppercase tracking-widest text-xs md:text-sm font-bold hidden sm:inline">Back to All Solutions</span>
                  <span className="uppercase tracking-widest text-xs font-bold sm:hidden">Back</span>
                </button>
              </motion.div>
            ) : (
              <div key="spacer" className="w-px" />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selectedParent ? (
              <motion.div
                key="children-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute right-0 top-0 bottom-0 flex items-center"
              >
                <div className="text-right">
                  <span className="text-blue-400 text-[10px] md:text-xs tracking-widest uppercase block mb-1">
                    {selectedParent.name} Variants
                  </span>
                  <p className="text-gray-500 text-[10px] md:text-xs">
                    {displayedProducts.length} options available
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="main-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
              >
                <h2 className="text-xl md:text-3xl lg:text-5xl font-black text-white mb-2 md:mb-4 uppercase tracking-tight">
                  Our <span className="text-blue-400">Products</span> Range
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-sm lg:text-base">
                  Click any product to explore specific variants tailored to your needs
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Grid Container */}
        <div
          ref={containerRef}
          className="relative z-10 flex flex-col md:flex-row gap-3 md:gap-4 mx-0 md:mx-4 lg:mx-20 my-4 md:my-8 md:aspect-video"
          style={{
            minHeight: isClient && isMobile ? `${Math.max(displayedProducts.length * 70 + 150, 400)}px` : undefined,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedParent ? `children-${selectedParent.id}` : 'parents'}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col md:flex-row gap-3 md:gap-4 w-full h-full"
            >
              {displayedProducts.map((product, index) => {
                const hasChildren = products.some(p => p.parent_id === product.id);
                const isExpanded = isClient && isMobile && expandedMobileIndex === index;

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    onClick={() => handleCardClick(product, index)}
                    ref={(el) => {
                      if (el) cardsRef.current[index] = el;
                    }}
                    style={{
                      flex: isClient && isMobile
                        ? (isExpanded ? '2 1 0%' : '1 1 0%')
                        : undefined,
                      minHeight: isClient && isMobile
                        ? (isExpanded ? '200px' : '70px')
                        : undefined,
                      backgroundImage: "url('/assets/solutions_bg.png')",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    className={`
                      group relative overflow-hidden cursor-pointer 
                      border border-white/10 bg-[#111] rounded-2xl
                      
                      transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                      
                      active:scale-[0.98] md:active:scale-100
                      
                      md:flex-1 md:hover:flex-[2] md:min-h-0
                      
                      md:will-change-[flex]
                    `}
                  >
                    {/* Dark overlay */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none transition-colors duration-500 bg-black/60"
                      style={{
                        backgroundColor: isExpanded ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)'
                      }}
                    />

                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="md:hidden absolute inset-0 z-20 flex flex-col">
                      {/* Header Row - Always visible */}
                      <div
                        className="flex items-center justify-between px-5 transition-all duration-500"
                        style={{
                          paddingTop: isExpanded ? '16px' : '0',
                          paddingBottom: isExpanded ? '8px' : '0',
                          flex: isExpanded ? '0 0 auto' : '1 1 0%',
                          alignItems: isExpanded ? 'flex-start' : 'center',
                        }}
                      >
                        <h3
                          className="font-black tracking-wider text-white uppercase transition-all duration-300"
                          style={{
                            fontSize: isExpanded ? '18px' : '14px',
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Indicator arrow */}
                        <div
                          className="text-blue-400 transition-transform duration-300"
                          style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                        >
                          <ChevronRight size={20} />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <div
                        className="px-5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          maxHeight: isExpanded ? '150px' : '0px',
                          paddingBottom: isExpanded ? '20px' : '0px',
                        }}
                      >
                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                          {product.shortDesc || 'Premium Protection Solution'}
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasChildren) {
                              navigateToChildren(product);
                            } else {
                              setActiveProduct(product);
                            }
                          }}
                          className="border border-blue-400 text-blue-400 font-bold tracking-widest uppercase text-[10px] px-4 py-2 rounded active:bg-blue-400 active:text-white transition-colors duration-200"
                        >
                          {hasChildren ? 'View Variants' : 'View Solution'}
                        </button>
                      </div>
                    </div>

                    {/* ===== DESKTOP LAYOUT ===== */}
                    {/* Default State - Rotated Text */}
                    <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="whitespace-nowrap text-xl lg:text-2xl font-black tracking-widest text-white/90 uppercase -rotate-90 drop-shadow-lg px-4 text-center">
                        {product.name}
                      </h3>
                    </div>

                    {/* Hover State - Full Content */}
                    <div className="hidden md:flex absolute inset-0 p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-20">
                      <div className="w-full text-left pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        <span className="text-blue-400 font-bold tracking-widest uppercase text-[10px] lg:text-xs mb-2 block">
                          {selectedParent ? 'View Details' : 'Click for Options'}
                        </span>
                        <h4 className="text-2xl lg:text-4xl font-black text-white mb-2 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-white/90 text-sm lg:text-base line-clamp-2 mb-4 lg:mb-6 font-medium">
                          {product.shortDesc || 'Premium Protection Solution'}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(product, index);
                          }}
                          className="border border-blue-400 text-blue-400 font-bold tracking-widest uppercase text-[10px] lg:text-xs px-5 py-2 hover:bg-blue-400 hover:text-white transition-colors duration-300 pointer-events-auto"
                        >
                          {hasChildren ? 'Explore' : 'View Solution'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== PRODUCT DETAIL MODAL ===== */}
      <AnimatePresence>
        {activeProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-end md:items-center justify-center"
            onClick={() => setActiveProduct(null)}
          >
            {/* Mobile Modal - Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="md:hidden absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-400/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-4 right-4 z-50 text-white/50 p-3 bg-black/40 rounded-full active:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Image Section */}
              <div className="w-full h-[200px] sm:h-[250px] bg-gradient-to-br from-gray-900 to-black relative shrink-0">
                {(() => {
                  const imageUrl = getProductImageUrl(activeProduct.image_url);
                  if (!imageUrl) {
                    return (
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <h2 className="text-2xl font-black text-white uppercase text-center">{activeProduct.name}</h2>
                      </div>
                    );
                  }
                  return (
                    <div className="relative w-full h-full">
                      <Image 
                        src={imageUrl} 
                        alt={activeProduct.name} 
                        fill 
                        className="object-contain p-6" 
                        sizes="100vw" 
                        priority 
                        unoptimized // Add this for external URLs
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Content Section - Scrollable */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mb-1">{activeProduct.name}</h2>
                {activeProduct.shortDesc && (
                  <p className="text-gray-400 text-sm mb-6">{activeProduct.shortDesc}</p>
                )}

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-blue-400 font-bold uppercase text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck size={18} /> Highlights
                  </h3>
                  <div className="space-y-3">
                    {parseFeatures(activeProduct.features).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <span className="text-white/80 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs */}
                {parseSpecs(activeProduct.specs).length > 0 && (
                  <div>
                    <h3 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                      <Zap size={18} className="text-blue-400" /> Specs
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {parseSpecs(activeProduct.specs).map((spec, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">{spec.label}</p>
                          <p className="text-white font-bold text-sm break-words">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Safe Area Spacer */}
              <div className="h-[env(safe-area-inset-bottom)] bg-[#0a0a0a]" />
            </motion.div>

            {/* Desktop Modal - Centered */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="hidden md:flex bg-[#0a0a0a] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex-row shadow-2xl shadow-blue-400/10 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-4 right-4 z-30 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full p-2"
              >
                <X size={24} />
              </button>

              {/* Modal Left: Product Image */}
              <div className="w-2/5 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden min-h-[500px] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {(() => {
                    const imageUrl = getProductImageUrl(activeProduct.image_url);
                    if (imageUrl) {
                      return (
                        <div className="relative w-full h-[400px]">
                          <Image
                            src={imageUrl}
                            alt={activeProduct.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="40vw"
                            priority
                            unoptimized // Add this for external URLs
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="text-center">
                        <h2 className="text-4xl font-black text-white mb-2 uppercase leading-none drop-shadow-lg">
                          {activeProduct.name}
                        </h2>
                        <div className="h-1 w-24 bg-blue-400 mx-auto mt-4 shadow-[0_0_20px_rgba(0,170,255,0.8)]" />
                      </div>
                    );
                  })()}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
              </div>

              {/* Modal Right: Details */}
              <div className="w-3/5 p-10 flex flex-col justify-center overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
                    {activeProduct.name}
                  </h2>
                  {activeProduct.shortDesc && (
                    <p className="text-gray-400 text-sm mt-2">
                      {activeProduct.shortDesc}
                    </p>
                  )}
                </div>

                {/* Features Section */}
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={20} />
                    Product Highlights
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {parseFeatures(activeProduct.features).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <span className="text-white/80 text-sm font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs Section */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={20} className="text-blue-400" />
                    Technical Specs
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const specEntries = parseSpecs(activeProduct.specs);

                      if (specEntries.length === 0) {
                        return (
                          <div className="col-span-2 text-white/30 text-sm italic bg-white/5 rounded-lg p-4 border border-white/5">
                            Specifications not available for this product
                          </div>
                        );
                      }

                      return specEntries.map((spec, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-blue-400/30 transition-colors"
                        >
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1 line-clamp-1">
                            {spec.label}
                          </p>
                          <p className="text-white font-bold text-sm md:text-base break-words">
                            {spec.value}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}