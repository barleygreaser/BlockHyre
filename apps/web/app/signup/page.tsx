"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/app/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

import { AuthGoogleButton } from "@/app/components/auth-google-button";
import { useAuthRedirect } from "@/app/hooks/use-auth-redirect";

export default function SignupPage() {
    useAuthRedirect(); // Redirect if already logged in
    const router = useRouter();
    const searchParams = useSearchParams();
    const intent = searchParams.get('intent');
    // ... (rest of state)


    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all required fields.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account");
            }

            setSuccess(true);
            setTimeout(() => {
                const intentQuery = intent ? `?intent=${intent}` : '';
                router.push(`/auth${intentQuery}`); // Redirect to login page
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-200">

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
                            {intent === 'list-tool'
                                ? "Turn Your Idle Equipment Into Income"
                                : "Create your account"
                            }
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {intent === 'list-tool'
                                ? "Join the community to safely rent out high-value tools and earn."
                                : "Join the community to rent and share tools."
                            }
                        </p>
                    </div>

                    {success ? (
                        <div className="rounded-md bg-green-50 p-4 border border-green-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Account created successfully!</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>Redirecting you to login...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                        Username <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="johndoe123"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="Min. 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-safety-orange focus:border-safety-orange sm:text-sm"
                                        placeholder="Re-enter password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-safety-orange hover:bg-safety-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safety-orange shadow-md h-12"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
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
                                <p className="text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link href="/auth" className="font-medium text-safety-orange hover:text-orange-700">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
