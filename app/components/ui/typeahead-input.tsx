"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/app/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Suggestion {
    id?: string;
    brand?: string;
    tool_name?: string;
    tier_suggestion?: number;
}

interface TypeaheadInputProps {
    label: string;
    value: string;
    type: 'brand' | 'tool';
    brandFilter?: string; // Optional filter for tool lookup
    onChange: (val: string) => void;
    onSelect: (item: Suggestion) => void;
    placeholder?: string;
    className?: string;
}

export function TypeaheadInput({ label, value, type, brandFilter, onChange, onSelect, placeholder, className }: TypeaheadInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Flag to prevent searching immediately after selection
    const [justSelected, setJustSelected] = useState(false);

    const debouncedValue = useDebounce(value, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            if (debouncedValue.length < 1 || justSelected) {
                if (debouncedValue.length < 1) setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                let url = `/api/fetch-suggestions?query=${encodeURIComponent(debouncedValue)}&type=${type}`;
                if (brandFilter) {
                    url += `&brandFilter=${encodeURIComponent(brandFilter)}`;
                }

                const res = await fetch(url);
                const data = await res.json();
                if (data.suggestions) {
                    setSuggestions(data.suggestions);
                    if (data.suggestions.length > 0) setIsOpen(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
                setJustSelected(false);
            }
        };

        fetchSuggestions();
    }, [debouncedValue, type, brandFilter]);

    // Reset selected index when suggestions change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [suggestions]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'auto'
                });
            }
        }
    }, [selectedIndex]);

    const handleSelect = (item: Suggestion) => {
        setJustSelected(true);
        onSelect(item);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJustSelected(false);
        onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <div className={cn("relative space-y-2", className)} ref={wrapperRef}>
            <label className="text-sm font-medium text-slate-900">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
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
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-auto"
                >
                    {suggestions.map((item, idx) => (
                        <button
                            key={item.id || idx}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm flex items-center justify-between group border-b border-slate-100 last:border-0 transition-colors",
                                idx === selectedIndex
                                    ? "bg-safety-orange/10 text-slate-900"
                                    : "hover:bg-slate-50 text-slate-700"
                            )}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                        >
                            <span className="font-medium">
                                {type === 'brand' ? item.brand : (
                                    <>
                                        {item.brand} <span className="font-normal text-slate-500">{item.tool_name}</span>
                                    </>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
