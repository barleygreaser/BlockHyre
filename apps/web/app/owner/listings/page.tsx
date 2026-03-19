import { redirect } from "next/navigation";

// Legacy route — redirects to new /dashboard/inventory so sidebar persists
export default function LegacyListingsRedirect() {
    redirect("/dashboard/inventory");
}
