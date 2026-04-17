"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    ChevronRight,
    LogOut,
    Menu,
    X,
    User,
    Package,
    Settings
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import MetallicPaint from "../MetallicPaint";

// Initialize Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Package, label: "Products", href: "/admin/dashboard/products" },
    { icon: User, label: "Users", href: "/admin/dashboard/users" },
    { icon: Settings, label: "Site Config", href: "/admin/dashboard/config" },
    // Removed "Warranties" as per request since Dashboard IS the warranties view
    // if there are more views later, add them here
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<{ fullName: string, email: string, role: string } | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Mobile Menu State

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile logic
                const { data: profile } = await supabase.from('admin_profiles').select('full_name, role, email').eq('id', user.id).single();
                setUserProfile({
                    fullName: profile?.full_name || "Admin User",
                    email: profile?.email || "",
                    role: profile?.role || ""
                });
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        toast.info("Logged out successfully");
        router.push('/admin');
        setLoading(false);
    };

    // --- STAX STYLE SIDEBAR ---
    return (
        <>
            {/* Mobile Hamburguer (Visible only on small screens) */}
            <div className="lg:hidden fixed top-6 right-4 z-[100]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-[#1e1b4b] bg-white p-2 rounded-lg shadow-lg"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-[260px] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[100dvh]
                bg-linear-to-b from-black via-[#110e30] to-[#2a2275] flex flex-col justify-between px-4 py-8 text-white overflow-hidden
                ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                {/* Top Section */}
                <div>
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-16 mt-0 lg:mt-2">
                        <div className="w-auto flex flex-1 items-center justify-center">
                            <Image
                                src="/assets/logo-final-wide.jpeg"
                                alt="Gentech"
                                width={400}
                                height={200}
                                className="object-contain h-auto w-full mix-blend-screen"
                            />
                        </div>
                        <span className="hidden text-[10px] uppercase border border-white/30 px-[6px] py-[2px] rounded-[12px] text-white/80 tracking-wider">
                            beta
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-[8px] transition-colors
                                        ${isActive
                                            ? "bg-white/10 text-white shadow-inner shadow-white/5"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                        }
                                    `}
                                >
                                    <item.icon size={18} className={isActive ? "text-indigo-300" : ""} />
                                    <span>{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div>
                    {/* Metallic Paint Effect - Positioned at bottom */}

                    <div className="absolute bottom-[-2%] right-[-12%] left-[-12%] z-0 mx-auto opacity-10 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                        <MetallicPaint
                            src="/assets/gentech-shield-bitmap.svg"
                            params={{
                                edge: 0.0,
                                patternScale: 2,
                                speed: 0.3,
                                liquid: 0.05
                            }}
                        />
                    </div>

                    <div className="mb-6 px-3">
                        <p className="text-xs text-white/40 leading-relaxed font-sans">
                            Gentech Car Care Admin Console v1.0 <br />
                            Authorized Personnel Only.
                        </p>
                    </div>

                    {/* Profile Block */}
                    {userProfile && (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border-2 border-indigo-400 shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{userProfile.fullName}</p>
                                    <p className="text-[10px] text-indigo-200 truncate uppercase tracking-wider font-semibold">{userProfile.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 hover:text-white text-xs text-white/70 transition-all font-medium"
                            >
                                <LogOut size={12} /> Log Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
