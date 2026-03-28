import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liability & Risk Policy | BlockHyre",
  description: "Rights, responsibilities, and protections when renting tools through BlockHyre, including Assumption of Risk and Safety Requirements.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
