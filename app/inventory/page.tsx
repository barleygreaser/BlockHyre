"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ToolCard, Tool } from "@/app/components/tool-card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { calculateDistance, Coordinates } from "@/lib/location";
import { Search, Filter, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock User Location (e.g., Downtown)
const USER_LOCATION: Coordinates = {
    latitude: 34.0522,
    longitude: -118.2437,
};

// Mock Inventory Data
const MOCK_INVENTORY: Tool[] = [
    {
        id: "1",
        title: "Harvest Right Freeze Dryer",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer",
        price: 45,
        deposit: 250,
        category: "Harvest",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0530, longitude: -118.2420 }, // 0.1 miles
    },
    {
        id: "2",
        title: "DeWalt 10-Inch Table Saw",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Table+Saw",
        price: 25,
        deposit: 50,
        category: "Woodworking",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0450, longitude: -118.2380 }, // 0.6 miles
    },
    {
        id: "3",
        title: "Honda Mid-Tine Rototiller",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Rototiller",
        price: 35,
        deposit: 150,
        category: "Gardening",
        isHeavyMachinery: true,
        coordinates: { latitude: 34.0600, longitude: -118.2500 }, // 0.7 miles
    },
    {
        id: "4",
        title: "Kubota Mini Excavator",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Excavator",
        price: 250,
        deposit: 500,
        category: "Heavy Machinery",
        isHeavyMachinery: true,
        coordinates: { latitude: 34.0700, longitude: -118.2600 }, // 1.6 miles
    },
    {
        id: "5",
        title: "Makita Orbital Sander",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Sander",
        price: 15,
        deposit: 50,
        category: "Woodworking",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0525, longitude: -118.2440 }, // 0.02 miles
    },
    {
        id: "6",
        title: "Post Hole Digger (Gas)",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Post+Hole",
        price: 40,
        deposit: 100,
        category: "Gardening",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0400, longitude: -118.2300 }, // 1.1 miles
    },
    {
        id: "7",
        title: "Lincoln Electric Welder",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Welder",
        price: 55,
        deposit: 150,
        category: "Metalworking",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0800, longitude: -118.2700 }, // 2.4 miles
    },
    {
        id: "8",
        title: "Pressure Washer 3000 PSI",
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Pressure+Washer",
        price: 30,
        deposit: 50,
        category: "Maintain",
        isHeavyMachinery: false,
        coordinates: { latitude: 34.0300, longitude: -118.2200 }, // 2.0 miles
    },
];

const CATEGORIES = ["Woodworking", "Metalworking", "Heavy Machinery", "Gardening", "Harvest", "Maintain"];

export default function InventoryPage() {
    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
    const [maxDistance, setMaxDistance] = useState(2.0);
    const [showHeavyMachineryOnly, setShowHeavyMachineryOnly] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter Logic
    const filteredTools = useMemo(() => {
        return MOCK_INVENTORY.map(tool => ({
            ...tool,
            distance: calculateDistance(USER_LOCATION, tool.coordinates)
        })).filter(tool => {
            // 1. Search
            if (searchQuery && !tool.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // 2. Categories
            if (selectedCategories.length > 0 && !selectedCategories.includes(tool.category)) {
                return false;
            }
            // 3. Price
            if (tool.price < priceRange[0] || tool.price > priceRange[1]) {
                return false;
            }
            // 4. Distance
            if (tool.distance && tool.distance > maxDistance) {
                return false;
            }
            // 5. Safety Level
            if (showHeavyMachineryOnly && !tool.isHeavyMachinery) {
                return false;
            }
            return true;
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
    }, [searchQuery, selectedCategories, priceRange, maxDistance, showHeavyMachineryOnly]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="What do you need to build?"
                                className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                            <MapPin className="h-4 w-4 text-safety-orange" />
                            <span>Current Location: <strong>90012</strong></span>
                        </div>

                        <Button
                            variant="outline"
                            className="md:hidden w-full"
                            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar (Filters) */}
                    <aside className={cn(
                        "w-full md:w-64 space-y-8 flex-shrink-0",
                        isMobileFiltersOpen ? "block" : "hidden md:block"
                    )}>
                        {/* Categories */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {CATEGORIES.map(category => (
                                    <label key={category} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                            selectedCategories.includes(category)
                                                ? "bg-safety-orange border-safety-orange text-white"
                                                : "border-slate-300 bg-white group-hover:border-safety-orange"
                                        )}>
                                            {selectedCategories.includes(category) && <span className="text-[10px]">✓</span>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => toggleCategory(category)}
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Daily Rate</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>${priceRange[0]}</span>
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
                        </div>

                        {/* Distance Radius */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold font-serif text-slate-900">Distance</h3>
                                <span className="text-xs font-bold text-safety-orange bg-orange-50 px-2 py-1 rounded">
                                    {maxDistance} mi
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.1"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-safety-orange"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>0.5 mi</span>
                                <span>5 mi</span>
                            </div>
                        </div>

                        {/* Safety Level */}
                        <div>
                            <h3 className="font-bold font-serif text-slate-900 mb-4">Safety Level</h3>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={cn(
                                    "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out",
                                    showHeavyMachineryOnly ? "bg-safety-orange" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out",
                                        showHeavyMachineryOnly ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={showHeavyMachineryOnly}
                                    onChange={() => setShowHeavyMachineryOnly(!showHeavyMachineryOnly)}
                                />
                                <span className="text-sm text-slate-600">Heavy Machinery Only</span>
                            </label>
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

                        {filteredTools.length > 0 ? (
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
                                        setShowHeavyMachineryOnly(false);
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
