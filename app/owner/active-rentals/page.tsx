"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ArrowLeft, MessageCircle, Calendar, Clock, MapPin, Info, Wrench } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/app/components/ui/empty";

import { Skeleton } from "@/app/components/ui/skeleton";

export default function ActiveRentalsPage() {
    const { user } = useAuth();
    const [activeRentals, setActiveRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellerFeePercent, setSellerFeePercent] = useState<number>(0);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Helper for date formatting
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate owner's revenue after platform fee
    const calculateOwnerRevenue = (rentalFee: number) => {
        if (!rentalFee || !sellerFeePercent) return rentalFee || 0;
        const platformFee = rentalFee * (sellerFeePercent / 100);
        return rentalFee - platformFee;
    };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch platform settings for seller fee
                const { data: settingsData } = await supabase
                    .from('platform_settings')
                    .select('seller_fee_percent')
                    .single();

                if (settingsData) {
                    setSellerFeePercent(settingsData.seller_fee_percent || 0);
                }

                // Fetch Active Rentals
                // 1. Get all listings owned by user to ensure RLS compliance
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select('id')
                    .eq('owner_id', user.id);

                if (listingsError) {
                    console.error("Error fetching owner listings:", listingsError);
                    throw listingsError;
                }

                if (!listingsData || listingsData.length === 0) {
                    setActiveRentals([]);
                    setLoading(false);
                    return;
                }

                const listingIds = listingsData.map(l => l.id);

                // 2. Get rentals for these listings (INCLUDING renter_id for messaging)
                const { data: rentalsData, error: rentalsError } = await supabase
                    .from('rentals')
                    .select('id, status, start_date, end_date, total_days, rental_fee, renter_id, listing_id')
                    .in('listing_id', listingIds)
                    .in('status', ['active', 'approved', 'returned', 'Active', 'Approved', 'Returned'])
                    .order('start_date', { ascending: false });

                if (rentalsError) {
                    console.error("Error fetching rentals:", JSON.stringify(rentalsError));
                    throw rentalsError;
                }

                if (!rentalsData || rentalsData.length === 0) {
                    setActiveRentals([]);
                    setLoading(false);
                    return;
                }

                // 3. Get unique renter IDs and listing IDs
                const renterIds = [...new Set(rentalsData.map(r => r.renter_id))];
                const rentalListingIds = [...new Set(rentalsData.map(r => r.listing_id))];

                // 4. Fetch renter details
                const { data: rentersData } = await supabase
                    .from('users')
                    .select('id, full_name, email')
                    .in('id', renterIds);

                // 5. Fetch listing details
                const { data: listingsDetailsData } = await supabase
                    .from('listings')
                    .select('id, title, images, hourly_price, daily_price')
                    .in('id', rentalListingIds);

                console.log("Rental Listing IDs:", rentalListingIds);
                console.log("Fetched Listings Details:", listingsDetailsData);

                // 6. Create lookup maps
                const rentersMap = new Map(rentersData?.map(r => [r.id, r]) || []);
                const listingsMap = new Map(listingsDetailsData?.map(l => [l.id, l]) || []);

                console.log("Listings Map:", Array.from(listingsMap.entries()));

                // 7. Map to flat structure for the UI
                const mappedRentals = rentalsData.map((r: any) => {
                    const renter = rentersMap.get(r.renter_id);
                    const listing = listingsMap.get(r.listing_id);

                    console.log(`Rental ${r.id}: looking for listing_id ${r.listing_id}, found:`, listing);

                    return {
                        id: r.id,
                        status: r.status,
                        start_date: r.start_date,
                        end_date: r.end_date,
                        total_days: r.total_days,
                        rental_fee: r.rental_fee,
                        renter_id: r.renter_id,
                        renter_full_name: renter?.full_name || 'Unknown User',
                        renter_email: renter?.email || '',
                        listing_id: listing?.id || r.listing_id,
                        listing_title: listing?.title || 'Unknown Tool',
                        listing_images: listing?.images || [],
                        listing_daily_price: listing?.daily_price || 0,
                        listing_hourly_price: listing?.hourly_price || 0
                    };
                });

                // Sort rentals: Overdue first (by most overdue), then normal rentals
                const sortedRentals = mappedRentals.sort((a, b) => {
                    const now = new Date();
                    const aEndDate = new Date(a.end_date);
                    const bEndDate = new Date(b.end_date);

                    const aIsOverdue = aEndDate < now;
                    const bIsOverdue = bEndDate < now;

                    // If both are overdue, sort by most overdue (earliest end_date first)
                    if (aIsOverdue && bIsOverdue) {
                        return aEndDate.getTime() - bEndDate.getTime();
                    }

                    // If only one is overdue, it comes first
                    if (aIsOverdue) return -1;
                    if (bIsOverdue) return 1;

                    // Both are not overdue, sort by end_date ascending (ending soonest first)
                    return aEndDate.getTime() - bEndDate.getTime();
                });

                setActiveRentals(sortedRentals);

            } catch (error) {
                console.error("Error fetching active rentals:", error);
                console.error("Error details:", JSON.stringify(error));
                // toast.error("Failed to load rentals");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-slate-900">Active Rentals</h1>
                            <p className="text-slate-500 mt-2">Track tools currently rented out and manage renter communications.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <>
                            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                        </>
                    ) : activeRentals.length > 0 ? (
                        activeRentals.map((rental) => {
                            const isOverdue = new Date(rental.end_date) < new Date();
                            return (
                                <Card
                                    key={rental.id}
                                    className={`border-slate-200 shadow-sm hover:border-safety-orange/30 transition-all duration-200 ${isOverdue ? 'border-red-400 border-2 bg-red-50/30 animate-pulse-subtle' : ''
                                        }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Tool Image */}
                                            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-100">
                                                {rental.listing_images && rental.listing_images.length > 0 ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={rental.listing_images[0]}
                                                        alt={rental.listing_title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <Wrench className="h-10 w-10" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <Badge className={`border-none capitalize ${rental.status.toLowerCase() === 'active' ? 'bg-green-500 hover:bg-green-600' :
                                                        rental.status.toLowerCase() === 'approved' ? 'bg-blue-500 hover:bg-blue-600' :
                                                            rental.status.toLowerCase() === 'returned' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                                'bg-slate-500'
                                                        }`}>
                                                        {rental.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 mb-1">{rental.listing_title}</h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
                                                                {rental.renter_full_name ? rental.renter_full_name.charAt(0) : 'R'}
                                                            </div>
                                                            <span className="text-sm text-slate-600">
                                                                Rented by <span className="font-medium text-slate-900">{rental.renter_full_name || 'Unknown User'}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end text-right">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="font-bold text-green-600 text-lg flex items-center gap-1 cursor-help">
                                                                        {formatCurrency(calculateOwnerRevenue(rental.rental_fee))}
                                                                        <Info className="h-3 w-3 opacity-50" />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left" className="bg-slate-900 text-white p-3 max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between gap-4">
                                                                            <span className="text-slate-300">Rental Fee:</span>
                                                                            <span className="font-semibold">{formatCurrency(rental.rental_fee)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between gap-4">
                                                                            <span className="text-slate-300">Platform Fee ({sellerFeePercent}%):</span>
                                                                            <span className="text-red-400">-{formatCurrency(rental.rental_fee * (sellerFeePercent / 100))}</span>
                                                                        </div>
                                                                        <div className="border-t border-slate-700 pt-1 mt-1"></div>
                                                                        <div className="flex justify-between gap-4">
                                                                            <span className="font-semibold">Your Revenue:</span>
                                                                            <span className="font-bold text-green-400">{formatCurrency(calculateOwnerRevenue(rental.rental_fee))}</span>
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <span className="text-xs text-slate-400">Estimated Earnings</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 md:mt-2">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            <span>{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Clock className="h-4 w-4 text-slate-400" />
                                                            {(() => {
                                                                const daysRemaining = Math.ceil((new Date(rental.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                                if (daysRemaining < 0) {
                                                                    return <span className="text-red-600 font-bold">Overdue by {Math.abs(daysRemaining)} Day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>;
                                                                }
                                                                return <span>{daysRemaining} Day{daysRemaining !== 1 ? 's' : ''} Remaining</span>;
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end justify-end">
                                                        <div className="w-full md:w-auto space-y-2">
                                                            {(() => {
                                                                const daysOverdue = Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24));
                                                                if (daysOverdue >= 2) {
                                                                    return (
                                                                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
                                                                            <span className="font-semibold">⚠️ Overdue by {daysOverdue} days</span>
                                                                            <br />
                                                                            Need help? <a href="mailto:support@blockhyre.com" className="underline hover:text-red-700 font-medium">Contact Support</a>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            <Link
                                                                href={`/messages?listing=${rental.listing_id}&renter=${rental.renter_id}`}
                                                                className={buttonVariants({ className: "w-full md:w-auto bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md" })}
                                                            >
                                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                                Message {rental.renter_full_name?.split(' ')[0] || 'Renter'}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <Empty className="bg-white border-slate-200">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Wrench className="text-slate-300" />
                                </EmptyMedia>
                                <EmptyTitle>No active rentals</EmptyTitle>
                                <EmptyDescription>
                                    You don't have any tools currently rented out.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Link href="/dashboard">
                                    <Button variant="outline">
                                        Return to Dashboard
                                    </Button>
                                </Link>
                            </EmptyContent>
                        </Empty>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
