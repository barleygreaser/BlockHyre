"use client";

import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";
import { usePathname } from "next/navigation";

interface FavoritesContextType {
    favoriteIds: Set<string>;
    isFavorite: (listingId: string) => boolean;
    toggleFavorite: (listingId: string) => Promise<boolean>;
    fetchFavoriteIds: () => Promise<void>;
    favoriteCount: number;
    loading: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// P3: Pages where favorites data is actually needed. Only fetch on these routes.
const FAVORITES_PAGES = ['/', '/listings', '/favorites'];

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    // Track if we've already fetched for this user session to avoid re-fetching
    // when navigating between pages that need favorites
    const hasFetchedRef = useRef(false);

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
            hasFetchedRef.current = true;
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Reset fetch state when user changes (logout/login)
        if (!user) {
            hasFetchedRef.current = false;
            setFavoriteIds(new Set());
            setLoading(false);
            return;
        }

        // P3: Only fetch favorites on pages that need them
        const needsFavorites = FAVORITES_PAGES.some(
            (page) => pathname === page || pathname?.startsWith('/listings/')
        );

        if (needsFavorites && !hasFetchedRef.current) {
            fetchFavoriteIds();
        } else if (!needsFavorites) {
            // Don't block rendering on non-favorites pages
            setLoading(false);
        }
    }, [fetchFavoriteIds, pathname, user]);

    const isFavorite = useCallback(
        (listingId: string) => favoriteIds.has(listingId),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (listingId: string): Promise<boolean> => {
            if (!user) {
                throw new Error("AUTH_REQUIRED");
            }

            // Ensure favorites are loaded before toggling
            if (!hasFetchedRef.current) {
                await fetchFavoriteIds();
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
        [user, favoriteIds, fetchFavoriteIds]
    );

    const favoriteCount = useMemo(() => favoriteIds.size, [favoriteIds]);

    const value = useMemo<FavoritesContextType>(() => ({
        favoriteIds,
        isFavorite,
        toggleFavorite,
        fetchFavoriteIds,
        favoriteCount,
        loading,
    }), [favoriteIds, isFavorite, toggleFavorite, fetchFavoriteIds, favoriteCount, loading]);

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}
