import { redirect } from "next/navigation";

// Old route — unified dashboard now lives at /dashboard?role=owner
export default function OwnerDashboardRedirect() {
    redirect("/dashboard?role=owner");
}
