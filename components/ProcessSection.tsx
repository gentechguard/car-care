"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ShieldCheck, Brush, Droplets, CheckCircle2, Award, Zap, Paintbrush } from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Surface Preparation",
        subtitle: "Washing, Decontamination & Inspection",
        details: ["Thorough vehicle washing", "Surface decontamination", "Multi-point inspection to ensure flawless product performance"],
        image: "/assets/steps/prep.png",
        icon: Brush
    },
    {
        id: "02",
        title: "Precision Installation",
        subtitle: "Expert Application & Alignment",
        details: ["Trained professional application", "Advanced tools for perfect alignment", "Precision fit and finish"],
        image: "/assets/steps/application.png",
        icon: Droplets
    },
    {
        id: "03",
        title: "Curing & Quality Check",
        subtitle: "Final Inspection & Delivery",
        details: ["Final curing process", "Edge sealing", "Multi-point quality inspection before delivery"],
        image: "/assets/steps/finishing.png",
        icon: ShieldCheck
    }
];

export default function ProcessSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end 1"]
    });

    const springPath = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const pathLength = useTransform(springPath, [0, 1], [0, 1]);

    return (
        <section id="process" className="py-32 bg-dark-bg relative overflow-hidden" ref={containerRef}>
            {/* Header */}
            <div className="container mx-auto px-4 md:px-8 mb-24 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-primary-blue font-black tracking-[0.3em] uppercase text-xs mb-4 inline-block"
                >
                    Our Process
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter"
                >
                    PRECISION. EXPERTISE. <span className="blue-text italic text-3xl md:text-7xl">QUALITY CONTROL</span>
                </motion.h2>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative">
                {/* Connecting Path (Mobile: Hidden, Desktop: Shown) */}
                <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-white/5 hidden lg:block">
                    <motion.div
                        style={{ height: "100%", scaleY: pathLength, originY: 0 }}
                        className="w-full bg-primary-blue shadow-[0_0_15px_rgba(0,170,255,0.5)]"
                    />
                </div>

                <div className="flex flex-col gap-32">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24 relative z-10`}
                        >
                            {/* Visual Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="flex-1 w-full"
                            >
                                <div className="group relative aspect-[16/10] rounded-[3rem] overflow-hidden border border-white/10 glass">
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60" />

                                    {/* Number Overlay */}
                                    <div className="absolute top-8 left-8 w-16 h-16 rounded-3xl bg-primary-blue/20 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-2xl text-white">
                                        {step.id}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Node Dot (Lg Only) */}
                            <div className="absolute left-[50%] -translate-x-1/2 w-4 h-4 rounded-full bg-dark-bg border-4 border-primary-blue hidden lg:block" />

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex-1 w-full text-center ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'}`}
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-blue/10 text-primary-blue mb-8 border border-primary-blue/20`}>
                                    <step.icon size={28} />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{step.title}</h3>
                                <p className="text-primary-blue font-bold uppercase tracking-widest text-xs mb-8 italic">{step.subtitle}</p>

                                <ul className={`space-y-4 inline-block text-left ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'}`}>
                                    {step.details.map((detail, i) => (
                                        <li key={i} className={`flex items-start gap-3 text-text-grey font-medium ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                                            <CheckCircle2 size={16} className="text-primary-blue shrink-0 mt-1" />
                                            <span className="leading-snug">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}
