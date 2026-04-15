"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Save, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Toaster, toast } from "sonner";

export default function SiteConfigPage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>(null); // We'll load flat key-values or a big JSON

    // For this MVP, we will try to load from a 'site_settings' table.
    // If it doesn't exist, we fall back to the static siteConfig (readonly-ish view for initial populate).

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Try to fetch from DB
            const { data, error } = await supabase.from("site_settings").select("*");

            // Always start with static default, then override with DB values
            // We need a deep clone of siteConfig to avoid modifying the read-only import
            let finalConfig = JSON.parse(JSON.stringify(siteConfig));

            if (data && data.length > 0) {
                data.forEach((row: any) => {
                    // We need to un-flatten keys: "contact.phone.display" -> { contact: { phone: { display: ... } } }
                    const keys = row.key.split('.');
                    let current = finalConfig as any;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {};
                        current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = row.value;
                });
            }
            setConfig(finalConfig);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = (path: string, value: string) => {
        setConfig((prev: any) => {
            const newConfig = { ...prev };
            const keys = path.split('.');
            let current = newConfig;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
    };

    const addSocial = () => {
        const name = window.prompt("Enter Social Platform Name (e.g. twitter, threads):");
        if (!name) return;
        const cleanName = name.trim().toLowerCase();
        if (config.socials?.[cleanName]) {
            toast.error("Platform already exists");
            return;
        }
        updateConfig(`socials.${cleanName}`, "");
    };

    const removeSocial = (key: string) => {
        if (!window.confirm(`Are you sure you want to remove ${key}?`)) return;
        setConfig((prev: any) => {
            const newConfig = { ...prev };
            if (newConfig.socials) {
                const { [key]: _, ...rest } = newConfig.socials;
                newConfig.socials = rest;
            }
            return newConfig;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // First, delete any existing socials entries to ensure deletions are reflected
            await supabase.from('site_settings').delete().like('key', 'socials%');

            const fieldsToSave = [
                { k: 'contact.phone.display', v: config.contact?.phone?.display },
                { k: 'contact.phone.value', v: config.contact?.phone?.value },
                { k: 'contact.email', v: config.contact?.email },
                { k: 'contact.whatsapp.number', v: config.contact?.whatsapp?.number },
                { k: 'contact.address.line1', v: config.contact?.address?.line1 },
                { k: 'contact.address.line2', v: config.contact?.address?.line2 },
                { k: 'contact.address.mapLink', v: config.contact?.address?.mapLink },

                // Save whole socials object
                { k: 'socials', v: config.socials },

                { k: 'company.name', v: config.company?.name },
                { k: 'company.legalName', v: config.company?.legalName },
                { k: 'company.copyright', v: config.company?.copyright },

                { k: 'metadata.title', v: config.metadata?.title },
                { k: 'metadata.description', v: config.metadata?.description },
            ];

            const { error } = await supabase.from('site_settings').upsert(
                fieldsToSave.map(f => ({ key: f.k, value: f.v }))
            );

            if (error) throw error;

            toast.success("Settings saved successfully!");
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to save settings: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Recursive input renderer? Or just hardcode the important fields?
    // Hardcoding is safer for now.

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-blue" /></div>;

    return (
        <div className="w-full mx-auto space-y-8 pb-20">
            <Toaster position="top-right" theme="dark" />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-end gap-2 text-sm text-slate-500 mb-1">
                        <span>Admin</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 font-medium">Config</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-[48px] md:mt-0">Website Config</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save
                </button>
            </div>

            <div className="hidden flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Site Configuration</h1>
                    <p className="text-gray-600 mt-1">Manage global website settings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary-blue text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Note about DB migration */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                <CheckCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Database Sync Active</h4>
                    <p className="text-xs text-blue-800/70 mt-1">
                        Changes made here are saved to Supabase and reflected across the live site.
                    </p>
                </div>
            </div>

            <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {/* Contact Info */}
                <Section title="Contact Information">
                    <Field label="Phone (Display)" value={config?.contact?.phone?.display} onChange={(v) => updateConfig('contact.phone.display', v)} />
                    <Field label="Phone (Value)" value={config?.contact?.phone?.value} onChange={(v) => updateConfig('contact.phone.value', v)} />
                    <Field label="Email" value={config?.contact?.email} onChange={(v) => updateConfig('contact.email', v)} />
                    <Field label="WhatsApp Number" value={config?.contact?.whatsapp?.number} onChange={(v) => updateConfig('contact.whatsapp.number', v)} />
                    <Field label="Address Line 1" value={config?.contact?.address?.line1} onChange={(v) => updateConfig('contact.address.line1', v)} />
                    <Field label="Address Line 2" value={config?.contact?.address?.line2} onChange={(v) => updateConfig('contact.address.line2', v)} />
                    <Field label="Map Link" value={config?.contact?.address?.mapLink} onChange={(v) => updateConfig('contact.address.mapLink', v)} />
                </Section>

                {/* Social Media */}
                <Section title="Social Media Links">
                    <div className="space-y-4">
                        {Object.entries(config?.socials || {}).map(([key, value]) => (
                            <div key={key} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Field
                                        label={key}
                                        value={value as string}
                                        onChange={(v) => updateConfig(`socials.${key}`, v)}
                                    />
                                </div>
                                <button
                                    onClick={() => removeSocial(key)}
                                    className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Remove Platform"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addSocial}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-blue hover:text-primary-blue hover:bg-blue-50/50 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Plus size={16} />
                        Add New Platform
                    </button>
                </Section>

                {/* Company Info */}
                <Section title="Company Details">
                    <Field label="Company Name" value={config?.company?.name} onChange={(v) => updateConfig('company.name', v)} />
                    <Field label="Legal Name" value={config?.company?.legalName} onChange={(v) => updateConfig('company.legalName', v)} />
                    <Field label="Copyright Text" value={config?.company?.copyright} onChange={(v) => updateConfig('company.copyright', v)} />
                    <h3 className="text-lg font-bold text-black my-6 uppercase tracking-wider border-b border-black/5 py-2">SEO Metadata</h3>
                    <div className="space-y-4">
                        <Field label="Meta Title" value={config?.metadata?.title} onChange={(v) => updateConfig('metadata.title', v)} />
                        <Field label="Meta Description" value={config?.metadata?.description} onChange={(v) => updateConfig('metadata.description', v)} isTextArea />
                    </div>
                </Section>

                {/* SEO */}
                {/*Section title="SEO Metadata">
                    <Field label="Meta Title" value={config?.metadata?.title} onChange={(v) => updateConfig('metadata.title', v)} />
                    <Field label="Meta Description" value={config?.metadata?.description} onChange={(v) => updateConfig('metadata.description', v)} isTextArea />
                </Section>*/}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white/50 border border-black/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wider border-b border-black/5 pb-2">{title}</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function Field({ label, value, onChange, isTextArea = false }: { label: string, value: string, onChange: (val: string) => void, isTextArea?: boolean }) {
    // No local state needed if we lift it up, but for smooth typing in managed components, local state + useEffect or just prop is fine.
    // Let's use controlled component directly for simplicity.

    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">{label}</label>
            {isTextArea ? (
                <textarea
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-primary-blue focus:ring-1 focus:ring-primary-blue outline-none transition-all h-24 resize-none placeholder:text-gray-400 font-medium"
                    placeholder={`Enter ${label}...`}
                />
            ) : (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-primary-blue focus:ring-1 focus:ring-primary-blue outline-none transition-all placeholder:text-gray-400 font-medium"
                    placeholder={`Enter ${label}...`}
                />
            )}
        </div>
    );
}
