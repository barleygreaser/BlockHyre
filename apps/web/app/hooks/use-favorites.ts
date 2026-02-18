"use client";

import { useContext, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";
import { FavoritesContext } from "@/app/context/favorites-context";

interface FavoriteListingRow {
    id: string;
    listing_id: string;
    created_at: string;
    listings: {
        id: string;
        title: string;
        daily_price: number;
        images: string[] | null;
        description: string | null;
        owner_id: string;
        category_id: string;
        categories: {
            name: string;
        } | null;
    } | null;
}

export interface FavoriteListing {
    id: string;
    title: string;
    dailyPrice: number;
    image: string;
    description: string;
    category: string;
    favoritedAt: string;
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }

    const { user } = useAuth();

    /** Fetch full listing details for all favorites (for the /favorites page) */
    const fetchFavoriteListings = useCallback(async (): Promise<FavoriteListing[]> => {
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from("favorites")
                .select(`
                    id,
                    listing_id,
                    created_at,
                    listings (
                        id,
                        title,
                        daily_price,
                        images,
                        description,
                        owner_id,
                        category_id,
                        categories (
                            name
                        )
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return (data as unknown as FavoriteListingRow[] || [])
                .filter((row) => row.listings !== null)
                .map((row) => ({
                    id: row.listings!.id,
                    title: row.listings!.title,
                    dailyPrice: row.listings!.daily_price,
                    image: row.listings!.images?.[0] || `https://placehold.co/600x400?text=${encodeURIComponent(row.listings!.title)}`,
                    description: row.listings!.description || "No description provided.",
                    category: row.listings!.categories?.name || "Uncategorized",
                    favoritedAt: row.created_at,
                }));
        } catch (error) {
            console.error("Error fetching favorite listings:", error);
            return [];
        }
    }, [user]);

    return {
        ...context,
        fetchFavoriteListings,
    };
}
