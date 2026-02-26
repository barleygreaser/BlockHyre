import { Suspense } from "react";
import { DashboardShell } from "@/app/components/dashboard/dashboard-shell";
import { RenterDashboardSkeleton } from "@/app/components/dashboard/dashboard-skeletons";

export default function DashboardPage() {
    return (
        // useSearchParams() inside DashboardShell requires Suspense at this boundary
        <Suspense fallback={<RenterDashboardSkeleton />}>
            <DashboardShell />
        </Suspense>
    );
}
