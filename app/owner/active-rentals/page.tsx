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
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'active' | 'overdue' | 'completed' | 'archived'>('all');

    // Read hash from URL on component mount
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['all', 'upcoming', 'active', 'overdue', 'completed', 'archived'].includes(hash)) {
            setActiveFilter(hash as any);
        }
    }, []);

    // Function to update filter and URL hash
    const handleFilterChange = (filter: 'all' | 'upcoming' | 'active' | 'overdue' | 'completed' | 'archived') => {
        setActiveFilter(filter);
        // Update URL hash without triggering a page reload
        window.history.pushState(null, '', `#${filter}`);
    };

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

    // Categorize a rental based on dates and status
    const categorizeRental = (rental: any) => {
        const now = new Date();
        const startDate = new Date(rental.start_date);
        const endDate = new Date(rental.end_date);
        const status = rental.status.toLowerCase();

        // Completed/Archived
        if (status === 'completed' || status === 'archived') {
            return 'completed';
        }

        // Upcoming - hasn't started yet
        if (startDate > now) {
            return 'upcoming';
        }

        // Overdue - past end date but not completed
        if (endDate < now && status !== 'returned' && status !== 'completed') {
            return 'overdue';
        }

        // Active - currently ongoing
        if (startDate <= now && endDate >= now) {
            return 'active';
        }

        return 'active'; // default
    };

    // Filter rentals based on active filter
    const filteredRentals = activeRentals.filter(rental => {
        if (activeFilter === 'all') return true;
        const category = categorizeRental(rental);
        if (activeFilter === 'archived') {
            return category === 'completed';
        }
        return category === activeFilter;
    });

    // Get counts for each category
    const getCounts = () => {
        const counts = {
            all: activeRentals.length,
            upcoming: 0,
            active: 0,
            overdue: 0,
            completed: 0,
        };

        activeRentals.forEach(rental => {
            const category = categorizeRental(rental);
            if (category === 'upcoming') counts.upcoming++;
            else if (category === 'active') counts.active++;
            else if (category === 'overdue') counts.overdue++;
            else if (category === 'completed') counts.completed++;
        });

        return counts;
    };

    const counts = getCounts();

    // Get empty state message based on filter
    const getEmptyStateInfo = () => {
        if (activeRentals.length === 0) {
            return {
                title: "No rentals yet",
                description: "You don't have any rental history."
            };
        }

        switch (activeFilter) {
            case 'upcoming':
                return {
                    title: "No upcoming rentals",
                    description: "You don't have any booked rentals starting soon."
                };
            case 'active':
                return {
                    title: "No active rentals",
                    description: "You don't have any tools currently being rented."
                };
            case 'overdue':
                return {
                    title: "No overdue rentals",
                    description: "Great news! None of your rentals are overdue."
                };
            case 'completed':
            case 'archived':
                return {
                    title: "No completed rentals",
                    description: "You haven't had any completed rentals yet."
                };
            default:
                return {
                    title: "No rentals found",
                    description: "No rentals match your current filter."
                };
        }
    };

    const emptyStateInfo = getEmptyStateInfo();

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

                // Use the RPC function that already handles all the joins correctly
                const { data: rentalsData, error: rentalsError } = await supabase
                    .rpc('get_owner_active_rentals', { p_owner_id: user.id });

                if (rentalsError) {
                    console.error("Error fetching rentals:", rentalsError);
                    throw rentalsError;
                }

                if (!rentalsData || rentalsData.length === 0) {
                    setActiveRentals([]);
                    setLoading(false);
                    return;
                }

                // Sort rentals: Overdue first (by most overdue), then normal rentals
                const sortedRentals = rentalsData.sort((a: any, b: any) => {
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

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all'
                            ? 'bg-safety-orange text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        All
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {counts.all}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange('upcoming')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'upcoming'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Upcoming
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {counts.upcoming}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange('active')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'active'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Active
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {counts.active}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange('overdue')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'overdue'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Overdue
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {counts.overdue}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange('archived')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'archived'
                            ? 'bg-slate-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Completed
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {counts.completed}
                        </span>
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <>
                            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                        </>
                    ) : filteredRentals.length > 0 ? (
                        filteredRentals.map((rental) => {
                            const now = new Date();
                            const endDate = new Date(rental.end_date);
                            const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            const isOverdue = daysRemaining < 0;
                            const isDueToday = daysRemaining === 0;

                            return (
                                <Card
                                    key={rental.id}
                                    className={`border-slate-200 shadow-sm hover:border-safety-orange/30 transition-all duration-200 ${isOverdue
                                        ? 'border-red-400 border-2 bg-red-50/30 animate-pulse-subtle'
                                        : isDueToday
                                            ? 'border-orange-300 border-2 bg-yellow-50/20'
                                            : ''
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Tool Image - Smaller on mobile */}
                                            <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-100">
                                                {rental.listing_images && rental.listing_images.length > 0 ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={rental.listing_images[0]}
                                                        alt={rental.listing_title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <Wrench className="h-8 w-8 md:h-10 md:w-10" />
                                                    </div>
                                                )}
                                                <div className="absolute top-1 left-1 md:top-2 md:left-2">
                                                    <Badge className={`border-none capitalize text-xs px-1.5 py-0.5 md:px-2 md:py-1 ${rental.status.toLowerCase() === 'active' ? 'bg-green-500/70 md:bg-green-500 hover:bg-green-600' :
                                                        rental.status.toLowerCase() === 'approved' ? 'bg-blue-500/70 md:bg-blue-500 hover:bg-blue-600' :
                                                            rental.status.toLowerCase() === 'returned' ? 'bg-yellow-500/70 md:bg-yellow-500 hover:bg-yellow-600' :
                                                                'bg-slate-500/70 md:bg-slate-500'
                                                        }`}>
                                                        {rental.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content - Compact and organized */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                                {/* Title and Revenue Row */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-base md:text-lg text-slate-900 truncate">{rental.listing_title}</h3>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                                {rental.renter_full_name ? rental.renter_full_name.charAt(0) : 'R'}
                                                            </div>
                                                            <span className="text-xs text-slate-600 truncate">
                                                                {rental.renter_full_name || 'Unknown User'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="font-bold text-green-600 text-sm md:text-base flex items-center gap-1 cursor-help whitespace-nowrap">
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
                                                </div>

                                                {/* Dates and Time Info */}
                                                <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-1 md:gap-x-3 md:gap-y-1 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        {(() => {
                                                            const daysRemaining = Math.ceil((new Date(rental.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                            if (daysRemaining < 0) {
                                                                return <span className="text-red-600 font-bold">Overdue by {Math.abs(daysRemaining)} Day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>;
                                                            }
                                                            if (daysRemaining === 0) {
                                                                return <span className="text-orange-600 font-semibold">Due Today</span>;
                                                            }
                                                            return <span>{daysRemaining} Day{daysRemaining !== 1 ? 's' : ''} Remaining</span>;
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Button and Support */}
                                                <div className="flex items-center justify-between gap-2">
                                                    {(() => {
                                                        const daysOverdue = Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24));
                                                        if (daysOverdue > 2) {
                                                            return (
                                                                <div className="text-xs text-slate-500 flex-1">
                                                                    Need help? <a href="mailto:support@blockhyre.com" className="text-slate-600 hover:text-safety-orange underline font-medium">Support</a>
                                                                </div>
                                                            );
                                                        }
                                                        return <div className="flex-1"></div>;
                                                    })()}
                                                    <Link
                                                        href={`/messages?listing=${rental.listing_id}&renter=${rental.renter_id}`}
                                                        className={buttonVariants({ className: "bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md text-xs md:text-sm px-3 py-2" })}
                                                    >
                                                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                                                        Message
                                                    </Link>
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
                                <EmptyTitle>{emptyStateInfo.title}</EmptyTitle>
                                <EmptyDescription>
                                    {emptyStateInfo.description}
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
