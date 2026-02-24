"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/app/components/ui/drawer";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { X, Shield, Zap, SlidersHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";

interface InventoryFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    categories: { id: string; name: string }[];
    selectedCategories: string[];
    toggleCategory: (cat: string) => void;
    selectedTier: string | null;
    setSelectedTier: (val: string | null) => void;
    verifiedOwnersOnly: boolean;
    setVerifiedOwnersOnly: (val: boolean) => void;
    maxDistance: number;
    setMaxDistance: (val: number) => void;
    priceRange: [number, number];
    setPriceRange: (val: [number, number]) => void;
    acceptsBarterOnly: boolean;
    setAcceptsBarterOnly: (val: boolean) => void;
    instantBookOnly: boolean;
    setInstantBookOnly: (val: boolean) => void;
    showDistanceFilter?: boolean;
}

export function InventoryFiltersModal(props: InventoryFiltersModalProps) {
    const { isOpen, onClose } = props;
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="fixed inset-0 z-50 h-full w-full max-w-none rounded-none border-0 bg-signal-white p-0 shadow-none sm:max-w-none overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-workshop-gray/10 flex-shrink-0 bg-white">
                        <div>
                            <DialogTitle className="text-xl font-bold font-serif text-charcoal flex items-center gap-2.5">
                                <SlidersHorizontal className="h-5 w-5 text-safety-orange" />
                                Filter Inventory
                            </DialogTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-charcoal/5 hover:bg-charcoal/10 transition-colors"
                            aria-label="Close filters"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter") onClose(); }}
                        >
                            <X className="h-5 w-5 text-charcoal/60" />
                        </button>
                    </div>
                    <FilterContent {...props} isDesktop={true} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh] flex flex-col rounded-t-[2rem] bg-signal-white border-t border-workshop-gray/10">
                <DrawerHeader className="text-left border-b border-workshop-gray/10 px-5 py-4">
                    <DrawerTitle className="text-xl font-bold font-serif text-charcoal flex items-center gap-2.5">
                        <SlidersHorizontal className="h-5 w-5 text-safety-orange" />
                        Filter Inventory
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto">
                    <FilterContent {...props} isDesktop={false} />
                </div>
                <DrawerFooter className="pt-3 pb-6 border-t border-workshop-gray/10 bg-white px-5">
                    <div className="flex items-center gap-3 w-full">
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
                            className="flex-1 text-charcoal/50 hover:text-charcoal font-bold text-xs uppercase tracking-wider rounded-full h-12"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={onClose}
                            className="flex-[2] bg-safety-orange hover:bg-safety-orange-hover h-12 text-sm font-bold uppercase tracking-wider rounded-full shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40"
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
        setInstantBookOnly,
        isDesktop,
        showDistanceFilter = true
    } = props;

    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={cn("p-5 space-y-5", isDesktop ? "flex-1 overflow-y-auto" : "")}>
            {/* Search */}
            <section className="bg-white p-4 rounded-xl border border-workshop-gray/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/30 z-10" />
                    <Input
                        type="text"
                        placeholder="Search tools..."
                        value={props.searchQuery}
                        onChange={(e) => props.setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 bg-signal-white border-workshop-gray/10 focus-visible:ring-safety-orange/30 focus-visible:border-safety-orange/50 text-charcoal placeholder:text-charcoal/30 rounded-lg transition-all"
                    />
                </div>
            </section>

            {/* Location / Radius */}
            {showDistanceFilter && (
                <section className="bg-white p-4 rounded-xl border border-workshop-gray/10">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="font-bold font-serif text-charcoal">Search Radius</Label>
                        <span className="text-xs font-mono font-bold text-safety-orange bg-safety-orange/10 px-2.5 py-1 rounded-full">
                            {maxDistance} mi
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
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-charcoal/30 mt-2">
                        <span>0.5 mi</span>
                        <span>20 mi</span>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="bg-white p-4 rounded-xl border border-workshop-gray/10">
                <Label className="font-bold font-serif text-charcoal mb-4 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                    {sortedCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-semibold transition-all duration-200 select-none",
                                selectedCategories.includes(cat.name)
                                    ? "bg-safety-orange/10 border-safety-orange/40 text-charcoal shadow-[0_0_8px_rgba(255,107,0,0.08)]"
                                    : "bg-signal-white border-workshop-gray/15 text-charcoal/70 hover:border-safety-orange/20 hover:text-charcoal"
                            )}
                            onClick={() => toggleCategory(cat.name)}
                            aria-label={`Toggle ${cat.name} filter`}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter") toggleCategory(cat.name); }}
                        >
                            {selectedCategories.includes(cat.name) && (
                                <span className="h-1.5 w-1.5 rounded-full bg-safety-orange flex-shrink-0" />
                            )}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Protection Tier */}
            <section className="bg-white p-4 rounded-xl border border-workshop-gray/10">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-safety-orange" />
                    <Label className="font-bold font-serif text-charcoal">Protection Tier</Label>
                </div>
                <RadioGroup value={selectedTier || ""} onValueChange={(val) => setSelectedTier(val === selectedTier ? null : val)}>
                    <div className="space-y-2.5">
                        {[
                            { id: "1", label: "Tier 1 (Basic)", sub: "<$50/day" },
                            { id: "2", label: "Tier 2 (Standard)", sub: "$50-$200" },
                            { id: "3", label: "Tier 3 (Max)", sub: "$200+ or Heavy" },
                        ].map(tier => (
                            <div
                                key={tier.id}
                                className={cn(
                                    "flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                                    selectedTier === tier.id
                                        ? "bg-safety-orange/5 border-safety-orange/30"
                                        : "border-transparent hover:bg-charcoal/[0.02]"
                                )}
                                onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                            >
                                <RadioGroupItem value={tier.id} id={`mobile-tier-${tier.id}`} onClick={() => { if (selectedTier === tier.id) setSelectedTier(null) }} />
                                <Label htmlFor={`mobile-tier-${tier.id}`} className="cursor-pointer flex-1">
                                    <span className="text-sm font-semibold text-charcoal block leading-none">{tier.label}</span>
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/40">{tier.sub}</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            </section>

            {/* Price Range */}
            <section className="bg-white p-4 rounded-xl border border-workshop-gray/10">
                <Label className="font-bold font-serif text-charcoal mb-4 block">Daily Price Range</Label>
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
                        <div className="border border-workshop-gray/10 rounded-lg px-3 py-1.5 bg-signal-white text-charcoal/40 text-sm font-mono">
                            $0
                        </div>
                        <span className="text-charcoal/20">—</span>
                        <div className="border border-safety-orange/30 rounded-lg px-3 py-1.5 bg-safety-orange/5 text-charcoal font-bold text-sm font-mono">
                            ${priceRange[1]}+
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggles */}
            <section className="bg-white p-4 rounded-xl border border-workshop-gray/10 space-y-0">
                {/* Verified Owners */}
                <div className="flex items-center justify-between py-3.5">
                    <Label htmlFor="mobile-verified" className="text-sm font-semibold text-charcoal cursor-pointer">Verified Owners Only</Label>
                    <Switch
                        id="mobile-verified"
                        checked={verifiedOwnersOnly}
                        onCheckedChange={setVerifiedOwnersOnly}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>

                {/* Barter */}
                <div className="flex items-center justify-between border-t border-workshop-gray/8 py-3.5">
                    <Label htmlFor="mobile-barter" className="text-sm font-semibold text-charcoal cursor-pointer">Accepts Barter</Label>
                    <Switch
                        id="mobile-barter"
                        checked={acceptsBarterOnly}
                        onCheckedChange={setAcceptsBarterOnly}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>

                {/* Instant Book */}
                <div className="flex items-center justify-between border-t border-workshop-gray/8 py-3.5">
                    <Label htmlFor="mobile-instant" className="text-sm font-semibold text-charcoal flex items-center gap-1.5 cursor-pointer">
                        <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        Instant Book
                    </Label>
                    <Switch
                        id="mobile-instant"
                        checked={props.instantBookOnly}
                        onCheckedChange={setInstantBookOnly}
                        className="data-[state=checked]:bg-yellow-400"
                    />
                </div>
            </section>

            {/* Desktop Footer */}
            {isDesktop && (
                <div className="p-5 border-t border-workshop-gray/10 bg-white flex items-center gap-3 flex-shrink-0 mt-4">
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
                        className="flex-1 text-charcoal/50 hover:text-charcoal font-bold text-xs uppercase tracking-wider rounded-full h-12"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={props.onClose}
                        className="flex-[2] bg-safety-orange hover:bg-safety-orange-hover h-12 text-sm font-bold uppercase tracking-wider rounded-full shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40"
                    >
                        Show Results
                    </Button>
                </div>
            )}
        </div>
    );
}
