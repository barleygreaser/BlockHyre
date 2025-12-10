"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ReturnInspectionModal } from "@/app/components/return-inspection-modal";
import { Plus, DollarSign, Wrench, Users, Check, X, Eye, Files } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { StripeConnectButton } from "@/app/components/stripe-connect-button";

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
    const [rentalRequests, setRentalRequests] = useState([
        { id: 1, user: "Mike T.", rating: 4.9, item: "DeWalt Table Saw", dates: "Oct 14 - Oct 16", duration: "2 Days" }
    ]);

    useEffect(() => {
        async function checkStripeStatus() {
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('stripe_account_id')
                    .eq('id', user.id)
                    .single();

                if (data?.stripe_account_id) {
                    setStripeConnected(true);
                }
            }
        }
        checkStripeStatus();
    }, [user]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Rentals</p>
                            {kpiLoading ? (
                                <div className="h-9 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900">{kpis.activeRentals}</h3>
                            )}
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

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

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tools Listed</p>
                            {kpiLoading ? (
                                <div className="h-9 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-3xl font-bold text-slate-900">{kpis.toolsListed}</h3>
                            )}
                        </div>
                        <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-safety-orange">
                            <Wrench className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Rental Requests & Active Rentals */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Rentals (Action Required) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Action Required</h2>

                        <Card className="border-[1.5px] border-[#FFC107] shadow-sm bg-[#FFFBE6]">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="bg-white text-safety-orange border-safety-orange">Returned</Badge>
                                            <span className="text-xs text-slate-500">Just now</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900">Harvest Right Freeze Dryer</h4>
                                        <p className="text-sm text-slate-600">Returned by <span className="font-medium">Sarah J.</span></p>
                                    </div>
                                    <Button onClick={() => setIsInspectionOpen(true)} className="w-full sm:w-auto bg-safety-orange text-white hover:bg-safety-orange/90 font-bold">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Inspect & Release Deposit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rental Requests */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Rental Requests</h2>

                        {rentalRequests.length > 0 ? (
                            rentalRequests.map((request) => (
                                <Card key={request.id} className="border-slate-200 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {request.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                        {request.user}
                                                        {request.rating && (
                                                            <span className="flex items-center text-xs font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                                <span className="text-yellow-400 mr-1">★</span>
                                                                {request.rating}
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">wants to rent <span className="font-medium text-slate-900">{request.item}</span></p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{request.dates}</span>
                                                        <span>•</span>
                                                        <span>{request.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                                                    <X className="mr-2 h-4 w-4" />
                                                    Deny
                                                </Button>
                                                <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white">
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-dashed border-slate-200 shadow-sm bg-slate-50/50">
                                <CardContent className="p-8 text-center flex flex-col items-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                                        <Files className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No new requests right now</h3>
                                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                        Time to optimize your listings! Adding more photos or lowering prices slightly can help attract renters.
                                    </p>
                                    <Link href="/inventory" className="mt-4">
                                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900">
                                            Manage Listings
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
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

                    {showProTip && (
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
