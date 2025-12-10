"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";
import { useAuth } from "@/app/context/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Dashboard</h1>
                    </div>

                    <Tabs defaultValue="owner" className="space-y-6">
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
