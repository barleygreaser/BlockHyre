"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Search, Calendar, Check, MessageSquare, TriangleAlert, MoreVertical, CalendarClock, X, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow, format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { RescheduleModal } from "@/app/components/reschedule-modal";
import { CancelRentalModal } from "@/app/components/cancel-rental-modal";
import { HandoverModal } from "@/app/components/modals/handover-modal";
import Image from "next/image";

interface ActiveRental {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    owner_id: string;
    owner_name: string;
    end_date: string;
    dashboard_status: 'overdue' | 'due_today' | 'active';
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
    const [selectedBooking, setSelectedBooking] = useState<UpcomingBooking | null>(null);

    useEffect(() => {
        async function fetchRenterData() {
            try {
                // Fetch active rentals
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

                // Fetch upcoming bookings
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

                // Fetch rental history
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
                    card: "border-2 border-red-500 bg-red-50",
                    badge: "bg-red-600 text-white hover:bg-red-700 border-none",
                    text: "text-red-700 font-bold"
                };
            case 'due-today':
                return {
                    card: "border-l-4 border-l-amber-500 border-y border-r border-amber-200 bg-amber-50",
                    badge: "bg-amber-500 text-white hover:bg-amber-600 border-none",
                    text: "text-amber-700 font-medium"
                };
            default: // due-future
                return {
                    card: "border border-slate-200 bg-white",
                    badge: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
                    text: "text-slate-500 font-normal"
                };
        }
    };

    const totalActive = activeRentals.length;
    const urgentCount = activeRentals.filter(r => r.dashboard_status === 'overdue' || r.dashboard_status === 'due_today').length;

    if (loading) {
        return <RenterDashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">My Rentals</h2>
                    <p className="text-slate-500">Track your active rentals and history.</p>
                </div>
                <Link href="/listings">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90">
                        <Search className="mr-2 h-4 w-4" />
                        Find Tools
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Active & Upcoming */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Rentals */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Active Rentals</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-base font-bold border border-slate-300 shadow-sm">
                                <span className="text-slate-800">{totalActive}</span>
                                <span className="text-slate-400">|</span>
                                <span className="text-red-600 font-extrabold">{urgentCount}</span>
                            </div>
                        </div>
                        {loading ? (
                            <Card className="border-slate-200">
                                <CardContent className="p-12 text-center text-slate-500">
                                    Loading...
                                </CardContent>
                            </Card>
                        ) : activeRentals.length === 0 ? (
                            <Card className="border-slate-200">
                                <CardContent className="p-12 text-center text-slate-500">
                                    No active rentals
                                </CardContent>
                            </Card>
                        ) : activeRentals.map((rental) => {
                            // Map dashboard_status to display format
                            const statusMap = {
                                'overdue': 'overdue',
                                'due_today': 'due-today',
                                'active': 'due-future'
                            };
                            const displayStatus = statusMap[rental.dashboard_status] || 'due-future';
                            const styles = getRentalStyles(displayStatus);

                            // Generate badge text and due text
                            const badgeText = rental.dashboard_status === 'overdue' ? 'OVERDUE' :
                                rental.dashboard_status === 'due_today' ? 'Return Today' :
                                    `Due in ${Math.ceil((new Date(rental.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days`;

                            const dueText = rental.dashboard_status === 'overdue' ? 'Due Yesterday' :
                                rental.dashboard_status === 'due_today' ? 'Due by 5:00 PM' :
                                    format(new Date(rental.end_date), 'MMM d');

                            return (
                                <Card key={rental.rental_id} className={`shadow-sm ${styles.card}`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="secondary" className={`${styles.badge} shadow-sm`}>{badgeText}</Badge>
                                                    <span className={`text-xs ${styles.text}`}>{dueText}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-lg">{rental.listing_title}</h4>
                                                <p className="text-sm text-slate-600">Owner: <span className="font-medium">{rental.owner_name}</span></p>
                                            </div>
                                            <Link href={`/messages?listing=${rental.listing_id}&owner=${rental.owner_id}`}>
                                                <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900">
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Message {rental.owner_name}
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Upcoming Bookings</h2>
                        {upcomingBookings.length === 0 ? (
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-12 text-center text-slate-500">
                                    No upcoming bookings
                                </CardContent>
                            </Card>
                        ) : upcomingBookings.map((booking) => {
                            // Check if we're within 24 hours of the start date
                            const startDate = new Date(booking.start_date);
                            const now = new Date();
                            const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                            const canReceiveTool = hoursUntilStart <= 24 && hoursUntilStart >= -24;

                            return (
                                <Card key={booking.rental_id} className="border-slate-200 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                    {booking.listing_image_url ? (
                                                        <Image
                                                            src={booking.listing_image_url}
                                                            alt={booking.listing_title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Calendar className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900">{booking.listing_title}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')} • {booking.total_days} days
                                                    </p>
                                                    {canReceiveTool && (
                                                        <p className="text-xs text-safety-orange font-medium mt-1">
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
                                                            className="bg-safety-orange hover:bg-safety-orange/90 text-white font-semibold"
                                                            size="sm"
                                                        >
                                                            <Package className="mr-2 h-4 w-4" />
                                                            Receive Tool
                                                        </Button>

                                                        {/* Show contact support if >24h past pickup */}
                                                        {hoursUntilStart < -24 && (
                                                            <a
                                                                href={`mailto:contact@blockhyre.com?subject=Handover Issue - Rental ID: ${booking.rental_id}`}
                                                                className="text-xs text-slate-600 hover:text-safety-orange text-center underline"
                                                            >
                                                                Having trouble? Contact support
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {!canReceiveTool && (
                                                            <DropdownMenuItem disabled className="text-slate-400">
                                                                <Package className="mr-2 h-4 w-4" />
                                                                Receive Tool (available on pickup day)
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setRescheduleModalOpen(true);
                                                            }}
                                                        >
                                                            <CalendarClock className="mr-2 h-4 w-4" />
                                                            Change Dates
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
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
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: History & Disputes */}
                <div className="space-y-6">
                    {/* Rental History */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-serif">Rental History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rentalHistory.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No rental history yet</p>
                            ) : rentalHistory.map((rental) => (
                                <div key={rental.rental_id} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-slate-900">{rental.listing_title}</p>
                                        <p className="text-xs text-slate-500">Returned {format(new Date(rental.end_date), 'MMM d')}</p>
                                    </div>
                                    {rental.has_review ? (
                                        <div className="text-right">
                                            <div className="text-xs text-green-600 font-bold mb-1">
                                                Completed
                                            </div>
                                            <Link href={`/listings/${rental.listing_id}`} className="text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2">
                                                Rent Again
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link href={`/reviews/new?rental=${rental.rental_id}`}>
                                            <Button variant="link" className="text-safety-orange p-0 h-auto text-xs font-bold">
                                                Leave Review
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Disputes */}
                    {/* Disputes */}
                    {activeDisputes.length > 0 ? (
                        <Card className="border-red-200 shadow-sm bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-lg font-serif text-red-700 flex items-center gap-2">
                                    <TriangleAlert className="h-5 w-5" />
                                    Active Dispute
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-600 text-sm mb-4">
                                    Action is required on your rental for <strong>Makita Circular Saw</strong>.
                                </p>
                                <Button size="sm" className="w-full font-bold bg-red-600 hover:bg-red-700 text-white">
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <span className="font-serif text-slate-900 font-medium">Disputes</span>
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                    <Check className="h-4 w-4" />
                                    No active disputes
                                </div>
                            </CardContent>
                        </Card>
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
                        // Refresh the bookings list
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
                        // Refresh to move rental from upcoming to active
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
