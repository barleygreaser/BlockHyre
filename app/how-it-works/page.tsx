import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ShieldCheck, Hammer, Camera, ArrowRight, Plus, Equal } from "lucide-react";

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 mb-6 tracking-tight">
                        How BlockShare Works.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto">
                        Simple. Safe. Neighborly.
                    </p>
                    <p className="mt-4 text-slate-500">
                        Join the neighborhood warehouse in 3 simple steps. Verified neighbors, insured tools, and zero clutter.
                    </p>
                </div>
            </section>

            {/* 3-Step Process */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center bg-slate-50 md:bg-transparent">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-slate-900 mb-6 shadow-sm z-10">
                                    <ShieldCheck className="h-10 w-10 text-safety-orange" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">1. Verify & Join</h3>
                                <p className="text-slate-600 leading-relaxed max-w-xs">
                                    Upload proof of residency. We limit access to the local 2,000 homes to ensure accountability.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center bg-slate-50 md:bg-transparent">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-slate-900 mb-6 shadow-sm z-10">
                                    <Hammer className="h-10 w-10 text-safety-orange" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">2. Rent & Build</h3>
                                <p className="text-slate-600 leading-relaxed max-w-xs">
                                    Book tools instantly. Pay a rental fee + a refundable deposit that covers the insurance deductible.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center bg-slate-50 md:bg-transparent">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-slate-900 mb-6 shadow-sm z-10">
                                    <Camera className="h-10 w-10 text-safety-orange" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">3. Snap & Swap</h3>
                                <p className="text-slate-600 leading-relaxed max-w-xs">
                                    Take 4 photos at pickup to confirm condition. Return it clean to get your full deposit back.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Math & Safety Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

                        {/* The Money (Deposit Formula) */}
                        <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-100 flex flex-col justify-center">
                            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-8">The Deposit Formula</h2>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left font-mono text-sm md:text-base text-slate-600">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-slate-900">Rental Fee</span>
                                        <span className="text-xs text-slate-400">(Usage)</span>
                                    </div>
                                    <Plus className="h-4 w-4 text-slate-300" />
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-slate-900">Peace Fund</span>
                                        <span className="text-xs text-slate-400">(10%)</span>
                                    </div>
                                    <Plus className="h-4 w-4 text-slate-300" />
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-safety-orange">Refundable Deposit</span>
                                        <span className="text-xs text-slate-400">(Risk-Gap)</span>
                                    </div>
                                    <Equal className="h-4 w-4 text-slate-300" />
                                    <div className="font-bold text-lg text-slate-900">Total</div>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed">
                                Your deposit is strictly to cover the insurance deductible ($250 max). It is <span className="font-bold text-slate-900">NOT</span> the full price of the tool. Return it safe, and 100% is refunded instantly.
                            </p>
                        </div>

                        {/* The Peace Fund */}
                        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-safety-orange opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold font-serif text-white mb-6">The Peace Fund</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                    We take 10% of fees to build a community pot for minor repairs. Worn blade? The Fund pays. No awkward arguments with neighbors.
                                </p>
                                <div className="flex items-center gap-4 text-sm font-medium text-safety-orange">
                                    <div className="h-1 w-12 bg-safety-orange rounded-full"></div>
                                    <span>Community Safety Net</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-slate-50 border-t border-slate-200 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 mb-6">Ready to start your project?</h2>
                    <Link href="/#inventory">
                        <Button size="lg" className="text-base px-8 bg-safety-orange hover:bg-safety-orange/90">
                            Browse Inventory
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
