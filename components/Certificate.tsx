import React from 'react';
import Image from "next/image";
import { Shield, Sparkles, Sun, Droplets, Layers, Zap } from 'lucide-react';

// --- Types ---
export interface WarrantyData {
    warrantyId: string;
    productName: string;
    duration: string;
    serialNumber: string;
    materialConsumed: string;
    customer: {
        name: string;
        vehicleModel: string;
        vin: string;
        phone: string;
    };
    installer: {
        studioName: string;
        location: string;
        technician: string;
        date: string;
    };
}

// --- Sub-components ---

const GentechLogo: React.FC<{ className?: string }> = ({ className = "h-12" }) => (
    <svg viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stylized G Shield Logo */}
        <path d="M30 5L10 15V35C10 48 30 55 30 55C30 55 50 48 50 35V15L30 5Z" stroke="#F5C842" strokeWidth="3" fill="rgba(212,175,55,0.12)" />
        <path d="M30 20V40M20 30H40" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" />

        {/* Text */}
        <text x="65" y="28" fill="white" fontFamily="Montserrat" fontWeight="800" fontSize="24" letterSpacing="1">GENTECH</text>
        <text x="65" y="48" fill="#F5C842" fontFamily="Montserrat" fontWeight="600" fontSize="16" letterSpacing="4">GUARD</text>
    </svg>
);

