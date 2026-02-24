"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/app/components/ui/drawer";
import { Button } from "@/app/components/ui/button";
import { ArrowUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sortOption: "price-asc" | "price-desc" | null;
    setSortOption: (val: "price-asc" | "price-desc" | null) => void;
}

export function SortDrawer({ isOpen, onClose, sortOption, setSortOption }: SortDrawerProps) {
    const handleSort = (option: "price-asc" | "price-desc" | null) => {
        setSortOption(option);
        onClose();
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="rounded-t-[2rem] bg-signal-white border-t border-workshop-gray/10">
                <DrawerHeader className="text-left border-b border-workshop-gray/10 px-5 py-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-charcoal/40 mb-1 block">Arrange</span>
                    <DrawerTitle className="text-xl font-bold font-serif text-charcoal flex items-center gap-2.5">
                        <ArrowUpDown className="h-5 w-5 text-safety-orange" />
                        Sort Results
                    </DrawerTitle>
                </DrawerHeader>
                <div className="p-5 space-y-2.5">
                    {[
                        { label: "Best Match", sub: "Default ranking", value: null },
                        { label: "Price: Lowest First", sub: "Budget-friendly", value: "price-asc" },
                        { label: "Price: Highest First", sub: "Premium first", value: "price-desc" }
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => handleSort(opt.value as any)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                sortOption === opt.value
                                    ? "bg-safety-orange/5 border-safety-orange/40 shadow-[0_0_12px_rgba(255,107,0,0.08)]"
                                    : "bg-white border-workshop-gray/10 hover:border-safety-orange/20 hover:bg-safety-orange/[0.02]"
                            )}
                            aria-label={`Sort by ${opt.label}`}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSort(opt.value as any); }}
                        >
                            <div className="text-left">
                                <span className={cn(
                                    "font-semibold block text-sm",
                                    sortOption === opt.value ? "text-charcoal" : "text-charcoal/80"
                                )}>{opt.label}</span>
                                <span className="text-xs font-mono uppercase tracking-wider text-charcoal/40">{opt.sub}</span>
                            </div>
                            {sortOption === opt.value && (
                                <div className="h-6 w-6 rounded-full bg-safety-orange flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <DrawerFooter className="pt-2 pb-6 px-5">
                    <DrawerClose asChild>
                        <Button
                            variant="outline"
                            className="h-12 text-sm font-bold uppercase tracking-wider rounded-full border-workshop-gray/15 text-charcoal/60 hover:text-charcoal hover:border-charcoal/30"
                        >
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
