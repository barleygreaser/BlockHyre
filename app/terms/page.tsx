"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-slate-500 mb-12">Last Updated: December 8, 2025</p>

                <div className="prose prose-slate prose-lg max-w-none">
                    <p className="lead text-xl text-slate-700">
                        Welcome to BlockShare. Please read these Terms of Service ("Terms") carefully. By accessing or using our platform,
                        you agree to be bound by these Terms and all terms incorporated by reference.
                    </p>

                    <h3>1. Definitions</h3>
                    <p>
                        <strong>"BlockShare"</strong> refers to the online marketplace platform.
                        <strong>"Owner"</strong> refers to a user listing items for rent.
                        <strong>"Renter"</strong> refers to a user requesting to rent items.
                        <strong>"Item"</strong> or <strong>"Tool"</strong> refers to the equipment listed on the platform.
                    </p>

                    <h3>2. Eligibility</h3>
                    <p>
                        You must be at least 18 years old to use BlockShare. By creating an account, you verify that you have the
                        legal capacity to enter into binding contracts.
                    </p>

                    <h3>3. User Responsibilities</h3>
                    <ul>
                        <li><strong>Owners:</strong> You warrant that your tools are safe, functional, and fit for purpose. You must disclose all known defects.</li>
                        <li><strong>Renters:</strong> You agree to use tools only for their intended purpose and within your skill level. You accept full responsibility for any injury or damage caused during use.</li>
                    </ul>

                    <h3>4. Fees and Payments</h3>
                    <p>
                        BlockShare charges a service fee on each transaction.
                        Rentals may also include a "Peace Fund" contribution (insurance pool) and a refundable security deposit.
                        Payment is processed immediately upon booking confirmation.
                    </p>

                    <h3>5. Cancellations</h3>
                    <p>
                        <strong>Renters:</strong> Full refund if cancelled 24+ hours before start time. 50% refund if cancelled within 24 hours.
                        <br />
                        <strong>Owners:</strong> Cancellations by owners are penalized and may result in account suspension.
                    </p>

                    <h3>6. Liability and Indemnification</h3>
                    <p>
                        BlockShare provides the platform but is not a party to the rental contract.
                        Please refer to our <a href="/liability" className="text-safety-orange underline">Liability Policy</a> for specific details regarding damages, theft, and bodily injury.
                    </p>

                    <h3>7. Dispute Resolution</h3>
                    <p>
                        All disputes arising from rental usage must be filed through the <a href="/disputes" className="text-safety-orange underline">Dispute Tribunal</a> within 24 hours of the rental end date.
                        You agree to be bound by the decision of the BlockShare arbitration team.
                    </p>

                    <h3>8. Termination</h3>
                    <p>
                        We reserve the right to suspend or terminate accounts that violate our Community Guidelines, specifically regarding safety negligence or off-platform transactions.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-12">
                        <h4 className="text-lg font-bold text-slate-900 mt-0">Contact Us</h4>
                        <p className="mb-0">
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@blockshare.com" className="text-safety-orange">legal@blockshare.com</a>.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
