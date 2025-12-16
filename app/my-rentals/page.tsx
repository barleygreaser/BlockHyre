'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ActiveRentalCard } from "@/app/components/rentals/ActiveRentalCard";
import { UpcomingBookingCard } from "@/app/components/rentals/UpcomingBookingCard";
import { RentalHistoryItem } from "@/app/components/rentals/RentalHistoryItem";
import { AlertCircle, Calendar, Clock, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ActiveRental {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    owner_id: string;
    owner_name: string;
    owner_photo_url: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
    rental_fee: number;
    peace_fund_fee: number;
    total_paid: number;
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
    days_until_start: number;
}

interface RentalHistory {
    rental_id: string;
    listing_id: string;
    listing_title: string;
    listing_image_url: string | null;
    end_date: string;
    has_review: boolean;
}

export default function MyRentalsPage() {
    const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
    const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRentalData() {
            try {
                // Fetch active rentals
                const { data: activeData, error: activeError } = await supabase
                    .rpc('get_my_active_rentals');

                if (activeError) throw activeError;
                setActiveRentals(activeData || []);

                // Fetch upcoming bookings
                const { data: upcomingData, error: upcomingError } = await supabase
                    .rpc('get_my_upcoming_bookings');

                if (upcomingError) throw upcomingError;
                setUpcomingBookings(upcomingData || []);

                // Fetch rental history
                const { data: historyData, error: historyError } = await supabase
                    .rpc('get_my_rental_history');

                if (historyError) throw historyError;
                setRentalHistory(historyData || []);
            } catch (error) {
                console.error('Error fetching rental data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRentalData();
    }, [supabase]);

    // Categorize active rentals
    const overdueRentals = activeRentals.filter(r => r.dashboard_status === 'overdue');
    const dueTodayRentals = activeRentals.filter(r => r.dashboard_status === 'due_today');
    const activeOnlyRentals = activeRentals.filter(r => r.dashboard_status === 'active');

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">
                        My Rentals
                    </h1>
                    <p className="text-slate-600">
                        Manage your active rentals and view your rental history
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safety-orange"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Active Rentals Section */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-safety-orange" />
                                    Active Rentals
                                </h2>

                                {activeRentals.length === 0 ? (
                                    <Card className="border-slate-200">
                                        <CardContent className="p-12 text-center">
                                            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <h3 className="font-medium text-slate-900 mb-1">No Active Rentals</h3>
                                            <p className="text-sm text-slate-500">
                                                You don't have any active rentals at the moment.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Overdue - Highest Priority */}
                                        {overdueRentals.map((rental) => (
                                            <ActiveRentalCard
                                                key={rental.rental_id}
                                                rentalId={rental.rental_id}
                                                listingId={rental.listing_id}
                                                listingTitle={rental.listing_title}
                                                listingImageUrl={rental.listing_image_url ?? undefined}
                                                ownerName={rental.owner_name}
                                                ownerId={rental.owner_id}
                                                endDate={rental.end_date}
                                                dashboardStatus={rental.dashboard_status}
                                            />
                                        ))}

                                        {/* Due Today - Medium Priority */}
                                        {dueTodayRentals.map((rental) => (
                                            <ActiveRentalCard
                                                key={rental.rental_id}
                                                rentalId={rental.rental_id}
                                                listingId={rental.listing_id}
                                                listingTitle={rental.listing_title}
                                                listingImageUrl={rental.listing_image_url ?? undefined}
                                                ownerName={rental.owner_name}
                                                ownerId={rental.owner_id}
                                                endDate={rental.end_date}
                                                dashboardStatus={rental.dashboard_status}
                                            />
                                        ))}

                                        {/* Active - Normal Priority */}
                                        {activeOnlyRentals.map((rental) => (
                                            <ActiveRentalCard
                                                key={rental.rental_id}
                                                rentalId={rental.rental_id}
                                                listingId={rental.listing_id}
                                                listingTitle={rental.listing_title}
                                                listingImageUrl={rental.listing_image_url ?? undefined}
                                                ownerName={rental.owner_name}
                                                ownerId={rental.owner_id}
                                                endDate={rental.end_date}
                                                dashboardStatus={rental.dashboard_status}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Bookings Section */}
                            {upcomingBookings.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-safety-orange" />
                                        Upcoming Bookings
                                    </h2>
                                    <div className="space-y-3">
                                        {upcomingBookings.map((booking) => (
                                            <UpcomingBookingCard
                                                key={booking.rental_id}
                                                rentalId={booking.rental_id}
                                                listingId={booking.listing_id}
                                                listingTitle={booking.listing_title}
                                                listingImageUrl={booking.listing_image_url}
                                                startDate={booking.start_date}
                                                endDate={booking.end_date}
                                                totalDays={booking.total_days}
                                                daysUntilStart={booking.days_until_start}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-serif">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Active Rentals</span>
                                        <span className="font-bold text-lg text-slate-900">{activeRentals.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Upcoming</span>
                                        <span className="font-bold text-lg text-slate-900">{upcomingBookings.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Completed</span>
                                        <span className="font-bold text-lg text-slate-900">{rentalHistory.length}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rental History */}
                            {rentalHistory.length > 0 && (
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-serif flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Recent History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="px-6 pb-6">
                                            {rentalHistory.map((rental) => (
                                                <RentalHistoryItem
                                                    key={rental.rental_id}
                                                    rentalId={rental.rental_id}
                                                    listingId={rental.listing_id}
                                                    listingTitle={rental.listing_title}
                                                    listingImageUrl={rental.listing_image_url}
                                                    endDate={rental.end_date}
                                                    hasReview={rental.has_review}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help Card */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 mb-1">Need Help?</h4>
                                            <p className="text-sm text-blue-700">
                                                Have questions about your rental? Check out our{' '}
                                                <a href="/how-it-works" className="underline font-medium">
                                                    How It Works
                                                </a>{' '}
                                                page or contact support.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
