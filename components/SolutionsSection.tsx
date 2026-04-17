'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, ShieldCheck, Zap, Download } from 'lucide-react';
import { useGlobalStore, Product } from '@/context/GlobalStore';
import Image from 'next/image';
import { useBackButton } from '@/hooks/useBackButton';
import { useDeviceCapability } from '@/lib/hooks/useDeviceCapability';

const getProductImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return '/assets/gentech-tall.png';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return '/assets/gentech-tall.png';

  let clean = imagePath.replace(/^\/+/, '');
  clean = clean.replace(/^products?\//, '');

  return `${supabaseUrl}/storage/v1/object/public/product/${clean}`;
};

// Helper to safely parse specs
const parseSpecs = (specs: any): Array<{ label: string, value: string }> => {
  if (!specs) return [];

  if (Array.isArray(specs) && specs.length > 0 && specs[0].label) {
    return specs;
  }

  if (typeof specs === 'object' && !Array.isArray(specs)) {
    return Object.entries(specs).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Array.isArray(value) ? value.join(', ') : String(value)
    }));
  }

  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      return Object.entries(parsed).map(([key, value]) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Array.isArray(value) ? value.join(', ') : String(value)
      }));
    } catch {
      return [];
    }
  }

  return [];
};

const parseFeatures = (features: any): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      return JSON.parse(features);
    } catch {
      return features ? [features] : [];
    }
  }
  return [];
};

type DisplayProduct = Product & { nonInteractive?: boolean };

const PRODUCT_OVERRIDES: Record<string, { name: string; shortDesc: string }> = {
  perfumes: {
    name: 'Ceramic Coating',
    shortDesc: 'Long-lasting hydrophobic ceramic layer that enhances gloss and shields paint from contaminants and UV.',
  },
  'detailing products': {
    name: 'Premium Car Wash',
    shortDesc: 'Contactless premium wash with pH-neutral foam and microfiber care for a spotless, swirl-free finish.',
  },
};

const applyProductOverride = (product: Product): DisplayProduct => {
  const key = product.name.trim().toLowerCase();
  const override = PRODUCT_OVERRIDES[key];
  if (!override) return product;
  return { ...product, name: override.name, shortDesc: override.shortDesc, nonInteractive: true };
};

