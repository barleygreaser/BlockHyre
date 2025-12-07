"use client";

import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useCart } from "@/app/context/cart-context";
import { Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { calculateRentalPrice } from "@/lib/pricing";

export default function CartPage() {
    const { cart, removeFromCart, cartTotal } = useCart();

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold font-serif text-slate-900 mb-8">Your Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500 mb-4">Your cart is empty.</p>
                        <Link href="/">
                            <Button>Browse Inventory</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => {
                                const { finalTotal } = calculateRentalPrice(item.price.daily, item.days, item.price.riskTier);
                                const itemTotal = finalTotal + item.price.deposit;

                                return (
                                    <Card key={item.id} className="overflow-hidden border-slate-200">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover absolute inset-0"
                                                />
                                            </div>
                                            <CardContent className="flex-1 p-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="space-y-1 text-sm text-slate-600 mb-4">
                                                    <p>
                                                        <span className="font-semibold">Dates:</span> {format(item.dates.from, "MMM d")} - {format(item.dates.to, "MMM d, yyyy")}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">Duration:</span> {item.days} days
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div className="text-sm">
                                                        <p className="text-slate-500">Daily Rate: ${item.price.daily}</p>
                                                        <p className="text-slate-500">Deposit: ${item.price.deposit}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500 mb-1">Total for this item</p>
                                                        <p className="text-xl font-bold text-slate-900">
                                                            ${itemTotal}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-slate-200 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-bold font-serif text-slate-900">Summary</h3>

                                    <div className="space-y-2 text-sm text-slate-600 pb-4 border-b border-slate-100">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${cartTotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-slate-900">Total</span>
                                        <span className="text-2xl font-bold text-safety-orange">${cartTotal}</span>
                                    </div>

                                    <Link href="/checkout" className="block w-full">
                                        <Button className="w-full h-12 text-base font-bold bg-safety-orange hover:bg-safety-orange/90 text-white">
                                            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
