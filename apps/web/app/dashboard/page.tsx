"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";
import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("owner");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const checkHash = () => {
            if (typeof window !== 'undefined') {
                const hash = window.location.hash;
                if (hash === '#rental') {
                    setActiveTab('renter');
                } else if (hash === '#owner') {
                    setActiveTab('owner');
                }
            }
        };

        checkHash();
        setIsMounted(true);

        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.pushState(null, '', `#${value === 'renter' ? 'rental' : 'owner'}`);
    };

    return (
        <main className="min-h-screen bg-signal-white">
            <Navbar />

            <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
                <div className="flex flex-col gap-10">
                    {/* Industrial Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 max-w-[60px] bg-safety-orange/40" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-safety-orange">
                                Command Center
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 tracking-tight">
                            Dashboard
                        </h1>
                    </div>

                    {!isMounted ? (
                        <div className="space-y-6">
                            <Skeleton className="h-12 w-full sm:w-[31rem] rounded-full bg-slate-200" />
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full rounded-[2rem]" />
                                <Skeleton className="h-64 w-full rounded-[2rem]" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Industrial Pill Tabs */}
                            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-full gap-1">
                                <button
                                    onClick={() => handleTabChange("owner")}
                                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${activeTab === "owner"
                                            ? "bg-safety-orange text-white shadow-lg shadow-safety-orange/20"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                                        }`}
                                    aria-label="Switch to Owner View"
                                    tabIndex={0}
                                >
                                    My Listings (Owner)
                                </button>
                                <button
                                    onClick={() => handleTabChange("renter")}
                                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${activeTab === "renter"
                                            ? "bg-safety-orange text-white shadow-lg shadow-safety-orange/20"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                                        }`}
                                    aria-label="Switch to Renter View"
                                    tabIndex={0}
                                >
                                    My Rentals (Renter)
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div>
                                {activeTab === "owner" && <OwnerDashboardView />}
                                {activeTab === "renter" && <RenterDashboardView />}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
