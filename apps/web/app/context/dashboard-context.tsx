"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Role = 'owner' | 'renter';

interface DashboardContextValue {
    activeRole: Role;
    setActiveRole: (role: Role) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
    activeRole: 'renter',
    setActiveRole: () => { },
});

export function useDashboard() {
    return useContext(DashboardContext);
}

/**
 * Wraps the entire dashboard. Tracks activeRole in React state (instant)
 * and syncs to the URL as ?role= in the background (bookmarkable).
 * Role is seeded from: ?role= param → pathname → 'renter' default.
 */
function DashboardProviderInner({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derive initial role once from URL / pathname
    const getInitialRole = (): Role => {
        const param = searchParams.get('role');
        if (param === 'owner' || param === 'renter') return param;
        if (pathname?.includes('/dashboard/owner') || pathname?.includes('/dashboard/inventory')) return 'owner';
        return 'renter';
    };

    const [activeRole, setActiveRoleState] = useState<Role>(getInitialRole);

    const setActiveRole = (role: Role) => {
        // Instant UI update — no routing involved
        setActiveRoleState(role);
        // Quietly update URL for bookmarkability (fire-and-forget, doesn't block render)
        if (pathname === '/dashboard') {
            router.replace(`/dashboard?role=${role}`, { scroll: false });
        }
    };

    // Keep role in sync when navigating to sub-pages (inventory, active-rentals)
    useEffect(() => {
        if (pathname === '/dashboard') {
            const param = searchParams.get('role');
            if (param === 'owner' || param === 'renter') {
                setActiveRoleState(param);
            }
        } else if (pathname?.includes('/dashboard/owner') || pathname?.includes('/dashboard/inventory')) {
            setActiveRoleState('owner');
        }
    }, [pathname, searchParams]);

    return (
        <DashboardContext.Provider value={{ activeRole, setActiveRole }}>
            {children}
        </DashboardContext.Provider>
    );
}

// Suspense wrapper because DashboardProviderInner uses useSearchParams()
import { Suspense } from "react";

export function DashboardProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <DashboardProviderInner>{children}</DashboardProviderInner>
        </Suspense>
    );
}
