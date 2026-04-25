'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
    Phone,
    MessageCircle,
    Globe,
    Instagram,
    Facebook,
    MapPin,
    Mail,
    Copy,
    Check,
} from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useShouldReduceAnimations } from '@/lib/hooks/useDeviceCapability';

const WEBSITE_URL = 'https://www.gentechcarcare.com/home/';

async function copyText(value: string): Promise<boolean> {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    } catch {
        // fall through to legacy fallback
    }

    if (typeof document === 'undefined') return false;
    try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

export default function ConnectPage() {
    const reduceMotion = useShouldReduceAnimations();
    const [phoneCopied, setPhoneCopied] = useState(false);
    const [addressCopied, setAddressCopied] = useState(false);

    const phoneDisplay = siteConfig.contact.phone.display;
    const phoneTel = siteConfig.contact.phone.value;
    const email = siteConfig.contact.email;
    const whatsappNumber = siteConfig.contact.whatsapp.number;
    const addressFull = siteConfig.contact.address.fullAddress;
    const mapLink = siteConfig.contact.address.mapLink;
    const instagramUrl = siteConfig.socials.instagram;
    const facebookUrl = siteConfig.socials.facebook;

    const handleCopyPhone = useCallback(async () => {
        const ok = await copyText(phoneDisplay);
        if (ok) {
            setPhoneCopied(true);
            toast.success('Phone number copied');
            setTimeout(() => setPhoneCopied(false), 1500);
        } else {
            toast.error('Could not copy. Please copy manually.');
        }
    }, [phoneDisplay]);

    const handleCopyAddress = useCallback(async () => {
        const ok = await copyText(addressFull);
        if (ok) {
            setAddressCopied(true);
            toast.success('Address copied');
            setTimeout(() => setAddressCopied(false), 1500);
        } else {
            toast.error('Could not copy. Please copy manually.');
        }
    }, [addressFull]);

    const fade = (delay: number) => ({
        initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] as const },
    });

    return (
        <main className="relative min-h-[100dvh] bg-[#070604] text-white selection:bg-primary-gold selection:text-black overflow-hidden">
            {/* Ambient gold glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(212,175,55,0.08), transparent 60%)',
                }}
            />

            <Toaster
                position="top-center"
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#141210',
                        color: '#fff',
                        border: '1px solid rgba(212,175,55,0.35)',
                    },
                }}
            />

            <div className="mx-auto w-full max-w-xl px-5 pt-10 pb-12 sm:pt-14 sm:pb-16 safe-top safe-bottom">
                {/* Hero */}
                <motion.section
                    {...fade(0)}
                    className="flex flex-col items-center text-center"
                >
                    <div className="relative w-[220px] sm:w-[260px] aspect-[5/2]">
                        <Image
                            src="/assets/logo-final-wide.png"
                            alt="Gentech Car Care logo"
                            fill
                            sizes="260px"
                            priority
                            className="object-contain"
                        />
                    </div>

                    <h1 className="mt-5 text-2xl sm:text-3xl font-semibold text-primary-gold">
                        Gentech Car Care
                    </h1>

                    <p className="mt-3 text-sm sm:text-base text-white/80 tracking-wide uppercase">
                        Premium Automotive Protection Solutions
                    </p>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 normal-case">
                        Connect with us instantly for car care, paint protection film, coatings, sun film, and detailing services.
                    </p>
                </motion.section>

                {/* Primary actions */}
                <motion.section
                    {...fade(0.1)}
                    aria-label="Primary contact actions"
                    className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                    <a
                        href={`tel:${phoneTel}`}
                        className="group relative flex items-center justify-center gap-3 rounded-2xl bg-primary-gold px-5 py-4 text-base font-semibold text-black shadow-[0_8px_30px_-12px_rgba(212,175,55,0.6)] transition-all duration-200 hover:bg-gold-bright active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604] min-h-[60px] touch-manipulation"
                    >
                        <Phone className="h-5 w-5" aria-hidden />
                        <span>Call Now</span>
                    </a>

                    <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-semibold text-white shadow-[0_8px_30px_-12px_rgba(37,211,102,0.55)] transition-all duration-200 hover:bg-[#1ebe57] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604] min-h-[60px] touch-manipulation"
                    >
                        <MessageCircle className="h-5 w-5" aria-hidden />
                        <span>WhatsApp</span>
                    </a>

                    <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center gap-3 rounded-2xl glass-card px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:border-primary-gold/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604] min-h-[60px] touch-manipulation"
                    >
                        <MapPin className="h-5 w-5 text-primary-gold" aria-hidden />
                        <span>Directions</span>
                    </a>
                </motion.section>

                {/* Secondary links */}
                <motion.section
                    {...fade(0.2)}
                    aria-label="Profiles and channels"
                    className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <SecondaryLink
                        href={WEBSITE_URL}
                        icon={<Globe className="h-5 w-5" aria-hidden />}
                        label="Website"
                        external
                    />
                    <SecondaryLink
                        href={instagramUrl}
                        icon={<Instagram className="h-5 w-5" aria-hidden />}
                        label="Instagram"
                        external
                    />
                    <SecondaryLink
                        href={facebookUrl}
                        icon={<Facebook className="h-5 w-5" aria-hidden />}
                        label="Facebook"
                        external
                    />
                    <SecondaryLink
                        href={`mailto:${email}`}
                        icon={<Mail className="h-5 w-5" aria-hidden />}
                        label="Email Us"
                    />
                </motion.section>

                {/* Utility row */}
                <motion.section
                    {...fade(0.3)}
                    aria-label="Quick copy"
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                    <UtilityButton
                        onClick={handleCopyPhone}
                        copied={phoneCopied}
                        label="Copy Phone Number"
                        sublabel={phoneDisplay}
                    />
                    <UtilityButton
                        onClick={handleCopyAddress}
                        copied={addressCopied}
                        label="Copy Address"
                        sublabel={addressFull}
                    />
                </motion.section>

                {/* Bottom */}
                <motion.footer
                    {...fade(0.4)}
                    className="mt-10 flex flex-col items-center text-center"
                >
                    <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-primary-gold/90">
                        Scan. Connect. Drive Protected.
                    </p>
                    <p className="mt-3 text-[11px] text-white/40 normal-case tracking-normal">
                        {siteConfig.company.copyright}
                    </p>
                </motion.footer>
            </div>
        </main>
    );
}

