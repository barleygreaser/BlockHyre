"use client";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useMarketplace, Listing } from "@/app/hooks/use-marketplace";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Loader2, Calendar, CheckCircle } from "lucide-react";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

export default function RequestBookingPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { fetchListing, createRental } = useMarketplace();
    const { user } = useAuth();
    const router = useRouter();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
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

    // Security Check: Prevent users from accessing the request form if they already have a pending request
    useEffect(() => {
        async function checkPendingRequests() {
            if (!user || !listing || loading) return;

            // Check if there's already a pending rental for this user + listing
            const { data: existingRental } = await supabase
                .from('rentals')
                .select('id')
                .eq('listing_id', listing.id)
                .eq('renter_id', user.id)
                .eq('status', 'pending')
                .maybeSingle();

            if (existingRental) {
                // Find the chat to redirect to
                const { data: chat } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('listing_id', listing.id)
                    .eq('renter_id', user.id)
                    .eq('owner_id', listing.owner_id)
                    .maybeSingle();

                toast.error("Request already pending", {
                    description: "Redirecting to your existing request..."
                });

                router.replace(`/messages?listing=${listing.id}${chat ? `&chat=${chat.id}` : ''}`);
            }
        }

        checkPendingRequests();
    }, [user, listing, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !listing || !fromDate || !toDate) {
            toast.error("Missing required information", {
                description: "Please ensure all booking details are provided."
            });
            return;
        }

        setSubmitting(true);

        try {
            // Calculate rental details
            const start = parseISO(fromDate);
            const end = parseISO(toDate);
            const totalDays = differenceInCalendarDays(end, start) + 1;
            const dailyPrice = listing.daily_price || 0;

            // Fetch category for risk fee calculation
            const { data: categoryData } = await supabase
                .from('categories')
                .select('risk_tier')
                .eq('id', listing.category_id)
                .single();

            const riskTier = categoryData?.risk_tier || 0;
            const peaceFundFee = dailyPrice * riskTier * totalDays;
            const rentalFee = dailyPrice * totalDays;
            const totalPaid = rentalFee + peaceFundFee;

            // Step 1: Create rental with pending status
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .insert([{
                    listing_id: listing.id,
                    renter_id: user.id,
                    owner_id: listing.owner_id,
                    start_date: start.toISOString(),
                    end_date: end.toISOString(),
                    total_days: totalDays,
                    daily_price_snapshot: dailyPrice,
                    risk_fee_snapshot: riskTier,
                    rental_fee: rentalFee,
                    peace_fund_fee: peaceFundFee,
                    total_paid: totalPaid,
                    is_barter_deal: false,
                    status: 'pending'
                }])
                .select()
                .single();

            if (rentalError) throw rentalError;

            // Step 2: Create or get chat thread between renter and owner
            const { data: existingChat } = await supabase
                .from('chats')
                .select('id')
                .eq('listing_id', listing.id)
                .eq('owner_id', listing.owner_id)
                .eq('renter_id', user.id)
                .single();

            let chatId = existingChat?.id;

            if (!chatId) {
                // Create new chat thread
                const { data: newChat, error: chatError } = await supabase
                    .from('chats')
                    .insert([{
                        listing_id: listing.id,
                        owner_id: listing.owner_id,
                        renter_id: user.id
                    }])
                    .select()
                    .single();

                if (chatError) throw chatError;
                chatId = newChat.id;
            }

            // Step 3: Send system messages using the RENTAL_REQUEST_SUBMITTED template
            // This sends both owner and renter versions
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            // Fetch owner name
            const { data: ownerData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', listing.owner_id)
                .single();

            // Fetch platform settings for seller fee
            const { data: settingsData } = await supabase
                .from('platform_settings')
                .select('seller_fee_percent')
                .single();

            const sellerFee = settingsData?.seller_fee_percent || 0;

            // Prepare context for template rendering
            const messageContext = {
                tool_name: listing.title,
                renter_name: currentUser?.user_metadata?.full_name || 'Unknown',
                owner_name: ownerData?.full_name || 'Owner',
                start_date: format(start, "MM/dd/yyyy"),
                end_date: format(end, "MM/dd/yyyy"),
                total_paid: totalPaid.toFixed(2),
                seller_fee_percent: sellerFee
            };

            // Send owner's version (recipient = owner)
            const { error: ownerMsgError } = await supabase.rpc('send_system_message', {
                p_chat_id: chatId,
                p_content: `🔔 **Action Required:** New Rental Request for ${listing.title}!\n\n${currentUser?.user_metadata?.full_name || 'A user'} has requested to rent your tool from ${format(start, "MMM d, yyyy")} to ${format(end, "MMM d, yyyy")}.\n\n**Total Price:** $${totalPaid.toFixed(2)}\n**Your Potential Earnings:** $${(totalPaid * (1 - sellerFee / 100)).toFixed(2)}\n\nPlease accept or decline this request within 24 hours.`,
                p_sender_id: listing.owner_id,
                p_recipient_id: listing.owner_id
            });

            if (ownerMsgError) console.error('Error sending owner message:', ownerMsgError);

            // Send renter's version (recipient = renter)
            const { error: renterMsgError } = await supabase.rpc('send_system_message', {
                p_chat_id: chatId,
                p_content: `⏳ Request Sent!\n\nWe have sent your request for the ${listing.title} to ${ownerData?.full_name || 'the owner'}.\n\nYour card will only be charged once the owner accepts the booking. We will notify you as soon as they respond!`,
                p_sender_id: listing.owner_id,
                p_recipient_id: user.id
            });

            if (renterMsgError) console.error('Error sending renter message:', renterMsgError);

            // Also send the custom message if provided
            // Insert twice: once for owner to see, once for renter to see
            if (message.trim()) {
                // Message visible to owner (recipient = owner)
                const { error: ownerCustomMsgError } = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: chatId,
                        sender_id: user.id,
                        content: message.trim(),
                        message_type: 'text',
                        recipient_id: listing.owner_id
                    }]);

                if (ownerCustomMsgError) console.error('Error sending custom message to owner:', ownerCustomMsgError);

                // Message visible to renter (recipient = renter, so they can see their own message)
                const { error: renterCustomMsgError } = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: chatId,
                        sender_id: user.id,
                        content: message.trim(),
                        message_type: 'text',
                        recipient_id: user.id
                    }]);

                if (renterCustomMsgError) console.error('Error sending custom message to renter:', renterCustomMsgError);
            }

            // Success! Show "Sent!" in button
            setSent(true);

            // Wait 1 second to show the "Sent!" state, then redirect
            setTimeout(() => {
                router.replace(`/messages?listing=${listing.id}&chat=${chatId}`);
            }, 1000);

        } catch (error: any) {
            console.error("Error creating booking request:", error);
            toast.error("Failed to send request", {
                description: error.message || "An unexpected error occurred. Please try again."
            });
        } finally {
            setSubmitting(false);
        }
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
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">{listing.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {format(parseISO(fromDate!), "MMM d")} - {format(parseISO(toDate!), "MMM d")}
                                    </span>
                                </div>

                                {/* Owner Information - Inline */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                    {listing.owner?.profile_photo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={listing.owner.profile_photo_url}
                                            alt={listing.owner.full_name || "Owner"}
                                            className="h-8 w-8 rounded-full object-cover bg-slate-100"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-safety-orange to-orange-600 flex items-center justify-center font-bold text-white text-xs">
                                            {listing.owner?.full_name ? listing.owner.full_name.charAt(0).toUpperCase() : 'O'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="font-medium text-slate-700">{listing.owner?.full_name || "Neighbor"}</span>
                                            {listing.owner?.is_id_verified && (
                                                <CheckCircle className="h-3 w-3 text-blue-500" />
                                            )}
                                        </p>
                                    </div>
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
                                    disabled={submitting || sent}
                                >
                                    {sent ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Sent!
                                        </>
                                    ) : submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Request'
                                    )}
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
