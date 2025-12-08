"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Check, X } from "lucide-react";

export default function CommunityGuidelinesPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-slate-50 border-b border-slate-200 py-16">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Community Guidelines</h1>
                    <p className="text-lg text-slate-600">
                        BlockHyre is built on trust. These standards ensure that every extensive renovation project and weekend quick-fix happens safely and respectfully.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 max-w-4xl">

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
                                <Check className="w-5 h-5" />
                            </span>
                            The BlockHyre Standard
                        </h2>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Be Accurate</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Photos must be current. Descriptions must mention quirks. If a saw blade is dull, say so.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Respect the Equipment</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Treat every tool as if it were your own grandmother's. Return it cleaner than you found it.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Communicate Promptly</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Respond to requests within 24 hours. If you're running late for a return, text immediately.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700">
                                <X className="w-5 h-5" />
                            </span>
                            Zero Tolerance
                        </h2>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Discrimination</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Any bias based on race, gender, religion, or background results in an immediate permanent ban.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Off-Platform Transactions</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Taking rentals off BlockHyre voids all insurance and Peace Fund protections.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Safety Negligence</h3>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Providing tools with disabled safety guards or known dangerous defects is strictly prohibited.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl text-center">
                    <h3 className="text-xl font-bold mb-4">See a violation?</h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                        Help us keep the community safe. Reports are anonymous and investigated by our Trust & Safety team.
                    </p>
                    <button className="text-safety-orange hover:text-white font-bold transition-colors underline">
                        Report an Issue
                    </button>
                </div>

            </div>

            <Footer />
        </main>
    );
}
