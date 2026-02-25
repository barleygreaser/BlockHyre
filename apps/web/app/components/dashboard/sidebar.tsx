"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Home, Wrench, MessageSquare, User, Heart, LogOut, Package, Menu, X } from "lucide-react";

export function DashboardSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, signOut } = useAuth();
    const [alerts, setAlerts] = useState({ owner: 0, renter: 0 });
    const [activeRole, setActiveRole] = useState<'owner' | 'renter'>('renter');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Derive active role from URL:
    // - On /dashboard, read ?role= param
    // - On sub-pages like /dashboard/inventory or /dashboard/owner/*, infer from pathname
    useEffect(() => {
        if (pathname === '/dashboard') {
            setActiveRole(searchParams.get('role') === 'owner' ? 'owner' : 'renter');
        } else if (pathname?.includes('/dashboard/owner') || pathname?.includes('/dashboard/inventory')) {
            setActiveRole('owner');
        } else {
            setActiveRole('renter');
        }
    }, [pathname, searchParams]);

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    // Fetch global alert counts
    useEffect(() => {
        if (!user) return;
        const fetchAlerts = async () => {
            const { data, error } = await supabase.rpc('get_user_global_alerts', { p_user_id: user.id });
            if (!error && data) {
                setAlerts({
                    owner: data.owner_action_required || 0,
                    renter: data.renter_action_required || 0,
                });
            }
        };
        fetchAlerts();
    }, [user, pathname]);

    // Prevent body scroll when drawer is open on mobile
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const totalAlerts = alerts.owner + alerts.renter;

    const navLinkClass = (active: boolean) =>
        `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`;

    const SidebarContent = () => (
        <>
            {/* Top Logo / Brand */}
            <div className="p-6 pb-2 flex items-center justify-between">
                <Link href="/" className="font-serif text-2xl font-bold text-white tracking-tight">
                    BlockHyre<span className="text-safety-orange">.</span>
                </Link>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setDrawerOpen(false)}
                    className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Close navigation"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Role Switcher */}
            <div className="px-4 py-4 mb-2">
                <div className="bg-white/5 p-1 rounded-2xl flex gap-1 relative border border-white/10 shadow-inner">
                    <Link
                        href="/dashboard?role=renter"
                        onClick={() => setActiveRole('renter')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${activeRole === 'renter'
                            ? 'bg-signal-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="relative inline-block">
                            Renter
                            {alerts.renter > 0 && (
                                <span className="absolute -top-2 -right-3 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-orange opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-safety-orange border border-charcoal"></span>
                                </span>
                            )}
                        </span>
                    </Link>
                    <Link
                        href="/dashboard?role=owner"
                        onClick={() => setActiveRole('owner')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${activeRole === 'owner'
                            ? 'bg-safety-orange text-white shadow-[0_0_15px_rgba(255,102,0,0.3)] border border-safety-orange/50'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="relative inline-block">
                            Owner
                            {alerts.owner > 0 && (
                                <span className="absolute -top-2 -right-3 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-orange opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-safety-orange border border-white/30"></span>
                                </span>
                            )}
                        </span>
                    </Link>
                </div>
            </div>

            {/* Dynamic Middle Section */}
            <div className="flex-1 px-4 overflow-y-auto space-y-1">
                <p className="px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 mt-2">
                    {activeRole === 'owner' ? 'Command Center' : 'My Rentals'}
                </p>

                {activeRole === 'renter' ? (
                    <Link href="/dashboard/renter" className={navLinkClass(pathname === '/dashboard/renter')}>
                        <Package className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">Overview</span>
                    </Link>
                ) : (
                    <>
                        <Link href="/dashboard/owner" className={navLinkClass(pathname === '/dashboard/owner')}>
                            <Home className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link href="/dashboard/owner/active-rentals" className={navLinkClass(!!pathname?.includes('/dashboard/owner/active-rentals'))}>
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">Tool Bookings</span>
                        </Link>
                        <Link href="/dashboard/inventory" className={navLinkClass(!!pathname?.includes('/dashboard/inventory'))}>
                            <Wrench className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">My Fleet</span>
                        </Link>
                    </>
                )}
            </div>

            {/* Bottom Global Section */}
            <div className="p-4 border-t border-white/10 space-y-1 bg-charcoal">
                <p className="px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 mt-1">
                    Global
                </p>
                <Link href="/messages" className={navLinkClass(pathname === '/messages')}>
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Messages</span>
                    <span className="ml-auto text-[9px] font-mono text-slate-600 uppercase tracking-wider">↗</span>
                </Link>
                <Link href="/favorites" className={navLinkClass(pathname === '/favorites')}>
                    <Heart className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Favorites</span>
                </Link>
                <Link href="/profile" className={navLinkClass(pathname === '/profile')}>
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Profile</span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2"
                    aria-label="Log out"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm border-l border-white/10 pl-2">Log out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ── DESKTOP: always-visible fixed sidebar ── */}
            <aside className="hidden lg:flex w-64 h-screen bg-charcoal text-white flex-col fixed left-0 top-0 border-r border-white/10 z-50">
                <SidebarContent />
            </aside>

            {/* ── MOBILE: Fixed top bar ── */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-charcoal border-b border-white/10 z-50 flex items-center justify-between px-4">
                {/* Hamburger */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all relative"
                    aria-label="Open navigation"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setDrawerOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                    {/* Total alert bubble on hamburger */}
                    {totalAlerts > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-orange opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safety-orange"></span>
                        </span>
                    )}
                </button>

                {/* Logo */}
                <Link href="/" className="font-serif text-xl font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2">
                    BlockHyre<span className="text-safety-orange">.</span>
                </Link>

                {/* Active role pill */}
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${activeRole === 'owner'
                    ? 'bg-safety-orange text-white'
                    : 'bg-white/10 text-slate-300'
                    }`}>
                    {activeRole}
                </div>
            </header>

            {/* ── MOBILE: Backdrop overlay ── */}
            {drawerOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    onClick={() => setDrawerOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── MOBILE: Slide-out drawer ── */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-charcoal text-white flex flex-col z-[70] border-r border-white/10 transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                aria-label="Navigation drawer"
            >
                <SidebarContent />
            </aside>
        </>
    );
}
