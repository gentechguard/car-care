"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, ArrowRight, CheckCircle2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";
import { useGlobalStore } from "@/context/GlobalStore";
import GlassSurface from "./GlassSurface";
import MetallicPaint from "./MetallicPaint";

export default function ContactForm() {
    const { settings } = useGlobalStore();
    const config = settings || siteConfig;

    const whatsappNumber = config?.contact?.whatsapp?.number || siteConfig.contact.whatsapp.number;
    const dealerMessage = config?.contact?.whatsapp?.defaultMessage || siteConfig.contact.whatsapp.defaultMessage;

    return (
        <section id="contact" className="relative pb-32 overflow-hidden bg-dark-bg">
            {/* Background Image */}
            <div className="hidden absolute inset-0 z-0">
                <Image
                    src="/assets/contact_bg.png"
                    alt="Contact Background"
                    fill
                    className="object-cover opacity-40 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-primary-blue/10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="hidden w-24 h-24 mx-auto mb-6 relative">
                            <Image
                                src="/assets/gentech-tall.png"
                                alt="Gentech Car Care"
                                fill
                                className="object-contain opacity-80"
                            />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 shadow-xl drop-shadow-2xl">
                            BECOME A GENTECH CAR CARE™ <span className="text-primary-blue">PARTNER</span>
                        </h2>
                        <p className="text-blue-200/80 text-lg font-bold tracking-widest uppercase">
                            Grow With a Premium Automotive Protection Brand
                        </p>
                    </motion.div>
                </div>

                {/* Become A Dealer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-primary-blue/20 to-dark-bg/50 backdrop-blur-xl group hover:border-primary-blue/30 transition-all duration-500">
                        {/* Dealer Background Effect */}
                        <div className="absolute inset-0 bg-[url('/assets/solutions_bg.png')] opacity-10 bg-cover bg-center mix-blend-overlay" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 p-8 md:p-16 items-center">
                            <div>
                                <h3 className="text-4xl md:text-6xl font-black text-white uppercase leading-none mb-2">
                                    Become A <br />
                                    <span className="text-primary-blue text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-cyan-300">
                                        Dealer
                                    </span>
                                </h3>
                                <p className="text-white/70 text-lg font-medium mb-8 max-w-md">
                                    Join our expanding dealer network and offer your customers globally-inspired automotive protection solutions backed by quality, training, and support.
                                </p>

                                <div className="space-y-4 mb-10">
                                    <DealerBenefit text="Quality Services & Training Support" />
                                    <DealerBenefit text="Marketing & Technical Assistance" />
                                    <DealerBenefit text="Growing Nationwide Network" />
                                </div>

                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { type: 'dealer' } }))}
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-blue to-blue-600 text-white px-6 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base hover:scale-105 hover:shadow-[0_0_30px_rgba(0,170,255,0.4)] transition-all duration-300 group-hover:animate-pulse-slow"
                                >
                                    Apply For Dealership
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Visual/Image Side */}
                            <div className="relative h-full min-h-[250px] md:min-h-[400px] flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-primary-blue/20 blur-[60px] rounded-full" />
                                <Image
                                    src="/assets/gentech-tall.png"
                                    alt="Gentech Badge"
                                    width={300}
                                    height={300}
                                    className="hidden relative z-10 drop-shadow-[0_0_50px_rgba(0,170,255,0.3)] animate-float"
                                />
                                <div className="h-40 w-40 md:h-64 md:w-64 justify-self-center">
                                    <MetallicPaint
                                        src="/assets/gentech-shield-bitmap.svg"
                                        params={{
                                            edge: 0.0,
                                            patternScale: 2,
                                            refraction: 0,
                                            speed: 0.3,
                                            liquid: 0.07
                                        }}
                                    />
                                </div>
                                <div className="h-16 w-48 md:h-24 md:w-80 justify-self-center">
                                    <MetallicPaint
                                        src="/assets/gentech-text-bitmap.svg"
                                        params={{
                                            edge: 0.0,
                                            patternScale: 2,
                                            refraction: 0,
                                            speed: 0.3,
                                            liquid: 0.07
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-32">
                    <ContactCard
                        icon={Phone}
                        title="Call Us"
                        value={config.contact.phone.display}
                        action="View PPF Solutions"
                        href="/home#product-showcase"
                        delay={0.1}
                    />
                    <ContactCard
                        icon={Mail}
                        title="Email Us"
                        value={config.contact.email}
                        action="View Sunfilm Solutions"
                        href="/home#product-showcase"
                        delay={0.2}
                    />
                    <ContactCard
                        icon={MessageCircle}
                        title="WhatsApp"
                        value={config.contact.phone.display}
                        action="Chat Now"
                        href={`https://wa.me/${whatsappNumber}`}
                        delay={0.3}
                        isWhatsApp
                    />
                </div>
            </div>
        </section>
    );
}

function ContactCard({ icon: Icon, title, value, action, href, delay, isWhatsApp }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="group relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
            <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-primary-blue/50 transition-all duration-300 flex flex-col items-center text-center group-hover:-translate-y-2 [container-type:inline-size]">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isWhatsApp ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white' : 'bg-primary-blue/10 text-primary-blue group-hover:bg-primary-blue group-hover:text-white'}`}>
                    <Icon size={32} />
                </div>

                <h4 className="text-white font-black text-[clamp(0.9rem,1.5rem,6cqi)] mb-2">{value}</h4>
                <p className="text-text-grey text-xs font-bold uppercase tracking-widest mb-8">{title}</p>

                <Link
                    href={href}
                    className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors"
                >
                    {action}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
}

function DealerBenefit({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-primary-blue/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-primary-blue" />
            </div>
            <span className="text-white/90 font-bold text-sm md:text-base">{text}</span>
        </div>
    );
}
