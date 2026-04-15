"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";
import { useGlobalStore } from "@/context/GlobalStore";

export default function ContactCards() {
    const { settings } = useGlobalStore();
    const config = settings || siteConfig;

    const whatsappNumber = config?.contact?.whatsapp?.number || siteConfig.contact.whatsapp.number;

    return (
        <section id="contact-cards" className="relative py-16 md:py-24 overflow-hidden bg-dark-bg" style={{ background: '#050505' }}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
