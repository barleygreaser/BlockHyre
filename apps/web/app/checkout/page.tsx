"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { useCart } from "@/app/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calculateRentalPrice } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SafetyModal } from "@/app/components/safety-modal";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSafetyGate, setShowSafetyGate] = useState(false);

    const hasHighPowerItems = cart.some(item => item.price.riskTier === 3);

    const subtotal = cart.reduce((acc, item) => {
        const { subtotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
        return acc + subtotal;
    }, 0);

    const peaceFundTotal = cart.reduce((acc, item) => {
        const { peaceFundTotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
        return acc + peaceFundTotal;
    }, 0);

    const depositTotal = cart.reduce((acc, item) => acc + item.price.deposit, 0);
    const finalTotal = subtotal + peaceFundTotal + depositTotal;

    const handlePaymentClick = () => {
        if (hasHighPowerItems) {
            setShowSafetyGate(true);
        } else {
            handlePayment();
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please log in to continue.");
                return;
            }

            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    cartItems: cart.map(item => ({
                        id: item.id,
                        title: item.title,
                        days: item.days,
                        price: item.price,
                        dates: item.dates,
                    })),
                }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse response:", text);
                throw new Error("Server returned an invalid response. Check console for details.");
            }

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Failed to create checkout session");
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.message || "Something went wrong during checkout.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <Button onClick={() => router.push('/inventory')}>Go to Inventory</Button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-serif text-midnight-navy mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Billing Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-card border border-slate-200/80 shadow-sm">
                            <h2 className="text-xl font-serif font-bold text-midnight-navy mb-4">Billing Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase tracking-industrial font-semibold text-slate-600">First Name</label>
                                    <Input type="text" className="rounded-interactive focus-visible:ring-electric-indigo" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase tracking-industrial font-semibold text-slate-600">Last Name</label>
                                    <Input type="text" className="rounded-interactive focus-visible:ring-electric-indigo" placeholder="Doe" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-mono uppercase tracking-industrial font-semibold text-slate-600">Email</label>
                                    <Input type="email" className="rounded-interactive focus-visible:ring-electric-indigo" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-mono uppercase tracking-industrial font-semibold text-slate-600">Address</label>
                                    <Input type="text" className="rounded-interactive focus-visible:ring-electric-indigo" placeholder="123 Main St" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-card border border-slate-200/80 shadow-sm">
                            <h2 className="text-xl font-serif font-bold text-midnight-navy mb-4">Payment Details</h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-slate-200/80 rounded-interactive bg-slate-50/50 text-slate-600 text-xs font-mono">
                                    You will be redirected to Stripe to securely complete your payment.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-card border border-slate-200/80 shadow-sm sticky top-24">
                            <h3 className="font-serif font-bold text-lg text-midnight-navy mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Peace Fund</span>
                                    <span className="font-mono font-semibold">${peaceFundTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-safety-orange font-mono font-semibold text-sm">
                                    <span>Deposits</span>
                                    <span>${depositTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg text-midnight-navy">
                                    <span className="font-serif">Total</span>
                                    <span className="font-mono text-xl font-bold">${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                variant="default"
                                className="w-full mt-6 h-12 text-base font-bold rounded-interactive active:translate-y-0.5"
                                onClick={handlePaymentClick}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Pay Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <SafetyModal 
                isOpen={showSafetyGate} 
                onClose={() => setShowSafetyGate(false)} 
                onConfirm={() => {
                    setShowSafetyGate(false);
                    handlePayment();
                }} 
            />

            <Footer />
        </main>
    );
}
