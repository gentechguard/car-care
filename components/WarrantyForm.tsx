"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { User, Car, Wrench, ArrowRight, ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Certificate, { WarrantyData } from "./Certificate";
import { generateWarrantyPdf, uploadWarrantyPdf } from "@/lib/warranty-pdf";

const steps = [
    { id: 1, title: "Owner Info", icon: User },
    { id: 2, title: "Vehicle Details", icon: Car },
    { id: 3, title: "Installation", icon: Wrench },
];

import { siteConfig } from "@/lib/site-config";
import { useGlobalStore } from "@/context/GlobalStore";
import GlassSurface from "./GlassSurface";

// Formatting helper for Indian Reg Numbers
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

const formatPhoneNumber = (val: string) => {
    const clean = val.replace(/\D/g, '');
    return clean.slice(0, 10);
};

type SubmissionPhase = 'idle' | 'submitting' | 'generating_pdf' | 'uploading_pdf' | 'sending_whatsapp' | 'complete';

export default function WarrantyForm() {
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        regNumber: "",
        chassisNumber: "",
        ppfRoll: "",
        ppfCategory: "",
        dealerName: "",
        installerMobile: "",
        installationLocation: "",
        message: "",
    });

    // Dynamic Categories — show only sub-products under the PPF parent
    const { products } = useGlobalStore();
    const ppfParent = products.find(p => !p.parent_id && p.name.toLowerCase().includes('paint protection'));
    const ppfSubProducts = ppfParent
        ? products.filter(p => p.parent_id === ppfParent.id)
        : [];
    const ppfCategories = ppfSubProducts.length > 0
        ? ppfSubProducts.map(p => p.name)
        : siteConfig.productCategories;

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [files, setFiles] = useState<{
        vehicleImage: File | null;
        rcImage: File | null;
    }>({
        vehicleImage: null,
        rcImage: null,
    });

    // Post-submission state
    const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>('idle');
    const [warrantyId, setWarrantyId] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [whatsappStatus, setWhatsappStatus] = useState<{
        dealer: boolean;
        customer: boolean;
        admin: boolean;
    } | null>(null);

    // Certificate rendering
    const [certificateData, setCertificateData] = useState<WarrantyData | null>(null);
    const hiddenCertRef = useRef<HTMLDivElement>(null);

    const getSupabase = useCallback(() => {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }, []);

    const updateField = (field: string, value: string) => {
        let finalValue = value;
        if (field === 'regNumber') {
            finalValue = value.toUpperCase();
        }
        if (field === 'phone' || field === 'installerMobile') {
            finalValue = formatPhoneNumber(value);
        }
        setFormData((prev) => ({ ...prev, [field]: finalValue }));
        setError("");
    };

    const handleFileChange = (field: "vehicleImage" | "rcImage", file: File | null) => {
        setFiles((prev) => ({ ...prev, [field]: file }));
    };

    const validateStep = (currentStep: number) => {
        const d = formData;
        if (currentStep === 1) {
            if (!d.name || !d.phone) return "Please fill in Name and Phone.";
            if (d.phone.length < 10) return "Phone number must be 10 digits.";
        }
        if (currentStep === 2) {
            if (!d.regNumber) return "Registration Number is required.";
            if (!d.ppfRoll) return "PPF Roll Number is required.";
            if (!d.ppfCategory) return "PPF Category is required.";
            const rollPrefix = d.ppfRoll.toUpperCase().slice(0, 2);
            if (!['GT', 'GN', 'GR'].includes(rollPrefix)) {
                return "Invalid PPF Roll Number. Please check the code on your warranty card.";
            }
            if (d.regNumber.length < 6) return "Please enter a valid Registration Number";
            if (!files.vehicleImage) return "Vehicle Image is required.";
        }
        if (currentStep === 3) {
            if (!d.dealerName || !d.installerMobile || !d.installationLocation) return "Please fill in all required dealer details.";
            if (d.installerMobile.length < 10) return "Installer mobile must be 10 digits.";
        }
        return null;
    };

    const handleNext = () => {
        const errorMsg = validateStep(step);
        if (errorMsg) {
            setError(errorMsg);
            return;
        }
        setError("");
        setStep((s) => Math.min(s + 1, 3));
    };

    const handleBack = () => {
        setError("");
        setStep((s) => Math.max(s - 1, 1));
    };

    // ---- Submission Flow ----

    const handleSubmit = async () => {
        const errorMsg = validateStep(3);
        if (errorMsg) {
            setError(errorMsg);
            return;
        }
        setError("");
        await handleFullSubmission();
    };

    // ---- Full Submission Flow ----

    const handleFullSubmission = async () => {
        setIsSubmitting(true);
        setError("");
        setSubmissionPhase('submitting');

        try {
            const supabase = getSupabase();

            // 1. Upload images
            let vehicleImgUrl = "";
            let rcImgUrl = "";

            const uploadFile = async (file: File, path: string) => {
                const ext = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
                const filePath = `${path}/${fileName}`;
                const { error } = await supabase.storage
                    .from('warranty-uploads')
                    .upload(filePath, file);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from('warranty-uploads')
                    .getPublicUrl(filePath);
                return publicUrl;
            };

            if (files.vehicleImage) {
                vehicleImgUrl = await uploadFile(files.vehicleImage, 'vehicle_images');
            }
            if (files.rcImage) {
                rcImgUrl = await uploadFile(files.rcImage, 'rc_images');
            }

            const cleanPPFRoll = formData.ppfRoll.replace(/[^a-zA-Z0-9]/g, '');
            const cleanChassis = formData.chassisNumber ? formData.chassisNumber.replace(/[^a-zA-Z0-9]/g, '') : "";

            // 2. Insert warranty registration
            const { data: insertedData, error: insertError } = await supabase
                .from('warranty_registrations')
                .insert({
                    name: formData.name,
                    phone: `+91${formData.phone}`,
                    email: formData.email,
                    reg_number: formatRegNumber(formData.regNumber),
                    chassis_number: cleanChassis,
                    ppf_roll: cleanPPFRoll,
                    ppf_category: formData.ppfCategory,
                    dealer_name: formData.dealerName,
                    installer_mobile: `+91${formData.installerMobile}`,
                    installation_location: formData.installationLocation,
                    message: formData.message,
                    vehicle_image_url: vehicleImgUrl,
                    rc_image_url: rcImgUrl,
                    status: 'pending',
                })
                .select('id, created_at')
                .single();

            if (insertError) throw insertError;

            const wId = `GW-${insertedData.id?.toString().padStart(6, '0')}`;
            setWarrantyId(wId);

            // 3. Fetch product details for warranty duration
            let duration = "5 Years";
            const matchedProduct = products.find(p => p.name === formData.ppfCategory);
            if (matchedProduct?.specs) {
                let specs = matchedProduct.specs;
                if (typeof specs === 'string') {
                    try { specs = JSON.parse(specs); } catch { specs = []; }
                }
                if (Array.isArray(specs)) {
                    const warrantySpec = specs.find((s: any) => s.label === "Warranty");
                    if (warrantySpec?.value) duration = warrantySpec.value;
                }
            }
            // Fallback: extract warranty years from product name (e.g. "GenTech Ultra Pro 8" → "8 Years")
            if (duration === "5 Years" && formData.ppfCategory) {
                const nameMatch = formData.ppfCategory.match(/(\d+)\s*$/);
                if (nameMatch) {
                    duration = `${nameMatch[1]} Years`;
                }
            }

            // 4. Build certificate data
            const certData: WarrantyData = {
                warrantyId: wId,
                productName: formData.ppfCategory,
                duration,
                serialNumber: cleanPPFRoll,
                materialConsumed: "Standard Kit",
                customer: {
                    name: formData.name,
                    vehicleModel: "Vehicle",
                    vin: cleanChassis || "N/A",
                    phone: `+91${formData.phone}`,
                },
                installer: {
                    studioName: formData.dealerName,
                    location: formData.installationLocation,
                    technician: "Authorized Technician",
                    date: new Date(insertedData.created_at).toLocaleDateString(),
                },
            };
            setCertificateData(certData);

            // 5. Generate PDF (wait for Certificate to render)
            setSubmissionPhase('generating_pdf');
            await new Promise(resolve => setTimeout(resolve, 500));

            if (hiddenCertRef.current) {
                try {
                    const blob = await generateWarrantyPdf(hiddenCertRef.current);
                    setPdfBlob(blob);

                    // 6. Upload PDF
                    setSubmissionPhase('uploading_pdf');
                    const publicUrl = await uploadWarrantyPdf(supabase, wId, blob);
                    setPdfUrl(publicUrl);

                    // Insert certificate tracking record
                    await supabase.from('warranty_certificates').insert({
                        warranty_id: wId,
                        registration_id: insertedData.id,
                        pdf_storage_path: `${wId}.pdf`,
                        pdf_public_url: publicUrl,
                    });

                    // 7. Send via WhatsApp
                    setSubmissionPhase('sending_whatsapp');
                    try {
                        const { data: waData } = await supabase.functions.invoke('send-warranty-whatsapp', {
                            body: {
                                pdfUrl: publicUrl,
                                warrantyId: wId,
                                customerName: formData.name,
                                customerPhone: formData.phone,
                                dealerPhone: formData.installerMobile,
                                vehicleRegNumber: formatRegNumber(formData.regNumber),
                                productName: formData.ppfCategory,
                            },
                        });

                        if (waData?.deliveryResults) {
                            setWhatsappStatus({
                                dealer: waData.deliveryResults.dealer?.success || false,
                                customer: waData.deliveryResults.customer?.success || false,
                                admin: waData.deliveryResults.admin?.success || false,
                            });
                        }
                    } catch (waErr) {
                        console.error('WhatsApp delivery error:', waErr);
                        // Non-blocking — warranty is already saved
                    }

                } catch (pdfErr) {
                    console.error('PDF generation error:', pdfErr);
                    // Non-blocking — warranty is already saved
                }
            }

            setSubmissionPhase('complete');
            setIsSubmitted(true);

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || "An error occurred. Please try again.");
            setSubmissionPhase('idle');
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadPdf = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Gentech-Warranty-${warrantyId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ---- Render ----

    // Success screen
    if (isSubmitted) {
        return (
            <div className="text-center py-12 sm:py-20 px-6 sm:px-8 bg-dark-bg/50 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                    <CheckCircle className="text-green-500" size={40} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Registration Successful!</h3>
                <p className="text-white/60 mb-2 max-w-md mx-auto text-sm">
                    Your warranty <span className="text-primary-gold font-bold">{warrantyId}</span> has been officially registered with Gentech Car Care.
                </p>

                {whatsappStatus && (
                    <div className="mt-6 mb-6 max-w-sm mx-auto space-y-2">
                        <p className="text-xs uppercase tracking-wider text-white/40 font-bold mb-3">WhatsApp Delivery</p>
                        <div className="flex items-center justify-between text-sm px-4 py-2 rounded-lg bg-white/5">
                            <span className="text-white/60">Dealer</span>
                            <span className={whatsappStatus.dealer ? "text-green-400" : "text-yellow-400"}>
                                {whatsappStatus.dealer ? "Sent" : "Pending"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm px-4 py-2 rounded-lg bg-white/5">
                            <span className="text-white/60">Customer</span>
                            <span className={whatsappStatus.customer ? "text-green-400" : "text-yellow-400"}>
                                {whatsappStatus.customer ? "Sent" : "Pending"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm px-4 py-2 rounded-lg bg-white/5">
                            <span className="text-white/60">Admin</span>
                            <span className={whatsappStatus.admin ? "text-green-400" : "text-yellow-400"}>
                                {whatsappStatus.admin ? "Sent" : "Pending"}
                            </span>
                        </div>
                    </div>
                )}

                {!whatsappStatus && pdfUrl && (
                    <p className="text-white/40 text-xs mt-4 mb-6">
                        WhatsApp delivery was not available. You can download the certificate below.
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    {pdfBlob && (
                        <button
                            onClick={downloadPdf}
                            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                        >
                            <Download size={16} /> Download PDF
                        </button>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-gold text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#8B6F1F] transition-colors"
                    >
                        Register Another
                    </button>
                </div>
            </div>
        );
    }

    // Submission progress overlay (shown during post-OTP submission)
    if (isSubmitting && submissionPhase !== 'idle') {
        const phaseMessages: Record<SubmissionPhase, string> = {
            idle: '',
            submitting: 'Registering your warranty...',
            generating_pdf: 'Generating warranty certificate...',
            uploading_pdf: 'Uploading certificate...',
            sending_whatsapp: 'Sending via WhatsApp...',
            complete: 'Complete!',
        };

        return (
            <div className="text-center py-20 px-8 bg-dark-bg/50 backdrop-blur-md rounded-2xl border border-white/10">
                <Loader2 className="animate-spin text-primary-gold mx-auto mb-6" size={48} />
                <h3 className="text-xl font-black text-white mb-2">Processing</h3>
                <p className="text-white/60 text-sm">{phaseMessages[submissionPhase]}</p>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-8">
                    {(['submitting', 'generating_pdf', 'uploading_pdf', 'sending_whatsapp'] as SubmissionPhase[]).map((phase, i) => {
                        const phases: SubmissionPhase[] = ['submitting', 'generating_pdf', 'uploading_pdf', 'sending_whatsapp'];
                        const currentIndex = phases.indexOf(submissionPhase);
                        return (
                            <div
                                key={phase}
                                className={`w-2 h-2 rounded-full transition-colors ${i <= currentIndex ? 'bg-primary-gold' : 'bg-white/10'}`}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

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
            <div className="w-full mx-auto rounded-3xl overflow-hidden">
                {/* Header / Steps */}
                <div className="bg-black/10 border-b border-white/5 p-4 md:p-8">
                    <div className="flex justify-between items-center relative">
                        {steps.map((s) => {
                            const Icon = s.icon;
                            const isActive = step >= s.id;
                            return (
                                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                                    <div
                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border ${isActive
                                            ? "bg-primary-gold border-primary-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.65)]"
                                            : "bg-white/5 border-white/10 text-white/30"
                                            }`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span
                                        className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-primary-gold" : "text-white/20"
                                            }`}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                        {/* Progress Bar Line */}
                        <div className="absolute top-5 md:top-6 left-0 w-full h-[2px] bg-white/5 -z-0">
                            <div
                                className="h-full bg-primary-gold transition-all duration-500"
                                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 md:p-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none"
                                            placeholder="Enter vehicle owner's name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                                        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary-gold focus-within:ring-1 focus-within:ring-primary-gold transition-all">
                                            <span className="bg-white/5 text-white/50 px-4 py-4 flex items-center justify-center border-r border-white/10">+91</span>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                className="flex-1 bg-transparent border-none p-4 text-white placeholder:text-white/20 outline-none"
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Email Address <span className="text-white/20">(Optional)</span></label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Registration Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.regNumber}
                                                onChange={(e) => updateField("regNumber", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none uppercase font-mono"
                                                placeholder="TS 09 AB 1234"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Chassis / VIN <span className="text-white/20">(Optional)</span></label>
                                            <input
                                                type="text"
                                                value={formData.chassisNumber}
                                                onChange={(e) => updateField("chassisNumber", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none uppercase"
                                                placeholder="MA3..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">PPF Roll Code <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ppfRoll}
                                                onChange={(e) => updateField("ppfRoll", e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none uppercase"
                                                placeholder="GT-12345"
                                            />
                                            <p className="text-[10px] text-white/30 ml-1">Must start with GT, GN, or GR</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">PPF Product Category <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div
                                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                                    className={`w-full bg-white/5 border ${dropdownOpen ? 'border-primary-gold ring-1 ring-primary-gold' : 'border-white/10'} rounded-xl p-4 text-white cursor-pointer flex justify-between items-center transition-all hover:bg-white/10`}
                                                >
                                                    <span className={formData.ppfCategory ? "text-white" : "text-white/20"}>
                                                        {formData.ppfCategory || "Select Category"}
                                                    </span>
                                                    <ArrowRight size={14} className={`text-white/50 transition-transform duration-300 ${dropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                                                </div>

                                                <AnimatePresence>
                                                    {dropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                                                        >
                                                            {ppfCategories.map((cat) => (
                                                                <div
                                                                    key={cat}
                                                                    onClick={() => {
                                                                        updateField("ppfCategory", cat);
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                    className={`p-4 cursor-pointer text-sm font-medium transition-colors border-b border-white/5 last:border-none flex items-center justify-between group ${formData.ppfCategory === cat
                                                                        ? "bg-primary-gold/10 text-primary-gold"
                                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                    {formData.ppfCategory === cat && <CheckCircle size={14} />}
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {dropdownOpen && (
                                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Vehicle Image <span className="text-red-500">*</span></label>
                                            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange("vehicleImage", e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="text-primary-gold" size={24} />
                                                    <span className="text-sm text-white/70">
                                                        {files.vehicleImage ? files.vehicleImage.name : "Click to upload vehicle photo"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-white/50 tracking-wider">RC Image <span className="text-white/20">(Optional)</span></label>
                                            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange("rcImage", e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="text-primary-gold" size={24} />
                                                    <span className="text-sm text-white/70">
                                                        {files.rcImage ? files.rcImage.name : "Click to upload RC photo"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Dealer / Studio Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.dealerName}
                                            onChange={(e) => updateField("dealerName", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none"
                                            placeholder="Gentech Authorized Studio"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Installer Mobile <span className="text-red-500">*</span></label>
                                        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary-gold focus-within:ring-1 focus-within:ring-primary-gold transition-all">
                                            <span className="bg-white/5 text-white/50 px-4 py-4 flex items-center justify-center border-r border-white/10">+91</span>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.installerMobile}
                                                onChange={(e) => updateField("installerMobile", e.target.value)}
                                                className="flex-1 bg-transparent border-none p-4 text-white placeholder:text-white/20 outline-none"
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">City / Location <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.installationLocation}
                                            onChange={(e) => updateField("installationLocation", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none"
                                            placeholder="Hyderabad, Khajaguda"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-white/50 tracking-wider">Additional Message <span className="text-white/20">(Optional)</span></label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => updateField("message", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all outline-none h-24 resize-none"
                                            placeholder="Any notes..."
                                        />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-8 border-t border-white/5 flex justify-between bg-black/10">
                    <button
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-3 bg-primary-gold text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#8B6F1F] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.45)] hover:shadow-[0_0_30px_rgba(212,175,55,0.65)]"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-3 bg-primary-gold text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#8B6F1F] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.45)] hover:shadow-[0_0_30px_rgba(212,175,55,0.65)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                            ) : (
                                <>Submit <ArrowRight size={16} /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Off-screen Certificate for PDF Capture */}
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none w-[794px] h-[1123px] overflow-hidden">
                <div ref={hiddenCertRef} className="opacity-100">
                    {certificateData && <Certificate data={certificateData} />}
                </div>
            </div>
        </GlassSurface>
    );
}
