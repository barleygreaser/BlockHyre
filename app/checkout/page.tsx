"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { useCart } from "@/app/context/cart-context";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calculateRentalPrice } from "@/lib/pricing";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Here we would create the rentals in Supabase
        // For now, just clear cart and redirect
        clearCart();
        alert("Payment successful! Your rentals are confirmed.");
        router.push('/inventory');
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
                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Billing Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">Billing Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input type="text" className="w-full p-2 border rounded" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input type="text" className="w-full p-2 border rounded" placeholder="Doe" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input type="email" className="w-full p-2 border rounded" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <input type="text" className="w-full p-2 border rounded" placeholder="123 Main St" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                            <div className="space-y-4">
                                <div className="p-4 border rounded bg-slate-50 text-slate-500 text-sm">
                                    Payment integration coming soon. This is a demo.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Peace Fund</span>
                                    <span>${peaceFundTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-safety-orange">
                                    <span>Deposits</span>
                                    <span>${depositTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg text-slate-900">
                                    <span>Total</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-6 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12"
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Pay Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
