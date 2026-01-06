"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
    Plus, Trash2, Zap, Wrench, Circle, Loader2, Info,
    BatteryFull, Ruler, Plug, Hammer, Scale, Gauge, Fuel, Droplet
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Interface Definitions ---

interface Specification {
    id: string;
    spec_key: string;
    display_name: string;
    unit_type: string;
    icon_name: string;
    is_numeric: boolean;
}

export interface ListingSpecValue {
    spec_id: string;
    value: string;
    unit?: string;
}

interface EditListingSpecsProps {
    selectedCategoryId: string | null;
    initialSpecs: ListingSpecValue[];
    onSpecsChange: (specs: ListingSpecValue[]) => void;
}

// --- Static Icon Map ---
const IconMap: Record<string, React.ElementType> = {
    'Zap': Zap,
    'Wrench': Wrench,
    'Circle': Circle,
    'BatteryFull': BatteryFull,
    'Ruler': Ruler,
    'Plug': Plug,
    'Hammer': Hammer,
    'Scale': Scale,
    'Gauge': Gauge,
    'Fuel': Fuel,
    'Droplet': Droplet
};

export function EditListingSpecs({ selectedCategoryId, initialSpecs, onSpecsChange }: EditListingSpecsProps) {

    // List of specifications available for the currently selected category
    const [availableSpecs, setAvailableSpecs] = useState<Specification[]>([]);

    // The specifications the user has added to their listing
    const [listingSpecs, setListingSpecs] = useState<ListingSpecValue[]>(initialSpecs);

    const [loadingSpecs, setLoadingSpecs] = useState(false);
    const [newSpecId, setNewSpecId] = useState<string | null>(null);

    // Sync internal state if initialSpecs changes (e.g. from parent fetch)
    useEffect(() => {
        if (JSON.stringify(initialSpecs) !== JSON.stringify(listingSpecs)) {
            // Only update if different to prevent loops, though ideally parent only passes initial once or we use a key
            // But here we might just want to respect the prop if it's the source of truth on load.
            // Actually, treating it as 'initial' means we ignore subsequent updates? 
            // Logic: If listingSpecs is empty and initialSpecs has stuff, set it.
            if (listingSpecs.length === 0 && initialSpecs.length > 0) {
                setListingSpecs(initialSpecs);
            }
        }
    }, [initialSpecs]); // Be careful with dependency arrays on objects/arrays

    // --- Data Fetching Logic ---
    const fetchAvailableSpecs = useCallback(async (categoryId: string) => {
        setLoadingSpecs(true);
        try {
            const { data, error } = await supabase
                .from('category_specifications')
                .select(`
                    spec:listing_specifications (
                        id, spec_key, display_name, unit_type, icon_name, is_numeric
                    )
                `)
                .eq('category_id', categoryId);

            if (error) throw error;

            // Map the nested data structure
            const specs = data
                .map((item: any) => item.spec)
                .filter((s): s is Specification => s !== null);

            setAvailableSpecs(specs);

        } catch (error) {
            console.error("Error fetching available specifications:", error);
            setAvailableSpecs([]);
        } finally {
            setLoadingSpecs(false);
        }
    }, []);

    // --- Effect: Re-fetch specs whenever the Category changes ---
    useEffect(() => {
        if (selectedCategoryId) {
            fetchAvailableSpecs(selectedCategoryId);
        } else {
            setAvailableSpecs([]);
            // Don't clear listing specs automatically; allows user to change category without losing data immediately?
            // Actually, if category changes, old specs might be invalid. 
            // For now, let's keep them, but user might see mismatched metrics.
            // Better UX: Keep them, let user delete.
        }
    }, [selectedCategoryId, fetchAvailableSpecs]);

    // --- Handlers ---

    const getSpecDetails = (specId: string): Specification | undefined => {
        return availableSpecs.find(s => s.id === specId);
    };

    const handleAddSpec = () => {
        if (!newSpecId) return;

        const specDetails = getSpecDetails(newSpecId);
        // Prevent duplicates
        if (!specDetails || listingSpecs.some(s => s.spec_id === newSpecId)) {
            setNewSpecId(null);
            return;
        }

        const newSpec: ListingSpecValue = {
            spec_id: newSpecId,
            value: '',
            unit: specDetails.unit_type,
        };

        const updatedSpecs = [...listingSpecs, newSpec];
        setListingSpecs(updatedSpecs);
        onSpecsChange(updatedSpecs);
        setNewSpecId(null);
    };

    const handleRemoveSpec = (specIdToRemove: string) => {
        const updatedSpecs = listingSpecs.filter(s => s.spec_id !== specIdToRemove);
        setListingSpecs(updatedSpecs);
        onSpecsChange(updatedSpecs);
    };

    const handleValueChange = (specId: string, newValue: string) => {
        const updatedSpecs = listingSpecs.map(s =>
            s.spec_id === specId ? { ...s, value: newValue } : s
        );
        setListingSpecs(updatedSpecs);
        onSpecsChange(updatedSpecs);
    };

    const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
        const IconComponent = IconMap[name] || Info;
        return <IconComponent className={className} />;
    };

    // Filter out specs already added
    const specsToAdd = availableSpecs.filter(
        s => !listingSpecs.some(ls => ls.spec_id === s.id)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-serif text-slate-800">
                    Technical Specifications
                </h3>
                {loadingSpecs && (
                    <div className="flex items-center text-xs text-safety-orange animate-pulse">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Syncing...
                    </div>
                )}
            </div>

            {!selectedCategoryId && (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-500 text-sm">
                    Select a category above to load relevant technical specifications.
                </div>
            )}

            {/* Specs List */}
            <div className="space-y-3">
                {listingSpecs.map(specValue => {
                    const details = getSpecDetails(specValue.spec_id);

                    // If we can't find details (e.g. from old data or unloaded category), show a fallback or hide?
                    // Showing fallback allows user to at least see/delete it.
                    if (!details) {
                        // Fallback for "Custom" or "Legacy" specs if we want to support them
                        // For now, we only support specs in the `availableSpecs` list.
                        // But if we just loaded the page and availableSpecs represents strictly the CATEGORY specs...
                        // If a listing has a spec that is NOT in the current category (legacy?), it will disappear here.
                        // This is acceptable behavior for "Enforcing Schema".
                        return null;
                    }

                    return (
                        <div
                            key={details.id}
                            className="group flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-slate-300 focus-within:ring-1 focus-within:ring-safety-orange focus-within:border-safety-orange animate-in slide-in-from-left-2 duration-200"
                        >
                            <div className="p-2 bg-slate-50 rounded-md text-slate-500 group-hover:text-safety-orange group-hover:bg-orange-50 transition-colors">
                                <DynamicIcon name={details.icon_name} className="w-5 h-5" />
                            </div>

                            <label htmlFor={`spec-${details.id}`} className="text-sm font-medium text-slate-700 w-32 md:w-40 flex-shrink-0">
                                {details.display_name}
                            </label>

                            <div className="relative flex-1">
                                <Input
                                    id={`spec-${details.id}`}
                                    type={details.is_numeric ? "number" : "text"}
                                    value={specValue.value}
                                    onChange={(e) => handleValueChange(details.id, e.target.value)}
                                    placeholder={details.unit_type ? `ex. 500` : `Value...`}
                                    className="pr-12"
                                />
                                {details.unit_type && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                                        {details.unit_type}
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSpec(details.id)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                title="Remove specification"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Add Spec Footer */}
            {specsToAdd.length > 0 && selectedCategoryId && (
                <div className="flex items-center gap-3 pt-2">
                    <Select onValueChange={setNewSpecId} value={newSpecId || ""}>
                        <SelectTrigger className="w-[280px] bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 transition-colors">
                            <SelectValue placeholder="Select specification to add..." />
                        </SelectTrigger>
                        <SelectContent>
                            {specsToAdd.map(spec => (
                                <SelectItem key={spec.id} value={spec.id}>
                                    <span className="flex items-center gap-2">
                                        <DynamicIcon name={spec.icon_name} className="w-4 h-4 text-slate-400" />
                                        {spec.display_name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        onClick={handleAddSpec}
                        disabled={!newSpecId}
                        className={cn(
                            "transition-all",
                            newSpecId
                                ? "bg-safety-orange hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                                : "bg-slate-100 text-slate-400 pointer-events-none"
                        )}
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Add Field
                    </Button>
                </div>
            )}
        </div>
    );
}
