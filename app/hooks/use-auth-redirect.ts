"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useAuthRedirect(redirectTo: string = "/dashboard") {
    const router = useRouter();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                // User is signed in
                router.push(redirectTo);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, redirectTo]);
}
