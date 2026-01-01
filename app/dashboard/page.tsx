"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";
import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("owner");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Function to check hash and update logic
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

        // Check on mount
        checkHash();
        setIsMounted(true);

        // Listen for hash changes (e.g. back button)
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.pushState(null, '', `#${value === 'renter' ? 'rental' : 'owner'}`);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Dashboard</h1>
                    </div>

                    {!isMounted ? (
                        <div className="space-y-6">
                            {/* Tabs List Skeleton */}
                            <Skeleton className="h-12 w-full sm:w-[31rem] rounded-lg bg-slate-200" />

                            {/* Content Skeleton */}
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                            <TabsList className="bg-slate-200 p-1 w-full sm:w-auto inline-flex h-auto">
                                <TabsTrigger value="owner" className="py-2 px-6 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-safety-orange data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-md flex-1 sm:flex-none">
                                    My Listings (Owner View)
                                </TabsTrigger>
                                <TabsTrigger value="renter" className="py-2 px-6 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-safety-orange data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-md flex-1 sm:flex-none">
                                    My Rentals (Renter View)
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="owner" className="focus-visible:outline-none">
                                <OwnerDashboardView />
                            </TabsContent>

                            <TabsContent value="renter" className="focus-visible:outline-none">
                                <RenterDashboardView />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
