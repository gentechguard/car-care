"use client";

import { useEffect, useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    SortingState,
    ColumnDef,
} from "@tanstack/react-table";
import {
    Search,
    ChevronDown,
    MoreVertical,
    User,
    CheckCircle,
    XCircle,
    Shield
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import * as Popover from "@radix-ui/react-popover";

// -- TYPES --
type AdminProfile = {
    id: string; // uuid
    email: string; // From auth.users actually, but we might only have it if we join. 
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

// -- SUPABASE --
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UsersPage() {
    const [data, setData] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        // We really want emails too. But standard Supabase patterns often separate auth.users.
        // If we can't join easily without a function, we'll just show what we have in admin_profiles.
        const { data: profiles, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profiles) setData(profiles as AdminProfile[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('admin_profiles')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
            // Optimistic update
            setData(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
        }
    };

    // -- COLUMNS --
    const columns = useMemo<ColumnDef<AdminProfile>[]>(() => [
        {
            accessorKey: "created_at",
            header: "Signed Up",
            cell: ({ row }) => <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">{new Date(row.getValue("created_at")).toLocaleDateString()}</span>,
        },
        {
            accessorKey: "full_name",
            header: "User",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                        {row.original.full_name?.substring(0, 2) || <User size={14} />}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700 text-xs md:text-sm">{row.getValue("full_name") || "Unknown"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{row.original.id.slice(0, 8)}...</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.getValue("role") === 'superadmin'
                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                    {row.getValue("role")}
                </span>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean;
                return (
                    <button
                        onClick={() => toggleStatus(row.original.id, isActive)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'
                            }`}
                        title="Click to toggle status"
                    >
                        {isActive ? (
                            <><CheckCircle size={12} /> Active</>
                        ) : (
                            <><XCircle size={12} /> Inactive</>
                        )}
                    </button>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="text-slate-400 hover:text-slate-600 cursor-pointer hidden">
                    <MoreVertical size={16} />
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span>Admin</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-medium">Users</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-[48px] md:mt-0">User Management</h1>
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* Toolbar */}
                    <div className="bg-slate-50 p-1.5 border-b border-slate-200 flex justify-between items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-md text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold tracking-wide text-slate-500">
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="p-4 cursor-pointer hover:text-slate-700 transition-colors select-none whitespace-nowrap"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() && <ChevronDown className={`text-indigo-500 transition-transform ${header.column.getIsSorted() === 'asc' ? 'rotate-180' : ''}`} size={14} />}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(5)].map((_, j) => <td key={j} className="p-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>)}
                                        </tr>
                                    ))
                                ) : data.length > 0 ? (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="p-4 text-slate-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
