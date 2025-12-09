"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ToolCard, Tool } from "@/app/components/tool-card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { calculateDistance, Coordinates } from "@/lib/location";
import { Search, Filter, MapPin, X, Loader2, Zap, Shield, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplace } from "@/app/hooks/use-marketplace";
import { InventorySkeleton } from "@/app/components/ui/inventory-skeleton";

// Mock User Location (e.g., Downtown)
const USER_LOCATION: Coordinates = {
    latitude: 34.0522,
    longitude: -118.2437,
};



export default function InventoryPage() {
    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [verifiedOwnersOnly, setVerifiedOwnersOnly] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
    const [maxDistance, setMaxDistance] = useState(5.0);
    const [acceptsBarterOnly, setAcceptsBarterOnly] = useState(false);
    const [instantBookOnly, setInstantBookOnly] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const [userZip, setUserZip] = useState("90012");
    const [userLocation, setUserLocation] = useState<Coordinates>({ latitude: 34.0522, longitude: -118.2437 });
    const [isEditingZip, setIsEditingZip] = useState(false);
    const [sortOption, setSortOption] = useState<"price-asc" | "price-desc" | null>(null);

    // Simple Zip to Coords map (Mocking a geocoding service)
    const getCoordsFromZip = (zip: string): Coordinates | null => {
        const zipMap: Record<string, Coordinates> = {
            "90012": { latitude: 34.0522, longitude: -118.2437 }, // Downtown LA
            "90028": { latitude: 34.1000, longitude: -118.3281 }, // Hollywood
            "90401": { latitude: 34.0195, longitude: -118.4912 }, // Santa Monica
            "91101": { latitude: 34.1478, longitude: -118.1445 }, // Pasadena
        };
        return zipMap[zip] || null;
    };

    const handleZipUpdate = (newZip: string) => {
        setUserZip(newZip);
        const coords = getCoordsFromZip(newZip);
        if (coords) {
            setUserLocation(coords);
            setIsEditingZip(false);
        }
    };

    const { listings, loading, error, searchListings, categories } = useMarketplace();

    // Trigger search when filters change
    useEffect(() => {
        // Debounce could be added here
        const timer = setTimeout(() => {
            searchListings(
                userLocation.latitude,
                userLocation.longitude,
                maxDistance,
                priceRange[0],
                priceRange[1],
                selectedCategories.length === 1 ? selectedCategories[0] : undefined // RPC only supports one category for now
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [maxDistance, priceRange, selectedCategories, userLocation]); // Re-run when these change

    // Map Supabase listings to Tool format
    const inventoryTools: (Tool & { tier: number, ownerVerified: boolean })[] = useMemo(() => {
        return listings.map((listing: any) => {
            // Calculate Tier
            let tier = 1;
            const isHighPower = listing.is_high_powered || listing.category.name === "Heavy Machinery";
            if (isHighPower || listing.daily_price > 200) tier = 3;
            else if (listing.daily_price > 50) tier = 2;

            return {
                id: listing.id,
                title: listing.title,
                // Use image from DB or fallback
                image: listing.images?.[0] || `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(listing.title)}`,
                price: listing.daily_price,
                deposit: 100,
                category: listing.category.name,
                isHeavyMachinery: isHighPower,
                acceptsBarter: listing.accepts_barter,
                instantBook: listing.booking_type === 'instant',
                coordinates: listing.coordinates || userLocation,
                distance: listing.distance, // Use distance from RPC
                tier: tier,
                ownerVerified: true // Mock for now
            };
        });
    }, [listings, userLocation]);

    // Client-side sorting/filtering
    const filteredTools = useMemo(() => {
        return inventoryTools.filter(tool => {
            // 1. Search
            if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // 2. Protection Tier
            if (selectedTier && tool.tier !== parseInt(selectedTier)) {
                return false;
            }
            // 3. Verified Owners
            if (verifiedOwnersOnly && !tool.ownerVerified) {
                return false;
            }
            // 4. Barter
            if (acceptsBarterOnly && !tool.acceptsBarter) {
                return false;
            }
            // 5. Instant Book
            if (instantBookOnly && !tool.instantBook) {
                return false;
            }
            // 6. Categories
            if (selectedCategories.length > 0 && !selectedCategories.includes(tool.category)) {
                return false;
            }
            return true;
        })
            .sort((a, b) => {
                if (sortOption === "price-asc") {
                    return a.price - b.price;
                } else if (sortOption === "price-desc") {
                    return b.price - a.price;
                }
                return 0;
            });
    }, [inventoryTools, searchQuery, selectedTier, verifiedOwnersOnly, acceptsBarterOnly, instantBookOnly, selectedCategories, sortOption]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Sort categories alphabetically
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            {/* ... component placeholder if any ... */}

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar (Filters) */}
                    <aside className={cn(
                        "w-full md:w-64 space-y-8 flex-shrink-0",
                        isMobileFiltersOpen ? "block" : "hidden md:block"
                    )}>
                        {/* PHASE 1: CORE DISCOVERY */}

                        {/* Search */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-safety-orange/50 focus:border-safety-orange transition-all"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Categories</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                {sortedCategories.map(category => (
                                    <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                            selectedCategories.includes(category.name)
                                                ? "bg-safety-orange border-safety-orange text-white"
                                                : "border-slate-300 bg-white group-hover:border-safety-orange"
                                        )}>
                                            {selectedCategories.includes(category.name) && <span className="text-[10px]">✓</span>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCategories.includes(category.name)}
                                            onChange={() => toggleCategory(category.name)}
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 truncate">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* PHASE 2: BLOCKHYRE TRUST & ACCESS */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-4 w-4 text-safety-orange" />
                                <h3 className="font-bold font-serif text-slate-900">Trust & Access</h3>
                            </div>

                            {/* Protection Tier */}
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Protection Tier</label>
                                <div className="space-y-2">
                                    {[
                                        { id: "1", label: "Tier 1 (Basic)", sub: "<$50/day" },
                                        { id: "2", label: "Tier 2 (Standard)", sub: "$50-$200" },
                                        { id: "3", label: "Tier 3 (Max)", sub: "$200+ or Heavy" },
                                    ].map(tier => (
                                        <label key={tier.id} className="flex items-start gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="tier"
                                                className="mt-1 accent-safety-orange"
                                                checked={selectedTier === tier.id}
                                                onChange={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                                                onClick={() => { if (selectedTier === tier.id) setSelectedTier(null); }} // Allow unchecking
                                            />
                                            <div className="text-sm">
                                                <span className="text-slate-700 font-medium block">{tier.label}</span>
                                                <span className="text-xs text-slate-500">{tier.sub}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Verified Owners Toggle */}
                            <div className="mb-6">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-semibold text-slate-700">Verified Owners Only</span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                        verifiedOwnersOnly ? "bg-emerald-500" : "bg-slate-200"
                                    )} onClick={() => setVerifiedOwnersOnly(!verifiedOwnersOnly)}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                            verifiedOwnersOnly ? "translate-x-4 left-1" : "translate-x-0 left-1"
                                        )} />
                                    </div>
                                </label>
                            </div>

                            {/* Distance */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">Distance from Home</span>
                                    <span className="text-xs font-bold text-safety-orange bg-orange-50 px-2 py-1 rounded">
                                        {maxDistance} mi
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5"
                                    step="0.5"
                                    value={maxDistance}
                                    onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-safety-orange"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>0.5 mi</span>
                                    <span>5 mi</span>
                                </div>
                            </div>
                        </div>

                        {/* PHASE 3: FINANCIAL & OPTIONS */}
                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Financial & Options</h3>

                            {/* Daily Rate */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                    <span className="font-semibold text-slate-700">Daily Rate</span>
                                    <span>${priceRange[1]}+</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="300"
                                    step="10"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-safety-orange"
                                />
                            </div>

                            {/* Barter Toggle */}
                            <div className="mb-6">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-semibold text-slate-700">Accepts Barter Only</span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                        acceptsBarterOnly ? "bg-emerald-500" : "bg-slate-200"
                                    )} onClick={() => setAcceptsBarterOnly(!acceptsBarterOnly)}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                            acceptsBarterOnly ? "translate-x-4 left-1" : "translate-x-0 left-1"
                                        )} />
                                    </div>
                                </label>
                            </div>

                            {/* Instant Book Toggle */}
                            <div>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        Instant Book Only
                                    </span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                        instantBookOnly ? "bg-yellow-400" : "bg-slate-200"
                                    )} onClick={() => setInstantBookOnly(!instantBookOnly)}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                            instantBookOnly ? "translate-x-4 left-1" : "translate-x-0 left-1"
                                        )} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content (Grid) */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'} Found
                            </h2>
                            {/* Active Filters Summary */}
                            <div className="flex gap-2 flex-wrap">
                                {selectedCategories.map(cat => (
                                    <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                                        {cat}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                                            onClick={() => toggleCategory(cat)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Sorting Controls */}
                        <div className="flex justify-end mb-6">
                            <div className="relative group">
                                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-safety-orange transition-colors pointer-events-none" />
                                <select
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-safety-orange/20 focus:border-safety-orange font-medium text-sm transition-all cursor-pointer hover:border-slate-300 w-[240px]"
                                    value={sortOption || ""}
                                    onChange={(e) => setSortOption(e.target.value as any || null)}
                                >
                                    <option value="">Sort by: Best Match (Default)</option>
                                    <option value="price-asc">Price: Lowest First</option>
                                    <option value="price-desc">Price: Highest First</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <InventorySkeleton />
                        ) : filteredTools.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTools.map(tool => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No tools found nearby</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-6">
                                    We couldn't find any tools matching your criteria within {maxDistance} miles.
                                    Try increasing your search radius or clearing some filters.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMaxDistance(5);
                                        setSelectedCategories([]);
                                        setSearchQuery("");
                                        setPriceRange([0, 300]);
                                        setSelectedTier(null);
                                        setVerifiedOwnersOnly(false);
                                        setAcceptsBarterOnly(false);
                                        setInstantBookOnly(false);
                                    }}
                                >
                                    Expand Search Radius
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
