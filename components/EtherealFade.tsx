import React, { useState, useEffect } from 'react';

export interface EtherealImage {
    id: string;
    url: string;
    title?: string;
    subtitle?: string;
    alt?: string;
}

export interface EtherealFadeProps {
    /** Array of images to cycle through */
    images: EtherealImage[];
    /** Duration in milliseconds between slides. Default: 3000 */
    interval?: number;
    /** Optional class name for the outer container */
    className?: string;
}

export const EtherealFade: React.FC<EtherealFadeProps> = ({
    images,
    interval = 3000,
    className = ""
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length === 0) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    if (!images || images.length === 0) return null;

    return (
        <div className={`relative w-full h-full bg-neutral-900 overflow-hidden ${className}`}>
            {images.map((img, index) => {
                const isActive = index === activeIndex;

                return (
                    <div
                        key={img.id}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* Ken Burns Effect Wrapper - Optimized for mobile */}
                        <div className={`w-full h-full overflow-hidden`}>
                            <img
                                src={img.url}
                                alt={img.alt || img.title}
                                className={`w-full h-full object-cover origin-center transition-transform duration-[4000ms] ease-linear will-change-transform ${isActive ? 'scale-[1.05]' : 'scale-100'}`}
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

                        {/* Centered Content - Mobile safe */}
                        <div className="absolute left-0 right-0 bottom-24 w-full h-max flex flex-col items-center justify-end text-center z-20 px-4 md:px-20 py-4">
                            {img.title && (
                                <div className={`overflow-hidden transition-all duration-700 ${isActive ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <h2 className="text-4xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-[0.1em] md:tracking-[0.2em] leading-tight break-words font-sans">
                                        {img.title}
                                    </h2>
                                </div>
                            )}

                            {/* Subtitle / Description / Counter */}
                            <p className={`mt-2 md:mt-4 text-white font-mono text-[10px] md:text-sm tracking-widest uppercase transition-opacity duration-500 delay-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                {img.subtitle ? img.subtitle : `Collection / ${index + 1}`}
                            </p>
                        </div>
                    </div>
                );
            })}

            {/* Side Numbers Indicator */}
            <div className="absolute bottom-4 right-4 md:right-8 z-30 flex flex-col gap-6 md:gap-8 pointer-events-none">
                {images.map((_, idx) => (
                    <span
                        key={idx}
                        className={`text-[10px] md:text-sm font-bold rotate-90 transition-colors duration-300 ${idx === activeIndex ? 'text-white' : 'text-white/20'}`}
                    >
                        {String(idx + 1).padStart(2, '0')}
                    </span>
                ))}
            </div>
        </div>
    );
};
