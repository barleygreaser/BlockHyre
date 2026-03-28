import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | BlockHyre",
  description: "About the creator and system architecture of BlockHyre. The neighborhood factory designed to democratize access to commercial-grade equipment.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
