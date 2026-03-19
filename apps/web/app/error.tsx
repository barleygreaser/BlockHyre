"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 py-20">
                <AlertTriangle className="h-16 w-16 text-safety-orange" />
                <div className="space-y-2 max-w-lg">
                    <h1 className="text-3xl font-bold font-serif text-slate-900">
                        Something went wrong
                    </h1>
                    <p className="text-base text-slate-500">
                        {error.message || "We experienced an unexpected error. Our team has been notified."}
                    </p>
                </div>
                <div className="flex gap-4 mt-6">
                    <Button onClick={() => reset()} className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12 px-6">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-300 text-slate-700 h-12 px-6">
                        Return to Homepage
                    </Button>
                </div>
            </div>
            <Footer />
        </main>
    );
}