export default function SolutionsSection() {
  const { products, loading } = useGlobalStore();
  const [selectedParent, setSelectedParent] = useState<Product | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedMobileIndex, setExpandedMobileIndex] = useState<number | null>(null);

  // Device detection — landscape phones should also be treated as "mobile"
  const { isPhoneViewport, isClient } = useDeviceCapability();
  const isMobile = isPhoneViewport;

  // Browser back button closes the product detail modal
  useBackButton(!!activeProduct, () => setActiveProduct(null));

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);
  const isMobileRef = useRef(false);

  // Keep ref in sync with state (used inside rAF loop)
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const displayedProducts: DisplayProduct[] = (selectedParent
    ? products.filter(p => p.parent_id === selectedParent.id)
    : products.filter(p => !p.parent_id)
  ).map(applyProductOverride);

  useEffect(() => {
    // Reset expanded state when navigating between parent/children or switching views
    setExpandedMobileIndex(null);
  }, [selectedParent, isMobile]);

  // Synchronized background - vertical on mobile, horizontal on desktop
  const syncBackgrounds = useCallback(() => {
    if (!isSyncingRef.current) return;

    const container = containerRef.current;
    if (!container || cardsRef.current.length === 0) {
      rafIdRef.current = requestAnimationFrame(syncBackgrounds);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const mobile = isMobileRef.current;

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();

      if (mobile) {
        // Vertical sync for mobile accordion - cover-like sizing
        // Container is tall & narrow, so size by height to ensure full coverage
        card.style.backgroundSize = `auto ${containerRect.height}px`;
        const yOffset = containerRect.top - cardRect.top;
        card.style.backgroundPositionX = 'center';
        card.style.backgroundPositionY = `${yOffset}px`;
      } else {
        // Horizontal sync for desktop
        card.style.backgroundSize = `${containerRect.width}px ${containerRect.height}px`;
        const xOffset = containerRect.left - cardRect.left;
        card.style.backgroundPositionX = `${xOffset}px`;
        card.style.backgroundPositionY = 'center';
      }
    });

    rafIdRef.current = requestAnimationFrame(syncBackgrounds);
  }, []);

  useEffect(() => {
    if (!isTransitioning && !loading && displayedProducts.length > 0) {
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
  }, [displayedProducts.length, loading, isTransitioning, syncBackgrounds]);

  useEffect(() => {
    return () => {
      isSyncingRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleCardClick = (product: DisplayProduct, index: number) => {
    if (product.nonInteractive) return;

    const hasChildren = products.some(p => p.parent_id === product.id);

    if (isClient && isMobile) {
      // Single click: expand the card and navigate immediately
      setExpandedMobileIndex(index);
      if (hasChildren) {
        navigateToChildren(product);
      } else {
        setActiveProduct(product);
      }
      return;
    }

    if (hasChildren) {
      navigateToChildren(product);
    } else {
      setActiveProduct(product);
    }
  };

  const navigateToChildren = (product: Product) => {
    setIsTransitioning(true);
    isSyncingRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    cardsRef.current = [];

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

    setTimeout(() => {
      setSelectedParent(null);
      setIsTransitioning(false);
    }, 100);
  };

  if (loading) {
    return (
      <section id="product-showcase" className="bg-black py-20">
        <div className="h-[300px] flex items-center justify-center text-white">
          <div className="animate-pulse text-white/40 text-sm uppercase tracking-widest">Loading Products...</div>
        </div>
      </section>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <section id="product-showcase" className="bg-black py-20">
        <div className="h-[300px] flex flex-col items-center justify-center text-white gap-4">
          <p className="text-white/40 text-sm uppercase tracking-widest">No products available</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="product-showcase" className="bg-black py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 min-h-[4rem] relative">
          <AnimatePresence mode="wait">
            {selectedParent ? (
              <motion.div
                key="back-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" size={20} />
                  <span className="uppercase tracking-widest text-sm font-bold">Back to All Solutions</span>
                </button>
                <div className="text-left md:text-right">
                  <span className="text-blue-400 text-xs tracking-widest uppercase block mb-1">
                    {selectedParent.name} Variants
                  </span>
                  <p className="text-gray-500 text-xs">
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
                className="flex flex-col items-center justify-center text-center min-h-[4rem]"
              >
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                  Complete Vehicle <span className="text-blue-400">Protection</span> Solutions
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                  Click any service to explore specific variants tailored to your needs
                </p>
                <div className="flex items-center justify-center mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const files = [
                        '/assets/gentech_guard_brochure_borderless.pdf',
                        '/assets/gentech_guard_sunfilm_brochure_borderless.pdf',
                      ];
                      files.forEach((file) => {
                        const a = document.createElement('a');
                        a.href = file;
                        a.download = file.split('/').pop() || '';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      });
                    }}
                    className="inline-flex items-center gap-2 text-blue-400/80 hover:text-blue-400 text-sm tracking-wide transition-colors duration-300"
                  >
                    <Download size={15} />
                    Download Brochures For PPF & Sun Film
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Grid */}
        <div
          ref={containerRef}
          className="solutions-products-grid relative z-10 flex flex-col lg:flex-row gap-3 mx-0 lg:mx-10 xl:mx-20 my-0 lg:my-8 lg:pt-0 lg:pb-0 h-[70vh] lg:h-auto lg:aspect-video rounded-2xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedParent ? 'children' : 'parents'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full h-full"
            >
              {displayedProducts.map((product, index) => {
                const hasChildren = products.some(p => p.parent_id === product.id);
                const isExpanded = isClient && isMobile && expandedMobileIndex === index;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => handleCardClick(product, index)}
                    ref={(el) => {
                      if (el) cardsRef.current[index] = el;
                    }}
                    style={{
                      flex: isClient && isMobile
                        ? (isExpanded ? '3 1 0%' : '1 1 0%')
                        : undefined,
                      backgroundImage: "url('/assets/solutions_bg.png')",
                      backgroundRepeat: "no-repeat",
                    }}
                    className={`
                      group relative overflow-hidden rounded-2xl
                      transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                      ${product.nonInteractive ? 'cursor-default' : 'cursor-pointer active:scale-[0.98] lg:active:scale-100'}
                      lg:flex-1 lg:hover:flex-[2] lg:min-h-0
                      lg:will-change-[flex]
                      bg-[#111] border border-white/10
                    `}
                  >
                    {/* Dark overlay - Desktop */}
                    <div
                      className="hidden lg:block absolute inset-0 z-10 pointer-events-none transition-colors duration-500 bg-black/60 group-hover:bg-black/30"
                    />

                    {/* Dark overlay - Mobile */}
                    <div
                      className="lg:hidden absolute inset-0 z-10 pointer-events-none transition-all duration-500"
                      style={{
                        background: isExpanded
                          ? 'linear-gradient(to top, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 100%)'
                          : 'rgba(0,0,0,0.55)',
                      }}
                    />

                    {/* Mobile Layout - Collapsed: Centered name */}
                    <div
                      className="lg:hidden absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                      style={{ opacity: isExpanded ? 0 : 1 }}
                    >
                      <h3 className="text-sm font-black tracking-widest text-white/90 uppercase drop-shadow-lg">
                        {product.name}
                      </h3>
                    </div>

                    {/* Mobile Layout - Expanded: Content at bottom */}
                    <div
                      className="lg:hidden absolute inset-0 z-20 flex flex-col justify-end p-5 transition-opacity duration-500 pointer-events-none"
                      style={{ opacity: isExpanded ? 1 : 0 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: isExpanded ? 1 : 0,
                          y: isExpanded ? 0 : 15,
                        }}
                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                      >
                        <h3 className="text-lg font-black tracking-wider text-white uppercase mb-1">
                          {product.name}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-2">
                          {product.shortDesc || 'Premium Protection Solution'}
                        </p>
                      </motion.div>
                    </div>

                    {/* Desktop Layout - Default: Rotated name centered */}
                    <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="whitespace-nowrap text-xl lg:text-2xl font-black tracking-widest text-white/90 uppercase -rotate-90 drop-shadow-lg">
                        {product.name}
                      </h3>
                    </div>

                    {/* Desktop Layout - Hover: Content at bottom */}
                    <div className="hidden lg:flex absolute inset-0 p-4 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-20">
                      <div className="w-full text-left pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        {!product.nonInteractive && (
                          <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">
                            {selectedParent ? 'View Details' : 'Click for Options'}
                          </span>
                        )}
                        <h4 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-4 md:mb-6 font-medium">
                          {product.shortDesc || 'Premium Protection Solution'}
                        </p>
                        {!product.nonInteractive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(product, index);
                            }}
                            className="border border-blue-400 text-blue-400 font-bold tracking-widest uppercase text-[10px] md:text-xs px-5 py-2 hover:bg-blue-400 hover:text-white transition-colors duration-300 pointer-events-auto"
                          >
                            {selectedParent ? 'View Solution' : 'Explore'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-lg"
            onClick={() => setActiveProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md md:max-w-5xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row shadow-2xl shadow-blue-400/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-4 right-4 z-30 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1.5"
              >
                <X size={22} />
              </button>

              {/* Image Section */}
              <div className="w-full md:w-2/5 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black min-h-[200px] md:min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                {/* SVG filter to make white/near-white pixels transparent */}
                <svg className="absolute w-0 h-0" aria-hidden="true">
                  <defs>
                    <filter id="remove-white-bg" colorInterpolationFilters="sRGB">
                      <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1 -1 -1 1 2
                      "/>
                    </filter>
                  </defs>
                </svg>
                {activeProduct.image_url ? (
                  <div className="relative w-full h-full min-h-[200px] md:min-h-[400px]">
                    <Image
                      src={getProductImageUrl(activeProduct.image_url)}
                      alt={activeProduct.name}
                      fill
                      className="object-contain p-4 md:p-8"
                      style={{ filter: 'url(#remove-white-bg) drop-shadow(0 25px 25px rgba(0,0,0,0.15))' }}
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-none drop-shadow-lg">
                        {activeProduct.name}
                      </h2>
                      <div className="h-1 w-16 bg-blue-400 mx-auto mt-4 shadow-[0_0_20px_rgba(0,170,255,0.8)]" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 md:hidden" />
              </div>

              {/* Details Section */}
              <div className="w-full md:w-3/5 p-5 md:p-10">
                {/* Product Name with blue underline */}
                <div className="mb-5 md:mb-6 text-center md:text-left">
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase leading-tight pr-8 md:pr-10">
                    {activeProduct.name}
                  </h2>
                  <div className="h-1 w-16 bg-blue-400 mx-auto md:mx-0 mt-3 shadow-[0_0_15px_rgba(0,170,255,0.6)]" />
                  {activeProduct.shortDesc && (
                    <p className="text-gray-400 text-sm mt-3">{activeProduct.shortDesc}</p>
                  )}
                </div>

                {/* Features */}
                {parseFeatures(activeProduct.features).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm md:text-lg font-bold text-blue-400 mb-3 md:mb-4 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={18} />
                      Flavors
                    </h3>
                    <div className="space-y-2.5">
                      {parseFeatures(activeProduct.features).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                          </div>
                          <span className="text-white/80 text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specs */}
                <div>
                  <h3 className="text-sm md:text-lg font-bold text-white mb-3 md:mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={18} className="text-blue-400" />
                    Technical Specs
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {(() => {
                      const specEntries = parseSpecs(activeProduct.specs);
                      if (specEntries.length === 0) {
                        return (
                          <div className="col-span-2 text-white/30 text-sm italic bg-white/5 rounded-lg p-3 border border-white/5">
                            Specifications not available
                          </div>
                        );
                      }
                      return specEntries.map((spec, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-blue-400/30 transition-colors"
                        >
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-0.5 line-clamp-1">
                            {spec.label}
                          </p>
                          <p className="text-white font-bold text-sm break-words">
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
