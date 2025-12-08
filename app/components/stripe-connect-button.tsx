"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, CreditCard } from "lucide-react";

export function StripeConnectButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Please log in first.");
                return;
            }

            const { data, error } = await supabase.functions.invoke('connect-stripe', {
                body: {
                    returnUrl: window.location.origin + '/owner/dashboard',
                    refreshUrl: window.location.origin + '/owner/dashboard',
                },
            });

            if (error) {
                throw error;
            }

            if (data?.url) {
                window.location.href = data.url; // Redirect to Stripe
            }
        } catch (error) {
            console.error("Error linking Stripe:", error);
            alert("Failed to initialize Stripe connection. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-[#635BFF] hover:bg-[#5851E1] text-white font-bold" // Stripe Blurple
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Connect Payouts via Stripe
                </>
            )}
        </Button>
    );
}
