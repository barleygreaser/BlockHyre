"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { ShieldAlert, HardHat, FileSignature } from "lucide-react";

export default function LiabilityPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <ShieldAlert className="h-16 w-16 text-safety-orange mx-auto mb-6" />
                    <h1 className="text-4xl font-serif font-bold mb-4">Liability & Risk Policy</h1>
                    <p className="text-xl text-slate-300">
                        Understanding your rights, responsibilities, and protections when renting tools.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 max-w-4xl">

                <div className="space-y-12">

                    {/* Bodily Injury */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <HardHat className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Bodily Injury Waiver</h2>
                            <div className="prose prose-slate">
                                <p className="font-bold text-slate-700">
                                    By renting a tool on BlockHyre, you expressly acknowledge that tool usage involves inherent risks of physical injury.
                                </p>
                                <p>
                                    BlockHyre and the Tool Owner are <strong>NOT LIABLE</strong> for any bodily injury, incapacity, or death resulting from the use of rented equipment.
                                    The Renter assumes 100% of the safety risk. It is the Renter's responsibility to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mt-2">
                                    <li>Wear appropriate Personal Protective Equipment (PPE).</li>
                                    <li>Read the manufacturer's manual (linked in every listing).</li>
                                    <li>Ensure they have the necessary skill to operate the machinery.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Damage to Equipment */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <FileSignature className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Damage to Equipment</h2>
                            <div className="prose prose-slate">
                                <p>
                                    Any damage incurred during the rental period is the sole responsibility of the Renter.
                                </p>
                                <p>
                                    <strong>Minor Wear & Tear:</strong> (Scratches, paint chips) – No charge.<br />
                                    <strong>Breakage/Malfunction:</strong> Cost of repair deducted from Security Deposit.<br />
                                    <strong>Total Loss:</strong> Replacement cost charged to Renter's payment method.
                                </p>
                                <p className="text-sm bg-slate-50 p-4 border-l-4 border-safety-orange italic">
                                    *The "Peace Fund" may cover costs exceeding the deposit for verifiable accidents, subject to Tribunal review.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Third Party Property */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <ShieldAlert className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Third-Party Property Damage</h2>
                            <div className="prose prose-slate">
                                <p>
                                    If a rented tool causes damage to a third party's property (e.g., a pipe bursts, a car is scratched),
                                    BlockHyre explicitly disclaims all liability. The Renter is solely responsible for ensuring the work area is safe.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>

                <div className="mt-16 p-6 bg-red-50 border border-red-100 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Important Note on High-Powered Tools</h3>
                    <p className="text-red-700">
                        Heavy machinery rentals (excavators, lifts) require Renters to upload a valid Certificate of Insurance (COI)
                        or proof of specialized license before the booking is confirmed.
                    </p>
                </div>

            </div>

            <Footer />
        </main>
    );
}
