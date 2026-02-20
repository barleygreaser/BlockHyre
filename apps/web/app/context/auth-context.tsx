"use client";

import { createContext, useContext, useEffect, useCallback, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserProfile = {
    fullName: string | null;
    profilePhotoUrl: string | null;
    neighborhoodId: string | null;
    neighborhood: {
        name: string;
        centerLat: number;
        centerLon: number;
    } | null;
};

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    /** True if the user is likely authenticated (from server cookie or confirmed session). */
    maybeAuthenticated: boolean;
    /** Centralized user profile data (name, avatar, neighborhood). Null when loading or logged out. */
    userProfile: UserProfile | null;
    /** True while the user profile is being fetched after auth resolves. */
    userProfileLoading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
    /** Server-side auth hint from cookie, enables SSR skeleton rendering for authenticated users. */
    initialAuthHint?: boolean;
}

export function AuthProvider({ children, initialAuthHint = false }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [maybeAuthenticated, setMaybeAuthenticated] = useState(initialAuthHint);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userProfileLoading, setUserProfileLoading] = useState(false);
    // P2: Guard to prevent double-fetching user profile when checkSession + onAuthStateChange
    // both fire for the same user on initial mount
    const lastFetchedUserIdRef = useRef<string | null>(null);

    const fetchUserProfile = useCallback(async (userId: string) => {
        // P2: Skip if we've already fetched for this user
        if (lastFetchedUserIdRef.current === userId) return;
        lastFetchedUserIdRef.current = userId;

        setUserProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from("users")
                .select("full_name, profile_photo_url, neighborhood_id, neighborhoods(name, center_lat, center_lon)")
                .eq("id", userId)
                .single();

            if (error) throw error;

            if (data) {
                const nbRaw = data.neighborhoods as unknown;
                const nb = Array.isArray(nbRaw) ? nbRaw[0] : nbRaw as { name: string; center_lat: number; center_lon: number } | null;
                setUserProfile({
                    fullName: data.full_name,
                    profilePhotoUrl: data.profile_photo_url,
                    neighborhoodId: data.neighborhood_id,
                    neighborhood: nb ? {
                        name: nb.name,
                        centerLat: nb.center_lat,
                        centerLon: nb.center_lon,
                    } : null,
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setUserProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                setMaybeAuthenticated(true);
                fetchUserProfile(session.user.id);
            } else {
                setMaybeAuthenticated(false);
                setUserProfile(null);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                setMaybeAuthenticated(true);
                fetchUserProfile(session.user.id);
            } else {
                setMaybeAuthenticated(false);
                setUserProfile(null);
                // Reset the guard on logout so re-login fetches fresh
                lastFetchedUserIdRef.current = null;
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchUserProfile]);

    const signUp = async (email: string, password: string, fullName: string) => {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                confirmPassword: password,
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
        // Reset the profile guard so a fresh login always fetches the profile
        lastFetchedUserIdRef.current = null;
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
        <AuthContext.Provider value={{
            user, session, loading, maybeAuthenticated,
            userProfile, userProfileLoading,
            signUp, signIn, signOut
        }}>
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
