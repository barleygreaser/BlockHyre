"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { User, Shield, CreditCard, Activity, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [stripeLoading, setStripeLoading] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) setProfile(data);
            if (error) console.error("Error fetching profile:", error);
        };

        if (user) fetchProfile();
    }, [user]);

    // Handle Stripe Return/Refresh
    useEffect(() => {
        if (searchParams.get("stripe_return") === "true") {
            // Re-fetch profile to check connectivity status
            // Ideally we'd show a success toast here
        }
    }, [searchParams]);

    const handleConnectStripe = async () => {
        setStripeLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch("/api/stripe/connect", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to initiate Stripe connection.");
            }
        } catch (error) {
            console.error("Stripe Connect Error:", error);
            alert("An error occurred connecting to Stripe.");
        } finally {
            setStripeLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    if (!user) {
        router.push("/login"); // Or show "Please login"
        return null;
    }

    // Determine Statuses
    const isIdVerified = profile?.residency_verified || false; // Or check specific ID columns if we add them
    const isStripeConnected = profile?.stripe_account_id && profile?.stripe_connected !== false; // Simplified check

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-slate-900">Your Profile</h1>
                    <p className="text-slate-600">Manage your identity, payouts, and activity.</p>
                </div>

                <Tabs defaultValue="identity" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-200 p-1 rounded-lg">
                        <TabsTrigger value="identity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Identity & Trust</TabsTrigger>
                        <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Activity</TabsTrigger>
                        <TabsTrigger value="financials" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Financials</TabsTrigger>
                        <TabsTrigger value="protection" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Protection</TabsTrigger>
                    </TabsList>

                    {/* IDENTITY TAB */}
                    <TabsContent value="identity">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-safety-orange" />
                                    Identity Verification
                                </CardTitle>
                                <CardDescription>Your verified status determines your protection tier.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        {profile?.profile_photo_url ? (
                                            <img src={profile.profile_photo_url} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                                <User className="h-6 w-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900">{profile?.full_name || user.email}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className={`h-5 w-5 ${isIdVerified ? "text-green-500" : "text-slate-300"}`} />
                                            <div>
                                                <p className="font-medium text-slate-900">Residency Verification</p>
                                                <p className="text-xs text-slate-500">Required for Tier 2 Access</p>
                                            </div>
                                        </div>
                                        {isIdVerified ? (
                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Verified</span>
                                        ) : (
                                            <Button size="sm" variant="secondary">Upload Proof</Button>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-slate-300" />
                                            <div>
                                                <p className="font-medium text-slate-900">Government ID</p>
                                                <p className="text-xs text-slate-500">Required for Tier 3 (Heavy Machinery)</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500">Coming Soon</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FINANCIALS TAB */}
                    <TabsContent value="financials">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-safety-orange" />
                                    Payout Methods
                                </CardTitle>
                                <CardDescription>Securely receive earnings from your rentals.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <span className="font-bold text-indigo-600">Stripe</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Stripe Connect</p>
                                                <p className="text-sm text-slate-500">Fast, secure bank transfers.</p>
                                            </div>
                                        </div>
                                        {isStripeConnected ? (
                                            <span className="text-green-600 flex items-center gap-1 text-sm font-bold">
                                                <CheckCircle className="h-4 w-4" /> Connected
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 text-sm italic">Not Connected</span>
                                        )}
                                    </div>

                                    {!isStripeConnected ? (
                                        <Button
                                            onClick={handleConnectStripe}
                                            disabled={stripeLoading}
                                            className="w-full bg-[#635BFF] hover:bg-[#534be0] text-white"
                                        >
                                            {stripeLoading ? "Redirecting..." : "Connect with Stripe"}
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full">Manage Payout Settings <ExternalLink className="ml-2 h-4 w-4" /></Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ACTIVITY TAB (Placeholder) */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-500">
                                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No recent rentals or listings.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PROTECTION TAB (Placeholder) */}
                    <TabsContent value="protection">
                        <Card>
                            <CardHeader>
                                <CardTitle>Peace Fund Coverage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-500">
                                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Your rentals are protected by the community Peace Fund.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </main>
    );
}
