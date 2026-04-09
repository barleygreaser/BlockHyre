import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin operations will fail.');
}

/**
 * Supabase client with Service Role Key for server-side admin operations.
 * USE WITH CAUTION: This bypasses all RLS policies.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
