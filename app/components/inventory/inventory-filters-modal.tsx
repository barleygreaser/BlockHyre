"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/app/components/ui/drawer";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { X, Shield, Zap, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";

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

export function InventoryFiltersModal(props: InventoryFiltersModalProps) {
    const { isOpen, onClose } = props;
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="fixed inset-0 z-50 h-full w-full max-w-none rounded-none border-0 bg-white p-0 shadow-none sm:max-w-none overflow-hidden flex flex-col">
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
                    {/* Reusing the content via a component would be cleaner, but for now inlining the refactored logic for both is fine or passing props to a shared child */}
                    <FilterContent {...props} isDesktop={true} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh] flex flex-col rounded-t-[10px]">
                <DrawerHeader className="text-left border-b border-slate-200 px-4 py-3">
                    <DrawerTitle className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filter Inventory
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <FilterContent {...props} isDesktop={false} />
                </div>
                {/* Footer Actions embedded in content or separate? User requested 'Show Results' fixed at bottom of Drawer */}
                <DrawerFooter className="pt-2 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-4 w-full">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                props.setSearchQuery("");
                                props.setPriceRange([0, 300]);
                                props.setSelectedTier(null);
                                props.setVerifiedOwnersOnly(false);
                                props.setAcceptsBarterOnly(false);
                                props.setInstantBookOnly(false);
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
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function FilterContent(props: InventoryFiltersModalProps & { isDesktop: boolean }) {
    const {
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
        setInstantBookOnly,
        isDesktop
    } = props;

    // Sort categories
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={cn("p-4 space-y-8", isDesktop ? "flex-1 overflow-y-auto bg-slate-50" : "")}>
            {/* Location / Radius */}
            <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <Label className="font-bold text-slate-900">Search Radius</Label>
                    <span className="text-xs font-bold text-safety-orange bg-orange-50 px-2 py-1 rounded">
                        {maxDistance} miles
                    </span>
                </div>
                <Slider
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={[maxDistance]}
                    onValueChange={(val) => setMaxDistance(val[0])}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>0.5 mi</span>
                    <span>20 mi</span>
                </div>
            </section>

            {/* Categories */}
            <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <Label className="font-bold text-slate-900 mb-4 block">Categories</Label>
                <div className="grid grid-cols-2 gap-3">
                    {sortedCategories.map(cat => (
                        <div
                            key={cat.id}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors",
                                selectedCategories.includes(cat.name)
                                    ? "border-safety-orange bg-orange-50/50"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                            onClick={() => toggleCategory(cat.name)}
                        >
                            <Checkbox
                                id={`filter-cat-${cat.id}`}
                                checked={selectedCategories.includes(cat.name)}
                                onCheckedChange={() => toggleCategory(cat.name)}
                                className="data-[state=checked]:bg-safety-orange data-[state=checked]:border-safety-orange"
                            />
                            <span className="text-sm font-medium text-slate-700 truncate select-none">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Protection Tier */}
            <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-safety-orange" />
                    <Label className="font-bold text-slate-900">Protection Tier</Label>
                </div>
                <RadioGroup value={selectedTier || ""} onValueChange={(val) => setSelectedTier(val === selectedTier ? null : val)}>
                    <div className="space-y-3">
                        {[
                            { id: "1", label: "Tier 1 (Basic)", sub: "<$50/day" },
                            { id: "2", label: "Tier 2 (Standard)", sub: "$50-$200" },
                            { id: "3", label: "Tier 3 (Max)", sub: "$200+ or Heavy" },
                        ].map(tier => (
                            <div key={tier.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={tier.id} id={`mobile-tier-${tier.id}`} onClick={() => { if (selectedTier === tier.id) setSelectedTier(null) }} />
                                <Label htmlFor={`mobile-tier-${tier.id}`} className="cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700 block leading-none">{tier.label}</span>
                                    <span className="text-xs text-slate-500">{tier.sub}</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            </section>

            {/* Price Range */}
            <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <Label className="font-bold text-slate-900 mb-4 block">Daily Price Range</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={300}
                        step={10}
                        value={[priceRange[1]]}
                        onValueChange={(val) => setPriceRange([priceRange[0], val[0]])}
                        className="w-full mb-4"
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

            {/* Toggles */}
            <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                {/* Verified Owners */}
                <div className="flex items-center justify-between">
                    <Label htmlFor="mobile-verified" className="text-sm font-semibold text-slate-700">Verified Owners Only</Label>
                    <Switch
                        id="mobile-verified"
                        checked={verifiedOwnersOnly}
                        onCheckedChange={setVerifiedOwnersOnly}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>

                {/* Barter */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <Label htmlFor="mobile-barter" className="text-sm font-semibold text-slate-700">Accepts Barter</Label>
                    <Switch
                        id="mobile-barter"
                        checked={acceptsBarterOnly}
                        onCheckedChange={setAcceptsBarterOnly}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>

                {/* Instant Book */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <Label htmlFor="mobile-instant" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        Instant Book
                    </Label>
                    <Switch
                        id="mobile-instant"
                        checked={instantBookOnly}
                        onCheckedChange={setInstantBookOnly}
                        className="data-[state=checked]:bg-yellow-400"
                    />
                </div>
            </section>

            {/* Desktop Footer Logic was here, but moved to Dialog parent for Desktop */}
            {isDesktop && (
                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-4 flex-shrink-0 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            props.setSearchQuery("");
                            props.setPriceRange([0, 300]);
                            props.setSelectedTier(null);
                            props.setVerifiedOwnersOnly(false);
                            props.setAcceptsBarterOnly(false);
                            props.setInstantBookOnly(false);
                        }}
                        className="flex-1 text-slate-500 hover:text-slate-900"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={props.onClose}
                        className="flex-[2] bg-safety-orange hover:bg-safety-orange/90 h-12 text-base shadow-md"
                    >
                        Show Results
                    </Button>
                </div>
            )}
        </div>
    );
}
