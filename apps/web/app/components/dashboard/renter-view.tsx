"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Search, Calendar, Check, MessageSquare, TriangleAlert, MoreVertical, CalendarClock, X, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow, format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { RescheduleModal } from "@/app/components/reschedule-modal";
import { CancelRentalModal } from "@/app/components/cancel-rental-modal";
import { HandoverModal } from "@/app/components/modals/handover-modal";
import { ExtensionModal } from "@/app/components/extension-modal";
import Image from "next/image";
import { CountdownTimer } from "@/app/components/countdown-timer";

interface ActiveRental {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    owner_id: string;
    owner_name: string;
    end_date: string;
    dashboard_status: 'overdue' | 'due_today' | 'active';
    daily_price?: number;
    risk_fee?: number;
}

interface UpcomingBooking {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
}

interface RentalHistory {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    end_date: string;
    has_review: boolean;
}

interface PendingRequest {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
    created_at: string;
    owner_name: string;
}

import { RenterDashboardSkeleton } from "@/app/components/dashboard/dashboard-skeletons";

export function RenterDashboardView() {
    const [activeDisputes, setActiveDisputes] = useState([]);
    const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
    const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [handoverModalOpen, setHandoverModalOpen] = useState(false);
    const [extensionModalOpen, setExtensionModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<UpcomingBooking | null>(null);
    const [selectedRental, setSelectedRental] = useState<ActiveRental | null>(null);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [cancelPendingModalOpen, setCancelPendingModalOpen] = useState(false);
    const [selectedPendingRequest, setSelectedPendingRequest] = useState<PendingRequest | null>(null);

    useEffect(() => {
        async function fetchRenterData() {
            try {
                const { data: activeData, error: activeError } = await supabase
                    .rpc('get_my_active_rentals');

                if (activeError) {
                    console.error('Active rentals RPC error:', {
                        message: activeError.message,
                        details: activeError.details,
                        hint: activeError.hint,
                        code: activeError.code
                    });
                } else {
                    setActiveRentals(activeData || []);
                }

                const { data: upcomingData, error: upcomingError } = await supabase
                    .rpc('get_my_upcoming_bookings');

                if (upcomingError) {
                    console.error('Upcoming bookings RPC error:', {
                        message: upcomingError.message,
                        details: upcomingError.details,
                        hint: upcomingError.hint,
                        code: upcomingError.code
                    });
                } else {
                    setUpcomingBookings(upcomingData || []);
                }

                const { data: historyData, error: historyError } = await supabase
                    .rpc('get_my_rental_history');

                if (historyError) {
                    console.error('Rental history RPC error:', {
                        message: historyError.message,
                        details: historyError.details,
                        hint: historyError.hint,
                        code: historyError.code
                    });
                } else {
                    setRentalHistory(historyData || []);
                }

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: pendingData, error: pendingError } = await supabase
                        .from('rentals')
                        .select(`
                            id,
                            listing_id,
                            start_date,
                            end_date,
                            total_days,
                            created_at,
                            listing:listings!inner (
                                title,
                                images,
                                owner:users!owner_id (
                                    full_name
                                )
                            )
                        `)
                        .eq('renter_id', user.id)
                        .eq('status', 'pending')
                        .order('created_at', { ascending: false });

                    if (pendingError) {
                        console.error('Pending requests error:', pendingError);
                    } else if (pendingData) {
                        const mapped: PendingRequest[] = pendingData.map((r: any) => ({
                            rental_id: r.id,
                            listing_id: r.listing_id,
                            listing_title: r.listing?.title || 'Unknown',
                            listing_image_url: r.listing?.images?.[0] || null,
                            start_date: r.start_date,
                            end_date: r.end_date,
                            total_days: r.total_days,
                            created_at: r.created_at,
                            owner_name: r.listing?.owner?.full_name || 'Unknown'
                        }));
                        setPendingRequests(mapped);
                    }
                }
            } catch (error) {
                console.error('Unexpected error in fetchRenterData:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRenterData();
    }, []);

    const getRentalStyles = (status: string) => {
        switch (status) {
            case 'overdue':
                return {
                    card: "border-2 border-red-400 bg-red-50/50 animate-pulse-subtle",
                    badge: "bg-red-500 text-white hover:bg-red-600 border-none text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-3",
                    text: "text-red-600 font-bold",
                    dot: "bg-red-500 animate-ping",
                    timerColor: "text-red-500",
                };
            case 'due_today':
                return {
                    card: "border-2 border-amber-300 bg-amber-50/50",
                    badge: "bg-amber-500 text-white hover:bg-amber-600 border-none text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-3",
                    text: "text-amber-600 font-medium",
                    dot: "bg-amber-500 animate-pulse",
                    timerColor: "text-amber-500",
                };
            default:
                return {
                    card: "border border-slate-200 bg-white",
                    badge: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-3",
                    text: "text-slate-500 font-normal",
                    dot: "bg-emerald-500",
                    timerColor: "text-slate-400",
                };
        }
    };

    const totalActive = activeRentals.length;
    const urgentCount = activeRentals.filter(r => r.dashboard_status === 'overdue' || r.dashboard_status === 'due_today').length;
    const overdueCount = activeRentals.filter(r => r.dashboard_status === 'overdue').length;

    if (loading) {
        return <RenterDashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">My Rentals</h2>
                    <p className="text-sm text-slate-500 mt-1">Track your active rentals and history.</p>
                </div>
                <Link href="/listings">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40 hover:scale-105">
                        <Search className="mr-2 h-4 w-4" />
                        Find Tools
                    </Button>
                </Link>
            </div>

            {/* KPI Telemetry Row */}
            <div className="grid grid-cols-3 gap-4">
                {/* Active Rentals Count */}
                <div className={`bg-white rounded-[2rem] border p-5 shadow-sm flex items-center justify-between group ${overdueCount > 0 ? 'border-2 border-red-300' : 'border-slate-200'
                    }`}>
                    <div>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Active</p>
                        <h3 className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{totalActive}</h3>
                    </div>
                    <div className="relative h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar className="h-5 w-5" />
                        {overdueCount > 0 ? (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white"></span>
                            </span>
                        ) : (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white animate-pulse-operational"></span>
                        )}
                    </div>
                </div>

                {/* Urgent Count */}
                <div className={`rounded-[2rem] border p-5 shadow-sm flex items-center justify-between ${urgentCount > 0
                        ? 'bg-red-50/60 border-2 border-red-300 animate-pulse-subtle'
                        : 'bg-white border-slate-200'
                    }`}>
                    <div>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-slate-400">Urgent</p>
                        <h3 className={`text-3xl font-bold font-mono tabular-nums ${urgentCount > 0 ? 'text-red-600' : 'text-slate-900'
                            }`}>{urgentCount}</h3>
                    </div>
                    <div className={`relative h-10 w-10 rounded-2xl flex items-center justify-center ${urgentCount > 0 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'
                        }`}>
                        <TriangleAlert className="h-5 w-5" />
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                        <h3 className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{pendingRequests.length}</h3>
                    </div>
                    <div className="relative h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <CalendarClock className="h-5 w-5" />
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Active & Upcoming */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Rentals */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Active Rentals</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold border border-slate-200">
                                <span className="text-slate-700">{totalActive}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-red-500">{urgentCount}</span>
                            </div>
                        </div>
                        {activeRentals.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm">
                                <p className="text-slate-400 text-sm font-mono">No active rentals</p>
                            </div>
                        ) : activeRentals.map((rental) => {
                            const styles = getRentalStyles(rental.dashboard_status);
                            const endDate = new Date(rental.end_date);
                            const now = new Date();
                            const msLeft = endDate.getTime() - now.getTime();
                            const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
                            const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
                            const isOverdue = rental.dashboard_status === 'overdue';
                            const isDueToday = rental.dashboard_status === 'due_today';

                            const badgeText = isOverdue
                                ? `OVERDUE ${Math.abs(daysLeft)}D`
                                : isDueToday
                                    ? 'Return Today'
                                    : `Due in ${daysLeft} Days`;

                            return (
                                <div key={rental.rental_id} className={`rounded-[2rem] p-6 shadow-sm transition-all duration-300 ${styles.card}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
                                                    <Badge variant="secondary" className={styles.badge}>{badgeText}</Badge>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-lg tracking-tight font-serif">{rental.listing_title}</h4>
                                            <p className="text-sm text-slate-500 mt-0.5">Owner: <span className="font-medium text-slate-700">{rental.owner_name}</span></p>

                                            {/* Industrial Detonation Timer */}
                                            {(isOverdue || isDueToday) && (
                                                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider ${isOverdue
                                                        ? 'bg-red-900/10 border-red-300 text-red-600'
                                                        : 'bg-amber-900/10 border-amber-300 text-amber-600'
                                                    }`}>
                                                    <span className="animate-ping inline-flex h-2 w-2 rounded-full opacity-75" style={{ backgroundColor: isOverdue ? '#ef4444' : '#f59e0b' }}></span>
                                                    {isOverdue
                                                        ? `OVERDUE: ${Math.abs(hoursLeft)}h ago`
                                                        : `RETURN WINDOW: ${hoursLeft}h remaining`
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                                            <Link href={`/messages?listing=${rental.listing_id}&owner=${rental.owner_id}`}>
                                                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 rounded-full font-bold text-xs uppercase tracking-wider">
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Message {rental.owner_name}
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-full border-safety-orange/30 text-safety-orange hover:bg-safety-orange hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all"
                                                onClick={() => {
                                                    setSelectedRental(rental);
                                                    setExtensionModalOpen(true);
                                                }}
                                            >
                                                <CalendarClock className="mr-2 h-4 w-4" />
                                                Request Extension
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pending Requests */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Pending Requests</h2>
                            {pendingRequests.length > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-3">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </div>
                        {pendingRequests.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm">
                                <p className="text-slate-400 text-sm font-mono">No pending requests</p>
                            </div>
                        ) : pendingRequests.map((request) => (
                            <div key={request.rental_id} className="bg-white rounded-[2rem] border border-amber-200/60 p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            {request.listing_image_url ? (
                                                <Image
                                                    src={request.listing_image_url}
                                                    alt={request.listing_title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 text-sm">{request.listing_title}</h4>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                                                Owner: <span className="text-slate-600">{request.owner_name}</span>
                                            </p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                {format(new Date(request.start_date), 'MMM d')} – {format(new Date(request.end_date), 'MMM d')} • {request.total_days} days
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Auto-expires in:</div>
                                        <CountdownTimer createdAt={request.created_at} />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-1 h-auto py-1 px-2 text-[10px] font-mono text-slate-400 hover:text-red-600 hover:bg-transparent uppercase tracking-wider"
                                            onClick={() => {
                                                setSelectedPendingRequest(request);
                                                setCancelPendingModalOpen(true);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Upcoming Bookings</h2>
                        </div>
                        {upcomingBookings.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm">
                                <p className="text-slate-400 text-sm font-mono">No upcoming bookings</p>
                            </div>
                        ) : upcomingBookings.map((booking) => {
                            const startDate = new Date(booking.start_date);
                            const now = new Date();
                            const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                            const canReceiveTool = hoursUntilStart <= 24 && hoursUntilStart >= -24;

                            return (
                                <div key={booking.rental_id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:border-safety-orange/30 hover:shadow-md">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                {booking.listing_image_url ? (
                                                    <Image
                                                        src={booking.listing_image_url}
                                                        alt={booking.listing_title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm">{booking.listing_title}</h4>
                                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                                                    {format(new Date(booking.start_date), 'MMM d')} – {format(new Date(booking.end_date), 'MMM d')} • {booking.total_days} days
                                                </p>
                                                {canReceiveTool && (
                                                    <p className="text-[10px] font-mono text-safety-orange font-bold uppercase tracking-wider mt-1">
                                                        📦 Ready for pickup!
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {canReceiveTool && (
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setHandoverModalOpen(true);
                                                        }}
                                                        className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-5 h-9 shadow-lg shadow-safety-orange/20"
                                                        size="sm"
                                                    >
                                                        <Package className="mr-2 h-4 w-4" />
                                                        Receive Tool
                                                    </Button>

                                                    {hoursUntilStart < -24 && (
                                                        <a
                                                            href={`mailto:contact@blockhyre.com?subject=Handover Issue - Rental ID: ${booking.rental_id}`}
                                                            className="text-[10px] font-mono text-slate-500 hover:text-safety-orange text-center underline decoration-slate-300 underline-offset-2"
                                                        >
                                                            Having trouble? Contact support
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                                                    {!canReceiveTool && (
                                                        <DropdownMenuItem disabled className="text-slate-400 text-xs">
                                                            <Package className="mr-2 h-4 w-4" />
                                                            Receive Tool (available on pickup day)
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setRescheduleModalOpen(true);
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <CalendarClock className="mr-2 h-4 w-4" />
                                                        Change Dates
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 text-xs"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setCancelModalOpen(true);
                                                        }}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Cancel Booking
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: History & Disputes */}
                <div className="space-y-6">
                    {/* Rental History */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-base font-bold font-serif text-slate-900 mb-4">Rental History</h3>
                        <div className="space-y-4">
                            {rentalHistory.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4 font-mono">No rental history yet</p>
                            ) : rentalHistory.map((rental) => (
                                <div key={rental.rental_id} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{rental.listing_title}</p>
                                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">Returned {format(new Date(rental.end_date), 'MMM d')}</p>
                                    </div>
                                    {rental.has_review ? (
                                        <div className="text-right">
                                            <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider mb-1">
                                                Completed
                                            </div>
                                            <Link href={`/listings/${rental.listing_id}`} className="text-[10px] font-mono text-slate-400 hover:text-safety-orange underline decoration-slate-300 underline-offset-2 uppercase tracking-wider">
                                                Rent Again
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link href={`/reviews/new?rental=${rental.rental_id}`}>
                                            <Button variant="link" className="text-safety-orange p-0 h-auto text-[10px] font-mono font-bold uppercase tracking-wider">
                                                Leave Review
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disputes */}
                    {activeDisputes.length > 0 ? (
                        <div className="bg-red-50 rounded-[2rem] border-2 border-red-300 p-6 shadow-sm">
                            <h3 className="text-base font-bold font-serif text-red-700 flex items-center gap-2 mb-3">
                                <TriangleAlert className="h-5 w-5" />
                                Active Dispute
                            </h3>
                            <p className="text-red-600 text-sm mb-4">
                                Action is required on your rental for <strong>Makita Circular Saw</strong>.
                            </p>
                            <Button size="sm" className="w-full font-bold bg-red-500 hover:bg-red-600 text-white rounded-full text-xs uppercase tracking-wider">
                                View Details
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                            <span className="font-serif text-slate-900 font-medium text-sm">Disputes</span>
                            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-mono font-bold uppercase tracking-wider">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                No active disputes
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedBooking && (
                <RescheduleModal
                    isOpen={rescheduleModalOpen}
                    onClose={() => {
                        setRescheduleModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    rentalId={selectedBooking.rental_id}
                    currentStartDate={selectedBooking.start_date}
                    currentEndDate={selectedBooking.end_date}
                    listingTitle={selectedBooking.listing_title}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}

            {selectedBooking && (
                <CancelRentalModal
                    isOpen={cancelModalOpen}
                    onClose={() => {
                        setCancelModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    rentalId={selectedBooking.rental_id}
                    listingTitle={selectedBooking.listing_title}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}

            {selectedBooking && (
                <HandoverModal
                    isOpen={handoverModalOpen}
                    onClose={() => {
                        setHandoverModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    rentalId={selectedBooking.rental_id}
                    listingTitle={selectedBooking.listing_title}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}

            {selectedRental && (
                <ExtensionModal
                    isOpen={extensionModalOpen}
                    onClose={() => {
                        setExtensionModalOpen(false);
                        setSelectedRental(null);
                    }}
                    rentalId={selectedRental.rental_id}
                    listingTitle={selectedRental.listing_title}
                    currentEndDate={selectedRental.end_date}
                    dailyPrice={selectedRental.daily_price || 0}
                    riskFee={selectedRental.risk_fee || 0}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}

            {selectedPendingRequest && (
                <CancelRentalModal
                    isOpen={cancelPendingModalOpen}
                    onClose={() => {
                        setCancelPendingModalOpen(false);
                        setSelectedPendingRequest(null);
                    }}
                    rentalId={selectedPendingRequest.rental_id}
                    listingTitle={selectedPendingRequest.listing_title}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
