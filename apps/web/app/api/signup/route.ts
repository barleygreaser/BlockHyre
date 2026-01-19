import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_EMAIL_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 100;
const MAX_FULLNAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 30;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
// Security: Strong password policy (8+ chars, uppercase, lowercase, number, special char)
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export async function POST(request: Request) {
    try {
        // Security: Rate Limit (5 requests per minute)
        const ip = (await headers()).get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password, confirmPassword, fullName, username } = body;

        // 1. Input Validation
        if (!email || !password || !confirmPassword || !fullName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate lengths
        if (email.length > MAX_EMAIL_LENGTH) {
            return NextResponse.json({ error: "Email is too long" }, { status: 400 });
        }
        if (fullName.length > MAX_FULLNAME_LENGTH) {
            return NextResponse.json({ error: "Full name is too long" }, { status: 400 });
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
            return NextResponse.json({ error: "Password is too long" }, { status: 400 });
        }

        // Validate formats
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        if (username) {
            if (username.length > MAX_USERNAME_LENGTH) {
                return NextResponse.json({ error: "Username is too long" }, { status: 400 });
            }
            if (!USERNAME_REGEX.test(username)) {
                return NextResponse.json({ error: "Username can only contain letters, numbers, underscores, and hyphens" }, { status: 400 });
            }
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Security: Enforce strong password complexity
        if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." },
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
            console.error("Supabase Auth Signup Error:", authError.message);
            // Security: Don't leak raw auth error messages. Handle specific known errors if needed.
            if (authError.message === "User already registered") {
                return NextResponse.json({ error: "User already exists" }, { status: 409 });
            }
            return NextResponse.json(
                { error: "Account creation failed" },
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

    } catch (error: unknown) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
