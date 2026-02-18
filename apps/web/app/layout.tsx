import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import { cookies } from "next/headers";
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5, // Allow manual zoom for accessibility
  },
};

import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import { FavoritesProvider } from "./context/favorites-context";

import { LocationOnboardingModal } from "./components/location-onboarding-modal";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { MessageNotificationProvider } from "./components/message-notification-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the auth hint cookie set by middleware.
  // This tells the SSR render whether the user is likely authenticated,
  // allowing authenticated-only skeletons (e.g. "My Neighborhood") to be
  // included in the initial HTML — eliminating CLS and pop-in.
  const cookieStore = await cookies();
  const authHint = cookieStore.get("bh-auth-hint")?.value === "1";

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoSlab.variable} antialiased bg-white text-slate-900 font-sans`}
      >
        <NuqsAdapter>
          <AuthProvider initialAuthHint={authHint}>
            <FavoritesProvider>
              <CartProvider>
                <MessageNotificationProvider />
                <LocationOnboardingModal />
                {children}
                <Toaster richColors theme="light" />
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
