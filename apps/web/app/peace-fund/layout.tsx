import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Peace Fund | BlockHyre",
  description: "A community-driven protection matrix designed to eliminate high security deposits for equipment rentals on BlockHyre.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
