"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { AuthGoogleButton } from "@/app/components/auth-google-button";
import { useAuthRedirect } from "@/app/hooks/use-auth-redirect";

export default function AuthPage() {
    useAuthRedirect();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { signIn, signUp } = useAuth();
    const router = useRouter();

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
                router.push('/dashboard'); // Redirect to dashboard after login
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
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-200">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-serif">
                            {isSignUp ? 'Create your account' : 'Sign in to your account'}
                        </h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">

                            {/* Full Name - Only visible during Sign Up */}
                            {isSignUp && (
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <input
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="text-red-500 text-sm text-center">{errorMsg}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-safety-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safety-orange disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                            </button>
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
                            <button
                                type="button"
                                className="text-sm text-safety-orange hover:text-orange-700 font-medium"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}
