"use client";

import { useState } from "react";
import { useGlobalStore } from "@/context/GlobalStore";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
};

export default function GetInTouchForm() {
    const { products } = useGlobalStore();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        product: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.phone || !form.email || !form.product) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const supabase = getSupabase();
            if (!supabase) {
                toast.error("Unable to connect. Please try again later.");
                return;
            }

            const { error } = await supabase.from("get_in_touch").insert({
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                product: form.product,
            });

            if (error) {
                console.error("Get in touch submit error:", error);
                toast.error("Something went wrong. Please try again.");
                return;
            }

            toast.success("Thank you! We'll get back to you soon.");
            setForm({ name: "", phone: "", email: "", product: "" });
        } catch (err) {
            console.error("Get in touch submit error:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Get only parent products (no parent_id) for the dropdown
    const parentProducts = products.filter((p) => !p.parent_id);

    return (
        <section id="get-in-touch" className="relative py-16 md:py-24 bg-dark-bg" style={{ background: '#050505' }}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-xl mx-auto">
                    {/* Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 md:p-10">
                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-2">
                            Get In Touch
                        </h2>
                        <div className="w-full h-px bg-white/20 my-4" />
                        <p className="text-white/60 text-sm md:text-base text-center mb-8">
                            Write to us with your query and we shall get back to you
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name*"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 text-base focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition"
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number*"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 text-base focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email ID*"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 text-base focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition"
                            />
                            <div className="relative">
                                <select
                                    name="product"
                                    value={form.product}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3.5 rounded-lg border border-white/20 bg-white/5 text-white text-base appearance-none focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition [&>option]:bg-[#111] [&>option]:text-white"
                                >
                                    <option value="" disabled className="text-white/40">
                                        Select Product
                                    </option>
                                    {parentProducts.map((p) => (
                                        <option key={p.id} value={p.name}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {/* Dropdown arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary-blue hover:bg-blue-600 text-white font-bold text-base uppercase tracking-wider py-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Submitting..." : "SUBMIT"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
