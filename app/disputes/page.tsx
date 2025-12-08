"use client";

import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Scale, Gavel, FileText, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DisputesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero */}
            <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
                    <div className="mb-6 flex justify-center">
                        <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Scale className="h-8 w-8 text-safety-orange" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">The Dispute Tribunal</h1>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Conflicts happen. When they do, BlockHyre ensures a fair, transparent, and binding resolution process
                        backed by our impartial Tribunal and the Peace Fund.
                    </p>
                </div>
            </section>

            {/* Process Steps */}
            <section className="py-16 container mx-auto px-4">
                <h2 className="text-3xl font-serif font-bold text-center text-slate-900 mb-12">Resolution Process</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-slate-200 -z-10 transform translate-y-4"></div>

                    {[
                        {
                            icon: AlertTriangle,
                            title: "1. Report Incident",
                            desc: "File a dispute within 24 hours of the rental end date. Provide initial photos and description."
                        },
                        {
                            icon: Lock,
                            title: "2. Funds Frozen",
                            desc: "Security deposits and rental fees are immediately locked in escrow until the case is resolved."
                        },
                        {
                            icon: FileText,
                            title: "3. Evidence Phase",
                            desc: "Both parties have 48 hours to submit timestamped photos, messages, and video evidence."
                        },
                        {
                            icon: Gavel,
                            title: "4. Tribunal Verdict",
                            desc: "Our arbitration team reviews the case. A binding decision is issued within 3 business days."
                        }
                    ].map((step, idx) => (
                        <div key={idx} className="relative bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto md:mx-0">
                                {idx + 1}
                            </div>
                            <step.icon className="h-8 w-8 text-safety-orange mb-4" />
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-600">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* The Peace Fund Explanation */}
            <section className="py-16 bg-white border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                Financial Protection
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">The Peace Fund</h2>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Every rental on BlockHyre contributes a small percentage to the Peace Fund. This is a community insurance pool designed
                                to cover damages in cases where the deposit is insufficient or liability is complex (`force majeure`).
                            </p>

                            <div className="mb-6">
                                <Link href="/peace-fund" className="text-safety-orange font-bold hover:underline inline-flex items-center gap-1">
                                    Read detailed breakdown of the Peace Fund &rarr;
                                </Link>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    "Covers damages up to $2,000 above the deposit",
                                    "Protects against theft during verified rentals",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-safety-orange flex-shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Common Dispute Types</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-100 shadow-sm">
                                    <span className="text-sm font-medium">Tool Damage / Malfunction</span>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">65% of cases</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-100 shadow-sm">
                                    <span className="text-sm font-medium">Late Return</span>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">25% of cases</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded border border-slate-100 shadow-sm">
                                    <span className="text-sm font-medium">Cleanliness / Condition</span>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">10% of cases</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Help CTA */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="text-3xl font-serif font-bold mb-4">Need to file a dispute?</h2>
                    <p className="text-slate-300 mb-8">
                        Access your active rentals to begin the resolution process.
                        Our support team is standing by 24/7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/my-rentals">
                            <Button className="bg-safety-orange hover:bg-orange-600 text-white font-bold h-12 px-8">
                                Go to My Rentals
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
