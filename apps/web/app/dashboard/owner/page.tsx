"use client";

import { OwnerDashboardView } from "@/app/components/dashboard/owner-view";

export default function OwnerDashboardPage() {
    return (
        <div className="pt-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-safety-orange" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-safety-orange">
                    Command Center
                </span>
            </div>
            <OwnerDashboardView />
        </div>
    );
}
