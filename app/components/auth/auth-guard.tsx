"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Determine if we should redirect or 404.
                // For security hardening of "owner" routes, we often prefer 404 to hide existence.
                // However, standard "dashboard" access might just want a redirect.
                // Given the instructions: "unauthorized users ... must be blocked ... receiving a 404"
                notFound();
            } else {
                setIsChecking(false);
            }
        }
    }, [user, loading, router]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-safety-orange" />
            </div>
        );
    }

    return <>{children}</>;
}
