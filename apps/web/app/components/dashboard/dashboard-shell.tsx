"use client";

import { useDashboard } from "@/app/context/dashboard-context";
import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";
import { RenterDashboardView } from "@/app/components/dashboard/renter-view";

/**
 * Renders both dashboard views simultaneously in the DOM.
 * Switching between Owner/Renter is a pure CSS display toggle driven by
 * DashboardContext — zero routing, zero re-mount, zero loading.
 */
export function DashboardShell() {
    const { activeRole } = useDashboard();

    return (
        <>
            <div style={{ display: activeRole === 'renter' ? 'block' : 'none' }}>
                <RenterDashboardView />
            </div>
            <div style={{ display: activeRole === 'owner' ? 'block' : 'none' }}>
                <OwnerDashboardView />
            </div>
        </>
    );
}
