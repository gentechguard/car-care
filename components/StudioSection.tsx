"use client";

import { motion } from "framer-motion";
import { Globe2, Award, UserCheck, ClipboardCheck, Sparkles } from "lucide-react";

const pillars = [
    {
        title: "Globally Sourced Materials",
        description:
            "Every film, coating, and compound we install is imported from certified international manufacturers — selected for optical clarity, molecular stability, and proven field performance across the world's most demanding climates.",
        icon: Globe2,
        color: "from-[#8B6F1F] to-[#D4AF37]",
    },
    {
        title: "20+ Years of Mastery",
        description:
            "Two decades of hands-on expertise in paint protection, surface science, and advanced detailing — distilled into a craft that pairs engineering precision with artisanal finish.",
        icon: Award,
        color: "from-[#D4AF37] to-[#F5C842]",
    },
    {
        title: "Credentialed Applicators",
        description:
            "Our technicians are rigorously trained and internationally certified — each installation is calibrated to manufacturer specification, with a level of consistency only seasoned hands can deliver.",
        icon: UserCheck,
        color: "from-[#8B6F1F] to-[#5A4812]",
    },
    {
        title: "SOP-Driven Excellence",
        description:
            "From intake to handover, every square inch is governed by a documented Standard Operating Procedure — no shortcuts, no guesswork, only measurable, repeatable quality.",
        icon: ClipboardCheck,
        color: "from-[#5A4812] to-[#3A2C10]",
    },
];

const stats = [
    { value: "20+", label: "Years of Industry Experience" },
    { value: "100%", label: "Globally Sourced Raw Materials" },
    { value: "Certified", label: "Master Applicators" },
    { value: "SOP", label: "Governed Installation Protocol" },
];

export default function StudioSection() {
    return (
        <section
            id="studio"
            className="relative py-20 md:py-28 overflow-hidden"
            style={{
                background:
                    "linear-gradient(180deg, #070604 0%, #0f0c06 40%, #15100a 60%, #070604 100%)",
            }}
        >
            {/* Background glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-primary-gold/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#8B6F1F]/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#3A2C10]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(212,175,55,0.45) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-gold/30 bg-primary-gold/5 mb-6"
                    >
                        <Sparkles size={14} className="text-primary-gold" />
                        <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-primary-gold">
                            The Studio
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6"
                    >
                        Where <span className="gold-text">Craftsmanship</span>
                        <br className="hidden md:block" /> Meets{" "}
                        <span className="gold-text">Chemistry</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-text-grey text-base md:text-lg leading-relaxed font-medium max-w-3xl mx-auto"
                    >
                        At Gentech Car Care, we are more than a studio — we are a
                        discipline. Every square inch of film we apply carries the weight
                        of{" "}
                        <span className="text-white font-bold">
                            two decades of hands-on mastery
                        </span>
                        , globally sourced materials, and an uncompromising commitment to
                        protocol. Our applicators are credentialed craftsmen who have
                        shaped their skill under international installation standards, and
                        every vehicle that enters our bay is governed by a rigorous
                        Standard Operating Procedure — from intake inspection to the final
                        polish before delivery.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-text-grey/80 text-sm md:text-base leading-relaxed font-medium max-w-3xl mx-auto mt-6 italic"
                    >
                        This is protection elevated to an art form — precise, measured,
                        and built to last.
                    </motion.p>
                </div>

                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden mb-16 md:mb-20"
                >
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            className="bg-[#0a0805] px-6 py-8 md:py-10 text-center flex flex-col items-center justify-center gap-2 hover:bg-primary-gold/5 transition-colors"
                        >
                            <motion.p
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + idx * 0.1 }}
                                className="gold-text text-3xl md:text-5xl font-black tracking-tight"
                            >
                                {stat.value}
                            </motion.p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-text-grey leading-tight">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Pillars grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pillars.map((pillar, idx) => (
                        <motion.div
                            key={pillar.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass relative p-8 md:p-10 rounded-[2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-primary-gold/25 transition-all duration-500 group overflow-hidden"
                        >
                            <div
                                className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`}
                            />

                            <div
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                            >
                                <pillar.icon className="text-white" size={26} />
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">
                                {pillar.title}
                            </h3>
                            <p className="text-text-grey text-sm md:text-base leading-relaxed font-medium">
                                {pillar.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
