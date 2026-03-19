/**
 * Dashboard skeleton loaders — Industrial Boutique aesthetic.
 * Each skeleton precisely mirrors the real view's layout so there's
 * zero layout shift when data arrives. Uses a warm shimmer instead
 * of the default grey to match the charcoal/slate palette.
 */

/** Reusable shimmer block — matches the brand palette */
function Shimmer({ className }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-slate-100 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${className ?? ""}`}
        />
    );
}

// ─── KPI Card skeleton ───────────────────────────────────────────────────────
function KpiCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-3 sm:p-5 h-[88px] sm:h-[100px] flex items-center justify-between shadow-sm overflow-hidden relative">
            {/* Shimmer sweep over entire card */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
            <div className="space-y-2">
                <Shimmer className="h-2.5 w-16 sm:w-20" />
                <Shimmer className="h-6 sm:h-8 w-10 sm:w-14" />
            </div>
            <Shimmer className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex-shrink-0" />
        </div>
    );
}

// ─── Rental card skeleton (owner requests / renter active) ───────────────────
function RentalCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 space-y-3">
                    {/* Status badge row */}
                    <div className="flex items-center gap-2">
                        <Shimmer className="h-2 w-2 rounded-full" />
                        <Shimmer className="h-5 w-20 rounded-full" />
                    </div>
                    {/* Title */}
                    <Shimmer className="h-6 w-3/4" />
                    {/* Sub-label */}
                    <Shimmer className="h-3.5 w-1/3" />
                </div>
                {/* Action buttons */}
                <div className="flex flex-col gap-2 w-full sm:w-36">
                    <Shimmer className="h-9 w-full rounded-full" />
                    <Shimmer className="h-9 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ─── Upcoming booking skeleton ───────────────────────────────────────────────
function BookingRowSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <Shimmer className="h-14 w-14 rounded-2xl flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Shimmer className="h-4 w-2/3" />
                        <Shimmer className="h-3 w-1/2" />
                    </div>
                </div>
                <Shimmer className="h-8 w-8 rounded-xl flex-shrink-0" />
            </div>
        </div>
    );
}

// ─── History row skeleton ────────────────────────────────────────────────────
function HistoryRowSkeleton() {
    return (
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="space-y-1.5">
                <Shimmer className="h-4 w-36" />
                <Shimmer className="h-3 w-24" />
            </div>
            <Shimmer className="h-4 w-16" />
        </div>
    );
}

// ─── Section heading skeleton ────────────────────────────────────────────────
function SectionHeadingSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-safety-orange/20" />
            <Shimmer className="h-5 w-36" />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER SKELETON
// ═══════════════════════════════════════════════════════════════════════════════
export function OwnerDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Shimmer className="h-8 w-52" />
                    <Shimmer className="h-4 w-72" />
                </div>
                <Shimmer className="h-10 w-36 rounded-full" />
            </div>

            {/* Quick filters */}
            <div className="flex gap-2">
                <Shimmer className="h-8 w-24 rounded-full" />
                <Shimmer className="h-8 w-24 rounded-full" />
                <Shimmer className="h-8 w-24 rounded-full" />
            </div>

            {/* KPI row — 3 cols always */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: rental request cards */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <SectionHeadingSkeleton />
                        <RentalCardSkeleton />
                        <RentalCardSkeleton />
                    </div>
                    <div className="space-y-4">
                        <SectionHeadingSkeleton />
                        <RentalCardSkeleton />
                    </div>
                </div>

                {/* Right: history / stats panel */}
                <div className="space-y-6">
                    {/* Stats panel */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
                        <Shimmer className="h-5 w-28" />
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Shimmer className="h-4 w-24" />
                                <Shimmer className="h-4 w-12" />
                            </div>
                            <div className="flex justify-between">
                                <Shimmer className="h-4 w-32" />
                                <Shimmer className="h-4 w-16" />
                            </div>
                            <div className="flex justify-between">
                                <Shimmer className="h-4 w-20" />
                                <Shimmer className="h-4 w-10" />
                            </div>
                        </div>
                    </div>
                    {/* Status panel */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
                        <Shimmer className="h-4 w-20" />
                        <Shimmer className="h-4 w-28" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENTER SKELETON
// ═══════════════════════════════════════════════════════════════════════════════
export function RenterDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Shimmer className="h-8 w-40" />
                    <Shimmer className="h-4 w-64" />
                </div>
                <Shimmer className="h-10 w-32 rounded-full" />
            </div>

            {/* KPI row — 3 cols always */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: active + upcoming */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active rentals */}
                    <div className="space-y-4">
                        <SectionHeadingSkeleton />
                        <RentalCardSkeleton />
                        <RentalCardSkeleton />
                    </div>
                    {/* Upcoming bookings */}
                    <div className="space-y-4">
                        <SectionHeadingSkeleton />
                        <BookingRowSkeleton />
                        <BookingRowSkeleton />
                    </div>
                </div>

                {/* Right: history + disputes */}
                <div className="space-y-6">
                    {/* Rental history */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
                        <Shimmer className="h-5 w-28 mb-4" />
                        <div className="space-y-4">
                            <HistoryRowSkeleton />
                            <HistoryRowSkeleton />
                            <HistoryRowSkeleton />
                        </div>
                    </div>
                    {/* Disputes row */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
                        <Shimmer className="h-4 w-20" />
                        <Shimmer className="h-4 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}
