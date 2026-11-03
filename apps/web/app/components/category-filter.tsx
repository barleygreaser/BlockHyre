"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export const CategoryFilter = memo(({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-2 min-w-max px-1">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={cn(
                            "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                            selectedCategory === category
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-card text-muted-foreground border border-border/80 hover:bg-accent hover:border-border hover:text-foreground"
                        )}
                        aria-label={`Filter by ${category}`}
                        tabIndex={0}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
});

CategoryFilter.displayName = "CategoryFilter";
