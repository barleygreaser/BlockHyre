import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const MAX_FULLNAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 30;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // Common bcrypt limit

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

        if (typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string' || typeof fullName !== 'string') {
             return NextResponse.json(
                { error: "Invalid input types" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json(
                { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` },
                { status: 400 }
            );
        }

        if (password.length > MAX_PASSWORD_LENGTH) {
            return NextResponse.json(
                { error: "Password is too long" },
                { status: 400 }
            );
        }

        if (!EMAIL_REGEX.test(email)) {
             return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        if (fullName.length > MAX_FULLNAME_LENGTH) {
            return NextResponse.json(
                { error: "Full name is too long" },
                { status: 400 }
            );
        }

        // Initialize Supabase Client (Admin context)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Security: Ensure we have the service role key for unique username check.
        // We do NOT fallback to ANON key because we need to bypass RLS to check
        // global username availability. Fallback would result in false negatives
        // if RLS blocks reading other users.
        if (!supabaseServiceKey) {
            console.error("Critical Security Error: Missing SUPABASE_SERVICE_ROLE_KEY in environment");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Database Check (Username/Email uniqueness in public.users)
        if (username) {
            if (username.length > MAX_USERNAME_LENGTH) {
                return NextResponse.json(
                    { error: "Username is too long" },
                    { status: 400 }
                );
            }

            if (!USERNAME_REGEX.test(username)) {
                 return NextResponse.json(
                    { error: "Username can only contain letters, numbers, and underscores" },
                    { status: 400 }
                );
            }

            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .single();

            // If there's an error other than "row not found", we should probably handle it
            // but for .single(), it returns error if 0 or >1 rows.
            // We only care if existingUser is returned.

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
            // Security: In production, consider generic error messages to prevent enumeration.
            // For now, we return the message but ensure it's not a raw stack trace.
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

        return NextResponse.json(
            { message: "Account created successfully", user: authData.user },
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
