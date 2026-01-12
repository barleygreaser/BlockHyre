"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { AuthGoogleButton } from "@/app/components/auth-google-button";
import { useAuthRedirect } from "@/app/hooks/use-auth-redirect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const intent = searchParams.get('intent');

    // If intent is list-tool, redirect to /add-tool if already logged in
    useAuthRedirect(intent === 'list-tool' ? '/add-tool' : '/dashboard');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Sign Up Logic
                await signUp(email, password, fullName);
                alert('Check your email for the confirmation link!');
            } else {
                // Sign In Logic
                await signIn(email, password);
                if (intent === 'list-tool') {
                    router.push('/add-tool');
                } else {
                    router.push('/dashboard'); // Redirect to dashboard after login
                }
            }
        } catch (error: any) {
            setErrorMsg(error.message || "An error occurred");
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
                            {isSignUp ? 'Create your account' : 'Sign in to your account'}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6 p-10 pt-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">

                                {/* Full Name - Only visible during Sign Up */}
                                {isSignUp && (
                                    <div>
                                        <Input
                                            type="text"
                                            required
                                            placeholder="Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="focus-visible:ring-safety-orange"
                                        />
                                    </div>
                                )}

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
                                <div>
                                    <Input
                                        type="password"
                                        required
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="focus-visible:ring-safety-orange"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm text-center">{errorMsg}</div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-safety-orange hover:bg-orange-600 text-white font-medium focus-visible:ring-safety-orange"
                                >
                                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                                </Button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div>
                                <AuthGoogleButton />
                            </div>

                            <div className="text-center mt-4">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-safety-orange hover:text-orange-700 font-medium p-0 h-auto"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                >
                                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
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
