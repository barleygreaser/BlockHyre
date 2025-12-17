"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ReturnInspectionModal } from "@/app/components/return-inspection-modal";
import { Plus, DollarSign, Wrench, Users, Check, X, Eye, Files, Info } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { StripeConnectButton } from "@/app/components/stripe-connect-button";
import { Skeleton } from "@/app/components/ui/skeleton";
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

export function OwnerDashboardView() {
    const { user } = useAuth();
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [showProTip, setShowProTip] = useState(true);

    useEffect(() => {
        const dismissed = localStorage.getItem("dashboard_protip_dismissed");
        if (dismissed === "true") {
            setShowProTip(false);
        }
    }, []);

    const handleDismissProTip = () => {
        setShowProTip(false);
        localStorage.setItem("dashboard_protip_dismissed", "true");
    };

    // State for KPIs
    const [kpis, setKpis] = useState({
        activeRentals: 0,
        earnings30d: 0,
        toolsListed: 0
    });
    const [kpiLoading, setKpiLoading] = useState(true);

    // Fetch Owner KPIs
    useEffect(() => {
        if (!user) return;

        const fetchKPIs = async () => {
            try {
                const { data, error } = await supabase.rpc('get_owner_dashboard_kpis', {
                    p_owner_id: user.id
                });

                if (error) throw error;

                if (data && data.length > 0) {
                    setKpis({
                        activeRentals: parseInt(data[0].active_rentals_count),
                        earnings30d: parseFloat(data[0].earnings_30d),
                        toolsListed: parseInt(data[0].tools_listed_count)
                    });
                }
            } catch (error) {
                console.error("Error fetching owner KPIs:", error);
            } finally {
                setKpiLoading(false);
            }
        };

        fetchKPIs();
    }, [user]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    // State for Lists
    const [actionItems, setActionItems] = useState<any[]>([]);
    const [rentalRequests, setRentalRequests] = useState<any[]>([]);
    const [listsLoading, setListsLoading] = useState(true);
    const [sellerFeePercent, setSellerFeePercent] = useState<number>(0);

    // Fetch Lists
    useEffect(() => {
        if (!user) return;

        const fetchLists = async () => {
            try {
                // Fetch platform settings for seller fee
                const { data: settingsData, error: settingsError } = await supabase
                    .from('platform_settings')
                    .select('seller_fee_percent')
                    .single();

                if (settingsError) {
                    console.error('Error fetching platform settings:', settingsError);
                } else if (settingsData) {
                    setSellerFeePercent(settingsData.seller_fee_percent || 0);
                }

                // 1. Action Items (Status = Returned) - For Inspection
                // Need to find rentals for MY listings that are 'Returned'
                const { data: returnedData, error: returnedError } = await supabase
                    .from('rentals')
                    .select(`
                        id,
                        status,
                        created_at,
                        renter:users!renter_id (full_name),
                        listing:listings!inner (title, owner_id)
                    `)
                    .eq('listings.owner_id', user.id)
                    .ilike('status', 'returned');

                if (returnedError) throw returnedError;
                if (returnedData) setActionItems(returnedData);

                // 2. Rental Requests (Status = Pending)
                const { data: pendingData, error: pendingError } = await supabase
                    .from('rentals')
                    .select(`
                        id,
                        status,
                        start_date,
                        end_date,
                        total_days,
                        rental_fee,
                        renter:users!renter_id (full_name, email), 
                        listing:listings!inner (title, owner_id)
                    `)
                    .eq('listings.owner_id', user.id)
                    .ilike('status', 'pending');

                if (pendingError) throw pendingError;
                if (pendingData) setRentalRequests(pendingData);

            } catch (error) {
                console.error("Error fetching dashboard lists:", error);
            } finally {
                setListsLoading(false);
            }
        };

        fetchLists();
    }, [user]);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (rentalId: string) => {
        setProcessingId(rentalId);
        try {
            const { error } = await supabase.rpc('approve_rental_request', {
                p_rental_id: rentalId
            });

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }

            // Refresh lists
            // In a real app we might just remove the item locally to save a fetch
            setRentalRequests(prev => prev.filter(r => r.id !== rentalId));

            // Optionally refresh KPIs too as active count changes
            // fetchKPIs(); 
        } catch (err) {
            console.error("Approval failed:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeny = async (rentalId: string) => {
        setProcessingId(rentalId);
        try {
            // We'll use a direct update for now if RLS permits, or assume an RPC exists/will exist
            // For safety/strict RLS, we should really use an RPC. 
            // Let's assume we'll just update status to 'Denied' via standard query for now 
            // verifying ownership via RLS policies.
            // If strict RLS blocks this, we'll need an RPC.
            const { error } = await supabase
                .from('rentals')
                .update({ status: 'denied' })
                .eq('id', rentalId);

            if (error) throw error;

            setRentalRequests(prev => prev.filter(r => r.id !== rentalId));
        } catch (err) {
            console.error("Denial failed:", err);
            alert("Could not deny request. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    // Helper for date formatting
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate owner's revenue after platform fee
    const calculateOwnerRevenue = (rentalFee: number) => {
        if (!rentalFee || !sellerFeePercent) return rentalFee || 0;
        const platformFee = rentalFee * (sellerFeePercent / 100);
        return rentalFee - platformFee;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">My Listings</h2>
                    <p className="text-slate-500">Manage your tools, rentals, and earnings.</p>
                </div>
                <Link href="/add-tool">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90">
                        <Plus className="mr-2 h-4 w-4" />
                        List New Tool
                    </Button>
                </Link>
            </div>

            {/* Stats Row */}
            {/* ... (Previous Stats Row Code) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/owner/active-rentals" className="block">
                    <Card className="border-slate-200 shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Active Rentals</p>
                                {kpiLoading ? (
                                    <div className="h-9 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-slate-900">{kpis.activeRentals}</h3>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Earnings (30d)</p>
                            {kpiLoading ? (
                                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.earnings30d)}</h3>
                            )}
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Link href="/owner/listings" className="block">
                    <Card className="border-slate-200 shadow-sm hover:border-safety-orange/50 transition-colors cursor-pointer group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-safety-orange transition-colors">Tools Listed</p>
                                {kpiLoading ? (
                                    <div className="h-9 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-slate-900">{kpis.toolsListed}</h3>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-safety-orange group-hover:scale-110 transition-transform">
                                <Wrench className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Rental Requests & Action Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Action Items (Returns Pending Inspection) */}
                    {actionItems.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Action Required</h2>
                            {actionItems.map(item => (
                                <Card key={item.id} className="border-[1.5px] border-[#FFC107] shadow-sm bg-[#FFFBE6]">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="bg-white text-safety-orange border-safety-orange">Returned</Badge>
                                                    <span className="text-xs text-slate-500">Needs Inspection</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900">{item.listing.title}</h4>
                                                <p className="text-sm text-slate-600">Returned by <span className="font-medium">{item.renter.full_name || 'Renter'}</span></p>
                                            </div>
                                            <Button onClick={() => setIsInspectionOpen(true)} className="w-full sm:w-auto bg-safety-orange text-white hover:bg-safety-orange/90 font-bold">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Inspect & Release Deposit
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Rental Requests */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Rental Requests</h2>

                        {listsLoading ? (
                            <Card className="border-slate-200 shadow-sm"><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                        ) : rentalRequests.length > 0 ? (
                            rentalRequests.map((request) => (
                                <Card key={request.id} className="border-slate-200 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                                    {/* Avatar or Initial */}
                                                    {request.renter.full_name ? request.renter.full_name.charAt(0) : 'R'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                        {request.renter.full_name || 'Unknown User'}
                                                        <span className="flex items-center text-xs font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                            <span className="text-yellow-400 mr-1">★</span>
                                                            5.0
                                                        </span>
                                                    </h4>
                                                    <p className="text-sm text-slate-500">wants to rent <span className="font-medium text-slate-900">{request.listing.title}</span></p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                                        </span>
                                                        <span className="text-slate-400">•</span>
                                                        <span className="text-slate-600">{request.total_days} Days</span>
                                                        {request.rental_fee && (
                                                            <>
                                                                <span className="text-slate-400">•</span>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="font-bold text-green-600 flex items-center gap-1 cursor-help">
                                                                                {formatCurrency(calculateOwnerRevenue(request.rental_fee))} revenue
                                                                                <Info className="h-3 w-3" />
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="bg-slate-900 text-white p-3 max-w-xs">
                                                                            <div className="space-y-1 text-xs">
                                                                                <div className="flex justify-between gap-4">
                                                                                    <span className="text-slate-300">Rental Fee:</span>
                                                                                    <span className="font-semibold">{formatCurrency(request.rental_fee)}</span>
                                                                                </div>
                                                                                <div className="flex justify-between gap-4">
                                                                                    <span className="text-slate-300">Platform Fee ({sellerFeePercent}%):</span>
                                                                                    <span className="text-red-400">-{formatCurrency(request.rental_fee * (sellerFeePercent / 100))}</span>
                                                                                </div>
                                                                                <div className="border-t border-slate-700 pt-1 mt-1"></div>
                                                                                <div className="flex justify-between gap-4">
                                                                                    <span className="font-semibold">Your Revenue:</span>
                                                                                    <span className="font-bold text-green-400">{formatCurrency(calculateOwnerRevenue(request.rental_fee))}</span>
                                                                                </div>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 sm:flex-none text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                                    onClick={() => handleDeny(request.id)}
                                                    disabled={processingId === request.id}
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Deny
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={processingId === request.id}
                                                >
                                                    {processingId === request.id ? 'Processing...' : (
                                                        <>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Empty className="bg-slate-50/50 shadow-sm">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Files />
                                    </EmptyMedia>
                                    <EmptyTitle>No new requests right now</EmptyTitle>
                                    <EmptyDescription>
                                        Time to optimize your listings! Adding more photos or lowering prices slightly can help attract renters.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Link href="/owner/listings">
                                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900">
                                            Manage Listings
                                        </Button>
                                    </Link>
                                </EmptyContent>
                            </Empty>
                        )}
                    </div>

                </div>

                {/* Right Column: Quick Stats / Tips */}
                <div className="space-y-6">
                    {/* Payout Status / Recent Payouts */}
                    {stripeConnected ? (
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-serif">Recent Payouts</CardTitle>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs font-normal">
                                    Stripe: Connected ●
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Mock Payouts */}
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-slate-900">Oct 15, 2025</p>
                                            <p className="text-xs text-slate-500">To: ****4242</p>
                                        </div>
                                        <span className="text-green-600 font-bold">+$124.50</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-slate-900">Oct 08, 2025</p>
                                            <p className="text-xs text-slate-500">To: ****4242</p>
                                        </div>
                                        <span className="text-green-600 font-bold">+$85.00</span>
                                    </div>
                                    <Link href="#">
                                        <Button variant="link" className="text-slate-500 p-0 h-auto text-xs w-full justify-start mt-2">
                                            View all transactions &rarr;
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-serif">Payout Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Connect your bank account to receive payouts for your rentals.
                                    </p>
                                    <StripeConnectButton />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {kpiLoading ? (
                        <Card className="bg-blue-50 border-blue-100 relative">
                            <CardHeader>
                                <Skeleton className="h-6 w-24 bg-blue-200" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full bg-blue-200" />
                                <Skeleton className="h-4 w-3/4 bg-blue-200" />
                                <Skeleton className="h-4 w-1/2 bg-blue-200" />
                            </CardContent>
                        </Card>
                    ) : showProTip && (
                        <Card className="bg-blue-50 border-blue-100 relative">
                            <button
                                onClick={handleDismissProTip}
                                className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <CardHeader>
                                <CardTitle className="text-lg font-serif text-blue-900">Pro Tip</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                    Adding a link to the manufacturer's manual increases your tool's safety rating and reduces accident disputes by 40%.
                                </p>
                                <Link href="/add-tool">
                                    <Button variant="link" className="text-blue-700 font-bold p-0 mt-4 h-auto hover:text-blue-900">
                                        Update your listings &rarr;
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>

            <ReturnInspectionModal
                isOpen={isInspectionOpen}
                onClose={() => setIsInspectionOpen(false)}
            />
        </div>
    );
}
