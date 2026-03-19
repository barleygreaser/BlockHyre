"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    
    // In Supabase, password reset links go to #access_token=..., but Next.js router
    // might not expose the hash fragment easily here, and Supabase client automatically
    // pulls the session out of the URL if it's there. 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // Once the user clicks the reset link in their email, auth state changes
            // and we update the password on the current user.
            const { error } = await supabase.auth.updateUser({ password });
            
            if (error) {
                throw error;
            }

            setSuccessMsg('Password updated successfully! Redirecting...');
            
            // Redirect to dashboard after a short delay so they can read the success message
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error: any) {
            setErrorMsg(error.message || "Failed to update password. Try requesting a new reset link.");
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
                            Set New Password
                        </CardTitle>
                        <CardDescription className="text-center text-slate-600">
                            Please enter your new password below.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 p-10 pt-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="password"
                                        required
                                        placeholder="New Password (min 6 chars)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="focus-visible:ring-safety-orange"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="password"
                                        required
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="focus-visible:ring-safety-orange"
                                    />
                                </div>
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
                                    disabled={loading || !password || !confirmPassword}
                                    className="w-full bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </main>
    );
}
