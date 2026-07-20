import type { Metadata } from "next";
import { Playfair_Display, Playfair_Display_SC, Outfit, Inter, Karla } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from 'react';

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const playfairSC = Playfair_Display_SC({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-playfair-sc" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla" });

export const metadata: Metadata = {
  title: "Sangeet Restaurant",
  description: "Authentic South Asian Cuisine",
};

const LoadingFallback = () => (
  <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
  </div>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${playfairSC.variable} ${outfit.variable} ${inter.variable} ${karla.variable} font-sans`}>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
