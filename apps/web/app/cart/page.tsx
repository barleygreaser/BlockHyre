"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { useCart } from "@/app/context/cart-context";
import { Button } from "@/app/components/ui/button";
import { Trash2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateRentalPrice } from "@/lib/pricing";
import { format } from "date-fns";

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const router = useRouter();

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

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-8">Your Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                        <p className="text-slate-500 mb-4">Your cart is empty.</p>
                        <Button onClick={() => router.push('/listings')}>Browse Inventory</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => {
                                const { finalTotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 flex gap-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md bg-slate-100" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>
                                                    {format(item.dates.from, "MMM d")} - {format(item.dates.to, "MMM d")} ({item.days} days)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                <AlertCircle className="h-4 w-4 text-safety-orange" />
                                                <span>Tier {item.price.riskTier} Peace Fund</span>
                                            </div>
                                            <div className="mt-2 font-bold text-slate-900">
                                                ${finalTotal + item.price.deposit} <span className="text-xs font-normal text-slate-500">(inc. ${item.price.deposit} deposit)</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-24">
                                <h3 className="font-bold text-lg text-slate-900 mb-4">Order Summary</h3>
                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal (Rental Fees)</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Peace Fund Contributions</span>
                                        <span>${peaceFundTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-safety-orange font-medium">
                                        <span>Refundable Deposits</span>
                                        <span>${depositTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg text-slate-900">
                                        <span>Total Due Now</span>
                                        <span>${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-6 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12"
                                    onClick={() => router.push('/checkout')}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
