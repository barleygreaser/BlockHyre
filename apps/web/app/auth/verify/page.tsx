"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // The actual verification is handled implicitly by Supabase when clicking the link,
        // which redirects to our site with an access_token hash. 
        // Supabase client auto-parses this hash to set the session.
        
        // This page mainly serves as a landing spot to tell the user they're verified
        // if they click a link that points here, or as a general "Check your email" page
        // if they are redirected here after signup.

        const checkParams = () => {
            // If the user lands here with a specific error from Supabase magic link
            const errorParam = searchParams.get('error');
            const errorDesc = searchParams.get('error_description');

            if (errorParam || errorDesc) {
                setStatus('error');
                return;
            }

            // We assume success if we arrived without errors, but give a small delay
            // for UX so they see the spinner briefly.
            const timeout = setTimeout(() => {
                setStatus('success');
            }, 1000);

            return () => clearTimeout(timeout);
        };

        checkParams();
    }, [searchParams]);

    return (
        <CardContent className="space-y-6 p-10 pt-0 text-center flex flex-col items-center">
            {status === 'verifying' && (
                <>
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verifying your email...</CardTitle>
                    <CardDescription>Please wait just a moment.</CardDescription>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                    <CardDescription className="mb-6">
                        Your email address has been successfully confirmed. You can now access your account.
                    </CardDescription>
                    
                    <Button
                        asChild
                        className="w-full max-w-xs bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                    >
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <CardTitle className="text-2xl font-bold text-red-600">Verification Failed</CardTitle>
                    <CardDescription className="mb-6">
                        The verification link may be invalid or has expired. Please try signing in to request a new link, or sign up again.
                    </CardDescription>
                    
                    <Button
                        asChild
                        className="w-full max-w-xs bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                    >
                        <Link href="/auth">Return to Sign In</Link>
                    </Button>
                </>
            )}
        </CardContent>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full shadow-lg border-slate-200">
                    <CardHeader className="text-center pb-2">
                        {/* Title handled dynamically in the component */}
                    </CardHeader>
                    
                    <Suspense fallback={
                        <CardContent className="space-y-6 p-10 pt-0 text-center flex flex-col items-center">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                        </CardContent>
                    }>
                        <VerifyEmailContent />
                    </Suspense>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
