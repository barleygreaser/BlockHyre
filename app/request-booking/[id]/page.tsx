"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import { Textarea } from "@/app/components/ui/textarea";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, Send } from "lucide-react";

// Mock Data (In real app, fetch based on ID)
const TOOL_DATA = {
    id: "chipper-001",
    title: "Commercial Wood Chipper",
    owner: {
        name: "Robert F.",
        image: "https://placehold.co/100x100/e2e8f0/1e293b?text=RF"
    },
    price: {
        daily: 120,
        deposit: 500,
        peaceFundRate: 0.04
    }
};

export default function RequestBookingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState("");

    const fromDate = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date();
    const toDate = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

    const days = differenceInDays(toDate, fromDate) + 1;
    const rentalFee = days * TOOL_DATA.price.daily;
    const peaceFundFee = Math.round(rentalFee * TOOL_DATA.price.peaceFundRate);
    const total = rentalFee + peaceFundFee + TOOL_DATA.price.deposit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would submit the request to the backend
        alert("Request sent successfully!");
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <button onClick={() => router.back()} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </button>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-xl font-serif text-slate-900">Request to Rent</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        {/* Tool Summary */}
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                            <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`https://placehold.co/100x100/e2e8f0/1e293b?text=Tool`} alt="Tool" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{TOOL_DATA.title}</h3>
                                <p className="text-sm text-slate-500">Owner: {TOOL_DATA.owner.name}</p>
                            </div>
                        </div>

                        {/* Dates & Cost */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500">Dates</p>
                                <p className="font-semibold text-slate-900">
                                    {format(fromDate, "MMM d")} - {format(toDate, "MMM d, yyyy")}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500">Total Estimate</p>
                                <p className="font-semibold text-slate-900">${total}</p>
                            </div>
                        </div>

                        {/* Message Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900">Message to Owner</label>
                                <textarea
                                    className="w-full min-h-[120px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-safety-orange/50"
                                    placeholder="Hi Robert, I'd like to rent your chipper for a weekend project..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-bold bg-safety-orange hover:bg-safety-orange/90 text-white">
                                <Send className="mr-2 h-4 w-4" />
                                Send Request
                            </Button>
                        </form>

                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
