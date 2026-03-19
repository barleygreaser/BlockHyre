"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Search,
    Wrench,
    MessageSquare,
    CalendarClock,
    Star,
    XCircle,
    CheckCircle,
    Package,
} from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/app/components/ui/empty";

interface RenterRental {
    id: string;
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
    total_paid: number;
    status: string;
    created_at: string;
    has_review: boolean;
}

type FilterKey = "all" | "active" | "upcoming" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
    active: {
        badge: "bg-emerald-500 text-white",
        dot: "bg-emerald-500",
        label: "Active",
    },
    approved: {
        badge: "bg-blue-500 text-white",
        dot: "bg-blue-500",
        label: "Approved",
    },
    pending: {
        badge: "bg-amber-500 text-white",
        dot: "bg-amber-500 animate-pulse",
        label: "Pending",
    },
    completed: {
        badge: "bg-slate-600 text-white",
        dot: "bg-slate-500",
        label: "Completed",
    },
    returned: {
        badge: "bg-indigo-500 text-white",
        dot: "bg-indigo-500",
        label: "Returned",
    },
    archived: {
        badge: "bg-slate-400 text-white",
        dot: "bg-slate-400",
        label: "Archived",
    },
    cancelled: {
        badge: "bg-red-500 text-white",
        dot: "bg-red-500",
        label: "Cancelled",
    },
    rejected: {
        badge: "bg-red-400 text-white",
        dot: "bg-red-400",
        label: "Rejected",
    },
};

