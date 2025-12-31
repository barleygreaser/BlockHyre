import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { CheckCircle, ArrowRight, Calendar, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { SuccessCartClearer } from "./success-cart-clearer";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id: string }> }) {
    const { session_id } = await searchParams;

    if (!session_id) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900">Missing Session</h1>
                        <p className="text-slate-600 mt-2">We couldn't find your rental details. Please check your inventory.</p>
                        <Link href="/inventory">
                            <Button className="mt-6">Go to Inventory</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent']
    });

    const isComplete = session.status === 'complete';
    const customerEmail = session.customer_details?.email;
    const amountTotal = (session.amount_total || 0) / 100;

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Component to clear the cart on the client side */}
            <SuccessCartClearer />

            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        {/* Header Section */}
                        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                            {/* Abstract decorative circles */}
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-safety-orange/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-safety-orange/5 rounded-full blur-3xl" />

                            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4 relative z-10 animate-in zoom-in duration-500">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white relative z-10 font-serif">Rental Confirmed!</h1>
                            <p className="text-slate-400 mt-2 relative z-10">Transaction ID: {session_id.slice(0, 15)}...</p>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Confirmation Sent</p>
                                            <p className="text-slate-900 font-semibold">{customerEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Next Step</p>
                                            <p className="text-slate-900 font-semibold italic">Coordinate with owner for pickup</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Security & Protection</p>
                                            <p className="text-slate-900 font-semibold">Peace Fund Coverage Active</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-sm text-slate-600">
                                        "Safe borrowing, safe lending. You're covered by the Blockhyre Guarantee."
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                                <Link href="/inventory" className="flex-1">
                                    <Button className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 group">
                                        View Your Rentals
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/explore" className="flex-1">
                                    <Button variant="outline" className="w-full h-14 text-lg border-2 rounded-2xl">
                                        Find More Tools
                                    </Button>
                                </Link>
                            </div>

                            <p className="text-center text-xs text-slate-400">
                                Need help? Contact us at <a href="mailto:support@blockhyre.com" className="text-safety-orange hover:underline">support@blockhyre.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
