"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useAuthRedirect(redirectTo: string = "/dashboard") {
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push(redirectTo);
            }
        };

        checkUser();

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
