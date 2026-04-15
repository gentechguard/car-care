'use client';

import React from 'react';
import Image from 'next/image';

interface MetallicPaintMobileProps {
    src: string;
    className?: string;
    alt?: string;
}

/**
 * Lightweight mobile alternative to MetallicPaint WebGL component.
 * Uses CSS animations to create a shimmer effect without WebGL overhead.
 */
export default function MetallicPaintMobile({
    src,
    className = '',
    alt = 'Logo'
}: MetallicPaintMobileProps) {
    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Base image with metallic gradient overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                    {/* The actual SVG/image - inverted and brightened to look metallic */}
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain"
                        style={{
                            filter: 'invert(1) brightness(1.8) contrast(1.2) drop-shadow(0 0 12px rgba(180, 200, 255, 0.5))',
                        }}
                        priority
                    />

                    {/* Metallic shimmer overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none metallic-shimmer"
                        style={{
                            background: `linear-gradient(
                105deg,
                transparent 15%,
                rgba(255, 255, 255, 0.15) 30%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0.15) 70%,
                transparent 85%
              )`,
                            backgroundSize: '200% 100%',
                            mixBlendMode: 'overlay',
                        }}
                    />

                    {/* Warm glow effect for metallic look */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(200,210,255,0.25) 0%, transparent 65%)',
                        }}
                    />
                </div>
            </div>

            {/* CSS for shimmer animation */}
            <style jsx>{`
        .metallic-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
        </div>
    );
}
