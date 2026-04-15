"use client";

import { useEffect, useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    SortingState,
    ColumnDef,
    ColumnFiltersState
} from "@tanstack/react-table";
import {
    Search,
    ChevronDown,
    Filter,
    Download,
    X,
    MoreVertical,
    Edit2,
    Trash2,
    Save,
    Image as ImageIcon,
    Plus,
    Loader2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { toast } from "sonner";
import * as Tooltip from "@radix-ui/react-tooltip";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// -- TYPES --
export type Warranty = {
    id: number;
    created_at: string;
    name: string;
    phone: string;
    email: string;
    reg_number: string;
    chassis_number: string;
    ppf_roll: string;
    ppf_category: string;
    dealer_name: string;
    installer_mobile: string;
    installation_location: string;
    message: string;
    vehicle_image_url: string;
    rc_image_url: string;
};

// -- SUPABASE --
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -- UTILS --
const TruncatedCell = ({ text }: { text: string }) => {
    if (!text) return <span className="text-slate-300">-</span>;
    return (
        <Tooltip.Provider>
            <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                    <div className="truncate max-w-[150px] cursor-default">{text}</div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="z-50 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg max-w-xs break-words" sideOffset={5}>
                        {text}
                        <Tooltip.Arrow className="fill-slate-900" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default function WarrantiesTable() {
    const [data, setData] = useState<Warranty[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Modal & Edit State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // New Warranty State
    const [newWarranty, setNewWarranty] = useState({
        name: "",
        phone: "",
        email: "",
        reg_number: "",
        ppf_roll: "",
        ppf_category: "",
        dealer_name: "",
        installer_mobile: "",
        installation_location: ""
    });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        const { data: warranties, error } = await supabase
            .from('warranty_registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (warranties) setData(warranties);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!newWarranty.name || !newWarranty.phone || !newWarranty.reg_number) {
            toast.error("Please fill in required fields (Name, Phone, Reg)");
            return;
        }

        const { error } = await supabase
            .from('warranty_registrations')
            .insert([newWarranty]);

        if (error) {
            toast.error("Failed to create warranty: " + error.message);
        } else {
            toast.success("Warranty created successfully");
            setIsCreateOpen(false);
            setNewWarranty({
                name: "", phone: "", email: "", reg_number: "", ppf_roll: "", ppf_category: "", dealer_name: "", installer_mobile: "", installation_location: ""
            });
            fetchData();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWarranty) return;

        const { error } = await supabase
            .from('warranty_registrations')
            .update(editingWarranty)
            .eq('id', editingWarranty.id);

        if (error) {
            toast.error("Failed to update warranty");
        } else {
            toast.success("Warranty updated successfully");
            setEditingWarranty(null);
            fetchData();
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase.from('warranty_registrations').delete().eq('id', deleteId);

        if (error) {
            toast.error("Failed to delete warranty");
        } else {
            toast.success("Warranty deleted");
            fetchData();
        }
        setDeleteId(null);
    };


    // -- COLUMNS DEFINITION --
    const columns = useMemo<ColumnDef<Warranty>[]>(() => [
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">{new Date(row.getValue("created_at")).toLocaleDateString()}</span>,
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => <span className="font-medium text-slate-700 whitespace-nowrap"><TruncatedCell text={row.getValue("name")} /></span>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <span className="font-mono text-xs text-slate-500 whitespace-nowrap">{row.getValue("phone")}</span>,
        },
        {
            accessorKey: "reg_number",
            header: "Reg. Number",
            cell: ({ row }) => <span className="font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap">{row.getValue("reg_number")}</span>,
        },
        {
            accessorKey: "ppf_roll",
            header: "Roll Code",
            cell: ({ row }) => <span className="font-mono text-xs whitespace-nowrap">{row.getValue("ppf_roll")}</span>,
        },
        {
            accessorKey: "ppf_category",
            header: "Category",
            cell: ({ row }) => <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600 whitespace-nowrap">{row.getValue("ppf_category")}</span>,
        },
        {
            accessorKey: "chassis_number",
            header: "Chassis / VIN",
            cell: ({ row }) => <TruncatedCell text={row.getValue("chassis_number")} />,
        },
        {
            accessorKey: "dealer_name",
            header: "Dealer",
            cell: ({ row }) => <span className="font-semibold text-xs text-slate-700 whitespace-nowrap">{row.getValue("dealer_name")}</span>,
        },
        {
            accessorKey: "installation_location",
            header: "Location",
            cell: ({ row }) => <span className="text-xs text-slate-500 whitespace-nowrap">{row.getValue("installation_location")}</span>,
        },
        {
            accessorKey: "installer_mobile",
            header: "Installer Phone",
            cell: ({ row }) => <span className="text-xs font-mono text-slate-400 whitespace-nowrap">{row.getValue("installer_mobile")}</span>,
        },
        {
            accessorKey: "message",
            header: "Notes",
            cell: ({ row }) => <TruncatedCell text={row.getValue("message")} />,
        },
        {
            id: "evidence",
            header: "Evidence",
            cell: ({ row }) => (
                <div className="flex gap-1 whitespace-nowrap">
                    {row.original.vehicle_image_url ? (
                        <div
                            className="w-7 h-7 rounded-md border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:z-10 transition-all bg-slate-100 flex items-center justify-center group"
                            onClick={() => setSelectedImage(row.original.vehicle_image_url)}
                            title="View Vehicle"
                        >
                            <Image src={row.original.vehicle_image_url} alt="Vehicle" width={28} height={28} className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon size={12} />
                        </div>
                    )}
                    {row.original.rc_image_url ? (
                        <div
                            className="w-7 h-7 rounded-md border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:z-10 transition-all bg-slate-100 group"
                            onClick={() => setSelectedImage(row.original.rc_image_url)}
                            title="View RC"
                        >
                            <Image src={row.original.rc_image_url} alt="RC" width={28} height={28} className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon size={12} />
                        </div>
                    )}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const warranty = row.original;
                return (
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        </Popover.Trigger>
                        <Popover.Content className="bg-white border border-slate-200 shadow-xl rounded-xl p-1 w-32 flex flex-col z-10" sideOffset={5} align="end">
                            <button
                                onClick={() => setEditingWarranty(warranty)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors w-full text-left font-medium"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                onClick={() => setDeleteId(warranty.id)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full text-left font-medium"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </Popover.Content>
                    </Popover.Root>
                );
            },
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-row gap-4 justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <div className="relative flex-1 sm:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Filter by keyword..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-max sm:w-auto">
                    {/* Add Data Button */}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                    >
                        <Plus size={16} /> <p className="hidden sm:inline">Add Warranty</p>
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`hidden p-2 border border-slate-200 rounded-md transition-colors ${showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                    >
                        <Filter size={16} />
                    </button>
                    <button className="hidden p-2 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* Column Filters (Conditional) */}
            {showFilters && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
                    {['name', 'phone', 'reg_number', 'dealer_name'].map((key) => (
                        <input
                            key={key}
                            placeholder={`Filter ${key.replace('_', ' ')}...`}
                            value={(table.getColumn(key)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn(key)?.setFilterValue(event.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 transition-colors"
                        />
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
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
                                                {header.column.getIsSorted() === "asc" && <ChevronDown className="rotate-180 text-indigo-500" size={14} />}
                                                {header.column.getIsSorted() === "desc" && <ChevronDown className="text-indigo-500" size={14} />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(8)].map((_, j) => (
                                            <td key={j} className="p-4">
                                                <div className="h-4 bg-slate-100 rounded w-full max-w-[100px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 text-slate-700">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-16 text-slate-400 flex flex-col items-center gap-2">
                                        <Filter size={32} className="opacity-20" />
                                        <p>No matching records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50/50">
                    <span className="text-xs font-medium text-slate-500">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* 1. Image View Modal */}
            <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/90 z-[60] backdrop-blur-sm animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] z-[70] outline-none">
                        <VisuallyHidden>
                            <Dialog.Title>Image View</Dialog.Title>
                        </VisuallyHidden>
                        {selectedImage && (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <div className="relative w-full h-full max-w-5xl max-h-full">
                                    <Image
                                        src={selectedImage}
                                        alt="Evidence"
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />
                                </div>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-md border border-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* 2. DELETE CONFIRMATION */}
            <Dialog.Root open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px] animate-in fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-sm z-[70] outline-none animate-in zoom-in-95 duration-200">
                        <VisuallyHidden>
                            <Dialog.Title>Confirm Deletion</Dialog.Title>
                        </VisuallyHidden>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete this warranty record? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* 3. EDIT MODAL */}
            <Dialog.Root open={!!editingWarranty} onOpenChange={(open) => !open && setEditingWarranty(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-[2px] animate-in fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto z-[70] outline-none animate-in slide-in-from-bottom-5 duration-200">
                        <VisuallyHidden>
                            <Dialog.Title>Edit Warranty Details</Dialog.Title>
                        </VisuallyHidden>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-slate-900">Edit Warranty Details</h2>
                            <button onClick={() => setEditingWarranty(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {editingWarranty && (
                            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Customer Name</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={editingWarranty.name}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={editingWarranty.phone}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={editingWarranty.email}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reg Number</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                        value={editingWarranty.reg_number}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, reg_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dealer Name</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={editingWarranty.dealer_name}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, dealer_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">PPF Roll</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={editingWarranty.ppf_roll}
                                        onChange={e => setEditingWarranty({ ...editingWarranty, ppf_roll: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setEditingWarranty(null)}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* 4. CREATE MODAL */}
            <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-[2px] animate-in fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto z-[70] outline-none animate-in slide-in-from-bottom-5 duration-200">
                        <VisuallyHidden>
                            <Dialog.Title>Add New Warranty</Dialog.Title>
                        </VisuallyHidden>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-slate-900">Add New Warranty</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Customer Name</label>
                                <input
                                    required
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.name}
                                    onChange={e => setNewWarranty({ ...newWarranty, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone</label>
                                <input
                                    required
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.phone}
                                    onChange={e => setNewWarranty({ ...newWarranty, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                                <input
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.email}
                                    onChange={e => setNewWarranty({ ...newWarranty, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reg Number</label>
                                <input
                                    required
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                    value={newWarranty.reg_number}
                                    onChange={e => setNewWarranty({ ...newWarranty, reg_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dealer Name</label>
                                <input
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.dealer_name}
                                    onChange={e => setNewWarranty({ ...newWarranty, dealer_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">PPF Roll</label>
                                <input
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.ppf_roll}
                                    onChange={e => setNewWarranty({ ...newWarranty, ppf_roll: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                                <input
                                    className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    value={newWarranty.ppf_category}
                                    onChange={e => setNewWarranty({ ...newWarranty, ppf_category: e.target.value })}
                                    placeholder="e.g. GEN 5 PPF"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Create Registration
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
