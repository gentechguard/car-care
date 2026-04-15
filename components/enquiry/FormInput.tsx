'use client';

import { motion } from 'framer-motion';
import { FormTheme } from '@/types/enquiries';
import { useState } from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  theme: FormTheme;
  delay?: number;
  icon?: React.ReactNode;
}

const themeConfig: Record<FormTheme, { 
  labelColor: string; 
  borderColor: string; 
  focusColor: string;
  glowColor: string;
}> = {
  purple: {
    labelColor: 'text-violet-300',
    borderColor: 'border-violet-500/30',
    focusColor: 'focus:border-violet-400',
    glowColor: 'focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
  },
  orange: {
    labelColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    focusColor: 'focus:border-amber-400',
    glowColor: 'focus:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
  },
  green: {
    labelColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
    focusColor: 'focus:border-emerald-400',
    glowColor: 'focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
  },
  blue: {
    labelColor: 'text-blue-300',
    borderColor: 'border-blue-500/30',
    focusColor: 'focus:border-blue-400',
    glowColor: 'focus:shadow-[0_0_20px_rgba(0,170,255,0.3)]'
  }
};

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  theme,
  delay = 0,
  icon
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const config = themeConfig[theme];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <label className={`block text-xs uppercase font-black tracking-wider ${config.labelColor}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          className={`
            w-full bg-black/40 backdrop-blur-sm 
            border ${config.borderColor} rounded-xl 
            py-4 ${icon ? 'pl-12' : 'px-4'} pr-4
            text-white placeholder:text-white/20 
            outline-none transition-all duration-300
            ${config.focusColor} ${config.glowColor}
            ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
          `}
        />
        
        {/* Animated border glow */}
        <motion.div
          className={`absolute inset-0 rounded-xl pointer-events-none ${config.focusColor.replace('focus:', '')}`}
          initial={false}
          animate={{ 
            boxShadow: isFocused 
              ? `0 0 0 1px currentColor, 0 0 20px currentColor` 
              : '0 0 0 0px transparent' 
          }}
          transition={{ duration: 0.3 }}
          style={{ opacity: 0.3 }}
        />
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