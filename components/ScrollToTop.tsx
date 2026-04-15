"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount — only scroll on actual navigation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // If there's a hash in the URL (e.g. #warranty-portal), let the browser handle it
    if (window.location.hash) return;

    // Force instant scroll to top, bypassing CSS scroll-smooth
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    // Fallback: some browsers may not honor "instant" with CSS scroll-smooth,
    // so also set it after a microtask
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    });
  }, [pathname, searchParams]);

  return null;
}

export default function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}
