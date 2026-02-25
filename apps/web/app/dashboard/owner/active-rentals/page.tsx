"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, MessageCircle, Calendar, Clock, Info, Wrench } from "lucide-react";
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

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['all', 'upcoming', 'active', 'overdue', 'completed', 'archived'].includes(hash)) {
            setActiveFilter(hash as any);
        }
    }, []);

    const handleFilterChange = (filter: 'all' | 'upcoming' | 'active' | 'overdue' | 'completed' | 'archived') => {
        setActiveFilter(filter);
        window.history.pushState(null, '', `#${filter}`);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateOwnerRevenue = (rentalFee: number) => {
        if (!rentalFee || !sellerFeePercent) return rentalFee || 0;
        return rentalFee - rentalFee * (sellerFeePercent / 100);
    };

    const categorizeRental = (rental: any) => {
        const now = new Date();
        const startDate = new Date(rental.start_date);
        const endDate = new Date(rental.end_date);
        const status = rental.status.toLowerCase();
        if (status === 'completed' || status === 'archived') return 'completed';
        if (startDate > now) return 'upcoming';
        if (endDate < now && status !== 'returned' && status !== 'completed') return 'overdue';
        if (startDate <= now && endDate >= now) return 'active';
        return 'active';
    };

    const filteredRentals = activeRentals.filter(rental => {
        if (activeFilter === 'all') return true;
        const category = categorizeRental(rental);
        if (activeFilter === 'archived') return category === 'completed';
        return category === activeFilter;
    });

    const getCounts = () => {
        const counts = { all: activeRentals.length, upcoming: 0, active: 0, overdue: 0, completed: 0 };
        activeRentals.forEach(rental => {
            const category = categorizeRental(rental);
            if (counts[category as keyof typeof counts] !== undefined) counts[category as keyof typeof counts]++;
        });
        return counts;
    };
    const counts = getCounts();

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const { data: settingsData } = await supabase
                    .from('platform_settings').select('seller_fee_percent').single();
                if (settingsData) setSellerFeePercent(settingsData.seller_fee_percent || 0);

                const { data: rentalsData, error: rentalsError } = await supabase
                    .rpc('get_owner_active_rentals', { p_owner_id: user.id });
                if (rentalsError) throw rentalsError;

                if (!rentalsData || rentalsData.length === 0) {
                    setActiveRentals([]);
                    return;
                }

                const sortedRentals = rentalsData.sort((a: any, b: any) => {
                    const now = new Date();
                    const aEnd = new Date(a.end_date);
                    const bEnd = new Date(b.end_date);
                    const aOver = aEnd < now, bOver = bEnd < now;
                    if (aOver && bOver) return aEnd.getTime() - bEnd.getTime();
                    if (aOver) return -1;
                    if (bOver) return 1;
                    return aEnd.getTime() - bEnd.getTime();
                });
                setActiveRentals(sortedRentals);
            } catch (error) {
                console.error("Error fetching active rentals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filterConfig = [
        { key: 'all', label: 'All', countKey: 'all', color: 'bg-safety-orange' },
        { key: 'upcoming', label: 'Upcoming', countKey: 'upcoming', color: 'bg-blue-500' },
        { key: 'active', label: 'Active', countKey: 'active', color: 'bg-emerald-500' },
        { key: 'overdue', label: 'Overdue', countKey: 'overdue', color: 'bg-red-500' },
        { key: 'archived', label: 'Completed', countKey: 'completed', color: 'bg-slate-600' },
    ] as const;

    return (
        <div className="pt-4">
            {/* Page Header */}
            <div className="mb-8">
                <Link href="/dashboard/owner" className="text-slate-400 hover:text-slate-700 flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-4 transition-colors">
                    <ArrowLeft className="h-3 w-3" />
                    Back to Command Center
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-safety-orange" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-safety-orange">
                        Tool Bookings
                    </span>
                </div>
                <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">Active Rentals</h1>
                <p className="text-slate-500 mt-1 text-sm">Track tools currently rented out and manage renter communications.</p>
            </div>

            {/* Filter Pills — Industrial style */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterConfig.map(({ key, label, countKey, color }) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold font-mono uppercase tracking-wider transition-all ${activeFilter === key
                                ? `${color} text-white shadow-lg`
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        {label}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {counts[countKey]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Rental Cards */}
            <div className="space-y-4">
                {loading ? (
                    <>
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-200"><Skeleton className="h-32 w-full" /></div>
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-200"><Skeleton className="h-32 w-full" /></div>
                    </>
                ) : filteredRentals.length > 0 ? (
                    filteredRentals.map((rental) => {
                        const now = new Date();
                        const endDate = new Date(rental.end_date);
                        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysRemaining < 0;
                        const isDueToday = daysRemaining === 0;

                        return (
                            <div
                                key={rental.id}
                                className={`bg-white rounded-[2rem] border p-6 shadow-sm transition-all duration-200 hover:shadow-md ${isOverdue ? 'border-2 border-red-400 bg-red-50/30 animate-pulse-subtle'
                                        : isDueToday ? 'border-2 border-amber-300 bg-amber-50/20'
                                            : 'border-slate-200 hover:border-safety-orange/30'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Tool Image */}
                                    <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-100">
                                        {rental.listing_images && rental.listing_images.length > 0 ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={rental.listing_images[0]} alt={rental.listing_title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Wrench className="h-8 w-8" />
                                            </div>
                                        )}
                                        <div className="absolute top-1 left-1">
                                            <Badge className={`border-none capitalize text-[10px] font-mono font-bold px-2 py-0.5 ${rental.status.toLowerCase() === 'active' ? 'bg-emerald-500 text-white'
                                                    : rental.status.toLowerCase() === 'approved' ? 'bg-blue-500 text-white'
                                                        : rental.status.toLowerCase() === 'returned' ? 'bg-amber-500 text-white'
                                                            : 'bg-slate-500 text-white'
                                                }`}>
                                                {rental.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base md:text-lg text-slate-900 font-serif truncate">{rental.listing_title}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {rental.renter_full_name ? rental.renter_full_name.charAt(0) : 'R'}
                                                    </div>
                                                    <span className="text-xs text-slate-500 font-mono truncate">{rental.renter_full_name || 'Unknown User'}</span>
                                                </div>
                                            </div>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-bold text-emerald-600 text-sm md:text-base flex items-center gap-1 cursor-help whitespace-nowrap font-mono">
                                                            {formatCurrency(calculateOwnerRevenue(rental.rental_fee))}
                                                            <Info className="h-3 w-3 opacity-50" />
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left" className="bg-charcoal text-white p-3 max-w-xs rounded-xl border border-white/10">
                                                        <div className="space-y-1 text-xs font-mono">
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-concrete/60">Rental Fee:</span>
                                                                <span className="font-semibold">{formatCurrency(rental.rental_fee)}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-concrete/60">Platform Fee ({sellerFeePercent}%):</span>
                                                                <span className="text-red-400">-{formatCurrency(rental.rental_fee * (sellerFeePercent / 100))}</span>
                                                            </div>
                                                            <div className="border-t border-white/10 pt-1 mt-1"></div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="font-semibold">Your Revenue:</span>
                                                                <span className="font-bold text-emerald-400">{formatCurrency(calculateOwnerRevenue(rental.rental_fee))}</span>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{formatDate(rental.start_date)} – {formatDate(rental.end_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {isOverdue
                                                    ? <span className="text-red-600 font-bold">Overdue by {Math.abs(daysRemaining)}d</span>
                                                    : isDueToday
                                                        ? <span className="text-amber-600 font-bold">Due Today</span>
                                                        : <span>{daysRemaining} Days Remaining</span>
                                                }
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            {Math.ceil((new Date().getTime() - new Date(rental.end_date).getTime()) / (1000 * 60 * 60 * 24)) > 2 && (
                                                <span className="text-xs text-slate-400 font-mono flex-1">
                                                    Need help? <a href="mailto:support@blockhyre.com" className="text-safety-orange underline">Support</a>
                                                </span>
                                            )}
                                            <Link
                                                href={`/messages?listing=${rental.listing_id}&renter=${rental.renter_id}`}
                                                className={buttonVariants({ className: "bg-safety-orange hover:bg-safety-orange/90 text-white font-bold font-mono uppercase tracking-wider text-xs rounded-full px-5 shadow-lg shadow-safety-orange/20" })}
                                            >
                                                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Message
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <Empty className="bg-white rounded-[2rem] border border-slate-200">
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><Wrench className="text-slate-300" /></EmptyMedia>
                            <EmptyTitle>{activeRentals.length === 0 ? "No rentals yet" : "No rentals match this filter"}</EmptyTitle>
                            <EmptyDescription>
                                {activeRentals.length === 0 ? "You don't have any rental history." : "Try changing the filter above."}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Link href="/dashboard/owner">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </EmptyContent>
                    </Empty>
                )}
            </div>
        </div>
    );
}
