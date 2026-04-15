"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MetallicPaint from "./MetallicPaint";
import Beams from "./Beams";

export default function MobileSplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
                // Hide after 5 seconds
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 15000);
                return () => clearTimeout(timer);
            } else {
                setIsMobile(false);
                setIsVisible(false);
            }
        };

        checkDevice();
    }, []);

    if (!isMobile) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8"
                >
                    <div
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="fixed inset-0">
                            <Beams
                                beamWidth={2.0}
                                beamHeight={25}
                                beamNumber={50}
                                speed={2.5}
                                noiseIntensity={3.5}
                                scale={0.15}
                                rotation={25}
                            />
                        </div>
                        <Image
                            src="/assets/logo-final-wide.png"
                            alt="Gentech Car Care"
                            width={240}
                            height={80}
                            className="object-contain w-full h-auto hidden"
                            priority
                        />
                        <div className="h-48 w-48 justify-self-center">
                            <MetallicPaint
                                src="/assets/gentech-shield-bitmap.svg"
                                params={{
                                    edge: 0.0,
                                    patternScale: 2,
                                    speed: 0.3,
                                    liquid: 0.05
                                }}
                            />
                        </div>
                        <div className="h-24 w-80 justify-self-center">
                            <MetallicPaint
                                src="/assets/gentech-text-bitmap.svg"
                                params={{
                                    edge: 0.0,
                                    patternScale: 2,
                                    speed: 0.3,
                                    liquid: 0.05
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
