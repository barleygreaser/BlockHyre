"use client";

import { AuthGuard } from "@/app/components/auth/auth-guard";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}
