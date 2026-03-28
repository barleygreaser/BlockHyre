import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BlockHyre",
  description: "Terms of Service and operating agreement for using the BlockHyre peer-to-peer equipment rental platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
