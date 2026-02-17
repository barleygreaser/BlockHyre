"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ToolCard, Tool } from "@/app/components/tool-card";
import { MobileToolCard } from "@/app/components/mobile-tool-card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Coordinates } from "@/lib/location";
import dynamic from 'next/dynamic';

// Optimization: Lazy load heavy filter modal to reduce initial bundle size and avoid hydration mismatch on mobile/desktop logic
const InventoryFiltersModal = dynamic(() => import('@/app/components/inventory/inventory-filters-modal').then(mod => mod.InventoryFiltersModal), {
    ssr: false,
});

// Optimization: Lazy load sort drawer to reduce initial bundle size
const SortDrawer = dynamic(() => import('@/app/components/inventory/sort-drawer').then(mod => mod.SortDrawer), {
    ssr: false,
});
import { Search, Filter, X, Zap, Shield, ArrowUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplace } from "@/app/hooks/use-marketplace";
import { InventorySkeleton } from "@/app/components/ui/inventory-skeleton";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Input } from "@/app/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";

import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useMediaQuery } from "@/app/hooks/use-media-query";

// Default Fallback (Woodstock, GA) - Used as center for global search
const DEFAULT_LOCATION: Coordinates = {
    latitude: 34.0924,
    longitude: -84.5097,
};

const GLOBAL_RADIUS_MILES = 20000;
const DEFAULT_LOCAL_RADIUS = 5.0;

