"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Shield, Zap, Droplets } from "lucide-react";
import { useRef } from "react";
import { EtherealFade } from "./EtherealFade";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { siteConfig } from "@/lib/site-config";

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
        title: "CERAMIC COATING",
        subtitle: "Long-lasting glossy shield with superior hydrophobic and UV protection"
    }, {
        id: "hero-5",
        url: "/assets/mobile-hero-5.png",
        title: "PREMIUM CAR WASH",
        subtitle: "Meticulous hand wash and decontamination for a spotless, showroom finish"
    }
];

export default function Hero() {
    const ref = useRef(null);
    const { isPhoneViewport, isClient } = useDeviceCapability();
    const prefersReducedMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Reduce parallax effect on mobile (including landscape phones) for better performance
    const yDesktop = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yMobile = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const y = isClient && isPhoneViewport ? yMobile : yDesktop;

    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Animation settings based on device
    const animationDuration = prefersReducedMotion ? 0.1 : (isPhoneViewport ? 0.5 : 0.8);
    const animationDelay = prefersReducedMotion ? 0 : (isPhoneViewport ? 0.1 : 0);

    return (
        <section
            ref={ref}
            className="hero-section relative min-h-[100dvh] w-full overflow-hidden bg-dark-bg flex items-start lg:items-center justify-center pt-16 sm:pt-20 lg:pt-20 pb-0"
        >
            {/* BACKGROUND: Static for Desktop, Carousel for Mobile */}
            <motion.div
                style={{ y, opacity: prefersReducedMotion ? 1 : opacity }}
                className="absolute inset-0 z-0 gpu-accelerated"
            >
                {/* Desktop Static Image */}
                <div className="hidden lg:block relative w-full h-full">
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
                <div className="block lg:hidden relative w-full h-full">
                    <EtherealFade images={carouselImages} interval={5000} />
                    <div className="hidden absolute inset-0 bg-gradient-to-t from-dark-bg via-black/20 to-transparent z-10" />
                </div>
            </motion.div>

            {/* CONTENT */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 lg:pt-0 relative z-10 w-full">
                <div className="max-w-4xl text-center lg:text-left mx-auto lg:mx-0">
                    <motion.div
                        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: animationDuration, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex flex-col items-center lg:items-start justify-center"
                    >
                        {/* Main Heading — always 3 lines, fluid size across every viewport */}
                        <h1
                            style={{ fontSize: 'clamp(1.125rem, 4.2vw, 3.75rem)' }}
                            className="font-black leading-[1.08] tracking-tight mb-2 sm:mb-3 whitespace-nowrap"
                        >
                            <span className="block">PREMIUM AUTOMOTIVE</span>
                            <span className="block gold-text tracking-wider">SURFACE PROTECTION</span>
                            <span className="block gold-text tracking-wider">SERVICE</span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-sm sm:text-base md:text-lg text-white/70 font-bold tracking-wide mb-4 sm:mb-6 italic">
                            Engineered to protect. Designed to impress.
                        </p>

                        {/* Description - Hidden on mobile and landscape phones for cleaner look */}
                        <p className="hero-description hidden sm:block text-sm sm:text-base md:text-lg text-text-grey max-w-xl mb-6 sm:mb-8 font-medium leading-relaxed">
                            Gentech Car Care provides premium detailing and protection services designed to keep your vehicle looking brand new. From advanced paint protection to professional maintenance, we safeguard your car’s finish against the elements with precision and expertise.
                        </p>

                        {/* CTA Buttons - Stack on mobile, row on larger screens */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto">
                            <a
                                href={`tel:${siteConfig.contact.phone.value}`}
                                className="bg-gradient-to-br from-[#F5C842] via-[#E8C879] to-[#8B6F1F] hover:from-white hover:to-white hover:via-white text-white hover:text-dark-bg px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-200 neon-glow flex items-center justify-center gap-2 group touch-manipulation active:scale-95"
                            >
                                CALL
                            </a>
                            <a
                                href="https://maps.app.goo.gl/kEQprRRWBQSNBd9k9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-br from-[#F5C842] via-[#E8C879] to-[#8B6F1F] hover:from-white hover:to-white hover:via-white text-white hover:text-dark-bg px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-200 neon-glow flex items-center justify-center touch-manipulation active:scale-95"
                            >
                                DIRECTIONS
                            </a>
                        </div>
                    </motion.div>

                    {/* MICRO FEATURES - Hidden on phones (portrait + landscape), visible on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: animationDelay + 0.4, duration: animationDuration }}
                        className="hidden lg:grid grid-cols-3 gap-4 lg:gap-6 pt-8 lg:pt-12 border-t border-white/10"
                    >
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-gold shrink-0">
                                <Shield size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs lg:text-sm tracking-widest">SELF-HEALING</h3>
                                <p className="text-[10px] lg:text-xs text-text-grey uppercase font-bold tracking-tighter">Scratch Recovery</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-gold shrink-0">
                                <Droplets size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs lg:text-sm tracking-widest">HYDROPHOBIC</h3>
                                <p className="text-[10px] lg:text-xs text-text-grey uppercase font-bold tracking-tighter">Easy Maintenance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-elevated-bg border border-white/10 flex items-center justify-center text-primary-gold shrink-0">
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
            <div className="absolute bottom-0 right-0 w-1/4 sm:w-1/3 h-[1px] bg-gradient-to-r from-transparent to-primary-gold opacity-50" />

            {/* Mobile scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden">
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
