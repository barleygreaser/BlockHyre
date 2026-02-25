"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ReturnInspectionModal } from "@/app/components/return-inspection-modal";
import { Plus, DollarSign, Wrench, Users, Check, X, Eye, Files, Info, CalendarClock, Clock } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/app/components/ui/empty";
import { sendSystemMessage } from "@/app/lib/chat-helpers";

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

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

    const [kpis, setKpis] = useState({
        activeRentals: 0,
        earnings30d: 0,
        toolsListed: 0
    });
    const [kpiLoading, setKpiLoading] = useState(true);
    const [overdueCount, setOverdueCount] = useState(0);

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

                const { data: overdueData, error: overdueError } = await supabase
                    .from('rentals')
                    .select('id, listing:listings!inner(owner_id)')
                    .eq('listings.owner_id', user.id)
                    .in('status', ['active', 'approved', 'Active', 'Approved'])
                    .lt('end_date', new Date().toISOString());

                if (overdueError) {
                    console.error("Error fetching overdue count:", overdueError);
                } else {
                    setOverdueCount(overdueData?.length || 0);
                }
            } catch (error) {
                console.error("Error fetching owner KPIs:", error);
            } finally {
                setKpiLoading(false);
            }
        };

        fetchKPIs();
    }, [user]);

    const formatCurrency = (amount: number) => {
        return currencyFormatter.format(amount);
    };

    const [actionItems, setActionItems] = useState<any[]>([]);
    const [rentalRequests, setRentalRequests] = useState<any[]>([]);
    const [extensionRequests, setExtensionRequests] = useState<any[]>([]);
    const [listsLoading, setListsLoading] = useState(true);
    const [sellerFeePercent, setSellerFeePercent] = useState<number>(0);

    useEffect(() => {
        if (!user) return;

        const fetchLists = async () => {
            try {
                const { data: settingsData, error: settingsError } = await supabase
                    .from('platform_settings')
                    .select('seller_fee_percent')
                    .single();

                if (settingsError) {
                    console.error('Error fetching platform settings:', settingsError);
                } else if (settingsData) {
                    setSellerFeePercent(settingsData.seller_fee_percent || 0);
                }

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

                const { data: pendingData, error: pendingError } = await supabase
                    .from('rentals')
                    .select(`
                        id,
                        status,
                        start_date,
                        end_date,
                        total_days,
                        rental_fee,
                        created_at,
                        renter:users!renter_id (full_name, email), 
                        listing:listings!inner (title, owner_id, location_address, preferred_pickup_time)
                    `)
                    .eq('listings.owner_id', user.id)
                    .ilike('status', 'pending');

                if (pendingError) throw pendingError;
                if (pendingData) setRentalRequests(pendingData);

                const { data: extensionsData, error: extensionsError } = await supabase
                    .rpc('get_owner_pending_extensions');

                if (extensionsError) {
                    console.error('Error fetching extensions:', extensionsError);
                } else if (extensionsData) {
                    setExtensionRequests(extensionsData);
                }
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
        const rental = rentalRequests.find(r => r.id === rentalId);
        if (!rental) {
            toast.error("Rental not found");
            return;
        }

        // Optimistic UI: Remove from list immediately
        setRentalRequests(prev => prev.filter(r => r.id !== rentalId));
        toast.message(`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Action logged. Details processing...`, {
            description: `Approving ${rental.listing.title}`,
            className: "font-mono border-l-4 border-l-safety-orange rounded-none",
        });

        try {

            const { error } = await supabase.rpc('approve_rental_request', {
                p_rental_id: rentalId
            });

            if (error) {
                toast.error(`[SYSTEM ERROR] Failed to approve: ${error.message}`, {
                    className: "font-mono border-l-4 border-l-red-500 rounded-none bg-charcoal text-white",
                });
                // Revert optimistic update gracefully
                setRentalRequests(prev => [rental, ...prev]);
                return;
            }

            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select(`
                    id,
                    listing_id,
                    renter_id,
                    owner_id,
                    start_date,
                    end_date,
                    total_paid
                `)
                .eq('id', rentalId)
                .single();

            if (rentalError || !rentalData) {
                console.error("Error fetching rental details for message:", JSON.stringify(rentalError, null, 2));
                console.error("Rental data received:", rentalData);
            } else {
                const listingData = rental.listing ? {
                    title: rental.listing.title,
                    owner_id: rental.listing.owner_id,
                    location_address: rental.listing.location_address || 'Address to be confirmed',
                    preferred_pickup_time: rental.listing.preferred_pickup_time || 'Check with owner'
                } : null;

                const { data: renterData } = await supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('id', rentalData.renter_id)
                    .single();

                const { data: ownerData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', rentalData.owner_id)
                    .single();

                if (!listingData || !renterData || !ownerData) {
                    console.error("Missing related data for rental", JSON.stringify({
                        listingData,
                        renterData,
                        ownerData
                    }, null, 2));
                }

                const { data: existingChat } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('owner_id', rentalData.owner_id)
                    .eq('renter_id', rentalData.renter_id)
                    .maybeSingle();

                let chatId = existingChat?.id;

                if (!chatId) {
                    const { data: newChat, error: chatError } = await supabase
                        .from('chats')
                        .insert([{
                            listing_id: rentalData.listing_id,
                            owner_id: rentalData.owner_id,
                            renter_id: rentalData.renter_id
                        }])
                        .select()
                        .single();

                    if (chatError) {
                        console.error("Error creating chat:", chatError);
                    } else {
                        chatId = newChat.id;
                    }
                }

                if (chatId) {
                    const startDate = new Date(rentalData.start_date);
                    const endDate = new Date(rentalData.end_date);

                    const context = {
                        recipient_role: '',
                        tool_name: listingData?.title || 'Tool',
                        owner_name: ownerData?.full_name || 'Owner',
                        renter_name: renterData?.full_name || 'Renter',
                        start_date: startDate.toLocaleDateString(),
                        end_date: endDate.toLocaleDateString(),
                        location_address: listingData?.location_address || 'Address to be confirmed',
                        total_paid: rentalData.total_paid?.toFixed(2) || '0.00',
                        total_cost: rentalData.total_paid?.toFixed(2) || '0.00',
                        pickup_time: listingData?.preferred_pickup_time || 'Check with owner',
                        owner_earnings: (rentalData.total_paid * (1 - sellerFeePercent / 100)).toFixed(2),
                        owner_notes_link: `/owner/listings/edit/${rentalData.listing_id}`
                    };

                    try {
                        await sendSystemMessage(
                            chatId,
                            'BOOKING_CONFIRMED',
                            context,
                            rentalData.owner_id,
                            rentalData.renter_id
                        );
                    } catch (msgError) {
                        console.error("Error sending confirmation message:", msgError);
                    }
                }
            }

            toast.success(`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] RENTAL APPROVED`, {
                description: `${rental.listing.title} marked active for ${rental.renter.full_name}`,
                className: "font-mono border-l-4 border-l-emerald-500 rounded-none bg-charcoal text-emerald-400",
            });
        } catch (err) {
            console.error("Approval failed:", err);
            // Revert optimistic
            setRentalRequests(prev => [rental, ...prev]);
            toast.error("Process interrupted. Please refresh.");
        }
    };

    const handleDeny = async (rentalId: string) => {
        setProcessingId(rentalId);
        try {
            const rental = rentalRequests.find(r => r.id === rentalId);
            if (!rental) {
                alert("Rental not found");
                return;
            }

            const { error } = await supabase
                .from('rentals')
                .update({
                    status: 'rejected',
                    cancelled_at: new Date().toISOString()
                })
                .eq('id', rentalId);

            if (error) throw error;

            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select(`
                    id,
                    listing_id,
                    renter_id,
                    owner_id,
                    start_date,
                    end_date
                `)
                .eq('id', rentalId)
                .single();

            if (!rentalError && rentalData) {
                const { data: existingChat } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('owner_id', rentalData.owner_id)
                    .eq('renter_id', rentalData.renter_id)
                    .maybeSingle();

                let chatId = existingChat?.id;

                if (!chatId) {
                    const { data: newChat, error: chatError } = await supabase
                        .from('chats')
                        .insert([{
                            listing_id: rentalData.listing_id,
                            owner_id: rentalData.owner_id,
                            renter_id: rentalData.renter_id
                        }])
                        .select()
                        .single();

                    if (!chatError && newChat) {
                        chatId = newChat.id;
                    }
                }

                if (chatId) {
                    const { data: renterData } = await supabase
                        .from('users')
                        .select('full_name')
                        .eq('id', rentalData.renter_id)
                        .single();

                    const { data: ownerData } = await supabase
                        .from('users')
                        .select('full_name')
                        .eq('id', rentalData.owner_id)
                        .single();

                    const startDate = new Date(rentalData.start_date);
                    const endDate = new Date(rentalData.end_date);

                    const context = {
                        tool_name: rental.listing?.title || 'Tool',
                        owner_name: ownerData?.full_name || 'Owner',
                        renter_name: renterData?.full_name || 'Renter',
                        start_date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        end_date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        total_cost: '',
                        owner_notes_link: ''
                    };

                    try {
                        await sendSystemMessage(
                            chatId,
                            'RENTAL_REQUEST_REJECTED',
                            context,
                            rentalData.owner_id,
                            rentalData.renter_id
                        );
                    } catch (msgError) {
                        console.error("Error sending rejection messages:", msgError);
                    }
                }
            }

            setRentalRequests(prev => prev.filter(r => r.id !== rentalId));
        } catch (err) {
            console.error("Denial failed:", err);
            alert("Could not deny request. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveExtension = async (extensionId: string) => {
        setProcessingId(extensionId);
        try {
            const { data, error } = await supabase.rpc('approve_rental_extension', {
                p_extension_id: extensionId
            });

            if (error) {
                console.error('Error approving extension:', error);
                toast.error(`Error: ${error.message}`);
                return;
            }

            if (!data.success) {
                toast.error(data.error || 'Failed to approve extension');
                return;
            }

            setExtensionRequests(prev => prev.filter(ext => ext.extension_id !== extensionId));
            toast.success('Extension approved successfully!');
        } catch (err) {
            console.error('Extension approval failed:', err);
            toast.error('Failed to approve extension');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeclineExtension = async (extensionId: string) => {
        setProcessingId(extensionId);
        try {
            const { data, error } = await supabase.rpc('decline_rental_extension', {
                p_extension_id: extensionId
            });

            if (error) {
                console.error('Error declining extension:', error);
                toast.error(`Error: ${error.message}`);
                return;
            }

            if (!data.success) {
                toast.error(data.error || 'Failed to decline extension');
                return;
            }

            setExtensionRequests(prev => prev.filter(ext => ext.extension_id !== extensionId));
            toast.success('Extension declined');
        } catch (err) {
            console.error('Extension decline failed:', err);
            toast.error('Failed to decline extension');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateFormatter.format(new Date(dateStr));
    };

    const calculateOwnerRevenue = (rentalFee: number) => {
        if (!rentalFee || !sellerFeePercent) return rentalFee || 0;
        const platformFee = rentalFee * (sellerFeePercent / 100);
        return rentalFee - platformFee;
    };

    const getTimeRemaining = (createdAt: string) => {
        if (!createdAt) return null;

        const created = new Date(createdAt);
        const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, isUrgent: hours < 2 };
    };

    const formatTimeRemaining = (createdAt: string) => {
        const timeRemaining = getTimeRemaining(createdAt);
        if (!timeRemaining) return 'Expired';

        const { hours, minutes } = timeRemaining;
        if (hours === 0) {
            return `${minutes}m`;
        }
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">My Listings</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your tools, rentals, and earnings.</p>
                </div>
                <Link href="/add-tool">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40 hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" />
                        List New Tool
                    </Button>
                </Link>
            </div>

            {/* KPI Telemetry Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/owner/active-rentals" className="block group active:translate-y-[2px] transition-transform">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex items-center justify-between transition-all duration-300 hover:border-safety-orange/40 hover:shadow-xl shadow-sm relative overflow-hidden">
                        {/* Scanner Sweep Element */}
                        <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />

                        <div className="relative z-10">
                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Tool Bookings</p>
                            {kpiLoading ? (
                                <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{kpis.activeRentals}</h3>
                            )}
                        </div>
                        <div className="relative z-10 h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                            {!kpiLoading && overdueCount > 0 ? (
                                <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-transparent border border-white">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </Badge>
                            ) : (
                                <Badge className="absolute -top-1.5 -right-1.5 h-3 w-3 p-0 flex items-center justify-center bg-emerald-500 border border-white animate-pulse-operational text-transparent">.</Badge>
                            )}
                        </div>
                    </div>
                </Link>

                <div className="block group active:translate-y-[2px] transition-transform cursor-pointer">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex items-center justify-between shadow-sm relative overflow-hidden hover:border-safety-orange/40 hover:shadow-xl transition-all duration-300">
                        {/* Scanner Sweep Element */}
                        <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />

                        <div className="relative z-10">
                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Earnings (30d)</p>
                            {kpiLoading ? (
                                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{formatCurrency(kpis.earnings30d)}</h3>
                            )}
                        </div>
                        <div className="relative z-10 h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <DollarSign className="h-6 w-6" />
                            {!kpiLoading && <Badge className="absolute -top-1.5 -right-1.5 h-3 w-3 p-0 flex items-center justify-center bg-emerald-500 border border-white animate-pulse-operational text-transparent">.</Badge>}
                        </div>
                    </div>
                </div>

                <Link href="/dashboard/inventory" className="block group active:translate-y-[2px] transition-transform">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex items-center justify-between transition-all duration-300 hover:border-safety-orange/40 hover:shadow-xl shadow-sm relative overflow-hidden">
                        {/* Scanner Sweep Element */}
                        <div className="absolute top-0 bottom-0 w-1 bg-safety-orange/50 blur-[2px] left-[-10px] group-hover:animate-scanner" />

                        <div className="relative z-10">
                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Tools Listed</p>
                            {kpiLoading ? (
                                <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900 font-mono tabular-nums">{kpis.toolsListed}</h3>
                            )}
                        </div>
                        <div className="relative z-10 h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-safety-orange group-hover:scale-110 transition-transform">
                            <Wrench className="h-6 w-6" />
                            {!kpiLoading && <Badge className="absolute -top-1.5 -right-1.5 h-3 w-3 p-0 flex items-center justify-center bg-emerald-500 border border-white animate-pulse-operational text-transparent">.</Badge>}
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Rental Requests & Action Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Action Items (Returns Pending Inspection) */}
                    {actionItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                                <h2 className="text-lg font-bold font-serif text-slate-900">Action Required</h2>
                            </div>
                            {actionItems.map(item => (
                                <div key={item.id} className="bg-white rounded-[2rem] border-2 border-amber-300 p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-safety-orange/10 text-safety-orange border border-safety-orange/20 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-3">Returned</Badge>
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Needs Inspection</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base">{item.listing.title}</h4>
                                            <p className="text-sm text-slate-500">Returned by <span className="font-medium text-slate-700">{item.renter.full_name || 'Renter'}</span></p>
                                        </div>
                                        <Button onClick={() => setIsInspectionOpen(true)} className="w-full sm:w-auto bg-safety-orange text-white hover:bg-safety-orange/90 font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg shadow-safety-orange/20">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Inspect & Release
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rental Requests */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 max-w-[40px] bg-safety-orange/40" />
                            <h2 className="text-lg font-bold font-serif text-slate-900">Rental Requests</h2>
                        </div>

                        {listsLoading ? (
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </div>
                        ) : (
                            <>
                                {/* Extension Requests - Priority Display */}
                                {extensionRequests.map((ext) => (
                                    <div key={ext.extension_id} className="bg-charcoal rounded-[2rem] p-6 shadow-lg border border-white/10">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <CalendarClock className="h-6 w-6 text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <Badge className="bg-safety-orange text-white font-bold text-[10px] uppercase tracking-wider rounded-full px-3 mb-2 border-0">
                                                    ⏰ Extension Request
                                                </Badge>
                                                <h4 className="font-bold text-white text-lg">{ext.renter_name}</h4>
                                                <p className="text-sm text-concrete/70">
                                                    wants to extend <span className="font-semibold text-white">{ext.listing_title}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                                            <div>
                                                <p className="text-[10px] font-mono text-concrete/50 uppercase tracking-wider mb-1">Current End</p>
                                                <p className="font-bold text-white font-mono text-sm">{formatDate(ext.current_end_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-concrete/50 uppercase tracking-wider mb-1">New End</p>
                                                <p className="font-bold text-safety-orange font-mono text-sm">{formatDate(ext.new_end_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-concrete/50 uppercase tracking-wider mb-1">Extra Days</p>
                                                <p className="font-bold text-white font-mono text-sm">+{ext.extra_days}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-concrete/50 uppercase tracking-wider mb-1">Extra Earnings</p>
                                                <p className="font-bold text-emerald-400 font-mono text-sm">
                                                    {formatCurrency(calculateOwnerRevenue(ext.additional_rental_fee))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-full h-10"
                                                disabled={processingId === ext.extension_id}
                                                onClick={() => handleApproveExtension(ext.extension_id)}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider rounded-full h-10"
                                                disabled={processingId === ext.extension_id}
                                                onClick={() => handleDeclineExtension(ext.extension_id)}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Regular Rental Requests */}
                                {rentalRequests.length > 0 ? (
                                    rentalRequests.map((request) => (
                                        <div key={request.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:border-safety-orange/30 hover:shadow-md">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
                                                        {request.renter.full_name ? request.renter.full_name.charAt(0) : 'R'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                            {request.renter.full_name || 'Unknown User'}
                                                            <span className="flex items-center text-[10px] font-mono font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                                <span className="text-yellow-400 mr-1">★</span>
                                                                5.0
                                                            </span>
                                                        </h4>
                                                        <p className="text-sm text-slate-500">wants to rent <span className="font-medium text-slate-900">{request.listing.title}</span></p>

                                                        {/* Specs Grid */}
                                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono uppercase tracking-wider">
                                                            <span className="bg-slate-50 px-2.5 py-1 rounded-full text-slate-500 border border-slate-100">
                                                                {formatDate(request.start_date)} – {formatDate(request.end_date)}
                                                            </span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-slate-500">{request.total_days} Days</span>
                                                            {request.rental_fee && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="font-bold text-emerald-600 flex items-center gap-1 cursor-help">
                                                                                    {formatCurrency(calculateOwnerRevenue(request.rental_fee))} revenue
                                                                                    <Info className="h-3 w-3" />
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="bg-charcoal text-white p-3 max-w-xs rounded-xl border border-white/10">
                                                                                <div className="space-y-1 text-xs font-mono">
                                                                                    <div className="flex justify-between gap-4">
                                                                                        <span className="text-concrete/60">Rental Fee:</span>
                                                                                        <span className="font-semibold">{formatCurrency(request.rental_fee)}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between gap-4">
                                                                                        <span className="text-concrete/60">Platform Fee ({sellerFeePercent}%):</span>
                                                                                        <span className="text-red-400">-{formatCurrency(request.rental_fee * (sellerFeePercent / 100))}</span>
                                                                                    </div>
                                                                                    <div className="border-t border-white/10 pt-1 mt-1"></div>
                                                                                    <div className="flex justify-between gap-4">
                                                                                        <span className="font-semibold">Your Revenue:</span>
                                                                                        <span className="font-bold text-emerald-400">{formatCurrency(calculateOwnerRevenue(request.rental_fee))}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Time Remaining Warning */}
                                                        {(() => {
                                                            const timeInfo = getTimeRemaining(request.created_at);
                                                            if (!timeInfo) return null;
                                                            const isUrgent = timeInfo.isUrgent;

                                                            return (
                                                                <div className={`flex items-center gap-1.5 mt-3 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit ${isUrgent
                                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                                                    }`}>
                                                                    <Clock className={`h-3 w-3 ${isUrgent ? 'animate-pulse' : ''}`} />
                                                                    <span>
                                                                        {isUrgent ? '⚠️ ' : ''}
                                                                        {formatTimeRemaining(request.created_at)} to respond
                                                                        {isUrgent ? ' – Auto-denies soon!' : ' or auto-denies'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 sm:flex-none text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-full font-bold text-xs uppercase tracking-wider"
                                                        onClick={() => handleDeny(request.id)}
                                                        disabled={processingId === request.id}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Deny
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 sm:flex-none bg-safety-orange hover:bg-safety-orange/90 shadow-lg shadow-safety-orange/20 text-white rounded-full font-bold text-xs uppercase tracking-wider"
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={processingId === request.id}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <Empty className="bg-white rounded-[2rem] border border-slate-200 shadow-sm">
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
                                                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 rounded-full font-bold text-xs uppercase tracking-wider">
                                                    Manage Listings
                                                </Button>
                                            </Link>
                                        </EmptyContent>
                                    </Empty>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Stats / Tips */}
                <div className="space-y-6">
                    {/* Payout Status */}
                    {stripeConnected ? (
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold font-serif text-slate-900">Recent Payouts</h3>
                                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] font-mono uppercase tracking-wider">
                                    Stripe: Connected ●
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Oct 15, 2025</p>
                                        <p className="text-[10px] font-mono text-slate-400">To: ****4242</p>
                                    </div>
                                    <span className="text-emerald-600 font-bold font-mono">+$124.50</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Oct 08, 2025</p>
                                        <p className="text-[10px] font-mono text-slate-400">To: ****4242</p>
                                    </div>
                                    <span className="text-emerald-600 font-bold font-mono">+$85.00</span>
                                </div>
                                <Link href="#">
                                    <Button variant="link" className="text-safety-orange p-0 h-auto text-xs font-bold uppercase tracking-wider w-full justify-start mt-2 hover:text-safety-orange/80">
                                        View all transactions &rarr;
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold font-serif text-slate-900 mb-3">Payout Settings</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500">
                                    Connect your bank account to receive payouts for your rentals.
                                </p>
                                <StripeConnectButton />
                            </div>
                        </div>
                    )}

                    {kpiLoading ? (
                        <div className="bg-safety-orange/5 rounded-[2rem] border border-safety-orange/10 p-6 relative">
                            <Skeleton className="h-6 w-24 bg-safety-orange/10 mb-3" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full bg-safety-orange/10" />
                                <Skeleton className="h-4 w-3/4 bg-safety-orange/10" />
                                <Skeleton className="h-4 w-1/2 bg-safety-orange/10" />
                            </div>
                        </div>
                    ) : showProTip && (
                        <div className="bg-safety-orange/5 rounded-[2rem] border border-safety-orange/10 p-6 relative">
                            <button
                                onClick={handleDismissProTip}
                                className="absolute top-5 right-5 text-safety-orange/40 hover:text-safety-orange transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold font-serif text-slate-900 mb-2">Pro Tip</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Adding a link to the manufacturer's manual increases your tool's safety rating and reduces accident disputes by 40%.
                            </p>
                            <Link href="/add-tool">
                                <Button variant="link" className="text-safety-orange font-bold p-0 mt-3 h-auto text-xs uppercase tracking-wider hover:text-safety-orange/80">
                                    Update your listings &rarr;
                                </Button>
                            </Link>
                        </div>
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