export default function RenterRentalsPage() {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<RenterRental[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (hash && ["all", "active", "upcoming", "completed", "cancelled"].includes(hash)) {
            setActiveFilter(hash as FilterKey);
        }
    }, []);

    const handleFilterChange = (filter: FilterKey) => {
        setActiveFilter(filter);
        window.history.pushState(null, "", `#${filter}`);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateShort = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const categorizeRental = (rental: RenterRental): FilterKey => {
        const now = new Date();
        const startDate = new Date(rental.start_date);
        const endDate = new Date(rental.end_date);
        const status = rental.status.toLowerCase();

        if (status === "cancelled" || status === "rejected") return "cancelled";
        if (status === "completed" || status === "returned" || status === "archived") return "completed";
        if (status === "approved" && startDate > now) return "upcoming";
        if (status === "active" || (status === "approved" && startDate <= now)) return "active";
        if (status === "pending") return "upcoming";
        return "active";
    };

    const getDaysContext = (rental: RenterRental) => {
        const now = new Date();
        const startDate = new Date(rental.start_date);
        const endDate = new Date(rental.end_date);
        const status = rental.status.toLowerCase();

        if (status === "cancelled" || status === "rejected") {
            return { text: status === "rejected" ? "Request rejected" : "Cancelled", urgent: false, overdue: false };
        }
        if (status === "completed" || status === "returned" || status === "archived") {
            return { text: `Ended ${formatDateShort(rental.end_date)}`, urgent: false, overdue: false };
        }
        if (status === "pending") {
            return { text: "Awaiting approval", urgent: false, overdue: false };
        }

        const msLeft = endDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

        if (startDate > now) {
            const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return { text: `Starts in ${daysUntil}d`, urgent: daysUntil <= 1, overdue: false };
        }

        if (daysLeft < 0) {
            return { text: `Overdue by ${Math.abs(daysLeft)}d`, urgent: true, overdue: true };
        }
        if (daysLeft === 0) {
            return { text: "Return today", urgent: true, overdue: false };
        }
        return { text: `${daysLeft}d remaining`, urgent: daysLeft <= 2, overdue: false };
    };

    useEffect(() => {
        if (!user) return;

        const fetchRentals = async () => {
            try {
                const { data, error } = await supabase
                    .from("rentals")
                    .select(`
                        id,
                        listing_id,
                        start_date,
                        end_date,
                        total_days,
                        rental_fee,
                        total_paid,
                        status,
                        created_at,
                        listing:listings!inner (
                            title,
                            images,
                            owner_id,
                            owner:users!owner_id (
                                full_name,
                                profile_photo_url
                            )
                        )
                    `)
                    .eq("renter_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching rentals:", error);
                    return;
                }

                if (!data) {
                    setRentals([]);
                    return;
                }

                // Check reviews for completed rentals
                const completedIds = data
                    .filter((r: any) => ["completed", "returned", "archived"].includes(r.status))
                    .map((r: any) => r.id);

                let reviewedIds = new Set<string>();
                if (completedIds.length > 0) {
                    const { data: reviewData } = await supabase
                        .from("reviews")
                        .select("rental_id")
                        .eq("reviewer_id", user.id)
                        .in("rental_id", completedIds);
                    if (reviewData) {
                        reviewedIds = new Set(reviewData.map((r: any) => r.rental_id));
                    }
                }

                const mapped: RenterRental[] = data.map((r: any) => ({
                    id: r.id,
                    listing_id: r.listing_id,
                    listing_title: r.listing?.title || "Unknown Tool",
                    listing_image_url: r.listing?.images?.[0] || null,
                    owner_id: r.listing?.owner_id || "",
                    owner_name: r.listing?.owner?.full_name || "Unknown Owner",
                    owner_photo_url: r.listing?.owner?.profile_photo_url || null,
                    start_date: r.start_date,
                    end_date: r.end_date,
                    total_days: r.total_days,
                    rental_fee: r.rental_fee || 0,
                    total_paid: r.total_paid || 0,
                    status: r.status,
                    created_at: r.created_at,
                    has_review: reviewedIds.has(r.id),
                }));

                setRentals(mapped);
            } catch (error) {
                console.error("Unexpected error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, [user]);

    const filteredRentals = rentals.filter((rental) => {
        if (activeFilter === "all") return true;
        return categorizeRental(rental) === activeFilter;
    });

    const getCounts = () => {
        const result = { all: rentals.length, active: 0, upcoming: 0, completed: 0, cancelled: 0 };
        rentals.forEach((rental) => {
            const cat = categorizeRental(rental);
            result[cat]++;
        });
        return result;
    };
    const counts = getCounts();

    const filterConfig: { key: FilterKey; label: string; color: string }[] = [
        { key: "all", label: "All", color: "bg-safety-orange" },
        { key: "active", label: "Active", color: "bg-emerald-500" },
        { key: "upcoming", label: "Upcoming", color: "bg-blue-500" },
        { key: "completed", label: "Completed", color: "bg-slate-600" },
        { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
    ];

    return (
        <div className="pt-4">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard?role=renter"
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-4 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-safety-orange" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-safety-orange">
                        Rental Operations
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">
                            My Rentals
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            All your rental activity — past, present, and upcoming.
                        </p>
                    </div>
                    <Link href="/listings">
                        <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40 hover:scale-105 active:translate-y-[2px]">
                            <Search className="mr-2 h-4 w-4" />
                            Find Tools
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterConfig.map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold font-mono uppercase tracking-wider transition-all active:translate-y-[2px] ${activeFilter === key
                                ? `${color} text-white shadow-lg`
                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                    >
                        {label}
                        <span
                            className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === key ? "bg-white/20" : "bg-slate-100"
                                }`}
                        >
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Rental Cards */}
            <div className="space-y-4">
                {loading ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-200">
                                <Skeleton className="h-28 w-full" />
                            </div>
                        ))}
                    </>
                ) : filteredRentals.length > 0 ? (
                    filteredRentals.map((rental, index) => {
                        const statusStyle = STATUS_STYLES[rental.status.toLowerCase()] || STATUS_STYLES.active;
                        const daysContext = getDaysContext(rental);
                        const category = categorizeRental(rental);

                        return (
                            <div
                                key={rental.id}
                                className={`bg-white rounded-[2rem] border p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md ${daysContext.overdue
                                        ? "border-2 border-red-400 bg-red-50/30 animate-pulse-subtle"
                                        : daysContext.urgent && category === "active"
                                            ? "border-2 border-amber-300 bg-amber-50/20"
                                            : "border-slate-200 hover:border-safety-orange/30"
                                    }`}
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                <div className="flex gap-4">
                                    {/* Tool Image */}
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-100">
                                        {rental.listing_image_url ? (
                                            <Image
                                                src={rental.listing_image_url}
                                                alt={rental.listing_title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Wrench className="h-6 w-6 sm:h-8 sm:w-8" />
                                            </div>
                                        )}
                                        <div className="absolute top-1 left-1">
                                            <Badge
                                                className={`border-none text-[9px] font-mono font-bold px-1.5 py-0 ${statusStyle.badge}`}
                                            >
                                                {statusStyle.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base sm:text-lg text-slate-900 font-serif truncate">
                                                    {rental.listing_title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {rental.owner_photo_url ? (
                                                        <Image
                                                            src={rental.owner_photo_url}
                                                            alt={rental.owner_name}
                                                            width={20}
                                                            height={20}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                            {rental.owner_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-slate-500 font-mono truncate">
                                                        {rental.owner_name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price — top right */}
                                            <span className="font-bold text-slate-900 text-sm sm:text-base font-mono tabular-nums whitespace-nowrap">
                                                {formatCurrency(rental.total_paid || rental.rental_fee)}
                                            </span>
                                        </div>

                                        {/* Dates + Time Context */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDateShort(rental.start_date)} – {formatDateShort(rental.end_date)}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span>{rental.total_days}d</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span
                                                    className={
                                                        daysContext.overdue
                                                            ? "text-red-600 font-bold"
                                                            : daysContext.urgent
                                                                ? "text-amber-600 font-bold"
                                                                : ""
                                                    }
                                                >
                                                    {daysContext.text}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                                            {/* Active: Message owner */}
                                            {category === "active" && (
                                                <Link
                                                    href={`/messages?listing=${rental.listing_id}&owner=${rental.owner_id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 rounded-full font-bold text-[10px] uppercase tracking-wider h-8 px-3"
                                                    >
                                                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                                        Message
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Completed: Leave Review or Rent Again */}
                                            {category === "completed" && !rental.has_review && (
                                                <Link href={`/reviews/new?rental=${rental.id}`}>
                                                    <Button
                                                        size="sm"
                                                        className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-full h-8 px-3 shadow-lg shadow-safety-orange/20"
                                                    >
                                                        <Star className="mr-1.5 h-3.5 w-3.5" />
                                                        Leave Review
                                                    </Button>
                                                </Link>
                                            )}
                                            {category === "completed" && rental.has_review && (
                                                <Link href={`/listings/${rental.listing_id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 rounded-full font-bold text-[10px] uppercase tracking-wider h-8 px-3"
                                                    >
                                                        <Package className="mr-1.5 h-3.5 w-3.5" />
                                                        Rent Again
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Review status indicator */}
                                            {category === "completed" && rental.has_review && (
                                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Reviewed
                                                </div>
                                            )}

                                            {/* Cancelled indicator */}
                                            {category === "cancelled" && (
                                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    {rental.status === "rejected" ? "Rejected by owner" : "Cancelled"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <Empty className="bg-white rounded-[2rem] border border-slate-200">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Package className="text-slate-300" />
                            </EmptyMedia>
                            <EmptyTitle>
                                {rentals.length === 0 ? "No rentals yet" : "No rentals match this filter"}
                            </EmptyTitle>
                            <EmptyDescription>
                                {rentals.length === 0
                                    ? "Browse tools near you to start renting."
                                    : "Try changing the filter above."}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            {rentals.length === 0 ? (
                                <Link href="/listings">
                                    <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10">
                                        <Search className="mr-2 h-4 w-4" />
                                        Browse Tools
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="border-slate-200 rounded-full font-bold text-xs uppercase tracking-wider"
                                    onClick={() => handleFilterChange("all")}
                                >
                                    Show All Rentals
                                </Button>
                            )}
                        </EmptyContent>
                    </Empty>
                )}
            </div>
        </div>
    );
}
