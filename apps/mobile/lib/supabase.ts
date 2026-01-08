import { setupURLPolyfill } from 'react-native-url-polyfill';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

setupURLPolyfill();

// FILLER INFORMATION - Please replace with your actual Supabase project details
const SUPABASE_URL = 'https://uttbptpkekijlfzvauzu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dGJwdHBrZWtpamxmenZhdXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTQ5OTUsImV4cCI6MjA4MDY5MDk5NX0.Gfg48S06JbT2XK_-RsHRd-C58fxkPUMyaVQA7bXPdXY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
