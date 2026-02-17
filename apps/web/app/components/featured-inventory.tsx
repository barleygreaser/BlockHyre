"use client";

import { useState, useMemo, memo } from "react";
import { FeaturedToolCard } from "./featured-tool-card";
import { CategoryFilter } from "./category-filter";
import { Listing } from "@/app/hooks/use-marketplace";
import { MapPin, Search, Globe } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/app/context/auth-context";

interface FeaturedInventoryProps {
    onRentClick: () => void; // Kept for interface compatibility, though CTA handles navigation now
    listings: Listing[];
}

const CATEGORIES = ["All", "Harvest", "Heavy Machinery", "Small Power Tools", "Hand Tools", "Gardening", "Camping & Outdoor"];

const normalize = (str: string) => str.toLowerCase().trim();

export const FeaturedInventory = memo(({ listings, onRentClick }: FeaturedInventoryProps) => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Filter Logic:
    // 1. Must be "High Value" (Tier 2 or 3) -> Price > $50 OR Heavy Machinery
    // 2. Must match selected category (if not "All")
    // 3. Must match search term (if not empty)
    const filteredListings = useMemo(() => {
        return listings
            .filter(tool => {
                // Tier 2+ check (Change logic here if "Tier 2" definition changes)
                const price = Number(tool.daily_price);
                const isHighValue = price > 50 || tool.is_high_powered;
                if (!isHighValue) return false;

                // Category filter
                if (selectedCategory !== "All") {
                    const categoryName = normalize(tool.category?.name || "");
                    if (categoryName !== normalize(selectedCategory)) return false;
                }

                // Search filter
                if (searchTerm) {
                    const title = normalize(tool.title || "");
                    const desc = normalize(tool.description || "");
                    const query = normalize(searchTerm);
                    if (!title.includes(query) && !desc.includes(query)) return false;
                }

                return true;
            })
            .slice(0, 6); // Limit to 6 items
    }, [listings, selectedCategory, searchTerm]);

    // Optimize: Pre-calculate tool props to maintain referential stability
    // This allows React.memo on FeaturedToolCard to work effectively
    const cardProps = useMemo(() => {
        return filteredListings.map(tool => ({
            id: tool.id,
            title: tool.title || tool.description || "Untitled Tool", // Fallback title
            image: tool.images?.[0] || "",
            price: tool.daily_price,
            deposit: tool.deposit || 100, // Fallback if not calc'd
            category: tool.category?.name || "General",
            isHeavyMachinery: tool.is_high_powered,
            coordinates: { latitude: 0, longitude: 0 }, // Not needed for display
            distance: tool.distance,
            acceptsBarter: tool.accepts_barter,
            instantBook: tool.booking_type === 'instant'
        }));
    }, [filteredListings]);

    return (
        <section className="pt-12 pb-20 bg-slate-50 relative" id="inventory">
            {/* Background enhancement */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight">
                            {user ? "Tools Near You" : "Recent Listings"}
                        </h2>
                        <div className="flex items-center gap-2 mt-3 text-slate-600 font-medium">
                            {user ? (
                                <>
                                    <MapPin className="h-4 w-4 text-safety-orange" />
                                    <p>Showing tools within 2 miles of <span className="text-slate-900 underline decoration-dotted underline-offset-4 cursor-help" title="Based on your verified address">Verified Address</span></p>
                                </>
                            ) : (
                                <>
                                    <Globe className="h-4 w-4 text-safety-orange" />
                                    <p className="flex items-center gap-1">Showing active listings from everywhere</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-80 relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 group-focus-within:text-safety-orange transition-colors">
                            <Search className="h-4 w-4" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Find a specific tool..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border-slate-200 pl-10 h-11 focus-visible:ring-safety-orange/20 focus-visible:border-safety-orange transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-8">
                    <CategoryFilter
                        categories={CATEGORIES}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                {cardProps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cardProps.map((tool) => (
                            <FeaturedToolCard
                                key={tool.id}
                                tool={tool}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-12 text-center border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">
                            {user
                                ? "No high-value tools found matching your criteria nearby."
                                : "No high-value tools found matching your criteria."}
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCategory("All");
                                setSearchTerm("");
                            }}
                            className="text-safety-orange font-medium hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
});

FeaturedInventory.displayName = "FeaturedInventory";
