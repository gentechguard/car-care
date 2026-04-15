"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Linkedin, Globe, ArrowUpRight, Zap } from "lucide-react";
import MetallicPaint, { parseLogoImage } from "./MetallicPaint";
import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site-config";
import { useGlobalStore } from "@/context/GlobalStore";

const navLinks = siteConfig.navigation;

// We will map products inside the component

export default function Footer() {
    const { products, settings } = useGlobalStore();

    // Prefer dynamic settings from DB, fallback to static siteConfig
    const config = settings || siteConfig;

    // Compute dynamic product links
    const productsLinks = products.length > 0
        ? products.map(p => p.name)
        : config.productCategories;

    return (
        <footer className="relative bg-[#030303] overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-blue/50 to-transparent" />

            {/* Decorative Background */}
            <div className="hidden absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-blue/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Main Grid */}
            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-8 md:gap-8 lg:gap-8 pt-16 pb-8 border-y border-white/5">
                    {/* Brand Column */}
                    <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-4">
                        <Link href="/home" className="inline-block mb-6">
                            <div className="w-48 h-12 relative">
                                <Image
                                    src="/assets/logo-final-wide.png"
                                    alt="Gentech Car Care"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-text-grey text-sm font-medium leading-relaxed mb-6 max-w-sm">
                            Premium Automotive Protection Solutions
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {Object.entries(config.socials || {}).map(([key, href]) => {
                                // Dynamic Icon Mapping
                                const iconMap: Record<string, any> = {
                                    instagram: Instagram,
                                    facebook: Facebook,
                                    youtube: Youtube,
                                    linkedin: Linkedin
                                };
                                const Icon = iconMap[key.toLowerCase()] || Globe;

                                return (
                                    <a
                                        key={key}
                                        href={href as string}
                                        aria-label={key}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-grey hover:text-white hover:border-primary-blue hover:bg-primary-blue/10 transition-all duration-300"
                                    >
                                        <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <h4 className="text-[11px] font-black text-primary-blue tracking-[0.3em] uppercase mb-6">Navigation</h4>
                        <ul className="flex flex-col gap-3">
                            {navLinks.map((item: any) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="group flex items-center gap-2 text-text-grey hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <span className="w-0 h-[2px] bg-primary-blue group-hover:w-3 transition-all duration-300" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Products */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <h4 className="text-[11px] font-black text-primary-blue tracking-[0.3em] uppercase mb-6">Products</h4>
                        <ul className="flex flex-col gap-3">
                            {productsLinks.map((item: string) => (
                                <li key={item}>
                                    <Link
                                        href="/home#product-showcase"
                                        className="group flex items-center gap-2 text-text-grey hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <span className="w-0 h-[2px] bg-primary-blue group-hover:w-3 transition-all duration-300" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="row-start-2 sm:row-start-1 sm:!col-end-[-1] col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-4 md:row-start-1 md:!col-end-[-1]">
                        <h4 className="text-[11px] font-black text-primary-blue tracking-[0.3em] uppercase mb-6">Get In Touch</h4>
                        <ul className="flex flex-row flex-wrap sm:flex-col gap-5">
                            <li className="group flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-blue group-hover:border-primary-blue/50 transition-colors shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-grey uppercase font-black tracking-widest mb-1">Call Us</p>
                                    <a href={`tel:${config.contact.phone.value}`} className="text-white font-bold text-sm hover:text-primary-blue transition-colors">{config.contact.phone.display}</a>
                                </div>
                            </li>
                            <li className="group flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-blue group-hover:border-primary-blue/50 transition-colors shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-grey uppercase font-black tracking-widest mb-1">Email</p>
                                    <a href={`mailto:${config.contact.email}`} className="text-white font-bold text-sm hover:text-primary-blue transition-colors">{config.contact.email}</a>
                                </div>
                            </li>
                            <li className="group flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-blue group-hover:border-primary-blue/50 transition-colors shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-grey uppercase font-black tracking-widest mb-1">Headquarters</p>
                                    <a href={config.contact.address.mapLink} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm hover:text-primary-blue transition-colors">{config.contact.address.line2}</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="py-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-text-grey/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-primary-blue" />
                            {config.company.copyright}
                        </p>
                        <p className="text-text-grey/40 text-[10px] font-medium tracking-wide">
                            {config.company.trademarkNotice || "™ denotes an unregistered trademark. Registration pending."}
                        </p>
                    </div>
                    <div className="flex gap-8">
                        <span className="text-text-grey/40 text-xs font-bold uppercase tracking-widest cursor-default">Privacy Policy</span>
                        <span className="text-text-grey/40 text-xs font-bold uppercase tracking-widest cursor-default">Terms of Service</span>
                    </div>
                </div>
            </div>

            {/* Giant Background Text */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-0">
                <div className="text-[20vw] font-black text-white/[0.015] uppercase tracking-tighter leading-none whitespace-nowrap translate-y-1/3">
                    {config.company.name}
                </div>
            </div>

            {/* Metallic Paint Effect */}
            <div className="hidden md:block absolute bottom-0 top-0 right-[-10%] lg:right-[-4%] z-0 mx-auto opacity-10 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
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

        </footer>
    );
}
