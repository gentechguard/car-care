// app/our-network/components/DealerFilter.tsx
"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Store, Star, Clock, X } from "lucide-react";
import { DealerFilter } from "@/types/dealer";

interface DealerFilterProps {
  filters: DealerFilter;
  states: string[];
  onUpdateFilter: (key: keyof DealerFilter, value: string | null) => void;
  onClearFilters: () => void;
  dealerCount: number;
  totalDealers: number;
  stats: {
    total: number;
    cities: number;
    states: number;
  };
}

export function DealerFilterSidebar({
  filters,
  states,
  onUpdateFilter,
  onClearFilters,
  dealerCount,
  totalDealers,
  stats,
}: DealerFilterProps) {
  const hasFilters = filters.type !== "all" || filters.state || filters.search;

  return (
    <motion.div
      className="w-full lg:w-80 flex-shrink-0 space-y-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Filter Panel */}
      <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-[#00A8FF]" />
            Filters
          </h3>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-white/60 hover:text-[#00A8FF] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="City or dealer name..."
              value={filters.search}
              onChange={(e) => onUpdateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00A8FF]/50 focus:ring-1 focus:ring-[#00A8FF]/50 transition-all"
            />
          </div>
        </div>

        {/* Dealer Type Filter */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 block">
            Dealer Type
          </label>
          <div className="space-y-2">
            <FilterOption
              label="All Dealers"
              isSelected={filters.type === "all"}
              onClick={() => onUpdateFilter("type", "all")}
              icon={<Store className="w-4 h-4" />}
              color="#FFFFFF"
            />
            <FilterOption
              label="Premium"
              isSelected={filters.type === "premium"}
              onClick={() => onUpdateFilter("type", "premium")}
              icon={<Star className="w-4 h-4" />}
              color="#00A8FF"
            />
            <FilterOption
              label="Standard"
              isSelected={filters.type === "standard"}
              onClick={() => onUpdateFilter("type", "standard")}
              icon={<Store className="w-4 h-4" />}
              color="#FFFFFF"
            />
            <FilterOption
              label="Coming Soon"
              isSelected={filters.type === "coming_soon"}
              onClick={() => onUpdateFilter("type", "coming_soon")}
              icon={<Clock className="w-4 h-4" />}
              color="#F59E0B"
            />
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 block">
            State
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={filters.state || "All States"}
              onChange={(e) =>
                onUpdateFilter("state", e.target.value === "All States" ? null : e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:border-[#00A8FF]/50 focus:ring-1 focus:ring-[#00A8FF]/50 transition-all cursor-pointer"
            >
              {states.map((state) => (
                <option key={state} value={state} className="bg-[#0A0A0A]">
                  {state}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="p-4 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/80">Showing</span>
          <span className="text-2xl font-bold text-[#00A8FF]">{dealerCount}</span>
        </div>
        <p className="text-xs text-white/60 mt-1">dealers across India</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold text-white">{stats.cities}+</div>
          <div className="text-xs text-white/60">Cities</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold text-white">{stats.states}</div>
          <div className="text-xs text-white/60">States</div>
        </div>
      </div>
    </motion.div>
  );
}

interface FilterOptionProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
}

function FilterOption({ label, isSelected, onClick, icon, color }: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isSelected
          ? "bg-white/10 border border-white/20"
          : "bg-transparent border border-transparent hover:bg-white/5"
      }`}
    >
      <span style={{ color: isSelected ? color : "rgba(255,255,255,0.4)" }}>{icon}</span>
      <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-white/60"}`}>
        {label}
      </span>
      {isSelected && (
        <motion.div
          layoutId="filter-indicator"
          className="ml-auto w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}