const CoverageIcon: React.FC<{ type: string; label: string }> = ({ type, label }) => {
    const getIcon = () => {
        switch (type) {
            case 'gloss': return <Sparkles className="w-6 h-6 text-black" />;
            case 'healing': return <Zap className="w-6 h-6 text-black" />;
            case 'yellowing': return <Sun className="w-6 h-6 text-black" />;
            case 'hydrophobic': return <Droplets className="w-6 h-6 text-black" />;
            case 'impact': return <Shield className="w-6 h-6 text-black" />;
            case 'adhesion': return <Layers className="w-6 h-6 text-black" />;
            default: return <Shield className="w-6 h-6 text-black" />;
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 text-center group">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_18px_rgba(245,200,66,0.8)] border border-[#F5D88A] group-hover:scale-110 transition-transform duration-300">
                {getIcon()}
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#d1d5dc] mt-1">{label}</span>
        </div>
    );
};

// --- Main Component ---

interface CertificateProps {
    data: WarrantyData;
}

const Certificate: React.FC<CertificateProps> = ({ data }) => {
    return (
        <div
            className="certificate-root mx-auto bg-[#020618] relative overflow-hidden text-white flex flex-col shadow-2xl print:shadow-none"
            // 794px x 1123px is the standard pixel dimension for A4 at 96 DPI.
            // We fix this size so the layout is static, then scale the parent.
            style={{ width: '794px', height: '1123px' }}
        >

            {/* Background Ambience / Tech Grid */}
            {/* Background Ambience / Tech Grid */}
            <div className="absolute inset-0 bg-tech-grid bg-[length:20px_20px] opacity-20 pointer-events-none"></div>
            {/* Replaced filter blur with radial gradients for html2canvas compatibility */}
            <div className="absolute top-0 right-0 w-96 h-96" style={{ background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(2,6,24,0) 70%)' }}></div>
            <div className="absolute bottom-0 left-0 w-64 h-64" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(2,6,24,0) 70%)' }}></div>

            {/* Decorative Border Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

            {/* Header */}
            <header className="relative z-10 pt-12 pb-6 px-12 flex justify-between items-start border-b border-[#1e293988]">
                <div>
                    <h2 className="text-[#F5C842] text-xs font-bold tracking-[0.3em] mb-2 uppercase">Official Protection Document</h2>
                    <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white">
                        Warranty <span className="text-[#F5C842]">Certificate</span>
                    </h1>
                </div>
                <GentechLogo className="h-16 hidden" />
                <div className="relative">
                    <Image
                        src="/assets/logo-final-wide.jpeg"
                        alt="Gentech Car Care"
                        width={240}
                        height={80}
                        className="object-contain object-right mix-blend-screen"
                        unoptimized
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 px-12 py-8 flex flex-col gap-8">

                {/* Primary Warranty Details - Hero Section */}
                <div className="grid grid-cols-2 gap-6 bg-[#101828] p-6 rounded-xl border border-[#1e2939]">
                    <div className="space-y-1">
                        <p className="text-[#99a1af] text-xs uppercase tracking-widest">Product Installed</p>
                        <p className="text-2xl font-display font-bold text-white">{data.productName}</p>
                        <div className="inline-block px-3 py-1 bg-[#D4AF3755] text-[#F5C842] text-xs font-bold rounded border border-[#D4AF37]/40 mt-2">
                            {data.duration} WARRANTY
                        </div>
                    </div>
                    <div className="space-y-4 text-right">
                        <div>
                            <p className="text-[#99a1af] text-xs uppercase tracking-widest">Warranty ID</p>
                            <p className="text-xl font-mono text-[#F5D88A] tracking-wider">{data.warrantyId}</p>
                        </div>
                        <div>
                            <p className="text-[#99a1af] text-xs uppercase tracking-widest">Roll Serial No.</p>
                            <p className="text-sm font-mono text-white">{data.serialNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mt-4">

                    {/* Customer Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-[#D4AF37]"></div>
                            <h3 className="font-display font-bold uppercase tracking-wider text-lg">Customer Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Owner Name</span>
                                <span className="text-sm font-semibold">{data.customer.name}</span>
                            </div>
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Vehicle Model</span>
                                <span className="text-sm font-semibold">{data.customer.vehicleModel}</span>
                            </div>
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">VIN / Chassis No.</span>
                                <span className="font-mono text-sm text-[#d1d5dc]">{data.customer.vin}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Contact</span>
                                <span className="text-sm text-[#d1d5dc]">{data.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Installer Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-[#6a7282]"></div>
                            <h3 className="font-display font-bold uppercase tracking-wider text-lg text-[#e5e7eb]">Installation Studio</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Authorized Studio</span>
                                <span className="text-sm font-semibold text-[#F5C842]">{data.installer.studioName}</span>
                            </div>
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Location</span>
                                <span className="text-sm font-semibold">{data.installer.location}</span>
                            </div>
                            <div className="border-b border-[#1e2939] pb-2">
                                <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Technician</span>
                                <span className="text-sm text-[#d1d5dc]">{data.installer.technician}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Install Date</span>
                                    <span className="text-sm text-white">{data.installer.date}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-[#6a7282] uppercase tracking-wider mb-1">Material Used</span>
                                    <span className="text-sm text-white">{data.materialConsumed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coverage Icons */}
                <div className="mt-8">
                    <h4 className="text-center text-xs uppercase tracking-[0.2em] text-[#6a7282] mb-6">Active Protection Features</h4>
                    <div className="flex justify-between px-4">
                        <CoverageIcon type="gloss" label="Mirror Gloss" />
                        <CoverageIcon type="healing" label="Self Healing" />
                        <CoverageIcon type="impact" label="Impact Resist" />
                        <CoverageIcon type="hydrophobic" label="Hydrophobic" />
                        <CoverageIcon type="yellowing" label="Anti-Yellowing" />
                        <CoverageIcon type="adhesion" label="Secure Bond" />
                    </div>
                </div>

                {/* After Care Section */}
                <div className="mt-auto pt-6 border-t border-[#1e2939]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#F5C842]">Essential After Care</h5>
                    </div>
                    <p className="text-[10px] leading-relaxed text-[#99a1af] text-justify">
                        To ensure longevity, allow the film to cure for 72 hours before washing.
                        Use only pH-neutral shampoos and microfiber mitts. Avoid high-pressure water
                        sprays directly on edges (maintain 1.5ft distance). Do not use abrasive compounds,
                        polishes, or automatic car washes with stiff brushes. Promptly remove bird droppings
                        and tree sap. Heat allows the film to self-heal minor scratches.
                        Full terms available at gentechguard.com/warranty.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-[#101828] py-4 px-12 flex justify-between items-center text-[10px] text-[#6a7282] border-t border-[#1e2939]">
                <div className="flex items-center gap-4">
                    <span className="text-[#8B6F1F] font-mono">{data.warrantyId}</span>
                    <span>|</span>
                    <span>VERIFIED AUTHENTIC</span>
                </div>
                <div className="uppercase tracking-widest font-semibold">
                    Issued by Gentech Car Care
                </div>
            </footer>
        </div>
    );
};

export default Certificate;