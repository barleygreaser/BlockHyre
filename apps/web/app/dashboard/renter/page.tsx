import { RenterDashboardView } from "@/app/components/dashboard/renter-view";

export default function RenterDashboardPage() {
    return (
        <div className="pt-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-slate-300" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                    My Rentals
                </span>
            </div>
            <RenterDashboardView />
        </div>
    );
}
