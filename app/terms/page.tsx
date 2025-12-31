"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-slate-500 mb-12">Last Updated: December 15, 2025</p>

                <div className="prose prose-slate prose-lg max-w-none">
                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction & Acceptance</h2>
                    <p>
                        Welcome to BlockHyre ("we," "us," or "the Platform"). By accessing our website or using our services, you agree to be bound by these Terms.
                        BlockHyre is a peer-to-peer tool-sharing marketplace designed to facilitate the rental of equipment between neighbors.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Eligibility & Verification</h2>
                    <p>
                        To use BlockHyre, you must be 18 years or older. We enforce a Tiered Verification System to ensure community safety:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Tier 1 & 2 (Low/Med Value):</strong> Requires proof of local residency (within 5 miles of a host).</li>
                        <li><strong>Tier 3 (High Value):</strong> Requires mandatory government-issued ID verification. We reserve the right to suspend any account that fails ongoing verification checks.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. The Peace Fund: Protection Program & Liability Waiver</h2>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3.1 Status: Not an Insurance Policy</h3>
                    <p>
                        The Peace Fund is NOT an insurance policy, is NOT regulated by any insurance authority, and does NOT constitute a contract of indemnification.
                        It is a discretionary community-funded protection program and a damage waiver provided by BlockHyre to facilitate rentals.
                    </p>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3.2 Funding and Discretion</h3>
                    <p>
                        The Peace Fund is a separate financial reserve funded by a mandatory daily fee paid by Renters. Payouts from the Peace Fund are discretionary and final,
                        determined solely by BlockHyre Administration based on evidence submitted (e.g., pre- and post-inspection photos).
                    </p>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3.3 Coverage Limits & Renter Deductibles</h3>
                    <p>
                        The Peace Fund only covers physical damage to the tool itself, up to the maximum coverage limit, after the Renter pays the mandatory Deductible
                        (the Renter’s initial self-retention amount).
                    </p>

                    <div className="overflow-x-auto my-6">
                        <table className="min-w-full border border-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Risk Tier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Renter Deductible (Out-of-Pocket)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Max Peace Fund Coverage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Tier 1 (Low)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">$25.00</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">Up to $300</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Tier 2 (Med)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">$75.00</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">Up to $1,000</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Tier 3 (High)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">$250.00</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">Up to $3,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3.4 Explicit Renter Liability</h3>
                    <p className="mb-2">The Renter explicitly agrees to remain personally liable for:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>The full amount of the Deductible listed above.</li>
                        <li>Any and all damages that exceed the Max Peace Fund Coverage limit (e.g., if a Tier 3 item sustains $5,000 in damage, the Renter is liable for the $2,000 difference plus the $250 deductible).</li>
                        <li>Any damage caused by gross negligence, intentional misuse, or operation under the influence.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">3.5 Security Deposits</h3>
                    <p>
                        For High-Risk (Tier 3) items, BlockHyre may require a Temporary Refundable Security Deposit. This is not the Deductible, but a temporary hold to ensure the Peace Fund reserve is solvent.
                        This deposit is returned upon the safe, timely return of the tool.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Renter Responsibilities</h2>
                    <p className="mb-2">As a Renter, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Safety Gate:</strong> Complete all mandatory safety checklists and review manuals before operating any tool.</li>
                        <li><strong>Proper Use:</strong> Use tools only for their intended purpose and within their rated capacity.</li>
                        <li><strong>Towing & Road Use:</strong> If renting a trailer or towable equipment: YOU MUST MAINTAIN YOUR OWN AUTO LIABILITY INSURANCE. The Peace Fund covers physical damage to the towable equipment but strictly excludes liability for road accidents, injury to third parties, or damage to your vehicle.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Owner Responsibilities</h2>
                    <p className="mb-2">As an Owner, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Safe Condition:</strong> Ensure all tools are in safe working order and all safety guards are intact before listing.</li>
                        <li><strong>Indemnification:</strong> You agree to hold BlockHyre harmless for any injury resulting from the use of your equipment. You retain ownership of the asset and acknowledge that BlockHyre is a facilitator, not a lessee.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Fees & Payments (Revised Section)</h2>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">6.1 Late Fees & Calculation</h3>
                    <p>
                        To ensure optimal community inventory flow and timely returns, items returned after the agreed-upon return time will incur a mandatory late fee.
                        The late fee is based on the <strong>Daily Rental Fee (D)</strong> set by the owner (excluding Platform Fee, Peace Fund Fee, and Security Deposit).
                    </p>
                    <p className="mt-2">We implement a tiered structure based on the delay time (t in hours):</p>

                    <div className="overflow-x-auto my-6">
                        <table className="min-w-full border border-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Delay Time (t)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Fee Applied (L)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">Calculation</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">0 - 0.5 Hours (30 mins)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">$0.00 (Grace Period)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">L = 0</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">0.5 &lt; t ≤ 1 Hour</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">50% of 1 Day's Rental Fee</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">L = 0.5D</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">1 &lt; t ≤ 4 Hours</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">100% of 1 Day's Rental Fee</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">L = D</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">t &gt; 4 Hours</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">Double the Daily Rate<br /><span className="text-xs font-normal text-slate-500">(for the entire delayed period)</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-mono">L = 2D × ⌈ t / 24 ⌉</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="mb-4">
                        <strong>Where:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-6">
                        <li><strong>D:</strong> The original daily rental fee.</li>
                        <li><strong>⌈ t / 24 ⌉:</strong> The total delay time rounded up to the nearest full 24-hour block (extra day).</li>
                    </ul>

                    <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">6.2 Standard Fees</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Rental Fee:</strong> Set by the Owner.</li>
                        <li><strong>Platform Fee:</strong> Charged to sustain the marketplace.</li>
                        <li><strong>Peace Fund Fee:</strong> A mandatory daily fee ($1.50 - $9.00) protecting the rental.</li>
                        <li><strong>Security Deposit:</strong> Temporary refundable hold may be placed on High-Risk (Tier 3) items.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Liability & Release (Waiver of Liability)</h2>
                    <p className="font-bold text-slate-900 mb-4">
                        READ CAREFULLY: YOU ARE ASSUMING ALL OPERATIONAL RISK. BLOCKHYRE IS NOT LIABLE FOR ANY PERSONAL INJURY, DEATH, OR PROPERTY DAMAGE ARISING FROM THE USE OF RENTED TOOLS.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Assumption of Risk:</strong> You acknowledge that operating machinery carries inherent risks. You assume full responsibility for these risks.</li>
                        <li><strong>Waiver:</strong> You release BlockHyre and the tool Owner from all liability for injuries sustained during the rental period, except in cases of gross negligence by the Owner.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Dispute Resolution</h2>
                    <p>
                        Dispute resolution is integrated and based on side-by-side photo comparison and Administrator review. BlockHyre Admin acts as the final arbitrator; decisions are binding.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Prohibited Items</h2>
                    <p>
                        The following may not be listed on BlockHyre: Firearms, explosives, or weapons of any kind; chemicals or hazardous materials; items requiring a specialized professional license to operate (unless Renter proves licensure); recalled items.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Termination</h2>
                    <p>
                        We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-12">
                        <h4 className="text-lg font-bold text-slate-900 mt-0">Contact Us</h4>
                        <p className="mb-0">
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@blockhyre.com" className="text-safety-orange">legal@blockhyre.com</a>.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
