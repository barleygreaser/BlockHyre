import { ReactNode, Suspense } from "react";
import { DashboardSidebar } from "@/app/components/dashboard/sidebar";
import { AuthGuard } from "@/app/components/auth/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-50 font-sans">
                {/* Workshop Grit: 4% SVG noise overlay */}
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply z-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
                />

                {/* Suspense required: sidebar calls useSearchParams() to detect ?role= param */}
                <Suspense fallback={<div className="hidden lg:block w-64 h-screen bg-charcoal flex-shrink-0" />}>
                    <DashboardSidebar />
                </Suspense>

                {/*
                  Mobile: no left margin, but 56px top padding for the fixed header (h-14 = 3.5rem)
                  Desktop (lg+): 256px left margin for the sidebar, no top padding needed
                */}
                <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 lg:p-8 overflow-x-hidden relative z-20">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
