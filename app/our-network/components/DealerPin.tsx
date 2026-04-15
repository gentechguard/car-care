"use client";

import { motion } from "framer-motion";
import { Dealer } from "@/types/dealer";
import { latLngToMapPercent } from "@/lib/dealers/map-utils";

interface DealerPinProps {
  dealer: Dealer;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export function DealerPin({
  dealer,
  index,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave
}: DealerPinProps) {
  const getPinColor = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return "#00A8FF";
      case "coming_soon":
        return "#F59E0B";
      default:
        return "#FFFFFF";
    }
  };

  const getPinSize = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return 3.5;
      default:
        return 2.5;
    }
  };

  const color = getPinColor();
  const size = getPinSize();
  const pos = latLngToMapPercent(dealer.latitude, dealer.longitude);

  // Convert percentage to SVG viewBox coordinates (764 x 792)
  const cx = (pos.x / 100) * 764;
  const cy = (pos.y / 100) * 792;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        delay: 1.5 + index * 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      style={{ cursor: "pointer" }}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pulse Ring Animation */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={size * 2}
        fill={color}
        opacity={0.2}
        animate={{
          r: [size * 2, size * 4, size * 2],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2
        }}
      />

      {/* Outer Glow Ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={isHovered || isSelected ? size * 2 : size * 1.5}
        fill={color}
        opacity={isHovered || isSelected ? 0.3 : 0.15}
        animate={{
          r: isHovered || isSelected ? size * 2.5 : size * 1.5
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main Pin Circle */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        stroke="#0A0A0A"
        strokeWidth="0.5"
        animate={{
          scale: isHovered || isSelected ? 1.5 : 1,
          filter: isHovered || isSelected
            ? `drop-shadow(0 0 8px ${color})`
            : `drop-shadow(0 0 4px ${color})`
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />

      {/* Inner Dot */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.4}
        fill="#0A0A0A"
      />

      {/* City Label on Hover */}
      <motion.text
        x={cx}
        y={cy - size - 2}
        textAnchor="middle"
        fill={color}
        fontSize="3"
        fontWeight="600"
        initial={{ opacity: 0, y: 2 }}
        animate={{
          opacity: isHovered || isSelected ? 1 : 0,
          y: isHovered || isSelected ? 0 : 2
        }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: "none" }}
      >
        {dealer.city}
      </motion.text>
    </motion.g>
  );
}
