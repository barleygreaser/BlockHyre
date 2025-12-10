"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { MapPin, Check, Loader2, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface Neighborhood {
    id: string;
    name: string;
    center_lat: number;
    center_lon: number;
    service_radius_miles: number;
}

import { usePathname } from "next/navigation";

// ... imports

export function LocationOnboardingModal() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. Check if user needs to select a neighborhood
    useEffect(() => {
        if (!user) return;

        // Define protected routes where location is mandatory
        const protectedPaths = ["/dashboard", "/inventory", "/add-tool", "/profile", "/cart", "/my-rentals", "/messages"];
        const isProtectedRoute = protectedPaths.some(path => pathname?.startsWith(path));

        if (!isProtectedRoute) {
            setIsOpen(false);
            return;
        }

        const checkUserLocation = async () => {
            try {
                // Fetch profile to see if neighborhood_id is set
                const { data: profile } = await supabase
                    .from('users')
                    .select('neighborhood_id')
                    .eq('id', user.id)
                    .single();

                if (profile && !profile.neighborhood_id) {
                    setIsOpen(true);
                    fetchNeighborhoods();
                } else {
                    setIsOpen(false);
                }
            } catch (error) {
                console.error("Error checking user location:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserLocation();
    }, [user, pathname]);

    // 2. Fetch available pilot neighborhoods
    const fetchNeighborhoods = async () => {
        const { data } = await supabase.from('neighborhoods').select('*');
        if (data) {
            setNeighborhoods(data);
        }
    };

    // Mock "Google Places Autocomplete" behavior
    const filteredNeighborhoods = neighborhoods.filter(n =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "Woodstock, GA".toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirm = async () => {
        if (!user || !selectedNeighborhood) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ neighborhood_id: selectedNeighborhood.id })
                .eq('id', user.id);

            if (error) throw error;

            // Close modal on success
            setIsOpen(false);
            // Reload to ensure all dashboard data refetches with new location context
            window.location.reload();
        } catch (error) {
            console.error("Error updating location:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-bold font-serif mb-3 leading-tight">
                        {/* CHANGE 1 & 2: Safety Orange text and block display for new line */}
                        <span className="text-safety-orange block mb-1">
                            Welcome to BlockHyre!
                        </span>
                        <span className="text-slate-900 text-xl">
                            We're currently piloting in two neighborhoods.
                        </span>
                    </h2>
                    <p className="text-slate-600">
                        Please confirm your address to ensure you are within our service area and can view local listings.
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 pt-2 space-y-6 overflow-y-auto">

                    {/* Address Input (Mock Autocomplete) */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Enter your address
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. 123 Pine St, Woodstock, GA"
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-safety-orange/50 focus:border-safety-orange transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedNeighborhood(null); // Reset selection on type
                                }}
                            />
                        </div>

                        {/* Autocomplete Suggestions */}
                        {searchTerm.length > 1 && !selectedNeighborhood && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                <p className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                                    SUGGESTED NEIGHBORHOODS (PILOT)
                                </p>
                                {filteredNeighborhoods.length > 0 ? (
                                    filteredNeighborhoods.map(n => (
                                        <button
                                            key={n.id}
                                            className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 transition-colors"
                                            onClick={() => {
                                                setSearchTerm(`${n.name}, Woodstock, GA`);
                                                setSelectedNeighborhood(n);
                                            }}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-slate-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{n.name}</div>
                                                <div className="text-sm text-slate-500">Woodstock, GA • {n.service_radius_miles} mi radius</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-slate-500">
                                        No pilot neighborhoods found matching "{searchTerm}".
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Map Visualization (Mock) */}
                    <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                        {/* Placeholder Map Background */}
                        <div
                            className="absolute inset-0 opacity-50 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/15/8563/13106.png')] bg-cover bg-center"
                            style={{ filter: "grayscale(50%)" }}
                        />

                        {/* Messages */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {selectedNeighborhood ? (
                                <div className="text-center animate-in fade-in zoom-in duration-300">
                                    <div className="h-24 w-24 bg-safety-orange/20 rounded-full border-2 border-safety-orange mx-auto flex items-center justify-center backdrop-blur-sm relative">
                                        <div className="h-3 w-3 bg-safety-orange rounded-full shadow-lg" />
                                        <div className="absolute -bottom-8 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-800 border border-slate-200 whitespace-nowrap">
                                            {selectedNeighborhood.name} Radius
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Map will update when address is selected</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer / CTA */}
                <div className="p-8 pt-0 mt-auto">
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedNeighborhood || isUpdating}
                        className={cn(
                            "w-full h-12 text-base font-bold shadow-lg transition-all",
                            selectedNeighborhood
                                ? "bg-safety-orange hover:bg-safety-orange/90 text-white"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                        )}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Setting Location...
                            </>
                        ) : selectedNeighborhood ? (
                            "Confirm Location & Start Renting"
                        ) : (
                            "Enter Address to Continue"
                        )}
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By confirming, you agree to our Service Area Terms & Conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}