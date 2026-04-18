"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Flame, Zap, Droplets, Shield, Sun, CheckCircle2, Waves, Diamond, Maximize, ArrowRight } from "lucide-react";
import Link from "next/link";

const coreUSPs = [
    {
        title: "Self-Healing Technology",
        description: "Light scratches disappear with heat activation, keeping your vehicle looking flawless.",
        icon: Flame,
        color: "from-[#8B6F1F] to-[#D4AF37]",
        size: "small"
    },
    {
        title: "Non-Yellowing Materials",
        description: "High-clarity materials that maintain crystal-clear transparency over time.",
        icon: Sun,
        color: "from-[#8B6F1F] to-[#8B6F1F]",
        size: "small"
    },
    {
        title: "Hyperhydrophobic Surface",
        description: "Advanced water-repellent surface for easy maintenance and effortless cleaning.",
        icon: Waves,
        color: "from-[#D4AF37] to-[#F5C842]",
        size: "small"
    },
    {
        title: "Built for Indian Conditions",
        description: "Designed specifically for Indian road and climate conditions — heat, dust, and harsh UV.",
        icon: Shield,
        color: "from-[#8B6F1F] to-[#5A4812]",
        size: "small"
    },
    {
        title: "Professional Installation",
        description: "Recommended professional installation for optimal performance and warranty coverage.",
        icon: Diamond,
        color: "from-[#8B6F1F] to-[#D4AF37]",
        size: "small"
    },
    {
        title: "Long-Term Durability",
        description: "Engineered for lasting clarity, durability, and performance without compromising your vehicle's beauty.",
        icon: Maximize,
        color: "from-[#5A4812] to-[#3A2C10]",
        size: "small"
    }
];

const technicalSpecs = [
    "Self-Healing Technology",
    "Non-Yellowing High-Clarity",
    "Hyperhydrophobic Surface",
    "Stone-Chip Resistance",
    "UV & Heat Protection",
    "Chemical Resistant Topcoat",
    "Anti-Oxidation Layer",
    "Acid Rain Resistance",
    "Swirl Resistance",
    "Optimized Adhesion"
];

export default function WhySection() {
    return (
        <section id="about" className="py-16 sm:py-20 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #070604 0%, #0f0c06 25%, #15100a 50%, #0f0c06 75%, #070604 100%)' }}>
            {/* Background Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-gold/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#5A4812]/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#3A2C10]/8 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />
            {/* Subtle grid texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.45) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="max-w-3xl mb-16">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-primary-gold font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-lg sm:text-xl md:text-2xl mb-4 inline-block"
                    >
                        Why Gentech Car Care™
                    </motion.h3>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tighter"
                    >
                        PROTECTION THAT GOES <span className="gold-text font-black uppercase">BEYOND THE SURFACE</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-text-grey text-base sm:text-lg font-medium leading-relaxed"
                    >
                        Our products are developed using advanced material science to deliver long-lasting clarity, durability, and performance—without compromising your vehicle&apos;s original beauty.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* BENTO GRID OF CORE USPs */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {coreUSPs.map((usp, index) => (
                            <motion.div
                                key={usp.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`glass p-8 rounded-[2.5rem] border border-white/[0.08] flex flex-col items-start group relative overflow-hidden bg-white/[0.02] backdrop-blur-sm hover:border-[#D4AF37]/20 transition-all duration-500 ${usp.size === "large" ? "md:col-span-2" : "col-span-1"
                                    }`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${usp.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${usp.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <usp.icon className="text-white" size={28} />
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">
                                    {usp.title}
                                </h3>
                                <p className="text-text-grey text-sm leading-relaxed font-medium">
                                    {usp.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* TECHNICAL MATRIX SIDEBAR */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="glass p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex-grow"
                        >
                            <h4 className="text-primary-gold font-black tracking-widest uppercase text-xs mb-8 flex items-center gap-2">
                                <ShieldCheck size={16} />
                                Technical Protection Matrix
                            </h4>
                            <ul className="space-y-4">
                                {technicalSpecs.map((spec, idx) => (
                                    <motion.li
                                        key={spec}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        className="flex items-center gap-3 text-sm font-bold text-white/80 group/spec"
                                    >
                                        <CheckCircle2 size={16} className="text-primary-gold shrink-0 group-hover/spec:scale-125 transition-transform" />
                                        <span className="uppercase tracking-tight">{spec}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="mt-12 p-6 rounded-2xl bg-primary-gold/10 border border-primary-gold/20">
                                <p className="text-[10px] font-black text-primary-gold uppercase tracking-widest mb-2">Verified Standard</p>
                                <p className="text-xs text-white/50 font-medium">
                                    All Gentech Car Care™ products undergo rigorous testing for clarity and durability.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Ultra-Fancy Neon Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-24 flex justify-center"
                >
                    <Link
                        href="/home#product-showcase"
                        className="group relative inline-flex items-center px-1 py-1 rounded-full overflow-hidden transition-all duration-500 scale-110 md:scale-125"
                    >
                        {/* 1. Revolving Border Layer */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            //className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_20%,var(--primary-gold)_50%,transparent_80%)] opacity-40 group-hover:opacity-100 transition-opacity"
                            className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_20%,var(--primary-gold)_50%,transparent_80%)] opacity-80 group-hover:opacity-100 transition-opacity"
                        />

                        {/* 2. Inner Button Body */}
                        <div className="relative max-w-[80dvw] z-10 flex items-center gap-6 px-10 py-4 bg-[#070604] rounded-full border border-white/5 group-hover:bg-primary-gold transition-colors">
                            <span className="text-white font-black uppercase tracking-[0.3em] text-[11px] md:text-sm">
                                Discover Our Heritage
                            </span>

                            {/* Neon Icon Circle */}
                            <div className="flex items-center justify-center h-10 aspect-square rounded-full bg-primary-gold text-white shadow-[0_0_20px_rgba(212,175,55,0.8)] group-hover:scale-110 group-hover:bg-white group-hover:text-primary-gold transition-transform">
                                <ArrowRight size={20} />
                            </div>
                        </div>

                        {/* 3. Outer Aura (Glow) */}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 blur-2xl bg-primary-gold transition-opacity duration-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary-gold/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping-slow pointer-events-none" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
