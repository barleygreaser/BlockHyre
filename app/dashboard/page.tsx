"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("owner");

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

        // Listen for hash changes (e.g. back button)
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Use replaceState to avoid cluttering history, or pushState if we want each tab change to be in history
        // User didn't specify, but typically tabs might not populate history excessively. 
        // However, "add to the end of the url" implies navigation relevance.
        // Let's use pushState so users can back out of a view change if they want, 
        // or actually replaceState is often better for tabs unless it is a major navigation.
        // Given the request is about "adding... hash", I"ll use replaceState to keep it clean unless requested otherwise, 
        // but pushState is safer for 'back' button expectations if they consider it a "page".
        // Let's stick to replaceState for now as it's cleaner for just toggling views properties.
        // Wait, if I send a link /dashboard#renter, and they click 'listings', they might expect back to go to 'rentals'.
        // Let's use pushState.
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
                </div>
            </div>

            <Footer />
        </main>
    );
}
