"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
    const [overdueCount, setOverdueCount] = useState(0);

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

                // Fetch overdue rentals count
                const { data: overdueData, error: overdueError } = await supabase
                    .from('rentals')
                    .select('id, listing:listings!inner(owner_id)')
                    .eq('listings.owner_id', user.id)
                    .in('status', ['active', 'approved', 'Active', 'Approved'])
                    .lt('end_date', new Date().toISOString());

                if (overdueError) {
                    console.error("Error fetching overdue count:", overdueError);
                } else {
                    console.log("Overdue rentals found:", overdueData?.length || 0, overdueData);
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
    const [extensionRequests, setExtensionRequests] = useState<any[]>([]);
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
                        created_at,
                        renter:users!renter_id (full_name, email), 
                        listing:listings!inner (title, owner_id)
                    `)
                    .eq('listings.owner_id', user.id)
                    .ilike('status', 'pending');

                if (pendingError) throw pendingError;
                if (pendingData) setRentalRequests(pendingData);

                // 3. Extension Requests
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
        setProcessingId(rentalId);
        try {
            // First, get the rental details before approving
            const rental = rentalRequests.find(r => r.id === rentalId);
            if (!rental) {
                alert("Rental not found");
                return;
            }

            // Approve the rental via RPC
            const { error } = await supabase.rpc('approve_rental_request', {
                p_rental_id: rentalId
            });

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }

            // Fetch additional data needed for the confirmation message
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
                // Use listing data from the rental object (already fetched in rentalRequests)
                // The rental object includes: listing:listings!inner (title, owner_id)
                const listingData = rental.listing ? {
                    title: rental.listing.title,
                    owner_id: rental.listing.owner_id,
                    location_address: rental.listing.location_address || 'Address to be confirmed'
                } : null;

                // Fetch renter details
                const { data: renterData } = await supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('id', rentalData.renter_id)
                    .single();

                // Fetch owner details
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
                    // Continue anyway, just use defaults
                }

                // Get or create chat for this rental
                const { data: existingChat } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('listing_id', rentalData.listing_id)
                    .eq('owner_id', rentalData.owner_id)
                    .eq('renter_id', rentalData.renter_id)
                    .single();

                let chatId = existingChat?.id;

                if (!chatId) {
                    // Create chat if it doesn't exist
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

                // Send BOOKING_CONFIRMED system messages if we have a chat
                if (chatId) {
                    const startDate = new Date(rentalData.start_date);
                    const endDate = new Date(rentalData.end_date);

                    const context = {
                        tool_name: listingData?.title || 'Tool',
                        owner_name: ownerData?.full_name || 'Owner',
                        renter_name: renterData?.full_name || 'Renter',
                        start_date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        end_date: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        location_address: listingData?.location_address || 'Address to be confirmed',
                        total_paid: rentalData.total_paid?.toFixed(2) || '0.00',
                        total_cost: rentalData.total_paid?.toFixed(2) || '0.00', // Alias for total_paid
                        pickup_time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        seller_fee_percent: sellerFeePercent,
                        owner_earnings: (rentalData.total_paid * (1 - sellerFeePercent / 100)).toFixed(2),
                        owner_notes_link: '#' // Not applicable for this event
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
                        // Don't fail the approval if message fails
                    }
                }
            }

            // Refresh lists
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
            // Get the rental details before denying
            const rental = rentalRequests.find(r => r.id === rentalId);
            if (!rental) {
                alert("Rental not found");
                return;
            }

            // Update status to rejected
            const { error } = await supabase
                .from('rentals')
                .update({
                    status: 'rejected',
                    cancelled_at: new Date().toISOString()
                })
                .eq('id', rentalId);

            if (error) throw error;

            // Fetch additional data for system messages
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
                // Get or create chat
                const { data: existingChat } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('listing_id', rentalData.listing_id)
                    .eq('owner_id', rentalData.owner_id)
                    .eq('renter_id', rentalData.renter_id)
                    .single();

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

                // Send system messages if we have a chat
                if (chatId) {
                    // Fetch user names
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
                        total_cost: '', // Not applicable for rejection
                        owner_notes_link: '' // Not applicable for rejection
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
                        // Don't fail the denial if message fails
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

            // Success - refresh the lists
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

            // Success - refresh the lists
            setExtensionRequests(prev => prev.filter(ext => ext.extension_id !== extensionId));
            toast.success('Extension declined');
        } catch (err) {
            console.error('Extension decline failed:', err);
            toast.error('Failed to decline extension');
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

    // Calculate time remaining before auto-denial (24 hours from created_at)
    const getTimeRemaining = (createdAt: string) => {
        if (!createdAt) return null;

        const created = new Date(createdAt);
        const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) return null; // Expired

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, isUrgent: hours < 2 }; // Urgent if less than 2 hours
    };

    // Format time remaining for display
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
                                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Tool Bookings</p>
                                {kpiLoading ? (
                                    <div className="h-9 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-slate-900">{kpis.activeRentals}</h3>
                                )}
                            </div>
                            <div className="relative h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                                {!kpiLoading && overdueCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-red-500 hover:bg-red-500 text-white border-white border-2 text-xs font-bold">
                                        {overdueCount}
                                    </Badge>
                                )}
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
                        ) : (
                            <>
                                {/* Extension Requests - Priority Display */}
                                {extensionRequests.map((ext) => (
                                    <Card key={ext.extension_id} className="border-2 border-amber-400 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                    <CalendarClock className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <Badge className="bg-amber-500 text-white font-semibold mb-2">
                                                        ⏰ EXTENSION REQUEST
                                                    </Badge>
                                                    <h4 className="font-bold text-slate-900 text-lg">{ext.renter_name}</h4>
                                                    <p className="text-sm text-slate-700">
                                                        wants to extend <span className="font-semibold">{ext.listing_title}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 bg-white/60 rounded-lg p-4 mb-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-slate-600 mb-1">Current End</p>
                                                    <p className="font-semibold">{formatDate(ext.current_end_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-600 mb-1">New End</p>
                                                    <p className="font-semibold text-amber-700">{formatDate(ext.new_end_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-600 mb-1">Extra Days</p>
                                                    <p className="font-semibold">+{ext.extra_days}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-600 mb-1">Extra Earnings</p>
                                                    <p className="font-bold text-green-600">
                                                        {formatCurrency(calculateOwnerRevenue(ext.additional_rental_fee))}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={processingId === ext.extension_id}
                                                    onClick={() => handleApproveExtension(ext.extension_id)}
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                                    disabled={processingId === ext.extension_id}
                                                    onClick={() => handleDeclineExtension(ext.extension_id)}
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Regular Rental Requests */}
                                {rentalRequests.length > 0 ? (
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

                                                            {/* Time Remaining Warning */}
                                                            {(() => {
                                                                const timeInfo = getTimeRemaining(request.created_at);
                                                                if (!timeInfo) return null;
                                                                const isUrgent = timeInfo.isUrgent;

                                                                return (
                                                                    <div className={`flex items-center gap-1.5 mt-3 text-xs font-medium px-2 py-1 rounded-md w-fit ${isUrgent
                                                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                        }`}>
                                                                        <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'animate-pulse' : ''}`} />
                                                                        <span>
                                                                            {isUrgent ? '⚠️ ' : ''}
                                                                            {formatTimeRemaining(request.created_at)} to respond
                                                                            {isUrgent ? ' - Auto-denies soon!' : ' or auto-denies'}
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
                            </>
                        )}
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
        </div>
    );
}
