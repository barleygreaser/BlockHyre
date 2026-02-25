"use client";

import { useSearchParams } from "next/navigation";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";

/**
 * Renders both dashboard views simultaneously in the DOM.
 * Switching between Owner/Renter is a pure CSS display toggle — zero loading,
 * zero network, zero remount. Both views fetch their data on initial mount in
 * parallel so by the time the user switches, everything is ready.
 */
export function DashboardShell() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') === 'owner' ? 'owner' : 'renter';

    return (
        <>
            {/* Both views are always mounted. Switching is instant. */}
            <div style={{ display: role === 'renter' ? 'block' : 'none' }}>
                <RenterDashboardView />
            </div>
            <div style={{ display: role === 'owner' ? 'block' : 'none' }}>
                <OwnerDashboardView />
            </div>
        </>
    );
}
