import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | BlockHyre",
  description: "Learn how the BlockHyre neighborhood factory operates. Four stages to output: Find Asset, Reserve, The Safety Gate, and Production.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
