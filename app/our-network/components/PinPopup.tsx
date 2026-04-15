// app/our-network/components/PinPopup.tsx
"use client";

import { motion } from "framer-motion";
import { Dealer } from "@/types/dealer";
import { MapPin, Phone, Mail, X, Navigation } from "lucide-react";

interface PinPopupProps {
  dealer: Dealer;
  onClose: () => void;
}

export function PinPopup({ dealer, onClose }: PinPopupProps) {
  const getTypeColor = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return "#00A8FF";
      case "coming_soon":
        return "#F59E0B";
      default:
        return "#FFFFFF";
    }
  };

  const color = getTypeColor();

  return (
    <>
      {/* Backdrop — clicking it closes the popup */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Popup Card */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 sm:absolute sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto"
        style={{ transform: "translate(0, 0)" }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Mobile: full-width bottom sheet. Desktop: centered card. */}
        <div
          className="relative w-full sm:w-80 p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl border backdrop-blur-xl sm:-translate-x-1/2 sm:-translate-y-1/2"
          style={{
            background: "rgba(17, 17, 17, 0.97)",
            borderColor: `${color}40`,
            boxShadow: `0 -10px 40px rgba(0,0,0,0.5), 0 0 30px ${color}20`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle (mobile) */}
          <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-3 sm:right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color }}
            >
              {dealer.dealer_type.replace("_", " ")}
            </span>
          </div>

          {/* Dealer Name */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 pr-8">
            {dealer.dealer_name}
          </h3>

          {/* Contact Person */}
          {dealer.contact_person && (
            <p className="text-sm text-white/60 mb-4">
              Contact: {dealer.contact_person}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

          {/* Location */}
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/80">{dealer.address}</p>
              <p className="text-sm text-white/60">
                {dealer.city}, {dealer.state} {dealer.pincode}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-white/40 flex-shrink-0" />
            <a
              href={`tel:${dealer.phone}`}
              className="text-sm text-white/80 hover:text-[#00A8FF] transition-colors"
            >
              {dealer.phone}
            </a>
          </div>

          {/* Email */}
          {dealer.email && (
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-white/40 flex-shrink-0" />
              <a
                href={`mailto:${dealer.email}`}
                className="text-sm text-white/80 hover:text-[#00A8FF] transition-colors truncate"
              >
                {dealer.email}
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <a
              href={`https://maps.google.com/?q=${dealer.latitude},${dealer.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A8FF] hover:bg-[#00A8FF]/90 text-black font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </a>
            <a
              href={`tel:${dealer.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
