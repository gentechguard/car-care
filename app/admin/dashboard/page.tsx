"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import WarrantiesTable from "@/components/admin/WarrantiesTable";
import { createClient } from "@supabase/supabase-js";

// -- SUPABASE --
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        percentChange: 0,
        isPositive: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data, count } = await supabase
                .from('warranty_registrations')
                .select('created_at', { count: 'exact' });

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Calculate previous month handles year rollover (Jan -> Dec)
            const prevDate = new Date();
            prevDate.setMonth(now.getMonth() - 1);
            const prevMonth = prevDate.getMonth();
            const prevYear = prevDate.getFullYear();

            let thisMonthCount = 0;
            let prevMonthCount = 0;

            data?.forEach(d => {
                const date = new Date(d.created_at);
                const m = date.getMonth();
                const y = date.getFullYear();

                if (m === currentMonth && y === currentYear) thisMonthCount++;
                if (m === prevMonth && y === prevYear) prevMonthCount++;
            });

            // Calculate Percentage Change
            let percent = 0;
            if (prevMonthCount > 0) {
                percent = ((thisMonthCount - prevMonthCount) / prevMonthCount) * 100;
            } else if (thisMonthCount > 0) {
                percent = 100; // If 0 last month and some this month, it's 100% growth effectively (or infinite)
            }

            setStats({
                total: count || 0,
                thisMonth: thisMonthCount,
                percentChange: Math.round(percent),
                isPositive: percent >= 0
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span>Admin</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-medium">Overview</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            </div>

            {/* Metrics Cards - Stax Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <span className="font-bold text-lg">W</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">Total Warranties</span>
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{stats.total}</span>
                        <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-2">
                            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">All time</span>
                            <span>registrations</span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <span className="font-bold text-lg">M</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">New This Month</span>
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{stats.thisMonth}</span>
                        <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-2">
                            <span className={`${stats.isPositive ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'} px-1.5 py-0.5 rounded`}>
                                {stats.isPositive ? '+' : ''}{stats.percentChange}%
                            </span>
                            <span>from last month</span>
                        </div>
                    </div>
                </div>

                {/* Card 3 - System Status (Hidden on Mobile) */}
                <div className="hidden md:block bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <span className="font-bold text-lg">S</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">System Status</span>
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">Active</span>
                        <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Registrations</h2>
                </div>
                <WarrantiesTable />
            </div>
        </div>
    );
}
