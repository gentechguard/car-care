'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, Handshake, Globe, Network, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnquiryDropdownProps {
  onSelectOption: (option: 'customer' | 'dealer' | 'distributor' | 'network') => void;
}

const menuItems = [
  {
    id: 'customer' as const,
    label: 'PPF/Sun Film/Graphene Enquiry',
    shortLabel: 'Customer Enquiry',
    icon: Shield,
    theme: 'purple' as const,
    bgColor: 'bg-violet-600',
    borderColor: 'border-violet-500/50',
    textColor: 'text-violet-300',
    hoverBg: 'hover:bg-violet-600/20',
    description: 'Get quotes for treatments'
  },
  {
    id: 'dealer' as const,
    label: 'Become a Dealer',
    shortLabel: 'Dealer',
    icon: Handshake,
    theme: 'orange' as const,
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-300',
    hoverBg: 'hover:bg-amber-500/20',
    description: 'Start your studio partnership'
  },
  {
    id: 'distributor' as const,
    label: 'Become a Distributor',
    shortLabel: 'Distributor',
    icon: Globe,
    theme: 'green' as const,
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    hoverBg: 'hover:bg-emerald-500/20',
    description: 'Wholesale distribution network'
  },
  {
    id: 'network' as const,
    label: 'Our Network',
    shortLabel: 'Network',
    icon: Network,
    theme: 'blue' as const,
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-300',
    hoverBg: 'hover:bg-blue-500/20',
    description: 'View authorized centers',
    isLink: true
  }
];

export default function EnquiryDropdown({ onSelectOption }: EnquiryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (itemId: 'customer' | 'dealer' | 'distributor' | 'network') => {
    if (itemId === 'network') {
      router.push('/our-network');
    } else {
      onSelectOption(itemId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Fixed size to prevent layout shift */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative h-11 px-6 rounded-full font-black uppercase tracking-wider text-sm
          flex items-center gap-2 transition-all duration-300 whitespace-nowrap
          ${isOpen 
            ? 'bg-primary-blue text-white shadow-[0_0_20px_rgba(0,170,255,0.5)]' 
            : 'bg-white/5 text-white border border-white/10 hover:border-primary-blue/50 hover:bg-white/10'
          }
        `}
      >
        <span>Enquiry</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Container - Positioned absolutely below button */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="absolute top-full right-0 mt-3 z-50 w-80"
            >
              <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full relative overflow-hidden rounded-xl p-4 mb-2 last:mb-0
                        flex items-center gap-4 text-left
                        transition-all duration-300 group
                        bg-white/5 ${item.hoverBg}
                        border border-transparent hover:${item.borderColor}
                      `}
                    >
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 ${item.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      {/* Icon */}
                      <div className={`
                        relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                        ${item.bgColor} shadow-lg
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="relative flex-1 min-w-0">
                        <h3 className="text-white font-black uppercase tracking-wide text-sm mb-1 group-hover:text-white transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-white/50 text-xs font-medium group-hover:text-white/70 transition-colors">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className="relative text-white/30 group-hover:text-white/60 transition-colors shrink-0">
                        <ChevronDown className="w-5 h-5 -rotate-90" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}