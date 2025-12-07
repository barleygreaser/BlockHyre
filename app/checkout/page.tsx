"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { AlertTriangle, CheckCircle, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/cart-context";
import { calculateRentalPrice, RISK_TIERS } from "@/lib/pricing";
import { useAuth } from "@/app/context/auth-context";
import { useMarketplace } from "@/app/hooks/use-marketplace";

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { createRental } = useMarketplace();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [checks, setChecks] = useState({
        risk: false,
        competence: false,
        peaceFund: false,
    });

    const allChecked = Object.values(checks).every(Boolean);

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Calculate breakdown from cart
    const breakdown = cart.reduce((acc, item) => {
        const { subtotal, peaceFundTotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
        return {
            subtotal: acc.subtotal + subtotal,
            peaceFundTotal: acc.peaceFundTotal + peaceFundTotal,
            depositTotal: acc.depositTotal + item.price.deposit
        };
    }, { subtotal: 0, peaceFundTotal: 0, depositTotal: 0 });

    const handleCheckout = async () => {
        if (!user) {
            router.push('/auth');
            return;
        }

        setIsProcessing(true);

        try {
            // Process all items
            for (const item of cart) {
                const riskFee = RISK_TIERS[item.price.riskTier];

                const result = await createRental(
                    item.id,
                    user.id,
                    item.dates.from,
                    item.dates.to,
                    item.price.daily,
                    riskFee,
                    false // Assuming no barter for now in this flow, or check item property?
                    // CartItem doesn't have isBarter property yet. 
                    // Let's assume false for standard checkout or add it to CartItem later.
                );

                if (!result.success) {
                    throw new Error("Failed to book item: " + item.title);
                }
            }

            // Success
            clearCart();
            router.push("/owner/dashboard"); // Redirect to dashboard or success page
            alert("Booking successful! Check your dashboard.");

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Checkout failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link href="/cart" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                </Link>

                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-8">Checkout & Safety Gate</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Safety Gate */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-safety-orange">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Mandatory Safety Acceptance</h2>
                                    <p className="text-xs text-slate-500">You must agree to all terms to proceed.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    checks.risk ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={checks.risk}
                                        onChange={() => toggleCheck('risk')}
                                    />
                                    <div className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Assumption of Risk</span>
                                        <span className="text-slate-600">I agree to the Assumption of Risk and indemnify BlockShare.</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    checks.competence ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={checks.competence}
                                        onChange={() => toggleCheck('competence')}
                                    />
                                    <div className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Operator Competence</span>
                                        <span className="text-slate-600">I certify my Competence to safely operate this power tool.</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    checks.peaceFund ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                                )}>
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={checks.peaceFund}
                                        onChange={() => toggleCheck('peaceFund')}
                                    />
                                    <div className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Peace Fund Contribution</span>
                                        <span className="text-slate-600">I acknowledge the Peace Fund Contribution in the Platform Fee.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Financial Summary */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm sticky top-6">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between text-slate-600">
                                    <span>Rental Fees</span>
                                    <span className="font-medium text-slate-900">${breakdown.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <span>Peace Fund (Insurance)</span>
                                        <div className="h-4 w-4 rounded-full bg-slate-200 text-[10px] flex items-center justify-center cursor-help" title="Includes Peace Fund Contribution">?</div>
                                    </div>
                                    <span className="font-medium text-slate-900">${breakdown.peaceFundTotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 pb-4 border-b border-slate-100">
                                    <span>Refundable Deposit</span>
                                    <span className="font-medium text-slate-900">${breakdown.depositTotal}</span>
                                </div>

                                <div className="flex justify-between items-end pt-2">
                                    <span className="font-bold text-slate-900 text-lg">TOTAL DUE NOW</span>
                                    <span className="font-bold text-safety-orange text-2xl">${cartTotal}</span>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        size="lg"
                                        className="w-full text-base"
                                        disabled={!allChecked || isProcessing}
                                        onClick={handleCheckout}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Place Hold & Pay
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-center text-slate-400 mt-3">
                                        Secure 256-bit encrypted payment
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
