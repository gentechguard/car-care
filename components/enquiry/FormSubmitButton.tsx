'use client';

import { motion } from 'framer-motion';
import { FormTheme } from '@/types/enquiries';
import { Loader2, ArrowRight, Check } from 'lucide-react';

interface FormSubmitButtonProps {
  label: string;
  loading?: boolean;
  success?: boolean;
  theme: FormTheme;
  delay?: number;
}

const themeConfig: Record<FormTheme, { 
  gradient: string; 
  shadow: string;
  hoverShadow: string;
}> = {
  purple: {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    hoverShadow: 'shadow-[0_0_30px_rgba(139,92,246,0.5)]'
  },
  orange: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    hoverShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]'
  },
  green: {
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    hoverShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]'
  },
  blue: {
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    shadow: 'shadow-[0_0_20px_rgba(0,170,255,0.3)]',
    hoverShadow: 'shadow-[0_0_30px_rgba(0,170,255,0.5)]'
  }
};

export default function FormSubmitButton({
  label,
  loading = false,
  success = false,
  theme,
  delay = 0
}: FormSubmitButtonProps) {
  const config = themeConfig[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="pt-4"
    >
      <motion.button
        type="submit"
        disabled={loading || success}
        whileHover={!loading && !success ? { scale: 1.02 } : {}}
        whileTap={!loading && !success ? { scale: 0.98 } : {}}
        className={`
          relative w-full py-4 px-8 rounded-xl
          bg-gradient-to-r ${config.gradient}
          text-white font-black uppercase tracking-[0.2em] text-sm
          ${config.shadow} hover:${config.hoverShadow}
          transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed
          overflow-hidden group
          border border-white/10
        `}
      >
        {/* Shimmer effect */}
        {!loading && !success && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        
        <div className="relative flex items-center justify-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : success ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-green-600" />
              </motion.div>
              <span>Submitted Successfully</span>
            </>
          ) : (
            <>
              <span>{label}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}