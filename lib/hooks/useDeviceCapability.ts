'use client';

import { useState, useEffect, useMemo } from 'react';

interface DeviceCapability {
    // Device type
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;

    // Orientation + pointer — true source of truth for "treat as mobile"
    orientation: 'portrait' | 'landscape';
    isCoarsePointer: boolean;
    isPhoneViewport: boolean;

    // Screen info
    screenWidth: number;
    screenHeight: number;

    // Performance indicators
    isLowEndDevice: boolean;
    supportsWebGL: boolean;
    supportsWebGL2: boolean;
    prefersReducedMotion: boolean;

    // Touch capability
    isTouchDevice: boolean;

    // Connection info (if available)
    isSlowConnection: boolean;

    // Client-side ready flag
    isClient: boolean;
}

const defaultCapabilities: DeviceCapability = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    isCoarsePointer: false,
    isPhoneViewport: false,
    screenWidth: 1920,
    screenHeight: 1080,
    isLowEndDevice: false,
    supportsWebGL: true,
    supportsWebGL2: true,
    prefersReducedMotion: false,
    isTouchDevice: false,
    isSlowConnection: false,
    isClient: false,
};

// Check WebGL support
function checkWebGLSupport(): { webgl: boolean; webgl2: boolean } {
    if (typeof window === 'undefined') {
        return { webgl: true, webgl2: true };
    }

    try {
        const canvas = document.createElement('canvas');
        const webgl2 = !!(canvas.getContext('webgl2'));
        const webgl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        return { webgl, webgl2 };
    } catch {
        return { webgl: false, webgl2: false };
    }
}

// Estimate device performance based on available hints
function estimateDevicePerformance(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return true;

    // Check device memory (if available)
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory && nav.deviceMemory < 4) return true;

    // Check if it's a mobile device with slow indicators
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    // On mobile, be more conservative
    if (isMobileUA && cores <= 4) return true;

    return false;
}

// Check for slow network connection
function checkSlowConnection(): boolean {
    if (typeof navigator === 'undefined') return false;

    const nav = navigator as Navigator & {
        connection?: {
            effectiveType?: string;
            saveData?: boolean;
        };
    };

    if (nav.connection) {
        // Check if user has data saver enabled
        if (nav.connection.saveData) return true;

        // Check effective connection type
        const slowTypes = ['slow-2g', '2g', '3g'];
        if (nav.connection.effectiveType && slowTypes.includes(nav.connection.effectiveType)) {
            return true;
        }
    }

    return false;
}

export function useDeviceCapability(): DeviceCapability {
    const [capabilities, setCapabilities] = useState<DeviceCapability>(defaultCapabilities);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateCapabilities = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Device type detection based on screen width
            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;
            const isDesktop = width >= 1024;

            // Orientation
            const orientation: 'portrait' | 'landscape' = width > height ? 'landscape' : 'portrait';

            // Pointer coarseness — true for phones/tablets regardless of orientation
            const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

            // True source of truth for "render the mobile layout".
            // Stays in sync with the CSS `lg:` breakpoint (1024) so that JS and CSS
            // agree on when to show the mobile vs desktop layout. Landscape phones
            // (width ≥ 1024 but coarse pointer with collapsed height) are also
            // treated as phones — prevents Galaxy Fold / ultrawide phones from
            // dropping into the desktop layout when rotated.
            const isPhoneViewport = width < 1024 || (isCoarsePointer && height < 500);

            // Check WebGL support
            const webglSupport = checkWebGLSupport();

            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Check touch capability
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // Estimate device performance
            const isLowEndDevice = estimateDevicePerformance();

            // Check connection speed
            const isSlowConnection = checkSlowConnection();

            setCapabilities({
                isMobile,
                isTablet,
                isDesktop,
                orientation,
                isCoarsePointer,
                isPhoneViewport,
                screenWidth: width,
                screenHeight: height,
                isLowEndDevice,
                supportsWebGL: webglSupport.webgl,
                supportsWebGL2: webglSupport.webgl2,
                prefersReducedMotion,
                isTouchDevice,
                isSlowConnection,
                isClient: true,
            });
        };

        // Initial check
        updateCapabilities();

        // Listen for resize events (fires on rotation too)
        window.addEventListener('resize', updateCapabilities);

        // Explicit orientation listener for devices where resize lags behind rotation
        const orientationQuery = window.matchMedia('(orientation: landscape)');
        const handleOrientationChange = () => updateCapabilities();
        orientationQuery.addEventListener('change', handleOrientationChange);

        // Pointer coarseness can change (external mouse plugged into tablet)
        const pointerQuery = window.matchMedia('(pointer: coarse)');
        const handlePointerChange = () => updateCapabilities();
        pointerQuery.addEventListener('change', handlePointerChange);

        // Listen for reduced motion preference changes
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = () => updateCapabilities();
        motionQuery.addEventListener('change', handleMotionChange);

        return () => {
            window.removeEventListener('resize', updateCapabilities);
            orientationQuery.removeEventListener('change', handleOrientationChange);
            pointerQuery.removeEventListener('change', handlePointerChange);
            motionQuery.removeEventListener('change', handleMotionChange);
        };
    }, []);

    return capabilities;
}

// Simple hook that just returns if we should use lightweight animations
export function useShouldReduceAnimations(): boolean {
    const { isMobile, isLowEndDevice, prefersReducedMotion, isSlowConnection, isClient } = useDeviceCapability();

    // On server, assume full animations
    if (!isClient) return false;

    // Reduce animations if any of these conditions are true
    return prefersReducedMotion || isLowEndDevice || isSlowConnection;
}

// Simple hook for checking if WebGL should be used
export function useShouldUseWebGL(): boolean {
    const {
        isMobile,
        isLowEndDevice,
        supportsWebGL2,
        prefersReducedMotion,
        isSlowConnection,
        isClient
    } = useDeviceCapability();

    // On server, assume WebGL is available
    if (!isClient) return true;

    // Don't use WebGL if:
    // - Device doesn't support WebGL2
    // - User prefers reduced motion
    // - Mobile device (too heavy)
    // - Low-end device
    // - Slow connection
    if (!supportsWebGL2) return false;
    if (prefersReducedMotion) return false;
    if (isMobile) return false;
    if (isLowEndDevice) return false;
    if (isSlowConnection) return false;

    return true;
}

export default useDeviceCapability;
