"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccessMsg('Check your email for a password reset link.');
            setEmail('');
        } catch (error: any) {
            setErrorMsg(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full shadow-lg border-slate-200">
                    <CardHeader>
                        <CardTitle className="mt-2 text-center text-3xl font-extrabold text-slate-900 font-serif">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center text-slate-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 p-10 pt-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <Input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus-visible:ring-safety-orange"
                                />
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{errorMsg}</div>
                            )}

                            {successMsg && (
                                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{successMsg}</div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                                >
                                    {loading ? 'Sending link...' : 'Send reset link'}
                                </Button>
                            </div>

                            <div className="text-center mt-4">
                                <Link href="/auth" passHref className="text-sm font-medium text-slate-600 hover:text-safety-orange transition-colors">
                                    Return to sign in
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
