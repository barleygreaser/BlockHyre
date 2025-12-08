import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, fullName, username } = body;

        // 1. Input Validation
        if (!email || !password || !confirmPassword || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Initialize Supabase Client (Admin context if needed, but Anon is fine for signUp)
        // We use the service role key here to ensure we can check the public.users table 
        // without RLS blocking us (if RLS is strict).
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Database Check (Username/Email uniqueness in public.users)
        // Note: auth.users handles email uniqueness, but we check username manually.
        if (username) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .single();

            if (existingUser) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 409 }
                );
            }
        }

        // 3. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username
                }
            }
        });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: "Failed to create user" },
                { status: 500 }
            );
        }

        // 4. Insert into public.users
        // Handled by database trigger 'on_auth_user_created'
        // We rely on the trigger to read raw_user_meta_data and populate public.users

        return NextResponse.json(
            { message: "Account created successfully", user: authData.user },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
