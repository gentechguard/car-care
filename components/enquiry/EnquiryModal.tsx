'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useBackButton } from '@/hooks/useBackButton';

const CustomerEnquiryForm = dynamic(() => import('./CustomerEnquiryForm'), { ssr: false });
const DealerEnquiryForm = dynamic(() => import('./DealerEnquiryForm'), { ssr: false });
const DistributorEnquiryForm = dynamic(() => import('./DistributorEnquiryForm'), { ssr: false });

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'customer' | 'dealer' | 'distributor' | null;
}

export default function EnquiryModal({ isOpen, onClose, type }: EnquiryModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Browser back button closes the modal
  useBackButton(isOpen, onClose);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!type) return null;

  const renderForm = () => {
    switch (type) {
      case 'customer':
        return <CustomerEnquiryForm onClose={onClose} />;
      case 'dealer':
        return <DealerEnquiryForm onClose={onClose} />;
      case 'distributor':
        return <DistributorEnquiryForm onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100]"
            onClick={onClose}
          />
          
          {/* Modal Container - Full screen on mobile, centered on desktop */}
          <div 
            className={`
              fixed inset-0 z-[101] 
              flex items-center justify-center 
              ${isMobile ? 'p-0' : 'p-4'}
            `}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.9, 
                y: isMobile ? 50 : 20 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: isMobile ? 50 : 20 
              }}
              transition={{ 
                duration: 0.4, 
                ease: [0.25, 1, 0.5, 1] 
              }}
              className={`
                relative w-full
                ${isMobile
                  ? 'h-full max-h-full rounded-none'
                  : 'max-w-lg max-h-[90vh] rounded-3xl'
                }
                overflow-y-auto
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {renderForm()}
              
              {/* Mobile Close Button - Inside modal */}
              {isMobile && (
                <button
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          </div>
          
          {/* Desktop Close Button - Outside modal */}
          {!isMobile && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed top-6 right-6 z-[102] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </>
      )}
    </AnimatePresence>
  );
}