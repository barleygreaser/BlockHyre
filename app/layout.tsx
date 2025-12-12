import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockHyre - Hyperlocal Tool Sharing",
  description: "Turn Your Neighborhood into a Factory. Rent high-value tools from neighbors.",
};

import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";

// ... imports
import { LocationOnboardingModal } from "./components/location-onboarding-modal";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { MessageNotificationProvider } from "./components/message-notification-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoSlab.variable} antialiased bg-white text-slate-900 font-sans`}
      >
        <NuqsAdapter>
          <AuthProvider>
            <CartProvider>
              <MessageNotificationProvider />
              <LocationOnboardingModal />
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
