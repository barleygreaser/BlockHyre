"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

import { Button, buttonVariants } from "./ui/button";
import { ShoppingCart, Menu, X, User, Heart } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMessageContext } from "@/app/context/message-context";

export function Navbar() {
    const { user, userProfile, signOut, loading, maybeAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isHomepage = pathname === "/";

    // On non-homepage routes, always show the pill state.
    // On homepage, transition from transparent → pill on scroll.
    const [isScrolled, setIsScrolled] = useState(!isHomepage);
    const [isMounted, setIsMounted] = useState(false);

    // Global unread count hook
    const { unreadCount } = useMessageContext();

    const avatarUrl = userProfile?.profilePhotoUrl ?? null;
    const fullName = userProfile?.fullName ?? null;

    useIsomorphicLayoutEffect(() => {
        // Delay enabling CSS transitions by 1 macrotask so the initial render state doesn't jump
        setTimeout(() => setIsMounted(true), 50);

        if (!isHomepage) {
            setIsScrolled(true);
            return;
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
        };
        // Check scroll immediately to sync state before browser paints
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomepage]);

    const handleSignOut = useCallback(async () => {
        try {
            await signOut();
            router.push("/");
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, [signOut, router]);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 ${isMounted ? "transition-all duration-500 ease-out" : ""} ${isScrolled
                    ? `py-2 px-4 md:px-8 ${!isHomepage ? "bg-gradient-to-b from-black/40 via-black/5 to-transparent" : ""}`
                    : "py-3 px-4 md:px-8"
                    }`}
            >
                <div
                    className={`mx-auto border rounded-full ${isMounted ? "transition-all duration-300 ease-in-out" : ""} ${isScrolled
                        ? "max-w-6xl bg-charcoal/80 backdrop-blur-xl border-safety-orange/20 shadow-2xl shadow-black/20 px-3 lg:px-5 xl:px-6 py-1"
                        : "max-w-[1440px] bg-transparent border-transparent shadow-none px-2 md:px-6 py-1"
                        }`}
                >
                    <div className="flex h-14 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group" aria-label="BlockHyre Home">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${isScrolled
                                ? "bg-safety-orange text-white"
                                : "bg-white/10 backdrop-blur-sm text-white border border-white/20"
                                }`}>
                                <span className="font-serif font-bold text-sm">B</span>
                            </div>
                            <span className={`text-lg font-bold font-serif tracking-tight transition-colors duration-300 ${isScrolled ? "text-white" : "text-white"
                                }`}>
                                BlockHyre
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
                            <Link
                                href="/listings"
                                className={`text-xs xl:text-sm font-semibold tracking-wide uppercase transition-colors duration-200 relative group whitespace-nowrap ${isScrolled ? "text-concrete hover:text-safety-orange" : "text-white/80 hover:text-white"
                                    }`}
                            >
                                Listings
                            </Link>
                            <Link
                                href="/how-it-works"
                                className={`text-xs xl:text-sm font-semibold tracking-wide uppercase transition-colors duration-200 relative group whitespace-nowrap ${isScrolled ? "text-concrete hover:text-safety-orange" : "text-white/80 hover:text-white"
                                    }`}
                            >
                                How it Works
                            </Link>
                            <Link
                                href="/peace-fund"
                                className={`text-xs xl:text-sm font-semibold tracking-wide uppercase transition-colors duration-200 relative group whitespace-nowrap ${isScrolled ? "text-concrete hover:text-safety-orange" : "text-white/80 hover:text-white"
                                    }`}
                            >
                                Peace Fund
                            </Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 lg:gap-2 xl:gap-3">
                            {/* Operational Indicator */}
                            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 mr-1 xl:mr-2">
                                <div className="relative">
                                    <div className="h-2 w-2 rounded-full bg-safety-orange animate-pulse-operational" />
                                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-safety-orange/40 animate-ping" />
                                </div>
                                <span className={`hidden xl:inline text-[10px] font-bold uppercase tracking-[0.15em] ${isScrolled ? "text-safety-orange" : "text-safety-orange"
                                    }`}>
                                    Operational
                                </span>
                            </div>

                            {/* Mobile User Button */}
                            <Link href={user ? "/dashboard" : "/auth"} className="lg:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`${isScrolled ? "text-concrete hover:text-white hover:bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                                    aria-label="User Account"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>

                            {/* Cart */}
                            <Link href="/cart">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`relative ${isScrolled ? "text-concrete hover:text-white hover:bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                                    aria-label="Shopping Cart"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                </Button>
                            </Link>

                            {/* Desktop Auth/User Actions */}
                            <div className="hidden lg:flex items-center gap-2 xl:gap-3 transition-all duration-300 min-w-[170px] justify-end">
                                {loading ? (
                                    maybeAuthenticated ? (
                                        <div className="flex items-center gap-2 xl:gap-3 opacity-60">
                                            <Skeleton className="h-9 w-[120px] xl:w-[135px] rounded-full bg-safety-orange/40" />
                                            <Skeleton className="h-9 w-[95px] xl:w-[110px] rounded-full bg-white/10" />
                                            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 xl:gap-3 opacity-60">
                                            <Skeleton className="h-9 w-[65px] rounded-full bg-white/5" />
                                            <Skeleton className="h-9 w-[90px] rounded-full bg-safety-orange/40" />
                                        </div>
                                    )
                                ) : user ? (
                                    <div className="flex items-center gap-2 xl:gap-3">
                                        <Link href="/add-tool">
                                            <Button className="nav-cta-magnetic bg-safety-orange hover:bg-safety-orange-hover text-white font-bold text-xs uppercase tracking-wider rounded-full px-3 xl:px-5 h-9 shadow-lg shadow-safety-orange/20 transition-all duration-300 hover:shadow-xl hover:shadow-safety-orange/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md active:shadow-safety-orange/20">
                                                + List a Tool
                                            </Button>
                                        </Link>

                                        <Link href="/dashboard">
                                            <Button className={`font-bold text-xs uppercase tracking-wider rounded-full px-3 xl:px-5 h-9 transition-all duration-300 ${isScrolled
                                                ? "bg-white/10 text-white border border-white/20 hover:border-safety-orange/60 hover:bg-safety-orange/10 hover:text-safety-orange hover:shadow-[0_0_12px_rgba(255,107,0,0.15)]"
                                                : "bg-white/10 text-white border border-white/20 hover:border-safety-orange/60 hover:bg-safety-orange/10 hover:text-safety-orange hover:shadow-[0_0_12px_rgba(255,107,0,0.15)]"
                                                }`}>
                                                Dashboard
                                            </Button>
                                        </Link>

                                        {/* User Menu Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                className="flex items-center gap-2 focus:outline-none relative"
                                                aria-label="User Menu"
                                                aria-expanded={isMenuOpen}
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsMenuOpen(!isMenuOpen); }}
                                            >
                                                <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 relative ${isScrolled
                                                    ? "bg-white/10 border border-white/20 hover:ring-2 hover:ring-safety-orange/60 hover:ring-offset-2 hover:ring-offset-charcoal hover:shadow-[0_0_16px_rgba(255,107,0,0.25)]"
                                                    : "bg-white/10 border border-white/20 hover:ring-2 hover:ring-safety-orange/60 hover:ring-offset-2 hover:ring-offset-transparent hover:shadow-[0_0_16px_rgba(255,107,0,0.25)]"
                                                    }`}>
                                                    {avatarUrl ? (
                                                        <Image
                                                            src={avatarUrl}
                                                            alt="User Avatar"
                                                            fill
                                                            className="object-cover"
                                                            sizes="32px"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-sm text-white">
                                                            {getUserDisplayName(user, fullName).charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <Badge
                                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-safety-orange hover:bg-safety-orange text-white border-charcoal border-2 text-[10px]"
                                                    >
                                                        {unreadCount}
                                                    </Badge>
                                                )}
                                            </button>

                                            {isMenuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    />
                                                    <div className="absolute right-0 top-[calc(100%+20px)] w-56 bg-charcoal/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-1.5 border border-safety-orange/20 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="px-3 py-2.5 mb-1.5 border-b border-white/10">
                                                            <p className="text-[10px] font-mono font-bold text-concrete/40 uppercase tracking-[0.2em] mb-1">
                                                                Sys_User
                                                            </p>
                                                            <p className="text-sm font-bold text-white truncate">
                                                                {getUserDisplayName(user, fullName)}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            href="/profile"
                                                            className="flex items-center px-3 py-2.5 text-sm font-medium text-concrete hover:text-safety-orange hover:bg-safety-orange/10 rounded-xl transition-colors"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            href="/messages"
                                                            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-concrete hover:text-safety-orange hover:bg-safety-orange/10 rounded-xl transition-colors"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            <span>Messages</span>
                                                            {unreadCount > 0 && (
                                                                <Badge className="bg-safety-orange hover:bg-safety-orange text-white border-0 text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full">{unreadCount}</Badge>
                                                            )}
                                                        </Link>
                                                        <Link
                                                            href="/my-rentals"
                                                            className="flex items-center px-3 py-2.5 text-sm font-medium text-concrete hover:text-safety-orange hover:bg-safety-orange/10 rounded-xl transition-colors"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            My Rentals
                                                        </Link>
                                                        <Link
                                                            href="/favorites"
                                                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-concrete hover:text-safety-orange hover:bg-safety-orange/10 rounded-xl transition-colors"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                            My Favorites
                                                        </Link>
                                                        <div className="border-t border-white/10 mt-1.5 pt-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    handleSignOut();
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => { if (e.key === "Enter") { handleSignOut(); setIsMenuOpen(false); } }}
                                                            >
                                                                Log Out
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/auth">
                                            <Button
                                                variant="ghost"
                                                className={`font-bold text-xs uppercase tracking-wider rounded-full px-5 h-9 ${isScrolled
                                                    ? "text-concrete hover:text-white hover:bg-white/10"
                                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                                    }`}
                                            >
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold text-xs uppercase tracking-wider rounded-full px-5 h-9 shadow-lg shadow-safety-orange/20 transition-all hover:shadow-safety-orange/40 hover:scale-105">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Hamburger */}
                            <button
                                className={`lg:hidden p-2 relative transition-colors ${isScrolled ? "text-concrete hover:text-white" : "text-white/80 hover:text-white"
                                    }`}
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Open menu"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") setIsMobileMenuOpen(true); }}
                            >
                                <Menu className="h-5 w-5" />
                                {user && unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-safety-orange" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE DRAWER */}
                {isMobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-charcoal shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col h-full animate-in slide-in-from-right">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-safety-orange animate-pulse-operational" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-concrete">Menu</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-concrete/60 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                    aria-label="Close menu"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === "Enter") setIsMobileMenuOpen(false); }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                                {loading ? (
                                    <div className="space-y-6 opacity-60">
                                        {maybeAuthenticated ? (
                                            <>
                                                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                                    <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                                                        <Skeleton className="h-4 w-1/2 bg-white/10" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Skeleton className="h-12 w-full rounded-xl bg-safety-orange/40" />
                                                    <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-4 pb-6 border-b border-white/10">
                                                    <Skeleton className="h-12 w-full rounded-xl bg-safety-orange/40" />
                                                    <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                                                </div>
                                                <div className="flex flex-col gap-4 pt-2">
                                                    <Skeleton className="h-5 w-24 bg-white/5 rounded" />
                                                    <Skeleton className="h-5 w-32 bg-white/5 rounded" />
                                                    <Skeleton className="h-5 w-28 bg-white/5 rounded" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : user ? (
                                    <>
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                            <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center relative">
                                                {avatarUrl ? (
                                                    <Image
                                                        src={avatarUrl}
                                                        alt="User"
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-xl text-white">
                                                        {getUserDisplayName(user, fullName).charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white truncate">{getUserDisplayName(user, fullName)}</p>
                                                <p className="text-sm text-concrete/60 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Primary Actions */}
                                        <div className="space-y-3">
                                            <Link
                                                href="/add-tool"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={buttonVariants({ className: "w-full bg-safety-orange hover:bg-safety-orange-hover text-white font-bold h-12 text-base shadow-lg shadow-safety-orange/20 rounded-xl uppercase tracking-wider" })}
                                            >
                                                + List a Tool
                                            </Link>
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={buttonVariants({ variant: "outline", className: "w-full border-white/20 text-white hover:bg-white/5 font-bold h-12 text-base rounded-xl uppercase tracking-wider" })}
                                            >
                                                Dashboard
                                            </Link>
                                        </div>

                                        {/* Navigation Links */}
                                        <div className="flex flex-col">
                                            <Link href="/listings" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                Listings
                                            </Link>
                                            <Link href="/messages" className="flex items-center justify-between py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                <span>Messages</span>
                                                {unreadCount > 0 && (
                                                    <Badge className="bg-safety-orange hover:bg-safety-orange text-[10px]">{unreadCount}</Badge>
                                                )}
                                            </Link>
                                            <Link href="/my-rentals" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                My Rentals
                                            </Link>
                                            <Link href="/favorites" className="flex items-center gap-2 py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Heart className="h-4 w-4 text-red-400" />
                                                My Favorites
                                            </Link>
                                            <Link href="/profile" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                Profile
                                            </Link>
                                            <Link href="/how-it-works" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                How it Works
                                            </Link>
                                            <Link href="/peace-fund" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                Peace Fund
                                            </Link>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-auto pt-4 border-t border-white/10">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full py-3 text-left text-red-400 font-medium hover:bg-red-500/10 rounded-lg px-3 transition-colors"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === "Enter") handleSignOut(); }}
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-4 pb-6 border-b border-white/10">
                                            <Link
                                                href="/signup"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={buttonVariants({ className: "w-full bg-safety-orange hover:bg-safety-orange-hover text-white font-bold h-12 text-lg shadow-lg shadow-safety-orange/20 rounded-xl uppercase tracking-wider" })}
                                            >
                                                Sign Up
                                            </Link>
                                            <Link
                                                href="/auth"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={buttonVariants({ variant: "ghost", className: "w-full text-concrete hover:text-white font-bold text-base hover:bg-white/5 rounded-xl" })}
                                            >
                                                Log In
                                            </Link>
                                        </div>

                                        <div className="flex flex-col">
                                            <Link href="/listings" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                Listings
                                            </Link>
                                            <Link href="/how-it-works" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                How it Works
                                            </Link>
                                            <Link href="/peace-fund" className="py-3.5 text-base font-medium text-concrete hover:text-safety-orange border-b border-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                Peace Fund
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* Spacer to push content below fixed navbar on non-homepage routes */}
            {!isHomepage && <div className="h-20" />}
        </>
    );
}
