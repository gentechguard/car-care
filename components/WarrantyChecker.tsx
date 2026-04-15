"use client";

import { useState, useRef } from "react";
import { Search, Loader2, AlertCircle, CheckCircle2, Phone, FileText, CarFront, X, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Certificate, { WarrantyData } from "./Certificate";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import GlassSurface from "./GlassSurface";
import { useBackButton } from '@/hooks/useBackButton';

// Initialize Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SearchType = "mobile" | "vin" | "reg";

const formatRegNumber = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const match = clean.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{1,4})$/);
    if (match) {
        const state = match[1];
        const rto = match[2].padStart(2, '0');
        const series = match[3];
        const num = match[4].padStart(4, '0');
        return `${state} ${rto} ${series ? series + ' ' : ''}${num}`;
    }
    return clean;
};

export default function WarrantyChecker() {
    const [searchType, setSearchType] = useState<SearchType>("mobile");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [productDetails, setProductDetails] = useState<any>(null);
    const [error, setError] = useState("");
    const [showCertificate, setShowCertificate] = useState(false);

    // Browser back button closes the certificate modal
    useBackButton(showCertificate, () => setShowCertificate(false));

    // Ref for hidden certificate to capture
    const hiddenCertRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResult(null);
        setProductDetails(null);

        if (!query) return;

        let finalQuery = query;

        // Validation & Formatting
        if (searchType === "mobile") {
            // Remove non-digits
            const nums = query.replace(/\D/g, '');
            if (nums.length !== 10) {
                setError("Please enter a valid 10-digit mobile number.");
                return;
            }
            finalQuery = nums; // API expects raw or we format it? API logic handles matching.
            // Our DB usually stores "+91.........." or similar. 
            // The API route likely searches using `eq`.
            // Let's assume the API handles it or I should try to match how it's stored.
            // Based on Form: `+91${formData.phone}`.
            // So I should probably search for the number, OR the number with +91.
            // Since I can't easily change the API to do deeply complex ORs without seeing it again,
            // I'll try to send the raw input and let the API (which likely uses .or() logic) handle it,
            // OR I'll search via Supabase directly here for better control?
            // "we are currently pulling data from the registrations table in our DB... use it to cross reference..."
            // I'll switch to CLIENT SIDE QUERYING for maximum control since I need to fetch product info anyway.
        } else if (searchType === "vin") {
            finalQuery = query.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        } else if (searchType === "reg") {
            // We store it formatted "TS 09 ..." usually.
            // But search might be raw.
            // Let's rely on my generic search or Supabase filter
            finalQuery = formatRegNumber(query);
        }

        setLoading(true);

        try {
            // 1. Fetch Registration
            let queryBuilder = supabase.from('warranty_registrations').select('*');

            if (searchType === "mobile") {
                // Try matching phone with or without +91
                queryBuilder = queryBuilder.or(`phone.eq.${finalQuery},phone.eq.+91${finalQuery},phone.eq.91${finalQuery}`);
            } else if (searchType === "vin") {
                queryBuilder = queryBuilder.eq('chassis_number', finalQuery);
            } else if (searchType === "reg") {
                // Try exact format or raw
                const raw = query.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                queryBuilder = queryBuilder.or(`reg_number.eq.${finalQuery},reg_number.eq.${raw}`);
            }

            const { data: warranties, error: wErr } = await queryBuilder;

            if (wErr) throw wErr;

            if (!warranties || warranties.length === 0) {
                throw new Error("No warranty record found with these details.");
            }

            const warranty = warranties[0]; // Take most recent?
            setResult(warranty);

            // 2. Fetch Product Details
            if (warranty.ppf_category) {
                // Cross reference Products table
                // Assuming 'name' in products table matches 'ppf_category'
                // Or maybe 'ppf_roll' prefix?
                // "use the PPF product name from that and use it to cross reference"
                const { data: product, error: pErr } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${warranty.ppf_category}%`) // Loose match as category might differ slightly from title
                    .limit(1)
                    .single();

                if (product) {
                    setProductDetails(product);
                }
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const getCertificateData = (): WarrantyData | null => {
        if (!result) return null;

        let duration = "5 Years"; // Default fallback
        let foundInSpecs = false;

        if (productDetails?.specs) {
            let specs = productDetails.specs;
            // Handle if specs is a string (Text column) or already an object (JSON col)
            if (typeof specs === 'string') {
                try {
                    specs = JSON.parse(specs);
                } catch (e) {
                    console.warn("Failed to parse product specs", e);
                    specs = [];
                }
            }

            if (Array.isArray(specs)) {
                const warrantySpec = specs.find((s: any) => s.label === "Warranty");
                if (warrantySpec?.value) {
                    duration = warrantySpec.value;
                    foundInSpecs = true;
                }
            }
        }

        if (!foundInSpecs) {
            if (result.ppf_category?.includes("TPH")) duration = "3 Years";
            if (result.ppf_category?.includes("Lite")) duration = "3 Years";
            // Extract warranty years from product name (e.g. "GenTech Ultra Pro 8" → "8 Years")
            const categoryName = result.ppf_category || "";
            const nameMatch = categoryName.match(/(\d+)\s*$/);
            if (nameMatch) {
                duration = `${nameMatch[1]} Years`;
            }
        }
        // Override if product details has warranty info? 
        // Assuming database has 'warranty_period' col? I don't know schema. Sticking to logic.

        return {
            warrantyId: `GW-${result.id?.toString().padStart(6, '0')}`,
            productName: productDetails?.name || result.ppf_category || "Gentech PPF",
            duration,
            serialNumber: result.ppf_roll || "N/A",
            materialConsumed: "Standard Kit", // Placeholder
            customer: {
                name: result.name,
                vehicleModel: "Vehicle", // Placeholder as we don't capture model
                vin: result.chassis_number || "N/A",
                phone: result.phone
            },
            installer: {
                studioName: result.dealer_name,
                location: result.installation_location,
                technician: "Authorized Technician",
                date: new Date(result.created_at).toLocaleDateString()
            }
        };
    };

    const downloadPdf = async () => {
        if (!hiddenCertRef.current) return;

        try {
            const dataUrl = await toPng(hiddenCertRef.current, {
                quality: 1.0,
                pixelRatio: 3,
                backgroundColor: '#020618',
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // Manually calculate height ratio instead of getImageProperties which might vary by version
            // Typically hiddenCertRef width/height are pixels
            const certWidth = hiddenCertRef.current.scrollWidth;
            const certHeight = hiddenCertRef.current.scrollHeight;
            const finalHeight = (certHeight * pdfWidth) / certWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, finalHeight);
            pdf.save(`Gentech-Warranty-${result.id}.pdf`);

        } catch (e) {
            console.error("PDF Gen Error:", e);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    return (
        <GlassSurface
            borderRadius={24}
            opacity={0.85}
            backgroundOpacity={0.1}
            blur={20}
            borderWidth={0.1}
            width="auto"
            height="auto"
            className="p-0 shadow-2xl"
        >
            <div className="p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
                <div className="max-w-md mx-auto text-center mb-10">
                    <h2 className="text-2xl font-black mb-4">VERIFY YOUR WARRANTY</h2>
                    <p className="text-text-grey text-sm font-medium">
                        Select a method to search for your warranty details.
                    </p>
                </div>

                {/* TAB SELECTOR */}
                <div className="flex justify-center gap-4 mb-8">
                    {[
                        { id: 'mobile', label: 'Mobile', icon: Phone },
                        { id: 'vin', label: 'VIN / Chassis', icon: CarFront },
                        { id: 'reg', label: 'Reg. Number', icon: FileText },
                    ].map((type) => {
                        const Icon = type.icon;
                        const isActive = searchType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => { setSearchType(type.id as SearchType); setQuery(""); setError(""); setResult(null); }}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all w-28 ${isActive
                                    ? "bg-primary-blue text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                            </button>
                        )
                    })}
                </div>

                <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-12 relative">
                    <div className="relative group">
                        {searchType === 'mobile' && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-bold z-10 select-none">
                                +91
                            </div>
                        )}
                        <input
                            type={searchType === 'mobile' ? "tel" : "text"}
                            maxLength={searchType === 'mobile' ? 10 : undefined}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                searchType === 'mobile' ? "Enter 10-digit number" :
                                    searchType === 'vin' ? "Enter Chassis Number" :
                                        "e.g. TS 09 AB 1234"
                            }
                            className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 md:pr-40 pr-6 outline-none focus:border-primary-blue focus:bg-white/10 transition-all font-black tracking-widest uppercase placeholder:text-text-grey/30 placeholder:normal-case ${searchType === 'mobile' ? 'pl-16' : 'pl-6'
                                }`}
                        />
                        {/* Desktop: button inside input */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="hidden md:flex absolute right-2 top-2 bottom-2 bg-primary-blue hover:bg-white hover:text-dark-bg text-white px-6 rounded-xl font-black text-xs transition-all items-center gap-2 neon-glow disabled:opacity-50 uppercase tracking-wider"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            {loading ? "Checking" : "Verify"}
                        </button>
                    </div>
                    {/* Mobile: button below input */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="md:hidden w-full mt-4 bg-primary-blue hover:bg-white hover:text-dark-bg text-white py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 neon-glow disabled:opacity-50 uppercase tracking-wider"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        {loading ? "Checking" : "Verify"}
                    </button>
                </form>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400 max-w-lg mx-auto mb-8"
                        >
                            <AlertCircle className="shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="bg-gradient-to-br from-white/10 to-transparent p-1 rounded-[2.5rem] shadow-2xl">
                                <div className="bg-dark-bg/90 backdrop-blur-xl rounded-[2.4rem] p-8 border border-white/5 relative overflow-hidden">
                                    {/* Success Badge */}
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <CheckCircle2 size={120} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="mb-8">
                                            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Active Warranty
                                            </div>
                                            <h3 className="text-2xl font-black text-white leading-tight">
                                                {productDetails?.name || result.ppf_category}
                                            </h3>
                                            {productDetails && (
                                                <p className="text-xs text-text-grey mt-1 line-clamp-1">{productDetails.subtitle || "Premium Protection Film"}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 text-sm">
                                            <div>
                                                <p className="text-[10px] text-text-grey uppercase tracking-widest mb-1 opacity-60">Customer</p>
                                                <p className="text-white font-bold truncate">{result.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-grey uppercase tracking-widest mb-1 opacity-60">Start Date</p>
                                                <p className="text-white font-bold text-lg font-mono tracking-tight">
                                                    {new Date(result.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-grey uppercase tracking-widest mb-1 opacity-60">Reg Number</p>
                                                <p className="text-white font-bold font-mono bg-white/5 px-2 py-1 rounded inline-block">{result.reg_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-grey uppercase tracking-widest mb-1 opacity-60">Roll Code</p>
                                                <p className="text-primary-blue font-bold font-mono">{result.ppf_roll}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setShowCertificate(true)}
                                                className="w-full py-4 bg-white/5 hover:bg-white hover:text-dark-bg border border-white/10 rounded-xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                            <button
                                                onClick={downloadPdf}
                                                className="w-full py-4 bg-primary-blue hover:bg-blue-400 text-white border border-transparent rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                            >
                                                <Download size={16} /> PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Certificate Modal */}
                <Dialog.Root open={showCertificate} onOpenChange={setShowCertificate}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] animate-in fade-in" />
                        <Dialog.Content className="fixed top-[5%] left-1/2 -translate-x-1/2 bg-transparent z-[70] outline-none animate-in zoom-in-95 data-[state=closed]:zoom-out-95">
                            <VisuallyHidden><Dialog.Title>Warranty Certificate</Dialog.Title></VisuallyHidden>

                            <div className="relative">
                                <button
                                    onClick={() => setShowCertificate(false)}
                                    className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-[calc(100%+10px)] text-[#ffffff88] hover:text-white transition-colors"
                                >
                                    <X size={32} />
                                </button>
                                {result && (
                                    <div className="scale-[0.6] md:scale-[0.92] lg:scale-[0.92] origin-top bg-white shadow-2xl">
                                        <Certificate data={getCertificateData()!} />
                                    </div>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Off-screen Certificate for PDF Capture */}
                {/* Placed 'fixed' behind content to ensure full rendering by browser layout engine */}
                <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none w-[794px] h-[1123px] overflow-hidden">
                    <div ref={hiddenCertRef} className="opacity-100">
                        {result && <Certificate data={getCertificateData()!} />}
                    </div>
                </div>

            </div>
        </GlassSurface>
    );
}
