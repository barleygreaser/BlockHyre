"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ListingsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-serif text-slate-900">
                    Failed to Load Listings
                </h1>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    {error.message || "We encountered an issue while loading the tools. Please try again."}
                </p>
            </div>
            <div className="flex gap-4 mt-2">
                <Button onClick={() => reset()} className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold">
                    Try again
                </Button>
                <Button onClick={() => window.location.href = '/listings'} variant="outline" className="border-slate-300">
                    Back to Listings
                </Button>
            </div>
        </div>
    );
}
