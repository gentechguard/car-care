"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { useGlobalStore } from "@/context/GlobalStore";

export default function ContactCards() {
    const { settings } = useGlobalStore();
    const config = settings || siteConfig;

    const whatsappNumber = config?.contact?.whatsapp?.number || siteConfig.contact.whatsapp.number;

    return (
        <section id="contact-cards" className="relative py-16 md:py-24 overflow-hidden bg-dark-bg" style={{ background: '#050505' }}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <ContactCard
                        icon={Phone}
                        title="Call Us"
                        value={config.contact.phone.display}
                        href={`tel:${config.contact.phone.value}`}
                        delay={0.1}
                    />
                    <ContactCard
                        icon={Mail}
                        title="Email Us"
                        value={config.contact.email}
                        href={`mailto:${config.contact.email}?subject=${encodeURIComponent("Inquiry from Gentech Car Care website")}`}
                        delay={0.2}
                        isEmail
                    />
                    <ContactCard
                        icon={MessageCircle}
                        title="Chat Now"
                        value={config.contact.phone.display}
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I have an inquiry about your services.")}`}
                        delay={0.3}
                        isWhatsApp
                    />
                </div>
            </div>
        </section>
    );
}

function ContactCard({ icon: Icon, title, value, href, delay, isWhatsApp, isEmail }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="group relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
            <a
                href={href}
                target={isWhatsApp ? "_blank" : undefined}
                rel={isWhatsApp ? "noopener noreferrer" : undefined}
                className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-primary-blue/50 transition-all duration-300 flex flex-col items-center text-center group-hover:-translate-y-2"
            >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isWhatsApp ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white' : 'bg-primary-blue/10 text-primary-blue group-hover:bg-primary-blue group-hover:text-white'}`}>
                    <Icon size={32} />
                </div>

                <h4 className={`text-white font-black mb-2 ${isEmail ? 'text-sm lg:text-base break-all' : 'text-xl lg:text-2xl break-all'}`}>{value}</h4>
                <p className="text-text-grey text-xs font-bold uppercase tracking-widest">{title}</p>
            </a>
        </motion.div>
    );
}
