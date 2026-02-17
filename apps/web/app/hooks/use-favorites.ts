"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";

interface FavoriteRecord {
    id: string;
    listing_id: string;
    user_id: string;
    created_at: string;
}

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
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    /** Fetch all favorite listing IDs for the current user */
    const fetchFavoriteIds = useCallback(async () => {
        if (!user) {
            setFavoriteIds(new Set());
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("favorites")
                .select("listing_id")
                .eq("user_id", user.id);

            if (error) throw error;

            const ids = new Set((data || []).map((row: { listing_id: string }) => row.listing_id));
            setFavoriteIds(ids);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFavoriteIds();
    }, [fetchFavoriteIds]);

    /** Check if a listing is currently favorited */
    const isFavorite = useCallback(
        (listingId: string) => favoriteIds.has(listingId),
        [favoriteIds]
    );

    /** Toggle favorite status for a listing. Returns the new state (true = favorited). */
    const toggleFavorite = useCallback(
        async (listingId: string): Promise<boolean> => {
            if (!user) {
                throw new Error("AUTH_REQUIRED");
            }

            const wasFavorited = favoriteIds.has(listingId);

            // Optimistic update
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (wasFavorited) {
                    next.delete(listingId);
                } else {
                    next.add(listingId);
                }
                return next;
            });

            try {
                if (wasFavorited) {
                    const { error } = await supabase
                        .from("favorites")
                        .delete()
                        .eq("user_id", user.id)
                        .eq("listing_id", listingId);

                    if (error) throw error;
                    return false;
                } else {
                    const { error } = await supabase
                        .from("favorites")
                        .insert({
                            user_id: user.id,
                            listing_id: listingId,
                        });

                    if (error) throw error;
                    return true;
                }
            } catch (error) {
                // Revert optimistic update on failure
                setFavoriteIds((prev) => {
                    const reverted = new Set(prev);
                    if (wasFavorited) {
                        reverted.add(listingId);
                    } else {
                        reverted.delete(listingId);
                    }
                    return reverted;
                });
                throw error;
            }
        },
        [user, favoriteIds]
    );

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

    const favoriteCount = useMemo(() => favoriteIds.size, [favoriteIds]);

    return {
        favoriteIds,
        isFavorite,
        toggleFavorite,
        fetchFavoriteListings,
        fetchFavoriteIds,
        favoriteCount,
        loading,
    };
}
