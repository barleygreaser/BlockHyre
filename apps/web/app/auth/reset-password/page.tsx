"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Loader2, KeyRound, AlertTriangle } from 'lucide-react';

type PageStatus = 'loading' | 'ready' | 'error' | 'success';

function ResetPasswordContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [pageStatus, setPageStatus] = useState<PageStatus>('loading');

    const router = useRouter();
    const searchParams = useSearchParams();

    // On mount, exchange the recovery code (from the email link) for a valid session.
    // Supabase uses PKCE flow: the link lands here with ?code=... in the URL.
    // Without this exchange, updateUser() will fail with "Auth session missing!".
    useEffect(() => {
        const exchangeCode = async () => {
            const code = searchParams.get('code');

            if (!code) {
                // No code in URL — user may have landed here directly or link has no code
                // Check if there's already a valid recovery session (e.g. hash-based implicit flow)
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setPageStatus('ready');
                } else {
                    setErrorMsg('Invalid or missing reset link. Please request a new one.');
                    setPageStatus('error');
                }
                return;
            }

            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Code exchange error:', error);
                setErrorMsg('This reset link has expired or is invalid. Please request a new one.');
                setPageStatus('error');
            } else {
                setPageStatus('ready');
            }
        };

        exchangeCode();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }

        setSubmitLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setPageStatus('success');

            // Sign out all other sessions after password change for security
            await supabase.auth.signOut({ scope: 'others' });

            setTimeout(() => {
                router.push('/auth');
            }, 2500);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to update password. Please request a new reset link.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <CardContent className="space-y-6 p-10 pt-4">
            {/* Loading: exchanging code */}
            {pageStatus === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <Loader2 className="h-10 w-10 text-safety-orange animate-spin" />
                    <p className="text-slate-600 text-sm">Verifying your reset link...</p>
                </div>
            )}

            {/* Error: invalid/expired link */}
            {pageStatus === 'error' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="h-7 w-7 text-red-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 mb-1">Link Invalid or Expired</p>
                        <p className="text-slate-500 text-sm">{errorMsg}</p>
                    </div>
                    <Button
                        asChild
                        className="w-full bg-safety-orange hover:bg-orange-600 text-white"
                    >
                        <Link href="/profile">Go back to Profile to request a new link</Link>
                    </Button>
                    <Link href="/auth" className="text-sm text-slate-500 hover:text-safety-orange transition-colors">
                        Return to Sign In
                    </Link>
                </div>
            )}

            {/* Success */}
            {pageStatus === 'success' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                        <KeyRound className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 mb-1">Password Updated!</p>
                        <p className="text-slate-500 text-sm">Redirecting you to sign in...</p>
                    </div>
                </div>
            )}

            {/* Form: ready to set new password */}
            {pageStatus === 'ready' && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <Input
                            id="new-password"
                            type="password"
                            required
                            placeholder="New Password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="focus-visible:ring-safety-orange"
                            aria-label="New password"
                        />
                        <Input
                            id="confirm-password"
                            type="password"
                            required
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="focus-visible:ring-safety-orange"
                            aria-label="Confirm new password"
                        />
                    </div>

                    {errorMsg && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    <Button
                        type="submit"
                        id="update-password-btn"
                        disabled={submitLoading || !password || !confirmPassword}
                        className="w-full bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                    >
                        {submitLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                            </span>
                        ) : (
                            'Update Password'
                        )}
                    </Button>
                </form>
            )}
        </CardContent>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full shadow-lg border-slate-200">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-extrabold text-slate-900 font-serif">
                            Set New Password
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Please enter your new password below.
                        </CardDescription>
                    </CardHeader>

                    <Suspense fallback={
                        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                            <Loader2 className="h-10 w-10 text-safety-orange animate-spin" />
                            <p className="text-slate-600 text-sm">Loading...</p>
                        </CardContent>
                    }>
                        <ResetPasswordContent />
                    </Suspense>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
