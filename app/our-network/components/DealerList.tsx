// app/our-network/components/DealerList.tsx
"use client";

import { motion } from "framer-motion";
import { Dealer } from "@/types/dealer";
import { MapPin, Phone, Mail, Star, Clock, Store } from "lucide-react";

interface DealerListProps {
  dealers: Dealer[];
  onSelectDealer: (id: string) => void;
}

export function DealerList({ dealers, onSelectDealer }: DealerListProps) {
  if (dealers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-white/40" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No dealers found</h3>
        <p className="text-white/60">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
      {dealers.map((dealer, index) => (
        <DealerCard
          key={dealer.id}
          dealer={dealer}
          index={index}
          onClick={() => onSelectDealer(dealer.id)}
        />
      ))}
    </div>
  );
}

interface DealerCardProps {
  dealer: Dealer;
  index: number;
  onClick: () => void;
}

function DealerCard({ dealer, index, onClick }: DealerCardProps) {
  const getTypeIcon = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return <Star className="w-4 h-4 text-[#00A8FF]" />;
      case "coming_soon":
        return <Clock className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <Store className="w-4 h-4 text-white/60" />;
    }
  };

  const getTypeColor = () => {
    switch (dealer.dealer_type) {
      case "premium":
        return "border-[#00A8FF]/30 bg-[#00A8FF]/5";
      case "coming_soon":
        return "border-[#F59E0B]/30 bg-[#F59E0B]/5";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${getTypeColor()}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-white text-lg">{dealer.dealer_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            {getTypeIcon()}
            <span className="text-xs text-white/60 capitalize">
              {dealer.dealer_type.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <div className="flex items-start gap-2 text-sm text-white/70">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
          <span>{dealer.address}, {dealer.city}, {dealer.state}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-white/40" />
          <a 
            href={`tel:${dealer.phone}`}
            className="text-[#00A8FF] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {dealer.phone}
          </a>
        </div>

        {dealer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-white/40" />
            <a 
              href={`mailto:${dealer.email}`}
              className="text-white/60 hover:text-white truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {dealer.email}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}