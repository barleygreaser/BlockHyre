import { redirect } from "next/navigation";

// Old route — unified dashboard now lives at /dashboard?role=renter
export default function RenterDashboardRedirect() {
    redirect("/dashboard?role=renter");
}
