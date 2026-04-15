"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/site-config";

// -- TYPES --
export type Product = {
    id: string;
    name: string;
    shortDesc: string;
    features: string[];
    specs: { label: string; value: string }[];
    parent_id?: string | null; 
    image_url?: string;
    sort_order?: number | null;
};

type GlobalContextType = {
    products: Product[];
    settings: any;
    loading: boolean;
    refreshProducts: () => void; // Add refresh function
};

const GlobalContext = createContext<GlobalContextType>({
    products: [],
    settings: null,
    loading: true,
    refreshProducts: () => {},
});

export const useGlobalStore = () => useContext(GlobalContext);

// -- PROVIDER --
export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchKey, setFetchKey] = useState(0); // Used to force refetch

    const fetchData = async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase env vars not set, skipping data fetch');
            setLoading(false);
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        try {

            // Fetch Products with cache-busting
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('sort_order', { ascending: true, nullsFirst: false })
                .order('name', { ascending: true }); // Secondary sort by name

            if (productsError) {
                console.error('Supabase error:', productsError);
            }

            if (productsData) {
                const mapped = productsData.map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    shortDesc: p.short_desc || p.description || "",
                    features: p.features || [],
                    specs: p.specs || [],
                    parent_id: p.parent_id || null,
                    image_url: p.image_url,
                    sort_order: p.sort_order ?? 999,
                }));
                
                setProducts(mapped);
            }

            // Fetch Settings
            const { data: settingsData } = await supabase.from('site_settings').select('*');

            let hydratedSettings = JSON.parse(JSON.stringify(siteConfig));

            if (settingsData && settingsData.length > 0) {
                settingsData.forEach((row: any) => {
                    const keys = row.key.split('.');
                    let current = hydratedSettings;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {};
                        current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = row.value;
                });
            }
            setSettings(hydratedSettings);

        } catch (err) {
            console.error("Failed to fetch global data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchKey]); // Refetch when fetchKey changes

    const refreshProducts = () => {
        setFetchKey(prev => prev + 1); // Force refetch
    };

    return (
        <GlobalContext.Provider value={{ products, settings, loading, refreshProducts }}>
            {children}
        </GlobalContext.Provider>
    );
};