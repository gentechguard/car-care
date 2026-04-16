// app/our-network/page.tsx
"use client";

import { motion } from "framer-motion";
import { NetworkHero } from "./components/NetworkHero";
import { IndiaMapComponent } from "./components/IndiaMap";
import { DealerFilterSidebar } from "./components/DealerFilter";
import { useDealerData } from "@/hooks/useDealerData";
import { Plus } from "lucide-react";
import Header from "@/components/Header";

export default function OurNetworkPage() {
  const {
    dealers,
    allDealers,
    availableStates,
    filters,
    stats,
    selectedDealer,
    hoveredDealer,
    updateFilter,
    clearFilters,
    selectDealer,
    hoverDealer
  } = useDealerData();

  return (
    <main className="min-h-screen bg-[#0A0A0A]" style={{ background: '#0A0A0A', color: '#fff' }}>
      <Header />
      
      {/* Hero Section */}
      <NetworkHero stats={stats} />

      {/* Map Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-[#00A8FF] text-sm font-semibold uppercase tracking-wider">
              Find a Dealer
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
              Explore Our <span className="text-[#00A8FF]">Network</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Click on any location to view dealer details, or use the filters to find a dealer near you.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <DealerFilterSidebar
              filters={filters}
              states={availableStates}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              dealerCount={dealers.length}
              totalDealers={allDealers.length}
              stats={stats}
            />

            {/* Map */}
            <motion.div
              className="flex-1 min-h-[500px] lg:min-h-[600px]"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <IndiaMapComponent
                dealers={dealers}
                selectedDealer={selectedDealer}
                hoveredDealer={hoveredDealer}
                onSelectDealer={selectDealer}
                onHoverDealer={hoverDealer}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Become a Dealer CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0F172A] to-[#0A0A0A]" />

        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,168,255,0.1) 0%, transparent 60%)"
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#00A8FF] text-sm font-semibold uppercase tracking-wider">
                Join Our Network
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
                Become a <span className="text-[#00A8FF]">Dealer</span>
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Join the fastest growing network of premium automotive protection studios in India. 
                Partner with Gentech Car Care and offer world-class PPF solutions to your customers.
              </p>

              <div className="space-y-4 mb-8">
                <BenefitItem text="Exclusive Territory Rights" />
                <BenefitItem text="Comprehensive Marketing Support" />
                <BenefitItem text="Technical Training & Certification" />
                <BenefitItem text="Priority Access to Premium Services" />
                <BenefitItem text="High-Margin Revenue Opportunities" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-enquiry', { detail: { type: 'dealer' } }))}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00A8FF] hover:bg-[#00A8FF]/90 text-black font-bold text-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Apply for Dealership
              </motion.button>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Glowing Circle */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, transparent, #00A8FF, transparent)",
                    opacity: 0.3
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Content */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0A0A0A] flex items-center justify-center border border-white/10">
                  <div className="text-center p-8">
                    <motion.div
                      className="text-7xl font-bold text-[#00A8FF] mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      100+
                    </motion.div>
                    <div className="text-white/60 text-lg">Dealers Nationwide</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-[#00A8FF] text-black font-bold text-sm"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Growing Fast
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-[#00A8FF]/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-[#00A8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-white/80">{text}</span>
    </div>
  );
}