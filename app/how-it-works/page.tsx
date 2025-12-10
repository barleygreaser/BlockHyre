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
                        How BlockHyre Works.
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
                                        <span className="text-xs text-slate-400">($1 - $10)</span>
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
                                Your deposit covers the insurance deductible. It is <span className="font-bold text-slate-900">NOT</span> the full price of the tool. Return it safe, and 100% is refunded instantly.
                            </p>
                        </div>

                        {/* The Peace Fund - Improved Visualization */}
                        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col relative overflow-hidden shadow-2xl">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-safety-orange opacity-10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold font-serif text-white mb-2">The Peace Fund: Worry-Free Renting</h2>
                                    <p className="text-slate-400">Our Community Safety Net: Replaces large security deposits, enables free borrowing, and covers accidental damage.</p>
                                </div>

                                {/* Visual Tiers Grid */}
                                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                                    <div className="bg-white/5 rounded-xl p-3 md:p-4 text-center border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group cursor-default">
                                        <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-300">Tier 1</div>
                                        <div className="text-xl md:text-2xl font-bold text-safety-orange mb-1 leading-none">$1<span className="text-[10px] md:text-xs text-slate-500 font-normal">/day</span></div>
                                        <div className="text-[10px] md:text-xs text-slate-400 leading-tight mt-1">Up to $100</div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-3 md:p-4 text-center border border-safety-orange/30 hover:bg-white/10 transition-colors backdrop-blur-sm relative group cursor-default">
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-safety-orange text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg whitespace-nowrap">STANDARD</div>
                                        <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-300">Tier 2</div>
                                        <div className="text-xl md:text-2xl font-bold text-safety-orange mb-1 leading-none">$3<span className="text-[10px] md:text-xs text-slate-500 font-normal">/day</span></div>
                                        <div className="text-[10px] md:text-xs text-slate-400 leading-tight mt-1">Up to $500</div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-3 md:p-4 text-center border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group cursor-default">
                                        <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-300">Tier 3</div>
                                        <div className="text-xl md:text-2xl font-bold text-safety-orange mb-1 leading-none">$10<span className="text-[10px] md:text-xs text-slate-500 font-normal">/day</span></div>
                                        <div className="text-[10px] md:text-xs text-slate-400 leading-tight mt-1">Up to $3,000</div>
                                    </div>
                                </div>

                                {/* Community Safety Net Visual */}
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10 mb-6 flex-grow">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20 shrink-0">
                                            <ShieldCheck className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white mb-1">What Your Fee Covers</div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                <span className="text-slate-200 font-medium">Zero Liability:</span> If accidental damage occurs, the fund covers the cost—you pay no deductible.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visual Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-500">Protection Level</span>
                                            <span className="text-green-500">Active</span>
                                        </div>
                                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden flex">
                                            <div className="h-full w-full bg-gradient-to-r from-green-600 to-green-400"></div>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Renter Deductible</span>
                                            <span className="font-mono text-sm font-bold text-safety-orange">NONE ($0.00)</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/liability" className="w-full mb-4">
                                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold border-0">
                                        Review Full Liability Policy
                                    </Button>
                                </Link>

                                <p className="text-[10px] text-slate-500 text-center leading-relaxed px-2">
                                    <span className="font-bold text-slate-400">Note:</span> The Peace Fund fee is mandatory for all rentals, including free borrows, as it protects the Owner's asset. All rental fees are held in escrow.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-slate-50 border-t border-slate-200 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 mb-6">Ready to start your project?</h2>
                    <Link href="/listings">
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
