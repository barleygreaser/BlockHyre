
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    full_name: string | null;
    profile_photo_url: string | null;
    email: string | null;
}

export function useUserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchUserAndProfile() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session?.user) {
                    if (mounted) setUser(session.user);

                    // Fetch profile from 'users' table
                    const { data: profileData, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        // If profile doesn't exist, we might want to create one or just ignore for now
                        // For now, we'll log it but not fail hard if it's just missing data
                        console.log('Error fetching user profile:', profileError.message);
                    } else if (mounted) {
                        setProfile(profileData as UserProfile);
                    }
                }
            } catch (err: any) {
                if (mounted) setError(err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchUserAndProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            } else if (session?.user) {
                setUser(session.user);
                // Optionally re-fetch profile here if needed
                if (mounted) {
                    const { data: profileData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (profileData) setProfile(profileData as UserProfile);
                }
            }
        });

        return () => {
            mounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, profile, loading, error };
}
