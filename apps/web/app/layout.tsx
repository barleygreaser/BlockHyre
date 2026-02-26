import type { Metadata } from "next";
import { Inter, Roboto_Slab, Bebas_Neue } from "next/font/google";
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

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockHyre — Turn Your Neighborhood Into a Factory",
  description: "Rent high-value tools from verified neighbors within 2 miles. Woodworking, power tools, gardening equipment — all insured by The Peace Fund.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import { FavoritesProvider } from "./context/favorites-context";

import { LocationOnboardingModal } from "./components/location-onboarding-modal";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { MessageProvider } from "@/app/context/message-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authHint = cookieStore.get("bh-auth-hint")?.value === "1";

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoSlab.variable} ${bebasNeue.variable} antialiased bg-white text-slate-900 font-sans grain-overlay`}
      >
        <NuqsAdapter>
          <AuthProvider initialAuthHint={authHint}>
            <FavoritesProvider>
              <CartProvider>
                <MessageProvider>
                  <LocationOnboardingModal />
                  {children}
                </MessageProvider>
                <Toaster richColors theme="light" />
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
