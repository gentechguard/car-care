"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { MapPin, Phone, ExternalLink, Navigation } from "lucide-react";

// Dynamically import Map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const dealers = [
    {
        id: 1,
        name: "Gentech Elite - Delhi",
        location: "Okhla Phase III, New Delhi",
        coords: [28.5355, 77.2731],
        phone: "+91 98100 XXXXX",
        type: "Certified Detailer",
    },
    {
        id: 2,
        name: "Gentech Armor - Mumbai",
        location: "Andheri East, Mumbai",
        coords: [19.1136, 72.8697],
        phone: "+91 98200 XXXXX",
        type: "Flagship Studio",
    },
    {
        id: 3,
        name: "Gentech Shield - Bangalore",
        location: "Indiranagar, Bangalore",
        coords: [12.9784, 77.6408],
        phone: "+91 98300 XXXXX",
        type: "Master Studio",
    },
    {
        id: 4,
        name: "Gentech Car Care - Hyderabad",
        location: "Jubilee Hills, Hyderabad",
        coords: [17.4326, 78.4071],
        phone: "+91 98400 XXXXX",
        type: "Certified Detailer",
    },
];

export default function DealerMap() {
    const [isClient, setIsClient] = useState(false);
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        import("leaflet").then((leaflet) => {
            setL(leaflet);
            // Fix for default marker icons in Leaflet + Next.js
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            });
        });
    }, []);

    if (!isClient || !L) return <div className="h-[600px] bg-dark-bg/50 animate-pulse rounded-[2.5rem]" />;

    return (
        <section id="dealers" className="py-24 bg-dark-bg relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary-gold font-black tracking-[0.2em] uppercase text-sm mb-4 inline-block"
                    >
                        Find an Expert
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black text-white"
                    >
                        LOCATE A <span className="gold-text italic text-4xl md:text-6xl">CERTIFIED</span> DEALER
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    {/* Dealer List */}
                    <div className="lg:col-span-1 glass rounded-[2rem] border border-white/5 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                        {dealers.map((dealer) => (
                            <div
                                key={dealer.id}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-gold/50 transition-all group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-gold mb-1 block">
                                            {dealer.type}
                                        </span>
                                        <h3 className="text-lg font-black text-white">{dealer.name}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary-gold/10 flex items-center justify-center border border-primary-gold/20 group-hover:bg-primary-gold group-hover:text-white transition-colors">
                                        <Navigation size={18} />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-text-grey">
                                        <MapPin size={14} className="text-primary-gold" />
                                        {dealer.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-grey">
                                        <Phone size={14} className="text-primary-gold" />
                                        {dealer.phone}
                                    </div>
                                </div>

                                <button className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 group-hover:text-primary-gold transition-colors">
                                    GET DIRECTIONS <ExternalLink size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Interactive Map */}
                    <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                        <MapContainer
                            center={[20.5937, 78.9629] as any}
                            zoom={5}
                            style={{ height: "100%", width: "100%", background: "#070604" }}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {dealers.map((dealer) => (
                                <Marker key={dealer.id} position={dealer.coords as any}>
                                    <Popup>
                                        <div className="p-2 min-w-[150px]">
                                            <h4 className="font-black text-dark-bg text-sm mb-1">{dealer.name}</h4>
                                            <p className="text-xs text-text-grey mb-2">{dealer.location}</p>
                                            <p className="text-xs font-bold text-primary-gold">{dealer.phone}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Map Overlay Blur (Edges Only) */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
