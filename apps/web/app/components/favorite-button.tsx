"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/auth-context";
import { useFavorites } from "@/app/hooks/use-favorites";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FavoriteButtonProps {
    listingId: string;
    /** Visual variant: 'overlay' renders over images, 'inline' renders as a standard button */
    variant?: "overlay" | "inline";
    /** Optional additional className */
    className?: string;
}

export function FavoriteButton({
    listingId,
    variant = "overlay",
    className,
}: FavoriteButtonProps) {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const router = useRouter();
    const [isAnimating, setIsAnimating] = useState(false);

    const favorited = isFavorite(listingId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Sign in to save favorites", {
                description: "Create an account to save your favorite tools.",
                action: {
                    label: "Sign In",
                    onClick: () => router.push("/auth"),
                },
            });
            return;
        }

        setIsAnimating(true);

        try {
            const newState = await toggleFavorite(listingId);
            toast.success(newState ? "Added to favorites" : "Removed from favorites", {
                duration: 2000,
            });
        } catch (error) {
            toast.error("Failed to update favorite");
        }

        // Reset animation after it plays
        setTimeout(() => setIsAnimating(false), 300);
    };

    if (variant === "overlay") {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "group/fav absolute z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                    "bg-black/30 backdrop-blur-sm hover:bg-black/50",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                    className
                )}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClick(e as unknown as React.MouseEvent);
                    }
                }}
            >
                <Heart
                    className={cn(
                        "h-5 w-5 transition-all duration-200",
                        favorited
                            ? "fill-red-500 text-red-500"
                            : "fill-transparent text-white group-hover/fav:text-red-300",
                        isAnimating && "scale-125"
                    )}
                />
            </button>
        );
    }

    // inline variant
    return (
        <button
            onClick={handleClick}
            className={cn(
                "group/fav inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                favorited
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200",
                className
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(e as unknown as React.MouseEvent);
                }
            }}
        >
            <Heart
                className={cn(
                    "h-4 w-4 transition-all duration-200",
                    favorited
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-slate-500 group-hover/fav:text-red-400",
                    isAnimating && "scale-125"
                )}
            />
            {favorited ? "Saved" : "Save"}
        </button>
    );
}
