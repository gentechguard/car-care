// hooks/useDealerData.ts
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Dealer, DealerFilter } from "@/types/dealer";
import { dealers as staticDealers } from "@/lib/dealers/data";
import { createClient } from "@/lib/supabase/client";

export function useDealerData() {
  const [allDealers, setAllDealers] = useState<Dealer[]>(staticDealers);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<DealerFilter>({
    type: "all",
    state: null,
    search: "",
  });

  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);
  const [hoveredDealer, setHoveredDealer] = useState<string | null>(null);

  // Fetch dealers from Supabase on mount, fall back to static data on error
  useEffect(() => {
    let cancelled = false;

    async function fetchDealers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("dealers")
          .select("*")
          .eq("is_active", true)
          .order("dealer_name");

        if (error) throw error;

        if (!cancelled && data && data.length > 0) {
          setAllDealers(data as Dealer[]);
        }
      } catch {
        // Supabase unavailable — keep using static fallback (already set)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDealers();
    return () => { cancelled = true; };
  }, []);

  // Derive unique states from fetched data
  const availableStates = useMemo(() => {
    const stateSet = new Set(allDealers.map((d) => d.state));
    return ["All States", ...Array.from(stateSet).sort()];
  }, [allDealers]);

  const filteredDealers = useMemo(() => {
    return allDealers.filter((dealer) => {
      if (filters.type !== "all" && dealer.dealer_type !== filters.type) return false;
      if (filters.state && filters.state !== "All States" && dealer.state !== filters.state) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          dealer.dealer_name.toLowerCase().includes(q) ||
          dealer.city.toLowerCase().includes(q) ||
          dealer.state.toLowerCase().includes(q);
        if (!match) return false;
      }
      return dealer.is_active;
    });
  }, [filters, allDealers]);

  const stats = useMemo(() => {
    const active = allDealers.filter((d) => d.is_active);
    return {
      total: active.length,
      premium: active.filter((d) => d.dealer_type === "premium").length,
      standard: active.filter((d) => d.dealer_type === "standard").length,
      comingSoon: active.filter((d) => d.dealer_type === "coming_soon").length,
      cities: new Set(active.map((d) => d.city)).size,
      states: new Set(active.map((d) => d.state)).size,
    };
  }, [allDealers]);

  const updateFilter = useCallback((key: keyof DealerFilter, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: "all", state: null, search: "" });
  }, []);

  const selectDealer = useCallback((id: string | null) => {
    setSelectedDealer(id);
  }, []);

  const hoverDealer = useCallback((id: string | null) => {
    setHoveredDealer(id);
  }, []);

  return {
    dealers: filteredDealers,
    allDealers,
    availableStates,
    filters,
    stats,
    loading,
    selectedDealer,
    hoveredDealer,
    updateFilter,
    clearFilters,
    selectDealer,
    hoverDealer,
  };
}
