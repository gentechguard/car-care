'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FormTheme } from '@/types/enquiries';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  theme: FormTheme;
  delay?: number;
  multiple?: boolean;
  selectedValues?: string[];
}

const themeConfig: Record<FormTheme, { 
  labelColor: string; 
  borderColor: string; 
  accentColor: string;
  bgColor: string;
}> = {
  purple: {
    labelColor: 'text-violet-300',
    borderColor: 'border-violet-500/30',
    accentColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10'
  },
  orange: {
    labelColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  green: {
    labelColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  blue: {
    labelColor: 'text-blue-300',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  }
};

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option',
  required = false,
  error,
  theme,
  delay = 0,
  multiple = false,
  selectedValues = []
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = themeConfig[theme];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues.join(','));
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const displayValue = multiple 
    ? (selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder)
    : (options.find(o => o.value === value)?.label || placeholder);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2 relative"
      ref={containerRef}
    >
      <label className={`block text-xs uppercase font-black tracking-wider ${config.labelColor}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-black/40 backdrop-blur-sm 
            border ${config.borderColor} rounded-xl 
            py-4 px-4 pr-12
            text-left text-white 
            outline-none transition-all duration-300
            ${isOpen ? `${config.accentColor.replace('text-', 'border-')} shadow-[0_0_20px_rgba(255,255,255,0.1)]` : ''}
            ${error ? 'border-red-500/50' : ''}
          `}
        >
          <span className={!value && !selectedValues.length ? 'text-white/30' : ''}>
            {displayValue}
          </span>
          
          <ChevronDown 
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-transform duration-300 ${config.accentColor} ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute z-50 w-full mt-2 
                bg-[#0a0a0a]/95 backdrop-blur-xl 
                border ${config.borderColor} rounded-xl 
                shadow-2xl overflow-hidden
                max-h-60 overflow-y-auto
              `}
            >
              {options.map((option, idx) => {
                const isSelected = multiple 
                  ? selectedValues.includes(option.value)
                  : value === option.value;
                  
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 text-left text-sm
                      flex items-center justify-between
                      transition-colors duration-200
                      ${isSelected ? `${config.bgColor} ${config.accentColor}` : 'text-white/70 hover:bg-white/5 hover:text-white'}
                      border-b border-white/5 last:border-none
                    `}
                  >
                    {option.label}
                    {isSelected && <Check className="w-4 h-4" />}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}