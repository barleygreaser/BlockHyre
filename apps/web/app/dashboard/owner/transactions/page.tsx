"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
    ArrowLeft,
    DollarSign,
    ExternalLink,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    ArrowDownRight,
    Banknote,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyContent,
} from "@/app/components/ui/empty";

interface StripeBalance {
    available: number;
    pending: number;
}

interface StripePayout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrivalDate: string | null;
    createdAt: string;
    method: string;
    bankLast4: string | null;
    description: string | null;
}

interface RentalTransaction {
    id: string;
    listing_title: string;
    renter_name: string;
    rental_fee: number;
    total_paid: number;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
}

type FilterKey = "all" | "paid" | "pending" | "in_transit" | "failed";

const PAYOUT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    paid: { label: "Paid", color: "bg-emerald-500 text-white", icon: CheckCircle },
    pending: { label: "Pending", color: "bg-amber-500 text-white", icon: Clock },
    in_transit: { label: "In Transit", color: "bg-blue-500 text-white", icon: TrendingUp },
    failed: { label: "Failed", color: "bg-red-500 text-white", icon: XCircle },
    canceled: { label: "Canceled", color: "bg-slate-500 text-white", icon: XCircle },
};

// ⚡ Bolt Optimization: Pre-initialize formatters at module level to avoid recreation during render loops
const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});
const dateFormatterShort = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

