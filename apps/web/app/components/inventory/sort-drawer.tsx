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
            <DrawerContent className="rounded-t-[10px]">
                <DrawerHeader className="text-left border-b border-slate-200 px-4 py-3">
                    <DrawerTitle className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                        <ArrowUpDown className="h-5 w-5" />
                        Sort Results
                    </DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-2">
                    {/* Options */}
                    {[
                        { label: "Best Match", value: null },
                        { label: "Price: Lowest First", value: "price-asc" },
                        { label: "Price: Highest First", value: "price-desc" }
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => handleSort(opt.value as any)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                                sortOption === opt.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <span className="font-medium">{opt.label}</span>
                            {sortOption === opt.value && <Check className="h-5 w-5 text-safety-orange" />}
                        </button>
                    ))}
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline" className="h-12 text-base">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
