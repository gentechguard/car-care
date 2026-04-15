"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Shield, Zap, Droplets } from "lucide-react";
import { useRef } from "react";
import { EtherealFade } from "./EtherealFade";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";

const carouselImages = [
    {
        id: "hero-1",
        url: "/assets/mobile-hero-1.png",
        title: "PPF",
        subtitle: "Premium Paint Protection Films with self-healing technology and high-gloss finish"
    }, {
        id: "hero-2",
        url: "/assets/mobile-hero-2.png",
        title: "SUN FILM",
        subtitle: "Ultra-Premium Automotive Sun Films for UV and heat protection"
    }, {
        id: "hero-3",
        url: "/assets/mobile-hero-3.png",
        title: "GRAPHENE COATING",
        subtitle: "Advanced Nano Protection Technology for enhanced gloss and surface protection"
    }, {
        id: "hero-4",
        url: "/assets/mobile-hero-4.png",
        title: "PERFUMES",
        subtitle: "Luxurious Car Air Fresheners with premium fragrances"
    }, {
        id: "hero-5",
        url: "/assets/mobile-hero-5.png",
        title: "DETAILING PRODUCTS",
        subtitle: "Professional Grade Detailing and Cleaning Solutions"
    }
];

export default function Hero() {
    const ref = useRef(null);
    const { isMobile, isClient } = useDeviceCapability();
    const prefersReducedMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Reduce parallax effect on mobile for better performance
    const yDesktop = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yMobile = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const y = isClient && isMobile ? yMobile : yDesktop;

    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Animation settings based on device
    const animationDuration = prefersReducedMotion ? 0.1 : (isMobile ? 0.5 : 0.8);
    const animationDelay = prefersReducedMotion ? 0 : (isMobile ? 0.1 : 0);

    return (
        <section
            ref={ref}
            className="relative h-[100dvh] w-full overflow-hidden bg-dark-bg flex items-start md:items-center justify-center pt-16 sm:pt-20 md:pt-20 pb-0"
        >
            {/* BACKGROUND: Static for Desktop, Carousel for Mobile */}
            <motion.div
                style={{ y, opacity: prefersReducedMotion ? 1 : opacity }}
                className="absolute inset-0 z-0 gpu-accelerated"
            >
                {/* Desktop Static Image */}
                <div className="hidden md:block relative w-full h-full">
                    <Image
                        src="/assets/Hero Image Side On.png"
                        alt="Gentech Car Care Hero"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/40 to-transparent" />
                </div>

                {/* Mobile Carousel */}
                <div className="block md:hidden relative w-full h-full">
                    <EtherealFade images={carouselImages} interval={5000} />
                    <div className="hidden absolute inset-0 bg-gradient-to-t from-dark-bg via-black/20 to-transparent z-10" />
                </div>
            </motion.div>

            {/* CONTENT */}
            <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-8 md:pt-0 relative z-10 w-full">
                <div className="max-w-4xl text-center md:text-left mx-auto md:mx-0">
                    <motion.div
                        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: animationDuration, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex flex-col items-center md:items-start justify-center"
                    >
                        {/* Main Heading - Responsive text sizing */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-2 sm:mb-3">
                            PREMIUM AUTOMOTIVE <br className="hidden sm:block" />
                            <span className="blue-text tracking-wider">
                                SURFACE <br className="sm:hidden" />
                                <span className="hidden sm:inline"> </span>
                                PROTECTION
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-sm sm:text-base md:text-lg text-white/70 font-bold tracking-wide mb-4 sm:mb-6 italic">
                            Engineered to protect. Designed to impress.
                        </p>

                        {/* Description - Hidden on mobile for cleaner look */}
                        <p className="hidden sm:block text-sm sm:text-base md:text-lg text-text-grey max-w-xl mb-6 sm:mb-8 font-medium leading-relaxed">
                            Gentech Car Care provides premium detailing and protection services designed to keep your vehicle looking brand new. From advanced paint protection to professional maintenance, we safeguard your car’s finish against the elements with precision and expertise.
                        </p>

                        {/* CTA Buttons - Stack on mobile, row on larger screens */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto">
                            <button
                                onClick={() => document.getElementById('contact-cards')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-primary-blue hover:bg-white hover:text-dark-bg text-white px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-200 neon-glow flex items-center justify-center gap-2 group touch-manipulation active:scale-95"
                            >
                                CALL
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href="https://maps.app.goo.gl/kEQprRRWBQSNBd9k9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-white/20 hover:border-primary-blue text-white px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-200 backdrop-blur-sm flex items-center justify-center touch-manipulation active:scale-95"
                            >
                                MAP
                            </a>
                        </div>
                    </motion.div>

                    {/* MICRO FEATURES - Hidden on mobile, visible on tablet+ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: animationDelay + 0.4, duration: animationDuration }}
                        className="hidden md:grid grid-cols-3 gap-4 lg:gap-6 pt-8 lg:pt-12 border-t border-white/10"
                    >
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-blue shrink-0">
                                <Shield size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs lg:text-sm tracking-widest">SELF-HEALING</h3>
                                <p className="text-[10px] lg:text-xs text-text-grey uppercase font-bold tracking-tighter">Scratch Recovery</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-blue shrink-0">
                                <Droplets size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs lg:text-sm tracking-widest">HYDROPHOBIC</h3>
                                <p className="text-[10px] lg:text-xs text-text-grey uppercase font-bold tracking-tighter">Easy Maintenance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-blue shrink-0">
                                <Zap size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs lg:text-sm tracking-widest">NON-YELLOWING</h3>
                                <p className="text-[10px] lg:text-xs text-text-grey uppercase font-bold tracking-tighter">High Clarity</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DECORATIVE LINE */}
            <div className="absolute bottom-0 right-0 w-1/4 sm:w-1/3 h-[1px] bg-gradient-to-r from-transparent to-primary-blue opacity-50" />

            {/* Mobile scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden">
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                >
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </motion.div>
            </div>
        </section>
    );
}
