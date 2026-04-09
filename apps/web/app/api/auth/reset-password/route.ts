import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { PasswordResetEmail } from '@/emails/password-reset';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 401 });
    }

    // 2. Determine if the user was created with an email (not OAuth)
    // Supabase stores this in the 'app_metadata' or we can just check if they have a password
    // Actually, even OAuth users might want to set a password, but typically it's for email users.
    const isEmailUser = user.app_metadata.provider === 'email';

    if (!isEmailUser) {
        return NextResponse.json({ 
            error: 'Password reset is only available for accounts created with email. Accounts using Google or other providers should manage their security through that provider.' 
        }, { status: 400 });
    }

    try {
        // 3. Generate the recovery link
        // This link will look something like: http://localhost:3000/#recovery_token=...
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: user.email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
            }
        });

        if (linkError || !linkData.properties?.action_link) {
            console.error('Error generating recovery link:', linkError);
            return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
        }

        const resetLink = linkData.properties.action_link;

        // 4. Send the email via Resend
        const emailResult = await sendEmail({
            to: user.email,
            subject: 'Reset your BlockHyre password',
            react: PasswordResetEmail({
                userEmail: user.email,
                resetLink: resetLink,
            }),
        });

        if (!emailResult.success) {
            return NextResponse.json({ error: emailResult.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Reset email sent!' });
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
}
