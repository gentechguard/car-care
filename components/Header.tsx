"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBackButton } from '@/hooks/useBackButton';

import { siteConfig } from "@/lib/site-config";

const navLinks = siteConfig.navigation;

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Browser back button closes the mobile menu
    useBackButton(isMenuOpen, () => setIsMenuOpen(false));

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 120);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const scrollToGetInTouch = () => {
        setIsMenuOpen(false);
        if (pathname === '/home') {
            document.getElementById('get-in-touch')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/home#get-in-touch';
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 ${
                scrolled ? "glass py-3" : "bg-transparent py-4 sm:py-5"
            }`}
            style={{
                background: scrolled
                    ? "linear-gradient(to right, #000 0%, #111 50%, #000 100%)"
                    : "linear-gradient(to right, #000 0%, transparent 100%)",
            }}
        >
            <div className="container mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link href="/home" className="relative z-10 shrink-0">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-36 md:w-48 h-10 md:h-12 relative"
                    >
                        <Image
                            src="/assets/logo-final-wide.png"
                            alt="Gentech Car Care"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden lg:flex items-center gap-4 xl:gap-7">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs xl:text-sm font-bold uppercase tracking-wider xl:tracking-widest text-text-grey hover:text-primary-blue transition-colors whitespace-nowrap"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <button
                        onClick={scrollToGetInTouch}
                        className="shrink-0 bg-primary-blue hover:bg-blue-600 text-white text-xs xl:text-sm font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors whitespace-nowrap"
                    >
                        Get In Touch
                    </button>
                </nav>

                {/* MOBILE TOGGLE */}
                <button
                    className="lg:hidden text-white p-2 relative z-10"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="lg:hidden fixed inset-0 z-[55] bg-[#0A0A0A] pt-20 pb-8 px-6 overflow-y-auto"
                    >
                        <nav className="flex flex-col gap-1 mt-4">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: 0.04 * i, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-lg py-3.5 font-bold uppercase tracking-widest text-white/80 hover:text-primary-blue flex items-center justify-between group border-b border-white/5"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                        <ChevronRight size={20} className="text-primary-blue opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Get In Touch button in mobile menu */}
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25, delay: 0.04 * navLinks.length, ease: [0.25, 0.1, 0.25, 1] }}
                                className="mt-4"
                            >
                                <button
                                    onClick={scrollToGetInTouch}
                                    className="w-full bg-primary-blue hover:bg-blue-600 text-white py-3.5 rounded-xl text-center font-bold uppercase tracking-wider text-lg transition-colors"
                                >
                                    Get In Touch
                                </button>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
