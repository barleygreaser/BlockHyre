"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    /** Synchronous hint: true if a Supabase session token exists in storage. False means definitely a guest. */
    maybeAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Synchronously checks localStorage for a Supabase auth token.
 * Returns true if a token exists (user might be logged in), false if definitely a guest.
 * This runs before any async calls, eliminating skeleton flash for guests.
 */
const getInitialAuthHint = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        // Supabase stores session under a key like: sb-<project-ref>-auth-token
        const keys = Object.keys(localStorage);
        return keys.some(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    } catch {
        return false;
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [maybeAuthenticated, setMaybeAuthenticated] = useState(false);

    // useLayoutEffect fires synchronously BEFORE the browser paints.
    // This ensures logged-in users see the skeleton on the very first visual frame,
    // while guests never see it at all (localStorage has no token).
    useLayoutEffect(() => {
        setMaybeAuthenticated(getInitialAuthHint());
    }, []);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        // Use the API endpoint to enforce rate limiting and password complexity
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                confirmPassword: password, // Frontend validation should handle mismatch, API requires this field
                fullName,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        return data;
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, maybeAuthenticated, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
