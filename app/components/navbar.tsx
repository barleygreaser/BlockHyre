"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { Shield, ShoppingCart } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";

export function Navbar() {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b border-slate-200 bg-white relative z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white group-hover:bg-safety-orange transition-colors duration-300">
                        <span className="font-serif font-bold">B</span>
                    </div>
                    <span className="text-xl font-bold font-serif tracking-tight text-slate-900 group-hover:text-safety-orange transition-colors duration-300">BlockShare</span>
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

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                    {/* Try to use the user's uploaded avatar, fallback to initial */}
                                    {/* Note: user metadata might not be immediately updated, so we might need to rely on the profile fetch or context update. For now using basic metadata if available. */}
                                    {/* In a real app, we'd sync this better. */}
                                    <span className="font-bold text-slate-600">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
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
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/owner/dashboard"
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Owner Dashboard
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
                                                signOut();
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
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="outline" className="hidden sm:flex bg-white text-slate-900 border-slate-200 hover:bg-slate-50 font-bold">
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