export default function InventoryPage() {
    const { user, loading: authLoading } = useAuth();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [verifiedOwnersOnly, setVerifiedOwnersOnly] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
    const [maxDistance, setMaxDistance] = useState(DEFAULT_LOCAL_RADIUS);
    const [acceptsBarterOnly, setAcceptsBarterOnly] = useState(false);
    const [instantBookOnly, setInstantBookOnly] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_LOCATION);
    const [locationLoaded, setLocationLoaded] = useState(false);
    const [sortOption, setSortOption] = useState<"price-asc" | "price-desc" | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [neighborhoodName, setNeighborhoodName] = useState<string | null>(null);

    // Initial Setup: Determine Mode (User Neighborhood vs Global Guest)
    useEffect(() => {
        const initializeLocation = async () => {
            // Wait for auth to resolve entirely
            if (authLoading) return;

            if (user) {
                // LOGGED IN: Fetch Neighborhood
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select(`
                            neighborhood_id,
                            neighborhoods (
                                center_lat,
                                center_lon,
                                name
                            )
                        `)
                        .eq('id', user.id)
                        .single();

                    if (data?.neighborhoods) {
                        const nb = data.neighborhoods as any;
                        setUserLocation({
                            latitude: nb.center_lat,
                            longitude: nb.center_lon
                        });
                        setNeighborhoodName(nb.name);
                        setMaxDistance(DEFAULT_LOCAL_RADIUS);
                        setLocationLoaded(true);
                    } else {
                        // User logged in but no neighborhood? Fallback to Global for now
                        console.warn("User has no neighborhood assigned. Defaulting to global view.");
                        setMaxDistance(GLOBAL_RADIUS_MILES);
                        setLocationLoaded(true);
                    }
                } catch (error) {
                    console.error("Error fetching neighborhood:", error);
                    // Error state - fallback to standard
                    setMaxDistance(DEFAULT_LOCAL_RADIUS);
                    setLocationLoaded(true);
                }
            } else {
                // GUEST: Global View (No IP Tracking)
                // We use DEFAULT_LOCATION as center but with a huge radius to encompass everything
                setUserLocation(DEFAULT_LOCATION);
                setMaxDistance(GLOBAL_RADIUS_MILES);
                setLocationLoaded(true);
            }
        };

        initializeLocation();
    }, [user, authLoading]);

    const { listings, loading, categoriesLoading, error, searchListings, categories } = useMarketplace();

    // Trigger search when properties change
    useEffect(() => {
        // PREVENT SEARCH IF LOCATION/AUTH ISN'T READY
        if (!locationLoaded || authLoading) return;

        const timer = setTimeout(() => {
            searchListings(
                userLocation.latitude,
                userLocation.longitude,
                maxDistance,
                priceRange[0],
                priceRange[1],
                undefined, // Client-side category filtering
                searchQuery
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [maxDistance, priceRange, userLocation, locationLoaded, searchQuery, authLoading]);

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

            {/* Mobile Sticky Control Bar */}
            <div className="md:hidden sticky top-16 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setIsFiltersOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" className="flex-1 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setIsSortOpen(true)}>
                    <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
                </Button>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar (Filters) */}
                    <aside className={cn(
                        "w-full md:w-64 space-y-8 flex-shrink-0 hidden md:block"
                    )}>
                        {/* PHASE 1: CORE DISCOVERY */}

                        {/* Current Location Context */}
                        {user && neighborhoodName && (
                            <div className="pb-4 border-b border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Neighborhood</h3>
                                <div className="flex items-center text-slate-800 font-medium">
                                    <MapPin className="w-4 h-4 mr-1 text-safety-orange" />
                                    {neighborhoodName}
                                </div>
                            </div>
                        )}

                        {/* Search */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 bg-white border-slate-200 focus-visible:ring-safety-orange/50 focus-visible:border-safety-orange transition-all"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Categories</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                                {categoriesLoading ? (
                                    // SKELETON LOADER IMPLEMENTATION
                                    Array.from({ length: 8 }).map((_, index) => {
                                        // Vary the width for more dynamic appearance
                                        const widths = ['100px', '130px', '110px', '145px', '95px', '125px', '115px', '135px'];
                                        return (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Skeleton className="h-5 w-4 rounded-sm flex-shrink-0" />
                                                <Skeleton className="h-5 w-full" style={{ maxWidth: widths[index] }} />
                                            </div>
                                        );
                                    })
                                ) : (
                                    // ACTUAL CATEGORY LIST
                                    sortedCategories.map(category => (
                                        <div key={category.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={selectedCategories.includes(category.name)}
                                                onCheckedChange={() => toggleCategory(category.name)}
                                                className="border-slate-300 data-[state=checked]:bg-safety-orange data-[state=checked]:border-safety-orange"
                                            />
                                            <Label
                                                htmlFor={`category-${category.id}`}
                                                className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 truncate"
                                            >
                                                {category.name}
                                            </Label>
                                        </div>
                                    ))
                                )}
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
                                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Protection Tier</Label>
                                <RadioGroup value={selectedTier || ""} onValueChange={(val) => setSelectedTier(val === selectedTier ? null : val)}>
                                    <div className="space-y-3">
                                        {[
                                            { id: "1", label: "Tier 1 (Basic)", sub: "<$50/day" },
                                            { id: "2", label: "Tier 2 (Standard)", sub: "$50-$200" },
                                            { id: "3", label: "Tier 3 (Max)", sub: "$200+ or Heavy" },
                                        ].map(tier => (
                                            <div key={tier.id} className="flex items-start space-x-2">
                                                <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} className="mt-0.5" />
                                                <Label htmlFor={`tier-${tier.id}`} className="cursor-pointer">
                                                    <span className="text-slate-700 font-medium block text-sm">{tier.label}</span>
                                                    <span className="text-xs text-slate-500">{tier.sub}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Verified Owners Toggle */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="verified-owners" className="text-sm font-semibold text-slate-700 cursor-pointer">Verified Owners Only</Label>
                                    <Switch
                                        id="verified-owners"
                                        checked={verifiedOwnersOnly}
                                        onCheckedChange={setVerifiedOwnersOnly}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Distance (Only shown for logged-in users with defined neighborhood) */}
                            {user && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-sm font-semibold text-slate-700">Distance from Neighborhood</Label>
                                        <span className="text-xs font-bold text-safety-orange bg-orange-50 px-2 py-1 rounded">
                                            {maxDistance} mi
                                        </span>
                                    </div>
                                    <Slider
                                        min={0.5}
                                        max={25}
                                        step={0.5}
                                        value={[maxDistance]}
                                        onValueChange={(val) => setMaxDistance(val[0])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                                        <span>0.5 mi</span>
                                        <span>25 mi</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PHASE 3: FINANCIAL & OPTIONS */}
                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Financial & Options</h3>

                            {/* Daily Rate */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                                    <Label className="font-semibold text-slate-700">Daily Rate</Label>
                                    <span>${priceRange[1]}+</span>
                                </div>
                                <Slider
                                    min={0}
                                    max={300}
                                    step={10}
                                    value={[priceRange[1]]}
                                    onValueChange={(val) => setPriceRange([priceRange[0], val[0]])}
                                    className="w-full"
                                />
                            </div>

                            {/* Barter Toggle */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="accepts-barter" className="text-sm font-semibold text-slate-700 cursor-pointer">Accepts Barter Only</Label>
                                    <Switch
                                        id="accepts-barter"
                                        checked={acceptsBarterOnly}
                                        onCheckedChange={setAcceptsBarterOnly}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Instant Book Toggle */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="instant-book" className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                                        <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        Instant Book Only
                                    </Label>
                                    <Switch
                                        id="instant-book"
                                        checked={instantBookOnly}
                                        onCheckedChange={setInstantBookOnly}
                                        className="data-[state=checked]:bg-yellow-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content (Grid) */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            {(loading || authLoading) ? (
                                <Skeleton className="h-7 w-48" />
                            ) : (
                                <h2 className="text-xl font-bold text-slate-900">
                                    {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'} Found
                                    {!user && <span className="text-sm font-normal text-slate-500 ml-2">(Everything)</span>}
                                    {user && neighborhoodName && <span className="text-sm font-normal text-slate-500 ml-2">near {neighborhoodName}</span>}
                                </h2>
                            )}
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
                        <div className="hidden md:flex justify-end mb-6">
                            <Select
                                value={sortOption || "default"}
                                onValueChange={(value) => setSortOption(value === "default" ? null : value as any)}
                            >
                                <SelectTrigger className="w-[240px] bg-white border-slate-200 text-slate-700 font-medium focus:ring-safety-orange/20 focus:border-safety-orange">
                                    <SelectValue placeholder="Sort by: Best Match (Default)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Sort by: Best Match (Default)</SelectItem>
                                    <SelectItem value="price-asc">Price: Lowest First</SelectItem>
                                    <SelectItem value="price-desc">Price: Highest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <InventorySkeleton />
                        ) : filteredTools.length > 0 ? (
                            <>
                                {/* Mobile List View */}
                                {!isDesktop && (
                                    <div className="space-y-6">
                                        {filteredTools.map(tool => (
                                            <MobileToolCard key={tool.id} tool={tool} />
                                        ))}
                                    </div>
                                )}

                                {/* Desktop Grid View */}
                                {isDesktop && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredTools.map(tool => (
                                            <ToolCard key={tool.id} tool={tool} />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No tools found</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-6">
                                    We could not find any tools matching your criteria.
                                    Try clearing some filters.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMaxDistance(25);
                                        setSelectedCategories([]);
                                        setSearchQuery("");
                                        setPriceRange([0, 300]);
                                        setSelectedTier(null);
                                        setVerifiedOwnersOnly(false);
                                        setAcceptsBarterOnly(false);
                                        setInstantBookOnly(false);
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <InventoryFiltersModal
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedTier={selectedTier}
                setSelectedTier={setSelectedTier}
                verifiedOwnersOnly={verifiedOwnersOnly}
                setVerifiedOwnersOnly={setVerifiedOwnersOnly}
                maxDistance={maxDistance}
                setMaxDistance={setMaxDistance}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                acceptsBarterOnly={acceptsBarterOnly}
                setAcceptsBarterOnly={setAcceptsBarterOnly}
                instantBookOnly={instantBookOnly}
                setInstantBookOnly={setInstantBookOnly}
                showDistanceFilter={!!user}
            />

            <SortDrawer
                isOpen={isSortOpen}
                onClose={() => setIsSortOpen(false)}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            <Footer />
        </main>
    );
}
