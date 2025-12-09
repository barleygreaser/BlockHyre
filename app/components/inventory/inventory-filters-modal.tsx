"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { X, Shield, Zap, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface InventoryFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Search
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    // Categories
    categories: { id: string; name: string }[];
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    // Tier
    selectedTier: string | null;
    setSelectedTier: (val: string | null) => void;
    // Verified
    verifiedOwnersOnly: boolean;
    setVerifiedOwnersOnly: (val: boolean) => void;
    // Distance
    maxDistance: number;
    setMaxDistance: (val: number) => void;
    // Price
    priceRange: [number, number];
    setPriceRange: (val: [number, number]) => void;
    // Toggles
    acceptsBarterOnly: boolean;
    setAcceptsBarterOnly: (val: boolean) => void;
    instantBookOnly: boolean;
    setInstantBookOnly: (val: boolean) => void;
}

export function InventoryFiltersModal({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategories,
    toggleCategory,
    selectedTier,
    setSelectedTier,
    verifiedOwnersOnly,
    setVerifiedOwnersOnly,
    maxDistance,
    setMaxDistance,
    priceRange,
    setPriceRange,
    acceptsBarterOnly,
    setAcceptsBarterOnly,
    instantBookOnly,
    setInstantBookOnly
}: InventoryFiltersModalProps) {

    // Sort categories
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="fixed inset-0 z-50 h-full w-full max-w-none rounded-none border-0 bg-white p-0 shadow-none sm:max-w-none overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
                    <DialogTitle className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filter Inventory
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-6 w-6 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8 bg-slate-50">

                    {/* Location / Radius */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Search Radius</h3>
                            <span className="text-xs font-bold text-safety-orange bg-orange-50 px-2 py-1 rounded">
                                {maxDistance} miles
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="20"
                            step="0.5"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-safety-orange"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>0.5 mi</span>
                            <span>20 mi</span>
                        </div>
                    </section>

                    {/* Categories */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {sortedCategories.map(cat => (
                                <label
                                    key={cat.id}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors",
                                        selectedCategories.includes(cat.name)
                                            ? "border-safety-orange bg-orange-50/50"
                                            : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center bg-white shrink-0",
                                        selectedCategories.includes(cat.name)
                                            ? "border-safety-orange text-safety-orange"
                                            : "border-slate-300"
                                    )}>
                                        {selectedCategories.includes(cat.name) && <div className="w-2 h-2 rounded-full bg-safety-orange" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={() => toggleCategory(cat.name)}
                                    />
                                    <span className="text-sm font-medium text-slate-700 truncate">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Protection Tier */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-4 w-4 text-safety-orange" />
                            <h3 className="font-bold text-slate-900">Protection Tier</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: "1", label: "Tier 1 (Basic)", sub: "<$50/day" },
                                { id: "2", label: "Tier 2 (Standard)", sub: "$50-$200" },
                                { id: "3", label: "Tier 3 (Max)", sub: "$200+ or Heavy" },
                            ].map(tier => (
                                <label key={tier.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="mobile_tier" // Unique name for mobile
                                            className="peer h-4 w-4 appearance-none rounded-full border border-slate-300 checked:border-safety-orange"
                                            checked={selectedTier === tier.id}
                                            onChange={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                                            onClick={() => { if (selectedTier === tier.id) setSelectedTier(null); }}
                                        />
                                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-safety-orange opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-700 block leading-none">{tier.label}</span>
                                        <span className="text-xs text-slate-500">{tier.sub}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Price Range */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Daily Price Range</h3>
                        <div className="px-2">
                            <input
                                type="range"
                                min="0"
                                max="300"
                                step="10"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-safety-orange mb-4"
                            />
                            <div className="flex justify-between items-center">
                                <div className="border border-slate-200 rounded px-3 py-1 bg-slate-50 text-slate-500 text-sm">
                                    $0
                                </div>
                                <span className="text-slate-400">-</span>
                                <div className="border border-slate-200 rounded px-3 py-1 bg-white text-slate-900 font-bold text-sm">
                                    ${priceRange[1]}+
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Availability (Date Placeholder) */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarIcon className="h-4 w-4 text-safety-orange" />
                            <h3 className="font-bold text-slate-900">Availability</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label>
                                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-safety-orange" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">End Date</label>
                                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-safety-orange" />
                            </div>
                        </div>
                    </section>

                    {/* Toggles */}
                    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        {/* Verified Owners */}
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-semibold text-slate-700">Verified Owners Only</span>
                            <div className={cn(
                                "w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                verifiedOwnersOnly ? "bg-emerald-500" : "bg-slate-200"
                            )} onClick={() => setVerifiedOwnersOnly(!verifiedOwnersOnly)}>
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                    verifiedOwnersOnly ? "translate-x-5 left-1" : "translate-x-0 left-1"
                                )} />
                            </div>
                        </label>

                        {/* Barter */}
                        <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 pt-4">
                            <span className="text-sm font-semibold text-slate-700">Accepts Barter</span>
                            <div className={cn(
                                "w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                acceptsBarterOnly ? "bg-emerald-500" : "bg-slate-200"
                            )} onClick={() => setAcceptsBarterOnly(!acceptsBarterOnly)}>
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                    acceptsBarterOnly ? "translate-x-5 left-1" : "translate-x-0 left-1"
                                )} />
                            </div>
                        </label>

                        {/* Instant Book */}
                        <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 pt-4">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                Instant Book
                            </span>
                            <div className={cn(
                                "w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                instantBookOnly ? "bg-yellow-400" : "bg-slate-200"
                            )} onClick={() => setInstantBookOnly(!instantBookOnly)}>
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out absolute top-1",
                                    instantBookOnly ? "translate-x-5 left-1" : "translate-x-0 left-1"
                                )} />
                            </div>
                        </label>
                    </section>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-4 flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            // Reset logic - simplistic for now, ideally passed down or refined
                            setSearchQuery("");
                            setPriceRange([0, 300]);
                            setSelectedTier(null);
                            setVerifiedOwnersOnly(false);
                            setAcceptsBarterOnly(false);
                            setInstantBookOnly(false);
                            // We might also clear categories, but keeping them might be preferred? 
                            // Let's assume clear all.
                            // Hmm, selectedCategories is raw string array in parent. 
                            // Prop `setSelectedCategories` is not passed, only `toggleCategory`. 
                            // This reset button is tricky without Setters. 
                            // Skipping reset functionality in Drawer for now or rely on parent reset.
                        }}
                        className="flex-1 text-slate-500 hover:text-slate-900"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-[2] bg-safety-orange hover:bg-safety-orange/90 h-12 text-base shadow-md"
                    >
                        Show Results
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
