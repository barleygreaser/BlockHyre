"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ReturnInspectionModal } from "@/app/components/return-inspection-modal";
import { Plus, DollarSign, Wrench, Users, Check, X, Eye } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { StripeConnectButton } from "@/app/components/stripe-connect-button";

export function OwnerDashboardView() {
    const { user } = useAuth();
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(false);

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
                            <h3 className="text-3xl font-bold text-slate-900">3</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Earnings</p>
                            <h3 className="text-3xl font-bold text-slate-900">$1,240</h3>
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
                            <h3 className="text-3xl font-bold text-slate-900">12</h3>
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

                    {/* Rental Requests */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Rental Requests</h2>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                            M
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Mike T.</h4>
                                            <p className="text-sm text-slate-500">wants to rent <span className="font-medium text-slate-900">DeWalt Table Saw</span></p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded">Oct 14 - Oct 16</span>
                                                <span>•</span>
                                                <span>2 Days</span>
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
                    </div>

                    {/* Active Rentals (Action Required) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Action Required</h2>

                        <Card className="border-l-4 border-l-safety-orange border-y border-r border-slate-200 shadow-sm bg-orange-50/30">
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
                                    <Button onClick={() => setIsInspectionOpen(true)} className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Inspect & Release Deposit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* Right Column: Quick Stats / Tips */}
                <div className="space-y-6">
                    {/* Payout Status */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-serif">Payout Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stripeConnected ? (
                                <div className="flex items-center gap-2 text-green-600 font-bold">
                                    <Check className="h-5 w-5" />
                                    Bank Account Connected
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Connect your bank account to receive payouts for your rentals.
                                    </p>
                                    <StripeConnectButton />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-serif">Pro Tip</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Adding a link to the manufacturer's manual increases your tool's safety rating and reduces accident disputes by 40%.
                            </p>
                            <Link href="/add-tool">
                                <Button variant="link" className="text-safety-orange p-0 mt-4 h-auto">
                                    Update your listings &rarr;
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <ReturnInspectionModal
                isOpen={isInspectionOpen}
                onClose={() => setIsInspectionOpen(false)}
            />
        </div>
    );
}
