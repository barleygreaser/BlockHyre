"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';

export type Listing = {
    id: string;
    title: string;
    description?: string;
    daily_price: number;
    accepts_barter: boolean;
    is_high_powered: boolean;
    category_id: string;
    category: {
        name: string;
        risk_daily_fee: number;
    };
    images?: string[];
    distance?: number;
    coordinates?: { latitude: number; longitude: number };
    booking_type?: 'instant' | 'request';
    weight_kg?: number;
    dimensions_cm?: string;
    specifications?: Record<string, any>;
    owner_id?: string;
    owner?: {
        id: string;
        full_name: string;
        profile_photo_url: string;
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
                        risk_daily_fee
                    )
                `);

            if (error) throw error;

            // Map 'categories' (DB relation) to 'category' (UI interface)
            const mappedListings = (data || []).map((item: any) => ({
                ...item,
                category: item.categories || item.category || { name: 'Unknown', risk_daily_fee: 0 }
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
                        risk_daily_fee
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
                    .select('id, full_name, profile_photo_url')
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
                category: item.categories || item.category || { name: 'Unknown', risk_daily_fee: 0 },
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
            const { data, error } = await supabase.rpc('search_nearby_listings', {
                user_lat: userLat,
                user_long: userLong,
                radius_miles: radius,
                min_price: minPrice,
                max_price: maxPrice,
                category_filter: category || null
            });

            if (error) throw error;

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
                    risk_daily_fee: item.risk_daily_fee
                },
                booking_type: item.booking_type as 'instant' | 'request',
                // Extra fields for UI
                images: item.images,
                distance: item.distance_miles,
                coordinates: { latitude: item.latitude, longitude: item.longitude }
            }));

            setListings(mappedListings);
        } catch (e) {
            setError(e);
            console.error("Error searching listings:", e);
        } finally {
            setLoading(false);
        }
    };

    const [categories, setCategories] = useState<{ id: string; name: string; risk_daily_fee: number }[]>([]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, risk_daily_fee');

            if (error) throw error;
            setCategories(data || []);
        } catch (e) {
            console.error("Error fetching categories:", e);
        }
    };

    const fetchUnavailableDates = async (listingId: string): Promise<Date[]> => {
        try {
            const { data, error } = await supabase
                .from('rentals')
                .select('start_date, end_date')
                .eq('listing_id', listingId)
                .in('status', ['Approved', 'Active']);

            if (error) throw error;

            const dates: Date[] = [];
            data?.forEach((rental: any) => {
                let current = dayjs(rental.start_date);
                const end = dayjs(rental.end_date);

                while (current.isBefore(end) || current.isSame(end, 'day')) {
                    dates.push(current.toDate());
                    current = current.add(1, 'day');
                }
            });

            return dates;
        } catch (e) {
            console.error("Error fetching unavailable dates:", e);
            return [];
        }
    };

    useEffect(() => {
        fetchListings();
        fetchCategories();
    }, []);

    return {
        listings,
        categories,
        loading,
        error,
        fetchListings,
        fetchListing,
        fetchCategories,
        fetchUnavailableDates, // Export new function
        searchListings,
        createRental
    };
};
