"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bentoTabs = [
    {
        id: "plan",
        name: "Plan your week",
        title: "Organize Your Operations",
        desc: "Set up your schedule for the upcoming week. From big landscaping jobs to daily neighborhood tasks, stay on top of your projects.",
        image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80"
    },
    {
        id: "grocery",
        name: "Create grocery list",
        title: "Stock Up on Supplies",
        desc: "List out all the materials, hardware, and groceries you need for the week. Seamlessly track everything in your local area.",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
    },
    {
        id: "recipes",
        name: "Save recipes",
        title: "Bookmark Your Favorites",
        desc: "Save the best project blueprints, tool combinations, and recipes. Access your personal curated lists instantly.",
        image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80"
    }
];

export function CategoryDiscovery() {
    const [activeTabId, setActiveTabId] = useState("plan");
    const activeTab = bentoTabs.find(t => t.id === activeTabId) || bentoTabs[0];

    return (
        <section className="py-12 md:py-16 px-4 md:px-8 max-w-screen-xl mx-auto bg-white">
            
            {/* Bento Box Container */}
            <div className="bg-[#FAF9F6] rounded-[40px] p-8 md:p-12 lg:p-16 flex flex-col items-center">
                
                {/* Segmented Control Navigation */}
                <div className="mb-12 bg-black/5 p-1.5 rounded-full inline-flex items-center gap-1 shadow-inner relative z-20 overflow-hidden text-center mx-auto">
                    {bentoTabs.map((tab) => {
                        const isActive = activeTabId === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`relative px-5 md:px-8 py-3 rounded-full text-sm md:text-base font-sans font-bold transition-colors duration-300 z-10 ${
                                    isActive ? "text-white" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-[#F06449] rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Bento Content Layout */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Primary Bento Hero Card */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden group">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="space-y-6 max-w-2xl"
                            >
                                <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A1A] leading-tight">
                                    {activeTab.title}
                                </h2>
                                <p className="text-base md:text-lg text-[#333333]/80 font-sans leading-relaxed">
                                    {activeTab.desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Secondary Bento Media Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl overflow-hidden min-h-[300px] lg:min-h-[400px] relative">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={activeTab.image}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                src={activeTab.image}
                                alt={activeTab.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Additional Bento Informational Cards (Static examples to complete the bento look) */}
                    <div className="lg:col-span-4 bg-[#F5F4F0] rounded-3xl p-8 flex flex-col justify-between">
                        <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/40 mb-4 block">Quick Action</span>
                        <div className="space-y-2">
                            <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">Smart Sync</h3>
                            <p className="text-sm text-[#333333]/70">Automatically link your curated lists across the neighborhood network.</p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-[#F5F4F0] rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative">
                        <div className="relative z-10 space-y-2 max-w-md">
                            <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/40 mb-4 block">Telemetry</span>
                            <h3 className="font-serif font-bold text-2xl text-[#1A1A1A]">Operational Efficiency</h3>
                            <p className="text-sm md:text-base text-[#333333]/70">Your personalized dashboard adjusts to your schedule, creating a seamless connection between your plans, lists, and required equipment.</p>
                        </div>
                        {/* Decorative Bento Element */}
                        <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-[#F06449]/5 rounded-full blur-3xl pointer-events-none" />
                    </div>

                </div>
            </div>
        </section>
    );
}