function SecondaryLink({
    href,
    icon,
    label,
    external,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    external?: boolean;
}) {
    const externalProps = external
        ? { target: '_blank' as const, rel: 'noopener noreferrer' }
        : {};
    return (
        <a
            href={href}
            {...externalProps}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl glass-card px-3 py-4 text-center text-sm font-medium text-white/90 transition-all duration-200 hover:border-primary-gold/50 hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604] min-h-[80px] touch-manipulation"
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-gold/10 text-primary-gold transition-colors group-hover:bg-primary-gold/20">
                {icon}
            </span>
            <span className="normal-case tracking-normal">{label}</span>
        </a>
    );
}

function UtilityButton({
    onClick,
    copied,
    label,
    sublabel,
}: {
    onClick: () => void;
    copied: boolean;
    label: string;
    sublabel: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-live="polite"
            className="group flex items-center justify-between gap-3 rounded-2xl glass-card px-4 py-3 text-left transition-all duration-200 hover:border-primary-gold/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604] min-h-[64px] touch-manipulation"
        >
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white normal-case tracking-normal">
                    {label}
                </span>
                <span className="block truncate text-xs text-white/50 normal-case tracking-normal">
                    {sublabel}
                </span>
            </span>
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    copied
                        ? 'bg-primary-gold text-black'
                        : 'bg-white/5 text-primary-gold group-hover:bg-primary-gold/20'
                }`}
                aria-hidden
            >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </span>
        </button>
    );
}
