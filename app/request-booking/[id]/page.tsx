"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";
import { Loader2, Calendar } from "lucide-react";
import dayjs from "dayjs";

export default function RequestBookingPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { fetchListing } = useMarketplace();
    const router = useRouter();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    useEffect(() => {
        if (id) {
            fetchListing(id as string).then(data => {
                setListing(data);
                setLoading(false);
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would create a 'pending' rental request
        alert("Request sent to owner!");
        router.push('/inventory');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
            </div>
        );
    }

    if (!listing) return null;

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Request to Rent</h1>
                    <p className="text-slate-600 mb-8">Send a message to the owner to request this tool.</p>

                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
                        <div className="flex gap-4 mb-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={listing.images?.[0]} alt={listing.title} className="w-24 h-24 object-cover rounded-md bg-slate-100" />
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{listing.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {dayjs(fromDate).format("MMM D")} - {dayjs(toDate).format("MMM D")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Message to Owner</label>
                                <textarea
                                    className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-safety-orange/50 focus:border-safety-orange outline-none resize-none"
                                    placeholder="Hi! I'd like to rent this for a weekend project..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            {listing.accepts_barter && (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-emerald-800">
                                    <strong>🍓 Barter Available:</strong> This owner accepts barter! Mention what you can offer in your message.
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-safety-orange hover:bg-safety-orange/90 text-white font-bold"
                                >
                                    Send Request
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
