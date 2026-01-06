"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Shield, Users, AlertOctagon, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function PeaceFundPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
                {/* Background Accents (optional abstract shapes) */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-safety-orange/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/20">
                        <Shield className="h-10 w-10 text-safety-orange" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">The Peace Fund</h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                        A community-driven protection plan designed to replace high security deposits.
                        We pool small fees to cover big risks, so you can borrow with confidence.
                    </p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-slate-900">Why We Built This?</h2>
                            <h3 className="text-lg font-bold text-safety-orange uppercase tracking-wider">The "Many Cover the Few" Philosophy</h3>
                            <p className="text-slate-600 font-medium text-lg">
                                In a standard rental model, renting a $2,000 tool often requires a $1,000 deposit.
                                This creates friction and locks people out.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                The Peace Fund removes this barrier. Instead of asking one person to lock up $1,000,
                                we ask 100 people to pay $5 each. This small, non-refundable fee goes into a collective "pot"
                                used to reimburse owners if their tools are damaged or stolen.
                            </p>
                        </div>
                        <div className="flex-1 bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-lg text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <Users className="h-10 w-10 text-slate-400" />
                                <span className="text-2xl text-slate-300 font-bold">&rarr;</span>
                                <Shield className="h-12 w-12 text-green-500" />
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">100</span>
                                    <span className="text-slate-600">100 renters pay a small fee (e.g. $5)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">$</span>
                                    <span className="text-slate-600">Fund collects $500 total</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-sm">!</span>
                                    <span className="text-slate-600">1 person breaks a $200 tool</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">✔</span>
                                    <span className="text-slate-600 font-bold">The Fund pays the $200 instantly.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works / Tiers */}
            <section className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">How It Works in Practice</h2>
                        <p className="text-slate-600">Not all tools carry the same risk. We categorize gear into tiers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tier 1 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-safety-orange transition-colors group">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-safety-orange">Tier 1</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">The Basics</h3>
                            <div className="text-3xl font-bold text-slate-900 mb-2">$1 <span className="text-base font-normal text-slate-500">/ day</span></div>
                            <div className="text-green-600 font-medium text-sm mb-6 flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Up to $100 Coverage
                            </div>
                            <ul className="text-slate-600 space-y-2 text-sm">
                                <li>• Hand Tools</li>
                                <li>• Ladders</li>
                                <li>• Extension Cords</li>
                                <li>• Garden Rakes</li>
                            </ul>
                        </div>

                        {/* Tier 2 */}
                        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-safety-orange relative transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-safety-orange text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Most Popular</div>
                            <div className="text-sm font-bold text-safety-orange uppercase tracking-widest mb-2">Tier 2</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Power Tools</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-2">$3 <span className="text-base font-normal text-slate-500">/ day</span></div>
                            <div className="text-green-600 font-medium text-sm mb-6 flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Up to $500 Coverage
                            </div>
                            <ul className="text-slate-600 space-y-2 text-sm font-medium">
                                <li>• Cordless Drills</li>
                                <li>• Circular Saws</li>
                                <li>• Shop Vacs</li>
                                <li>• Small Kitchen Appliances</li>
                            </ul>
                        </div>

                        {/* Tier 3 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-900 transition-colors group">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-slate-900">Tier 3</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Heavy Equipment</h3>
                            <div className="text-3xl font-bold text-slate-900 mb-2">$10 <span className="text-base font-normal text-slate-500">/ day</span></div>
                            <div className="text-green-600 font-medium text-sm mb-6 flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Up to $3,000 Coverage
                            </div>
                            <ul className="text-slate-600 space-y-2 text-sm">
                                <li>• Freeze Dryers</li>
                                <li>• Generators</li>
                                <li>• Trenchers</li>
                                <li>• Cement Mixers</li>
                            </ul>
                        </div>
                    </div>

                    {/* The Free Borrow Enabler */}
                    <div className="bg-slate-900 rounded-2xl p-8 md:p-12 mt-16 text-white flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold md:text-3xl font-serif mb-4 flex items-center gap-3">
                                <Zap className="text-yellow-400 h-8 w-8" />
                                The "Free Borrow" Enabler
                            </h3>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                This is critical for our community. An owner might list a table saw for <strong>$0 (Free)</strong> to help a neighbor, usually taking on huge risk.
                                With the Peace Fund, the renter pays just the $3 fee. The owner earns $0 but gets full protection if the saw breaks.
                            </p>
                            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20 font-mono text-sm">
                                Rental: $0.00 + Peace Fund: $3.00 = <span className="text-safety-orange font-bold">Total $3.00</span>
                            </div>
                        </div>
                        <div className="w-full md:w-64 bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-center">
                                <div className="text-sm text-slate-400 mb-2">Scenario</div>
                                <div className="font-bold text-lg mb-1">Neighbor borrows Table Saw</div>
                                <div className="text-yellow-400 font-bold text-2xl mb-4">Free Rental</div>
                                <hr className="border-white/10 my-4" />
                                <div className="text-left text-sm space-y-2">
                                    <div className="flex justify-between"><span>Owner Risk:</span> <span className="text-green-400">Zero</span></div>
                                    <div className="flex justify-between"><span>Renter Cost:</span> <span>$3.00</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Details */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 mb-12 text-center">What is Covered?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Covered */}
                        <div>
                            <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6" />
                                Included (The Accidents)
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <span className="font-bold text-slate-900 min-w-[100px]">Accidental Damage</span>
                                    <p className="text-slate-600 text-sm">Drops, spills, or electrical shorts that happen during normal, intended use.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-bold text-slate-900 min-w-[100px]">Theft</span>
                                    <p className="text-slate-600 text-sm">If the tool is stolen from the renter (police report required).</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-bold text-slate-900 min-w-[100px]">Vandalism</span>
                                    <p className="text-slate-600 text-sm">Third-party damage while in renter's possession.</p>
                                </div>
                            </div>
                        </div>

                        {/* Excluded */}
                        <div>
                            <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                                <AlertOctagon className="h-6 w-6" />
                                Excluded (The Cost of Business)
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <span className="font-bold text-slate-900 min-w-[100px]">Wear & Tear</span>
                                    <p className="text-slate-600 text-sm">Saw blades dulling, batteries aging, or cosmetic scratches. This is the owner's responsibility.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-bold text-slate-900 min-w-[100px]">Negligence</span>
                                    <p className="text-slate-600 text-sm">Using a wood saw on concrete or leaving tools in the rain. The Renter is fully liable personally.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-50 py-16 border-t border-slate-200 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Ready to rent with peace of mind?</h2>
                    <Link href="/inventory">
                        <Button className="bg-safety-orange hover:bg-orange-600 text-white font-bold h-12 px-8 text-lg shadow-md hover:shadow-lg">
                            Browse Protected Tools
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
