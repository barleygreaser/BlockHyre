"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export type Listing = {
    id: string;
    title: string;
    brand?: string;
    display_name?: string;
    description?: string;
    daily_price: number;
    accepts_barter: boolean;
    is_high_powered: boolean;
    category_id: string;
    category: {
        name: string;
        risk_daily_fee: number;
        risk_tier: 1 | 2 | 3;
        deductible_amount: number;
    };
    images?: string[];
    distance?: number;
    coordinates?: { latitude: number; longitude: number };
    booking_type?: 'instant' | 'request';
    weight_kg?: number;
    dimensions_cm?: string;
    min_rental_days?: number;
    owner_notes?: string;
    is_available?: boolean;
    manual_url?: string;
    specifications?: Record<string, any>;
    owner_id?: string;
    owner?: {
        id: string;
        full_name: string;
        profile_photo_url: string;
        is_id_verified: boolean;
    };
};

export const useMarketplace = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories (
                        name,
                        risk_daily_fee,
                        risk_tier,
                        deductible_amount
                    )
                `)
                .eq('status', 'active');

            if (error) throw error;

            // Map 'categories' (DB relation) to 'category' (UI interface)
            const mappedListings = (data || []).map((item: any) => ({
                ...item,
                category: item.categories || item.category || { name: 'Unknown', risk_daily_fee: 0, risk_tier: 1, deductible_amount: 0 }
            }));

            setListings(mappedListings as Listing[]);
        } catch (e) {
            setError(e);
            console.error("Error fetching listings:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchListing = async (id: string): Promise<Listing | null> => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    categories (
                        name,
                        risk_daily_fee,
                        risk_tier,
                        deductible_amount
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            // Fetch Owner Profile
            let ownerProfile = null;
            if (data.owner_id) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, full_name, profile_photo_url, is_id_verified')
                    .eq('id', data.owner_id)
                    .single();

                if (userData) {
                    ownerProfile = userData;
                }
            }

            // Map relation
            const item = data as any;
            const mappedItem = {
                ...item,
                category: item.categories || item.category || { name: 'Unknown', risk_daily_fee: 0, risk_tier: 1, deductible_amount: 0 },
                owner: ownerProfile
            };

            return mappedItem as Listing;
        } catch (e) {
            console.error("Error fetching listing:", e);
            setError(e);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchListings();
    // }, []);

    const createRental = async (
        listingId: string,
        renterId: string,
        startDate: Date,
        endDate: Date,
        dailyPrice: number,
        riskFee: number,
        isBarter: boolean
    ) => {
        try {
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            const totalDays = end.diff(start, 'day') + 1; // Inclusive

            const { data, error } = await supabase
                .from('rentals')
                .insert([
                    {
                        listing_id: listingId,
                        renter_id: renterId,
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        total_days: totalDays,
                        daily_price_snapshot: dailyPrice,
                        risk_fee_snapshot: riskFee,
                        is_barter_deal: isBarter,
                        status: 'pending'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            console.error("Error creating rental:", e);
            return { success: false, error: e };
        }
    };

    const searchListings = async (
        userLat: number,
        userLong: number,
        radius: number,
        minPrice: number,
        maxPrice: number,
        category?: string
    ) => {
        try {
            setLoading(true);
            console.log("Searching listings with params:", { userLat, userLong, radius, minPrice, maxPrice, category });
            const { data, error } = await supabase.rpc('search_nearby_listings', {
                user_lat: userLat,
                user_long: userLong,
                radius_miles: radius,
                min_price: minPrice,
                max_price: maxPrice,
                category_filter: category || null
            });

            if (error) {
                console.error("Supabase RPC Error Details:", JSON.stringify(error, null, 2));
                throw error;
            }
            console.log("RPC Search Results:", data);

            // Map RPC result to Listing type
            const mappedListings: Listing[] = (data as any[]).map(item => ({
                id: item.id,
                title: item.title,
                daily_price: item.daily_price,
                accepts_barter: item.accepts_barter || false,
                is_high_powered: item.is_high_powered || false,
                category_id: '',
                category: {
                    name: item.category_name,
                    risk_daily_fee: item.risk_daily_fee,
                    risk_tier: item.risk_tier || 1,
                    deductible_amount: item.deductible_amount || 0
                },
                booking_type: item.booking_type as 'instant' | 'request',
                // Extra fields for UI
                images: item.images,
                distance: item.distance_miles,
                coordinates: { latitude: item.latitude, longitude: item.longitude }
            }));

            setListings(mappedListings);
        } catch (e: any) {
            setError(e);
            console.error("Error searching listings:", e?.message || JSON.stringify(e));
        } finally {
            setLoading(false);
        }
    };

    const [categories, setCategories] = useState<{ id: string; name: string; risk_daily_fee: number; risk_tier: number; deductible_amount: number }[]>([]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, risk_daily_fee, risk_tier, deductible_amount');

            if (error) throw error;
            setCategories(data || []);
        } catch (e) {
            console.error("Error fetching categories:", e);
        }
    };

    const fetchUnavailableDates = async (listingId: string): Promise<Date[]> => {
        try {
            const { data, error } = await supabase.rpc('get_unavailable_dates_for_listing', {
                p_listing_id: listingId
            });

            if (error) throw error;

            const dates: Date[] = [];
            data?.forEach((rental: any) => {
                // Parse as UTC to avoid local timezone shifts from 00:00:00 timestamps
                let current = dayjs.utc(rental.start_date);
                const end = dayjs.utc(rental.end_date);

                while (current.isBefore(end) || current.isSame(end, 'day')) {
                    // Convert to JS Date. Note: This creates a date derived from the UTC components.
                    // However, we want the matched DATE to be the same string representation.
                    // The simplest way for the Calendar component to match is if we store the string "YYYY-MM-DD" or 
                    // ensure the Date object resolves to the same day in local time.
                    // If we use .toDate() on a UTC dayjs object, it converts to local time. 
                    // e.g. 2023-01-01T00:00Z -> 2022-12-31T19:00 EST. This SHIFTS the day.

                    // FIX: We strictly want the calendar date components.
                    // We will return dates constructed from the Year/Month/Day values match the string.
                    const dateStr = current.format('YYYY-MM-DD');
                    // Create a local date from the string components to match Calendar's local inputs
                    const [y, m, d] = dateStr.split('-').map(Number);
                    dates.push(new Date(y, m - 1, d));

                    current = current.add(1, 'day');
                }
            });

            return dates;
        } catch (e) {
            console.error("Error fetching unavailable dates:", e);
            return [];
        }
    };

    // REMOVE OR COMMENT OUT THIS BLOCK
    // The page controls the fetching based on filters/location now.
    /* useEffect(() => {
        fetchListings();
    }, []);
    */

    const [platformSettings, setPlatformSettings] = useState<{
        seller_fee_percent: number;
        buyer_fee_percent: number;
        maintenance_mode: boolean;
    } | null>(null);

    const fetchPlatformSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*')
                .single();

            if (error) {
                // If table doesn't exist or is empty, use defaults gracefully
                console.warn("Could not fetch platform settings, using defaults:", error.message);
                setPlatformSettings({
                    seller_fee_percent: 7,
                    buyer_fee_percent: 6.5,
                    maintenance_mode: false
                });
                return;
            }

            setPlatformSettings(data);
        } catch (e) {
            console.error("Error fetching platform settings:", e);
        }
    };

    // Keep this one, as categories are static and global
    useEffect(() => {
        fetchCategories();
        fetchPlatformSettings();
    }, []);

    const blockDateRange = async (listingId: string, startDate: Date, endDate: Date, reason?: string) => {
        const { error } = await supabase
            .from('blocked_dates')
            .insert({
                listing_id: listingId,
                owner_id: (await supabase.auth.getUser()).data.user?.id,
                start_date: dayjs(startDate).format('YYYY-MM-DD'),
                end_date: dayjs(endDate).format('YYYY-MM-DD'),
                reason
            });

        if (error) throw error;
    };

    const deleteBlockedDate = async (blockId: string) => {
        const { error } = await supabase
            .from('blocked_dates')
            .delete()
            .eq('id', blockId);

        if (error) throw error;
    };

    const fetchBlockedDates = async (listingId: string) => {
        const { data, error } = await supabase
            .from('blocked_dates')
            .select('*')
            .eq('listing_id', listingId)
            .order('start_date', { ascending: true });

        if (error) throw error;
        return data || [];
    };

    // NEW: Hybrid System State
    const [overriddenTier, setOverriddenTier] = useState<number | null>(null);
    const [isAutoCategorized, setIsAutoCategorized] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // NEW: Calculate financials based on hybrid tier logic
    const financials = useMemo(() => {
        if (!selectedCategory) return { peaceFundFee: 0, deductible: 0, currentTier: 1 };

        // Hybrid Logic: Use overridden tier or fall back to category default
        const currentTier = overriddenTier || selectedCategory.risk_tier;

        // Tier-based fee mapping
        const tierFees: Record<number, number> = { 1: 1.50, 2: 4.00, 3: 9.00 };
        const tierDeductibles: Record<number, number> = { 1: 25, 2: 75, 3: 250 };

        return {
            peaceFundFee: tierFees[currentTier] || selectedCategory.risk_daily_fee,
            deductible: tierDeductibles[currentTier] || selectedCategory.deductible_amount,
            currentTier
        };
    }, [selectedCategory, overriddenTier]);

    // NEW: State to track the debounced title for auto-categorization
    const [autoCategorizationTitle, setAutoCategorizationTitle] = useState<string>("");

    // NEW: Auto-categorization useEffect with cleanup phase
    useEffect(() => {
        async function checkCategory() {
            // 1. CLEANUP: If the title is too short, reset the state
            if (autoCategorizationTitle.length < 3) {
                // Only clear if the current category was AUTO-selected.
                // We don't want to clear a category the user manually picked.
                if (isAutoCategorized) {
                    setSelectedCategory(null);
                    setIsAutoCategorized(false);
                    setOverriddenTier(null);
                }
                return;
            }

            // 2. FETCH: Call the RPC
            try {
                const { data, error } = await supabase.rpc('suggest_category', {
                    tool_title: autoCategorizationTitle
                });

                if (error) {
                    // If RPC doesn't exist yet, silently skip (migration not applied)
                    if (error.message?.includes('function') || error.code === '42883') {
                        console.warn('suggest_category RPC not yet deployed. Skipping auto-categorization.');
                        return;
                    }
                    console.error('Error suggesting category:', error.message || error);
                    return;
                }

                if (data && data.length > 0) {
                    const suggestedCat = data[0];
                    const fullCategory = categories.find(c => c.id === suggestedCat.id);

                    // Only update if it's a NEW category to prevent jitter
                    if (fullCategory && fullCategory.id !== selectedCategory?.id) {
                        setSelectedCategory(fullCategory);
                        setIsAutoCategorized(true);
                        setOverriddenTier(null);
                    }
                }
            } catch (e: any) {
                console.error('Failed to suggest category:', e?.message || e);
            }
        }

        checkCategory();
    }, [autoCategorizationTitle, categories, isAutoCategorized, selectedCategory]);

    return {
        listings,
        categories,
        platformSettings,
        loading,
        error,
        fetchListings,
        fetchListing,
        fetchCategories,
        fetchPlatformSettings,
        fetchUnavailableDates,
        searchListings,
        createRental,
        blockDateRange,
        deleteBlockedDate,
        fetchBlockedDates,
        // NEW: Hybrid System Exports
        overriddenTier,
        setOverriddenTier,
        selectedCategory,
        setSelectedCategory,
        financials,
        isAutoCategorized,
        setIsAutoCategorized,
        setAutoCategorizationTitle
    };
};

