"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Shield, ShoppingCart } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";

export function Navbar() {
    const { user, signOut, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAvatar = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('users')
                .select('profile_photo_url')
                .eq('id', user.id)
                .single();

            if (data?.profile_photo_url) {
                setAvatarUrl(data.profile_photo_url);
            }
        };

        fetchAvatar();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="border-b border-slate-200 bg-white relative z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white group-hover:bg-safety-orange transition-colors duration-300">
                        <span className="font-serif font-bold">B</span>
                    </div>
                    <span className="text-xl font-bold font-serif tracking-tight text-slate-900 group-hover:text-safety-orange transition-colors duration-300">BlockHyre</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
                    <Link href="/inventory" className="hover:text-safety-orange transition-colors duration-200 relative group">
                        Listings
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-safety-orange transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="/how-it-works" className="hover:text-safety-orange transition-colors duration-200 relative group">
                        How it Works
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-safety-orange transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#" className="hover:text-safety-orange transition-colors duration-200 relative group">
                        Safety
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-safety-orange transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>

                    {loading ? (
                        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-md" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/add-tool">
                                <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md hidden sm:flex">
                                    + List a Tool
                                </Button>
                            </Link>

                            <Link href="/owner/dashboard">
                                <Button
                                    className="bg-white hover:bg-slate-50 text-safety-orange border border-safety-orange font-bold shadow-sm hidden sm:flex"
                                >
                                    Dashboard
                                </Button>
                            </Link>

                            {/* Mobile/Tablet Menu Trigger */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-safety-orange/50 transition-all">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="User Avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-600">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {isMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-slate-100 z-50">
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/add-tool"
                                                className="block sm:hidden px-4 py-2 text-sm text-safety-orange font-bold hover:bg-slate-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                + List a Tool
                                            </Link>
                                            <Link
                                                href="/owner/dashboard"
                                                className="block sm:hidden px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/my-rentals"
                                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                My Rentals
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleSignOut();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="ghost" className="hidden sm:flex text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-50">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
