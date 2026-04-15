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
    Package,
    Layers,
    Calendar,
    Edit2,
    Trash2,
    Plus,
    X,
    Save,
    Loader2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

// -- TYPES --
type ProductSpec = {
    label: string;
    value: string;
}

type Product = {
    id: string;
    name: string;
    short_desc: string;
    features: string[]; // JSONB array of strings
    specs: ProductSpec[]; // JSONB array of objects
    created_at: string;
};

// -- SUPABASE --
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        id: string;
        name: string;
        short_desc: string;
        features: string[];
        specs: ProductSpec[];
    }>({
        id: "",
        name: "",
        short_desc: "",
        features: [""],
        specs: [{ label: "", value: "" }]
    });

    const fetchData = async () => {
        setLoading(true);
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (products) setData(products as Product[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // -- HANDLERS --

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            id: "",
            name: "",
            short_desc: "",
            features: [""], // Start with one empty field
            specs: [{ label: "", value: "" }]
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            id: product.id,
            name: product.name,
            short_desc: product.short_desc,
            features: product.features && product.features.length > 0 ? product.features : [""],
            specs: product.specs && product.specs.length > 0 ? product.specs : [{ label: "", value: "" }]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete product");
        } else {
            toast.success("Product deleted");
            fetchData();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Filter out empty features/specs
        const cleanFeatures = formData.features.filter(f => f.trim() !== "");
        const cleanSpecs = formData.specs.filter(s => s.label.trim() !== "" && s.value.trim() !== "");

        // Generate ID for new products if user provided one, or auto-slug
        let finalId = formData.id;
        if (!editingProduct) {
            // If creating new, and ID is empty, create slug from name
            if (!finalId) {
                finalId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
        }

        const payload = {
            id: finalId,
            name: formData.name,
            short_desc: formData.short_desc,
            features: cleanFeatures,
            specs: cleanSpecs
        };

        let error;
        if (editingProduct) {
            // Update
            const { error: updateError } = await supabase
                .from('products')
                .update(payload)
                .eq('id', editingProduct.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('products')
                .insert([payload]);
            error = insertError;
        }

        setIsSaving(false);

        if (error) {
            console.error(error);
            toast.error(`Failed to save: ${error.message}`);
        } else {
            toast.success(editingProduct ? "Product updated" : "Product created");
            setIsModalOpen(false);
            fetchData();
        }
    };

    // Form Array Helpers
    const updateFeature = (index: number, val: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = val;
        setFormData({ ...formData, features: newFeatures });
    };
    const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateSpec = (index: number, field: 'label' | 'value', val: string) => {
        const newSpecs = [...formData.specs];
        newSpecs[index] = { ...newSpecs[index], [field]: val };
        setFormData({ ...formData, specs: newSpecs });
    };
    const addSpec = () => setFormData({ ...formData, specs: [...formData.specs, { label: "", value: "" }] });
    const removeSpec = (index: number) => {
        const newSpecs = formData.specs.filter((_, i) => i !== index);
        setFormData({ ...formData, specs: newSpecs });
    };


    // -- TABLE COLUMNS --
    const columns = useMemo<ColumnDef<Product>[]>(() => [
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                        <Package size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{row.getValue("name")}</p>
                        <p className="text-[10px] uppercase font-mono text-slate-400 bg-slate-100 w-fit px-1 rounded whitespace-nowrap">{row.original.id}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "short_desc",
            header: "Description",
            cell: ({ row }) => <span className="text-xs text-slate-600 font-medium line-clamp-2 max-w-[200px]">{row.getValue("short_desc")}</span>,
        },
        {
            id: "details",
            header: "Details",
            cell: ({ row }) => {
                const specs = row.original.specs || [];
                const thickness = specs.find(s => s.label.toLowerCase().includes('thickness'))?.value;
                const warranty = specs.find(s => s.label.toLowerCase().includes('warranty'))?.value;

                return (
                    <div className="flex gap-2 flex-wrap">
                        {thickness && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 flex items-center gap-1 whitespace-nowrap"><Layers size={10} /> {thickness}</span>}
                        {warranty && <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1 whitespace-nowrap"><Calendar size={10} /> {warranty}</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: "features",
            header: "Features",
            cell: ({ row }) => <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md cursor-pointer whitespace-nowrap" onClick={() => openEditModal(row.original)}> {row.original.features?.length || 0} features listed</span>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditModal(row.original)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
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
                    <span className="text-slate-900 font-medium">Products</span>
                </div>
                <div className="flex justify-between items-center mt-[48px] md:mt-0">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Catalog</h1>
                    <button
                        onClick={openCreateModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Package size={16} /> Add Product
                    </button>
                </div>
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
                                placeholder="Search products..."
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
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-[2px] animate-in fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto z-[70] outline-none animate-in slide-in-from-bottom-5 duration-200 p-0 flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                                <p className="text-slate-500 text-xs mt-1">Configure product details, features, and specs.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">

                            {/* Basics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Product ID (Unique Slug)</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                        placeholder={editingProduct ? editingProduct.id : "Auto-generated from Name if empty"}
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        disabled={!!editingProduct} // ID cannot change after creation to simplify relations
                                    />
                                    {editingProduct && <span className="text-[10px] text-amber-600">ID cannot be changed once created.</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Product Name</label>
                                    <input
                                        required
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="e.g. GEN 5 PPF"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Short Description</label>
                                    <input
                                        className="w-full p-2.5 bg-slate-50 text-black border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="Brief one-liner description"
                                        value={formData.short_desc}
                                        onChange={e => setFormData({ ...formData, short_desc: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Features Array */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Features</label>
                                    <button type="button" onClick={addFeature} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"><Plus size={12} /> Add Feature</button>
                                </div>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {formData.features.map((feat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="flex-1 p-2 bg-white border border-slate-200 text-black rounded-md text-sm outline-none focus:border-indigo-500"
                                                placeholder="Enter feature..."
                                                value={feat}
                                                onChange={e => updateFeature(idx, e.target.value)}
                                            />
                                            {formData.features.length > 1 && (
                                                <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specs Array (Map) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Technical Specs</label>
                                    <button type="button" onClick={addSpec} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"><Plus size={12} /> Add Spec</button>
                                </div>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {formData.specs.map((spec, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                className="w-1/3 p-2 bg-white border border-slate-200 text-black rounded-md text-sm outline-none focus:border-indigo-500 font-bold text-slate-600"
                                                placeholder="Label (e.g. Thickness)"
                                                value={spec.label}
                                                onChange={e => updateSpec(idx, 'label', e.target.value)}
                                            />
                                            <span className="text-slate-300">:</span>
                                            <input
                                                className="flex-1 p-2 bg-white border border-slate-200 text-black rounded-md text-sm outline-none focus:border-indigo-500"
                                                placeholder="Value (e.g. 190 microns)"
                                                value={spec.value}
                                                onChange={e => updateSpec(idx, 'value', e.target.value)}
                                            />
                                            {formData.specs.length > 1 && (
                                                <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isSaving ? "Saving..." : "Save Product"}
                                </button>
                            </div>

                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
