"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Home, Wrench, MessageSquare, User, Heart, LogOut, Package } from "lucide-react";

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [alerts, setAlerts] = useState({ owner: 0, renter: 0 });
    const [activeRole, setActiveRole] = useState<'owner' | 'renter'>('renter');

    useEffect(() => {
        if (pathname?.includes('/dashboard/owner') || pathname?.includes('/dashboard/inventory')) {
            setActiveRole('owner');
        } else {
            setActiveRole('renter');
        }
    }, [pathname]);

    useEffect(() => {
        if (!user) return;

        const fetchAlerts = async () => {
            const { data, error } = await supabase.rpc('get_user_global_alerts', { p_user_id: user.id });
            if (!error && data) {
                setAlerts({
                    owner: data.owner_action_required || 0,
                    renter: data.renter_action_required || 0
                });
            }
        };

        fetchAlerts();
    }, [user, pathname]);

    return (
        <div className="w-64 h-screen bg-charcoal text-white flex flex-col fixed left-0 top-0 border-r border-white/10 z-50">
            {/* Top Logo / Brand */}
            <div className="p-6 pb-2">
                <Link href="/" className="font-serif text-2xl font-bold text-white tracking-tight">
                    BlockHyre<span className="text-safety-orange">.</span>
                </Link>
            </div>

            {/* Role Switcher */}
            <div className="px-4 py-4 mb-2">
                <div className="bg-white/5 p-1 rounded-2xl flex gap-1 relative border border-white/10 shadow-inner">
                    <Link
                        href="/dashboard/renter"
                        onClick={() => setActiveRole('renter')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${activeRole === 'renter'
                            ? 'bg-signal-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Renter
                        {alerts.renter > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 z-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-charcoal"></span>
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/dashboard/owner"
                        onClick={() => setActiveRole('owner')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${activeRole === 'owner'
                            ? 'bg-safety-orange text-white shadow-[0_0_15px_rgba(255,102,0,0.3)] border border-safety-orange/50'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Owner
                        {alerts.owner > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 z-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-charcoal"></span>
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Dynamic Middle Section */}
            <div className="flex-1 px-4 overflow-y-auto space-y-1">
                <p className="px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 mt-2">
                    {activeRole === 'owner' ? 'Command Center' : 'My Rentals'}
                </p>

                {activeRole === 'renter' ? (
                    <>
                        <Link href="/dashboard/renter" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === '/dashboard/renter' ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Package className="w-4 h-4" />
                            <span className="text-sm">Overview</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard/owner" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === '/dashboard/owner' ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Home className="w-4 h-4" />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link href="/dashboard/owner/active-rentals" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname?.includes('/dashboard/owner/active-rentals') ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Package className="w-4 h-4" />
                            <span className="text-sm">Tool Bookings</span>
                        </Link>
                        <Link href="/dashboard/inventory" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname?.includes('/dashboard/inventory') ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Wrench className="w-4 h-4" />
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
                {/* Messages: links OUT of the dashboard shell — the chat experience is purposely full-screen */}
                <Link
                    href="/messages"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative ${pathname === '/messages' ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Messages</span>
                    <span className="ml-auto text-[9px] font-mono text-slate-600 uppercase tracking-wider">↗</span>
                </Link>

                <Link href="/favorites" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === '/favorites' ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Favorites</span>
                </Link>
                <Link href="/profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${pathname === '/profile' ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                </Link>

                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2"
                    aria-label="Log out"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm border-l border-white/10 pl-2">Log out</span>
                </button>
            </div>
        </div>
    );
}