export default function TransactionsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [balance, setBalance] = useState<StripeBalance | null>(null);
    const [payouts, setPayouts] = useState<StripePayout[]>([]);
    const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
    const [rentalTransactions, setRentalTransactions] = useState<RentalTransaction[]>([]);
    const [sellerFeePercent, setSellerFeePercent] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

    const formatCurrency = (amount: number) => currencyFormatter.format(amount);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return dateFormatter.format(new Date(dateStr));
    };

    const formatDateShort = (dateStr: string) => {
        if (!dateStr) return "";
        return dateFormatterShort.format(new Date(dateStr));
    };

    const calculateOwnerRevenue = (rentalFee: number) => {
        if (!rentalFee || !sellerFeePercent) return rentalFee || 0;
        return rentalFee - rentalFee * (sellerFeePercent / 100);
    };

    useEffect(() => {
        if (!user) return;

        const fetchAll = async () => {
            try {
                // Fetch platform settings
                const { data: settingsData } = await supabase
                    .from("platform_settings")
                    .select("seller_fee_percent")
                    .single();
                if (settingsData) setSellerFeePercent(settingsData.seller_fee_percent || 0);

                // Fetch Stripe data via API route
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (token) {
                    const response = await fetch("/api/stripe/transactions", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const stripeData = await response.json();
                        setStripeConnected(stripeData.connected);
                        setBalance(stripeData.balance);
                        setPayouts(stripeData.payouts || []);
                        setDashboardUrl(stripeData.dashboardUrl);
                    }
                }

                // Fetch completed rental transactions from Supabase
                const { data: rentalsData, error: rentalsError } = await supabase
                    .rpc("get_owner_completed_transactions", { p_owner_id: user.id });

                if (!rentalsError && rentalsData) {
                    setRentalTransactions(rentalsData);
                } else {
                    // Fallback: query rentals directly
                    const { data: fallbackData } = await supabase
                        .from("rentals")
                        .select(`
                            id,
                            rental_fee,
                            total_paid,
                            status,
                            start_date,
                            end_date,
                            created_at,
                            listing:listings!inner (title, owner_id),
                            renter:users!renter_id (full_name)
                        `)
                        .eq("listings.owner_id", user.id)
                        .in("status", ["completed", "archived", "active", "approved", "returned"])
                        .order("created_at", { ascending: false })
                        .limit(50);

                    if (fallbackData) {
                        const mapped = fallbackData.map((r: any) => ({
                            id: r.id,
                            listing_title: r.listing?.title || "Unknown Tool",
                            renter_name: r.renter?.full_name || "Unknown Renter",
                            rental_fee: r.rental_fee || 0,
                            total_paid: r.total_paid || 0,
                            status: r.status,
                            start_date: r.start_date,
                            end_date: r.end_date,
                            created_at: r.created_at,
                        }));
                        setRentalTransactions(mapped);
                    }
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user]);

    const filteredPayouts = payouts.filter(p => {
        if (activeFilter === "all") return true;
        return p.status === activeFilter;
    });

    // ⚡ Bolt Optimization: Pre-calculate counts using a memoized O(N) array traversal rather than O(N * M) .filter().length calls in render
    const payoutCounts = useMemo(() => {
        const counts = { paid: 0, pending: 0, in_transit: 0 };
        for (let i = 0; i < payouts.length; i++) {
            const status = payouts[i].status as keyof typeof counts;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        }
        return counts;
    }, [payouts]);

    const filterConfig = [
        { key: "all" as FilterKey, label: "All", count: payouts.length },
        { key: "paid" as FilterKey, label: "Paid", count: payoutCounts.paid },
        { key: "pending" as FilterKey, label: "Pending", count: payoutCounts.pending },
        { key: "in_transit" as FilterKey, label: "In Transit", count: payoutCounts.in_transit },
    ];

    const totalGross = rentalTransactions.reduce((sum, t) => sum + (t.rental_fee || 0), 0);
    const totalFees = totalGross * (sellerFeePercent / 100);
    const totalEarnings = totalGross - totalFees;

    return (
        <div className="pt-4">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard?role=owner"
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-4 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Command Center
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-safety-orange" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-safety-orange">
                        Financial Operations
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">
                            Transactions & Payouts
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Track your earnings, payouts, and financial activity.
                        </p>
                    </div>
                    {dashboardUrl && (
                        <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#635BFF] hover:bg-[#534be0] text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg transition-all hover:shadow-xl active:translate-y-[2px]">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Stripe Dashboard
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {/* Balance Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[2rem] border border-slate-200 p-6">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>
                    {/* Payout List Skeleton */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6">
                        <Skeleton className="h-6 w-40 mb-6" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className="py-4 border-b border-slate-100 last:border-0">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : !stripeConnected ? (
                <Empty className="bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Banknote className="text-slate-300" />
                        </EmptyMedia>
                        <EmptyTitle>No Stripe Account Connected</EmptyTitle>
                        <EmptyDescription>
                            Connect your Stripe account to start receiving payouts for your rentals. You can set this up from your profile page.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href="/profile">
                            <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10">
                                Connect Stripe
                            </Button>
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="space-y-8">
                    {/* Balance Overview — KPI Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Available Balance */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 sm:p-6 shadow-sm relative overflow-hidden group hover:border-safety-orange/40 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <DollarSign className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                        Available Balance
                                    </p>
                                    <Badge className="ml-auto h-2.5 w-2.5 p-0 bg-emerald-500 border border-white animate-pulse-operational" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                                    {formatCurrency(balance?.available || 0)}
                                </h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                                    Ready for payout
                                </p>
                            </div>
                        </div>

                        {/* Pending Balance */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 sm:p-6 shadow-sm relative overflow-hidden group hover:border-safety-orange/40 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                        Pending Balance
                                    </p>
                                    {(balance?.pending || 0) > 0 && (
                                        <Badge className="ml-auto h-2.5 w-2.5 p-0 bg-amber-500 border border-white animate-pulse" />
                                    )}
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                                    {formatCurrency(balance?.pending || 0)}
                                </h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                                    Processing by Stripe
                                </p>
                            </div>
                        </div>

                        {/* Total Earned */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 sm:p-6 shadow-sm relative overflow-hidden group hover:border-safety-orange/40 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-safety-orange" />
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                        Net Earned
                                    </p>
                                    <Badge className="ml-auto h-2.5 w-2.5 p-0 bg-emerald-500 border border-white animate-pulse-operational" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono tabular-nums">
                                    {formatCurrency(totalEarnings)}
                                </h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                                    {rentalTransactions.length} rentals · -{formatCurrency(totalFees)} fees
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stripe Payouts Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Stripe Payouts</h2>
                        </div>

                        {/* Filter Pills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {filterConfig.map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveFilter(key)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold font-mono uppercase tracking-wider transition-all active:translate-y-[2px] ${activeFilter === key
                                            ? "bg-safety-orange text-white shadow-lg"
                                            : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                >
                                    {label}
                                    <span
                                        className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === key ? "bg-white/20" : "bg-slate-100"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {filteredPayouts.length > 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm divide-y divide-slate-100">
                                {filteredPayouts.map((payout, index) => {
                                    const statusConfig = PAYOUT_STATUS_CONFIG[payout.status] || PAYOUT_STATUS_CONFIG.pending;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div
                                            key={payout.id}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            {/* Status Icon */}
                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${payout.status === "paid"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : payout.status === "pending"
                                                        ? "bg-amber-50 text-amber-600"
                                                        : payout.status === "in_transit"
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "bg-red-50 text-red-600"
                                                }`}>
                                                <ArrowDownRight className="h-5 w-5" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        Payout to bank
                                                    </span>
                                                    <Badge className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0 h-5 border-0 ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    {payout.bankLast4 && (
                                                        <span>****{payout.bankLast4}</span>
                                                    )}
                                                    <span className="text-slate-300">•</span>
                                                    <span>
                                                        {payout.arrivalDate
                                                            ? `Arrives ${formatDateShort(payout.arrivalDate)}`
                                                            : `Created ${formatDateShort(payout.createdAt)}`
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <span className="font-bold text-emerald-600 font-mono text-base tabular-nums whitespace-nowrap">
                                                +{formatCurrency(payout.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty className="bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Banknote className="text-slate-300" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {payouts.length === 0
                                            ? "No payouts yet"
                                            : "No payouts match this filter"
                                        }
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {payouts.length === 0
                                            ? "Payouts will appear here once Stripe processes your first transfer."
                                            : "Try changing the filter above."
                                        }
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </div>

                    {/* Rental Transaction History */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Rental Transactions</h2>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                {rentalTransactions.length} total
                            </span>
                        </div>

                        {rentalTransactions.length > 0 ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                {/* Table Header — Desktop only */}
                                <div className="hidden md:grid grid-cols-[1fr_1fr_100px_90px_90px_90px_80px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Tool</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Renter</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Dates</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">Gross</span>
                                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider text-right">Fee</span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider text-right">Net</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Status</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {rentalTransactions.map((tx, index) => (
                                        <div
                                            key={tx.id}
                                            className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            {/* Desktop Row */}
                                            <div className="hidden md:grid grid-cols-[1fr_1fr_100px_90px_90px_90px_80px] gap-4 items-center">
                                                <span className="font-medium text-slate-900 text-sm truncate">
                                                    {tx.listing_title}
                                                </span>
                                                <span className="text-sm text-slate-500 font-mono truncate">
                                                    {tx.renter_name}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    {formatDateShort(tx.start_date)} – {formatDateShort(tx.end_date)}
                                                </span>
                                                <span className="font-mono text-sm text-slate-600 text-right tabular-nums">
                                                    {formatCurrency(tx.rental_fee)}
                                                </span>
                                                <span className="font-mono text-sm text-red-400 text-right tabular-nums">
                                                    -{formatCurrency(tx.rental_fee * (sellerFeePercent / 100))}
                                                </span>
                                                <span className="font-bold text-emerald-600 font-mono text-sm text-right tabular-nums">
                                                    {formatCurrency(calculateOwnerRevenue(tx.rental_fee))}
                                                </span>
                                                <div className="flex justify-center">
                                                    <Badge className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0 h-5 border-0 capitalize ${tx.status === "completed" || tx.status === "archived"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : tx.status === "active" || tx.status === "approved"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : tx.status === "returned"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                        }`}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Mobile Card */}
                                            <div className="md:hidden space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">{tx.listing_title}</h4>
                                                        <p className="text-xs text-slate-500 font-mono">{tx.renter_name}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-emerald-600 font-mono text-sm whitespace-nowrap">
                                                            {formatCurrency(calculateOwnerRevenue(tx.rental_fee))}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-red-400">
                                                            -{formatCurrency(tx.rental_fee * (sellerFeePercent / 100))} fee
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    <span>{formatDateShort(tx.start_date)} – {formatDateShort(tx.end_date)}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <Badge className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0 h-4 border-0 capitalize ${tx.status === "completed" || tx.status === "archived"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : tx.status === "active" || tx.status === "approved"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Empty className="bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <DollarSign className="text-slate-300" />
                                    </EmptyMedia>
                                    <EmptyTitle>No rental transactions yet</EmptyTitle>
                                    <EmptyDescription>
                                        Completed rentals and their earnings will appear here.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Link href="/dashboard?role=owner">
                                        <Button variant="outline" className="border-slate-200 text-slate-600 rounded-full font-bold text-xs uppercase tracking-wider">
                                            Back to Dashboard
                                        </Button>
                                    </Link>
                                </EmptyContent>
                            </Empty>
                        )}
                    </div>

                    {/* Stripe Dashboard CTA */}
                    {dashboardUrl && (
                        <div className="bg-charcoal rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-white font-bold font-serif text-base mb-1">
                                    Need more detail?
                                </h3>
                                <p className="text-concrete/60 text-sm">
                                    View invoices, tax documents, and full transaction history in your Stripe Dashboard.
                                </p>
                            </div>
                            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-[#635BFF] hover:bg-[#534be0] text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg whitespace-nowrap active:translate-y-[2px] transition-all">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Stripe Dashboard
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
