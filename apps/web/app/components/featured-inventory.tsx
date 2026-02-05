"use client";

import { useState, useMemo } from "react";
import { FeaturedToolCard } from "./featured-tool-card";
import { CategoryFilter } from "./category-filter";
import { Listing } from "@/app/hooks/use-marketplace";
import { MapPin } from "lucide-react";

interface FeaturedInventoryProps {
    onRentClick: () => void; // Kept for interface compatibility, though CTA handles navigation now
    listings: Listing[];
}

const CATEGORIES = ["All", "Harvest", "Heavy Machinery", "Small Power Tools", "Hand Tools", "Gardening", "Camping & Outdoor"];

// Helper to normalize category strings for comparison
const normalize = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');

export function FeaturedInventory({ onRentClick, listings }: FeaturedInventoryProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Filter Logic:
    // 1. Must be "High Value" (Tier 2 or 3) -> Price > $50 OR Heavy Machinery
    // 2. Must match selected category (if not "All")
    const filteredListings = useMemo(() => {
        return listings
            .filter(tool => {
                // Tier 2+ check (Change logic here if "Tier 2" definition changes)
                const price = Number(tool.daily_price);
                const isHighValue = price > 50 || tool.is_high_powered;
                if (!isHighValue) return false;

                if (selectedCategory === "All") return true;

                // Match category name exactly as they now align with DB
                const categoryName = tool.category?.name || "";
                return categoryName === selectedCategory;
            })
            .slice(0, 6); // Limit to 6 items
    }, [listings, selectedCategory]);

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
                <div className="flex flex-col mb-8 gap-6">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight">
                            Tools Near You
                        </h2>
                        <div className="flex items-center gap-2 mt-3 text-slate-600 font-medium">
                            <MapPin className="h-4 w-4 text-safety-orange" />
                            <p>Showing tools within 2 miles of <span className="text-slate-900 underline decoration-dotted underline-offset-4 cursor-help" title="Based on your verified address">Verified Address</span></p>
                        </div>
                    </div>

                    {/* Filter Bar */}
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
                        <p className="text-slate-500 mb-4">No high-value tools found in this category nearby.</p>
                        <button onClick={() => setSelectedCategory("All")} className="text-safety-orange font-medium hover:underline">
                            View all categories
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
