// app/our-network/components/IndiaMap.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import IndiaMap from "@react-map/india";
import { Dealer } from "@/types/dealer";
import { PinPopup } from "./PinPopup";
import { latLngToMapPercent } from "@/lib/dealers/map-utils";
import { useBackButton } from "@/hooks/useBackButton";

interface IndiaMapProps {
  dealers: Dealer[];
  selectedDealer: string | null;
  hoveredDealer: string | null;
  onSelectDealer: (id: string | null) => void;
  onHoverDealer: (id: string | null) => void;
}

export function IndiaMapComponent({
  dealers,
  selectedDealer,
  hoveredDealer,
  onSelectDealer,
  onHoverDealer,
}: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Browser back button closes the dealer popup
  useBackButton(!!selectedDealer, () => onSelectDealer(null));

  // Dealer grouped by state for map coloring
  const stateData = useMemo(() => {
    const data: Record<string, { count: number; hasPremium: boolean; dealers: Dealer[] }> = {};
    dealers.forEach((dealer) => {
      const stateName = dealer.state;
      if (!data[stateName]) {
        data[stateName] = { count: 0, hasPremium: false, dealers: [] };
      }
      data[stateName].count += 1;
      data[stateName].dealers.push(dealer);
      if (dealer.dealer_type === "premium") {
        data[stateName].hasPremium = true;
      }
    });
    return data;
  }, [dealers]);

  const getStateColor = (stateName: string) => {
    const state = stateData[stateName];
    if (!state) return "#1E293B";
    if (state.hasPremium) return "#00A8FF";
    return "#3B82F6";
  };

  const handleStateClick = (stateName: string) => {
    const stateDealers = stateData[stateName]?.dealers || [];
    if (stateDealers.length > 0) {
      onSelectDealer(stateDealers[0].id);
    }
  };

  // Close popup when clicking outside (on the map background)
  const handleBackgroundClick = useCallback(() => {
    if (selectedDealer) {
      onSelectDealer(null);
    }
  }, [selectedDealer, onSelectDealer]);

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedDealer) {
        onSelectDealer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDealer, onSelectDealer]);

  const selectedDealerData = dealers.find((d) => d.id === selectedDealer);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full bg-gradient-to-br from-[#0A0A0A] via-[#0F172A] to-[#0A0A0A] rounded-3xl overflow-hidden border border-white/10"
      onClick={handleBackgroundClick}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00A8FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated Background Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,168,255,0.1) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/*
        Map + Pins container.
        The SVG viewBox for @react-map/india is ~764×792.
        We lock the container to that aspect-ratio so percentage-based pin
        positions align exactly with the rendered SVG content.
      */}
      <div className="relative w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div
          className="relative w-full mx-auto"
          style={{ aspectRatio: "764 / 792", maxWidth: "650px" }}
        >
          {/* The SVG map */}
          <IndiaMap
            type="select-single"
            size="100%"
            mapColor={getStateColor(hoveredState || "")}
            strokeColor="#00A8FF"
            strokeWidth="0.5"
            hoverColor="#00A8FF"
            hoverStrokeColor="#FFFFFF"
            hoverStrokeWidth="1"
            onSelect={(stateName: string) => handleStateClick(stateName)}
            onHover={(stateName: string) => setHoveredState(stateName)}
            selectColor="#00A8FF"
            hints={true}
            hintTextColor="#FFFFFF"
            hintBackgroundColor="rgba(0, 168, 255, 0.9)"
            hintPadding="8px"
            hintBorderRadius="6px"
            hintFontSize="12px"
            hintFontWeight="600"
          />

          {/* Dealer Pins Overlay — same bounding box as the SVG */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {dealers.map((dealer, index) => {
              const pos = latLngToMapPercent(dealer.latitude, dealer.longitude);
              return (
                <DealerPinOverlay
                  key={dealer.id}
                  dealer={dealer}
                  index={index}
                  posX={pos.x}
                  posY={pos.y}
                  isSelected={selectedDealer === dealer.id}
                  isHovered={hoveredDealer === dealer.id}
                  onSelect={() => {
                    onSelectDealer(selectedDealer === dealer.id ? null : dealer.id);
                  }}
                  onHover={() => onHoverDealer(dealer.id)}
                  onLeave={() => onHoverDealer(null)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Dealer Popup */}
      <AnimatePresence>
        {selectedDealer && selectedDealerData && (
          <PinPopup dealer={selectedDealerData} onClose={() => onSelectDealer(null)} />
        )}
      </AnimatePresence>

      {/* Map Legend — below map on mobile, overlay on desktop */}
      <motion.div
        className="relative mx-4 -mt-2 mb-4 flex flex-wrap gap-x-4 gap-y-1.5 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 z-10 lg:absolute lg:bottom-6 lg:left-6 lg:mx-0 lg:mb-0 lg:mt-0 lg:flex-col lg:gap-2 lg:p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="w-full text-[10px] lg:text-xs font-semibold text-white/60 uppercase tracking-wider mb-0.5 lg:mb-1">
          Dealer Network
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-[#00A8FF] shadow-[0_0_10px_rgba(0,168,255,0.8)]" />
          <span className="text-[10px] lg:text-sm text-white/80">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <span className="text-[10px] lg:text-sm text-white/80">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <span className="text-[10px] lg:text-sm text-white/80">Coming Soon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1E293B] border border-white/20" />
          <span className="text-[10px] lg:text-sm text-white/80">No Dealers</span>
        </div>
      </motion.div>

      {/* Stats Overlay */}
      <motion.div
        className="absolute top-4 right-4 lg:top-6 lg:right-6 flex flex-col gap-2 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10">
          <div className="text-xl lg:text-2xl font-bold text-[#00A8FF]">{dealers.length}</div>
          <div className="text-[10px] lg:text-xs text-white/60">Total Dealers</div>
        </div>
        <div className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10">
          <div className="text-xl lg:text-2xl font-bold text-white">
            {Object.keys(stateData).length}
          </div>
          <div className="text-[10px] lg:text-xs text-white/60">States Covered</div>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Individual dealer pin
// ──────────────────────────────────────────────
interface DealerPinOverlayProps {
  dealer: Dealer;
  index: number;
  posX: number;
  posY: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function DealerPinOverlay({
  dealer,
  index,
  posX,
  posY,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: DealerPinOverlayProps) {
  const getColor = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return "#00A8FF";
      case "coming_soon":
        return "#F59E0B";
      default:
        return "#3B82F6";
    }
  };

  const color = getColor();

  return (
    <motion.div
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8 + index * 0.08, type: "spring", stiffness: 300 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pulse Ring */}
      <motion.div
        className="absolute -inset-3 sm:-inset-4 rounded-full"
        style={{ backgroundColor: color, opacity: 0.2 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      />

      {/* Pin Dot */}
      <motion.div
        className="relative w-3 h-3 sm:w-4 sm:h-4"
        animate={{ scale: isHovered || isSelected ? 1.5 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div
          className="w-full h-full rounded-full border-2 border-[#0A0A0A]"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 ${isHovered || isSelected ? 12 : 6}px ${color}`,
          }}
        />
        <div className="absolute inset-1 rounded-full bg-[#0A0A0A]" />
      </motion.div>

      {/* Label on Hover */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 whitespace-nowrap pointer-events-none z-20"
          >
            <div className="text-[10px] sm:text-xs font-semibold text-white">{dealer.city}</div>
            <div className="text-[8px] sm:text-[10px] text-white/60 capitalize">
              {dealer.dealer_type.replace("_", " ")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
