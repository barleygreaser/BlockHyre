import { redirect } from "next/navigation";

// Legacy route — redirects to the new dashboard-rooted experience so sidebar persists
export default function LegacyActiveRentalsRedirect() {
    redirect("/dashboard/owner/active-rentals");
}
