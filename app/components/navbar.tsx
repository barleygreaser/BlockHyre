"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "./ui/button";
import { Shield, ShoppingCart, Menu, X } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { getUserDisplayName } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function Navbar() {
    const { user, signOut, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Dropdown for desktop user menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile drawer toggle
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const router = useRouter();

    interface UserProfile {
        profile_photo_url: string | null;
        full_name: string | null;
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('users')
                .select('profile_photo_url, full_name')
                .eq('id', user.id)
                .single();

            const profile = data as UserProfile | null;

            if (profile) {
                if (profile.profile_photo_url) setAvatarUrl(profile.profile_photo_url);
                if (profile.full_name) setFullName(profile.full_name);
            }
        };

        fetchUserProfile();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
            setIsMobileMenuOpen(false);
            setAvatarUrl(null);
            setFullName(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white group-hover:bg-safety-orange transition-colors duration-300">
                        <span className="font-serif font-bold">B</span>
                    </div>
                    <span className="text-xl font-bold font-serif tracking-tight text-slate-900 group-hover:text-safety-orange transition-colors duration-300">BlockHyre</span>
                </Link>

                {/* DESKTOP Navigation (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
                    <Link href="/listings" className="hover:text-safety-orange transition-colors duration-200 relative group">
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

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>

                    {/* Desktop Auth/User Actions (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                {/* Fixed Code - Tighter widths to match rendered buttons */}
                                <Skeleton className="h-10 w-[121px]" />  {/* Reduced from 142px */}
                                <Skeleton className="h-10 w-[100px]" />  {/* Reduced from 112px */}
                                <Skeleton className="h-9 w-9 rounded-full" />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/add-tool">
                                    <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold shadow-md">
                                        + List a Tool
                                    </Button>
                                </Link>

                                <Link href="/dashboard">
                                    <Button
                                        className="bg-white hover:bg-slate-50 text-safety-orange border border-safety-orange font-bold shadow-sm"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>

                                {/* Desktop User Menu Dropdown */}
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
                                                    {getUserDisplayName(user, fullName).charAt(0).toUpperCase()}
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
                                                        {getUserDisplayName(user, fullName)}
                                                    </p>
                                                </div>
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
                                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-50">
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

                    {/* Mobile Hamburger Trigger (Visible < md) */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* MOBILE DRAWER (Slide-over) */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col h-full animate-in slide-in-from-right">

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <span className="text-lg font-bold font-serif text-slate-900">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

                            {loading ? (
                                <div className="space-y-6">
                                    {/* key={loading} force re-render if needed, but not necessary inside conditional */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-12 w-full rounded-md" />
                                        <Skeleton className="h-12 w-full rounded-md" />
                                    </div>
                                    <div className="space-y-6 pt-2">
                                        <div className="py-2 border-b border-transparent">
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                        <div className="py-2 border-b border-transparent">
                                            <Skeleton className="h-6 w-32" />
                                        </div>
                                        <div className="py-2 border-b border-transparent">
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                        <div className="py-2 border-b border-transparent">
                                            <Skeleton className="h-6 w-28" />
                                        </div>
                                    </div>
                                </div>
                            ) : user ? (
                                /* Logged In State */
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="User" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xl text-slate-600">
                                                    {getUserDisplayName(user, fullName).charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">Hello, {getUserDisplayName(user, fullName)}!</p>
                                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="space-y-3">
                                        <Link
                                            href="/add-tool"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={buttonVariants({ className: "w-full bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12 text-base shadow-md" })}
                                        >
                                            + List a Tool
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={buttonVariants({ variant: "outline", className: "w-full border-safety-orange text-safety-orange hover:bg-orange-50 font-bold h-12 text-base" })}
                                        >
                                            Dashboard
                                        </Link>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="flex flex-col gap-2">
                                        <Link href="/listings" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            Listings
                                        </Link>
                                        <Link href="/my-rentals" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            My Rentals
                                        </Link>
                                        <Link href="/profile" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            Profile
                                        </Link>
                                        <Link href="/how-it-works" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            How it Works
                                        </Link>
                                        <Link href="#" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            Safety
                                        </Link>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full py-3 text-left text-red-600 font-medium hover:bg-red-50 rounded px-2 transition-colors"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Logged Out State */
                                <>
                                    <div className="space-y-4 pb-6 border-b border-slate-100">
                                        <Link
                                            href="/signup"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={buttonVariants({ className: "w-full bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12 text-lg shadow-md" })}
                                        >
                                            Sign Up Free
                                        </Link>
                                        <Link
                                            href="/auth"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={buttonVariants({ variant: "ghost", className: "w-full text-slate-600 hover:text-slate-900 font-bold text-base hover:bg-slate-50" })}
                                        >
                                            Log In
                                        </Link>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link href="/listings" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            Listings
                                        </Link>
                                        <Link href="/how-it-works" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            How it Works
                                        </Link>
                                        <Link href="#" className="py-3 text-lg font-medium text-slate-700 hover:text-safety-orange border-b border-slate-50" onClick={() => setIsMobileMenuOpen(false)}>
                                            Safety
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
