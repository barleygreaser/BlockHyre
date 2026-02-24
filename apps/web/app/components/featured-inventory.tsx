"use client";

import { useState, useMemo, memo, useEffect, useRef } from "react";
import { FeaturedToolCard } from "./featured-tool-card";
import { CategoryFilter } from "./category-filter";
import { Listing } from "@/app/hooks/use-marketplace";
import { MapPin, Search, Globe } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/app/context/auth-context";

interface FeaturedInventoryProps {
    onRentClick: () => void;
    listings: Listing[];
}

const CATEGORIES = ["All", "Woodworking", "Power Tools", "Gardening", "Heavy Machinery", "Hand Tools", "Camping & Outdoor"];

const normalize = (str: string) => str.toLowerCase().trim();

export const FeaturedInventory = memo(({ listings, onRentClick }: FeaturedInventoryProps) => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const sectionRef = useRef<HTMLElement>(null);

    const normalizedListings = useMemo(() => {
        return listings.map(tool => ({
            ...tool,
            normTitle: normalize(tool.title || ""),
            normDesc: normalize(tool.description || ""),
            normCategory: normalize(tool.category?.name || ""),
            price: Number(tool.daily_price)
        }));
    }, [listings]);

    const filteredListings = useMemo(() => {
        const normSelectedCategory = selectedCategory !== "All" ? normalize(selectedCategory) : null;
        const normSearchTerm = searchTerm ? normalize(searchTerm) : null;

        return normalizedListings
            .filter(tool => {
                const isHighValue = tool.price > 50 || tool.is_high_powered;
                if (!isHighValue) return false;

                if (normSelectedCategory) {
                    if (tool.normCategory !== normSelectedCategory) return false;
                }

                if (normSearchTerm) {
                    if (!tool.normTitle.includes(normSearchTerm) && !tool.normDesc.includes(normSearchTerm)) return false;
                }

                return true;
            })
            .slice(0, 6);
    }, [normalizedListings, selectedCategory, searchTerm]);

    const cardProps = useMemo(() => {
        return filteredListings.map(tool => ({
            id: tool.id,
            title: tool.title || tool.description || "Untitled Tool",
            image: tool.images?.[0] || "",
            price: tool.daily_price,
            deposit: tool.deposit || 100,
            category: tool.category?.name || "General",
            isHeavyMachinery: tool.is_high_powered,
            coordinates: { latitude: 0, longitude: 0 },
            distance: tool.distance,
            acceptsBarter: tool.accepts_barter,
            instantBook: tool.booking_type === 'instant'
        }));
    }, [filteredListings]);

    useEffect(() => {
        const loadGsap = async () => {
            try {
                const gsapModule = await import("gsap");
                const scrollTriggerModule = await import("gsap/ScrollTrigger");
                const gsap = gsapModule.default;
                const ScrollTrigger = scrollTriggerModule.default;
                gsap.registerPlugin(ScrollTrigger);

                if (!sectionRef.current) return;

                const cards = sectionRef.current.querySelectorAll(".inventory-card");

                cards.forEach((card, idx) => {
                    gsap.from(card, {
                        x: idx % 2 === 0 ? -60 : 60,
                        opacity: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 90%",
                            toggleActions: "play none none none",
                        },
                    });
                });
            } catch {
                // Graceful degradation
            }
        };
        loadGsap();
    }, [cardProps]);

    return (
        <section ref={sectionRef} className="py-20 md:py-32 bg-concrete/30 relative" id="inventory">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 max-w-[60px] bg-safety-orange/40" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-safety-orange">
                                Inventory
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif tracking-tight">
                            {user ? "Tools Near You" : "Recent Listings"}
                        </h2>
                        <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm font-medium">
                            {user ? (
                                <>
                                    <MapPin className="h-4 w-4 text-safety-orange" />
                                    <p>Tools within <span className="text-slate-900 font-bold">2 miles</span> of your verified address</p>
                                </>
                            ) : (
                                <>
                                    <Globe className="h-4 w-4 text-safety-orange" />
                                    <p>Showing active listings from everywhere</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-80 relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10 group-focus-within:text-safety-orange transition-colors">
                            <Search className="h-4 w-4" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search tools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 pl-10 h-11 focus-visible:ring-safety-orange/20 focus-visible:border-safety-orange/40 transition-all rounded-xl"
                            aria-label="Search tools"
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-10">
                    <CategoryFilter
                        categories={CATEGORIES}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                {/* Tool Grid */}
                {cardProps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cardProps.map((tool) => (
                            <div key={tool.id} className="inventory-card">
                                <FeaturedToolCard tool={tool} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm">
                        <p className="text-slate-400 mb-4 font-mono text-sm">
                            {user
                                ? "No high-value tools found matching your criteria nearby."
                                : "No high-value tools found matching your criteria."}
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCategory("All");
                                setSearchTerm("");
                            }}
                            className="text-safety-orange font-bold text-sm uppercase tracking-wider hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
});

FeaturedInventory.displayName = "FeaturedInventory";
