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

                    {/* Assumption of Risk */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <HardHat className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Assumption of Risk</h2>
                            <div className="prose prose-slate">
                                <p>
                                    You voluntarily assume all risk of personal injury, death, or property damage that may arise from the use, operation, transportation, or malfunction of the rented tool.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Owner Safety Requirement */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <FileSignature className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Owner Safety Requirement</h2>
                            <div className="prose prose-slate">
                                <p>
                                    You acknowledge that the Tool Owner is required to provide the Manufacturer's Operating Manual (digital or physical) for this tool.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Renter Skill & Safety Certification */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <ShieldAlert className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Renter Skill & Safety Certification <span className="text-base font-normal text-slate-500">(Tier 3 Tools ONLY)</span></h2>
                            <div className="prose prose-slate">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>You certify that you possess the necessary skill and experience to safely operate this specific machinery.</li>
                                    <li>You certify that you have read and understood the Manufacturer's Operating Manual provided by the Owner.</li>
                                    <li>You certify that you will wear all appropriate Personal Protective Equipment (PPE) required for the safe operation of this tool (e.g., safety glasses, gloves, respirators, hearing protection).</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Waiver of Liability */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <FileSignature className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Waiver of Liability</h2>
                            <div className="prose prose-slate">
                                <p className="font-bold text-slate-900">
                                    You irrevocably waive any right to claim against BlockHyre, Inc. and the Tool Owner for personal injury, death, or property damage resulting from your use of the equipment.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Peace Fund is NOT Insurance */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <ShieldAlert className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Peace Fund is NOT Insurance</h2>
                            <div className="prose prose-slate">
                                <p>
                                    You understand that the Peace Fund is NOT an insurance policy and does not cover personal injury or third-party property damage. The Fund only applies to physical damage to the rented tool itself, and your coverage is strictly limited to the Tier's maximum payout (e.g., Tier 3 maximum coverage is $3,000).
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200" />

                    {/* Renter is Liable */}
                    <section className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">
                            <ShieldAlert className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Renter is Liable</h2>
                            <div className="prose prose-slate">
                                <p>
                                    You accept that you are personally liable for the mandatory Deductible and for all repair or replacement costs that exceed the Peace Fund's maximum coverage.
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



                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-12">
                    <h4 className="text-lg font-bold text-slate-900 mt-0">Contact Us</h4>
                    <p className="mb-0">
                        If you have any questions about this Policy, please contact us at <a href="mailto:legal@blockhyre.com" className="text-safety-orange">legal@blockhyre.com</a>.
                    </p>
                </div>

            </div>

            <Footer />
        </main >
    );
}
