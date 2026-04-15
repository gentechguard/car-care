"use client";

import { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  useEffect(() => {
    // Auto-focus the first empty input
    const firstEmpty = digits.findIndex(d => d === '' || d === ' ');
    if (firstEmpty >= 0 && inputRefs.current[firstEmpty]) {
      inputRefs.current[firstEmpty]?.focus();
    }
  }, []);

  const handleChange = (index: number, char: string) => {
    if (disabled) return;

    // Only allow digits
    const digit = char.replace(/\D/g, '').slice(-1);
    const arr = digits.slice();
    arr[index] = digit;
    const newValue = arr.join('');
    onChange(newValue.replace(/\s/g, ''));

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current is empty, go back and clear previous
        const arr = digits.slice();
        arr[index - 1] = '';
        onChange(arr.join('').replace(/\s/g, ''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const arr = digits.slice();
        arr[index] = '';
        onChange(arr.join('').replace(/\s/g, ''));
      }
      e.preventDefault();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      onChange(pasted);
      // Focus the input after the last pasted digit
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit === ' ' ? '' : digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={`
            w-11 h-14 sm:w-13 sm:h-16
            text-center text-xl sm:text-2xl font-black
            bg-white/5 border rounded-xl
            text-white outline-none
            transition-all duration-200
            ${disabled
              ? 'border-white/5 opacity-50 cursor-not-allowed'
              : 'border-white/10 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue focus:bg-white/10'
            }
          `}
        />
      ))}
    </div>
  );
}
