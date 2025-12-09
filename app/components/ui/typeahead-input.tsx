"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/app/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Suggestion {
    id: string;
    brand: string;
    tool_name: string;
    tier_suggestion: number;
}

interface TypeaheadInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    onSelect: (item: Suggestion) => void;
    placeholder?: string;
    className?: string;
}

export function TypeaheadInput({ label, value, onChange, onSelect, placeholder, className }: TypeaheadInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Flag to prevent searching immediately after selection
    const [justSelected, setJustSelected] = useState(false);

    const debouncedValue = useDebounce(value, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedValue.length < 2 || justSelected) {
                // If just selected, we don't clear suggestions immediately to avoid flash, but we don't fetch new ones.
                // Actually better to clear suggestions if we matched exactly? 
                // Let's just return.
                if (debouncedValue.length < 2) setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/fetch-suggestions?query=${encodeURIComponent(debouncedValue)}`);
                const data = await res.json();
                if (data.suggestions) {
                    setSuggestions(data.suggestions);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
                setJustSelected(false); // Reset the flag after processing
            }
        };

        fetchSuggestions();
    }, [debouncedValue]); // Intentionally omitting justSelected from deps to avoid loop managed by flow

    const handleSelect = (item: Suggestion) => {
        setJustSelected(true); // Set true BEFORE value change triggers debounce
        onSelect(item);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJustSelected(false); // Reset on typing
        onChange(e.target.value);
    };

    return (
        <div className={cn("relative space-y-2", className)} ref={wrapperRef}>
            <label className="text-sm font-medium text-slate-900">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50 transition-all"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-auto">
                    {suggestions.map((item) => (
                        <button
                            key={item.id}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center justify-between group border-b border-slate-100 last:border-0"
                            onClick={() => handleSelect(item)}
                        >
                            <span className="font-medium text-slate-700">
                                {item.brand} <span className="font-normal text-slate-500">{item.tool_name}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
