import type { Metadata } from "next";
import { Playfair_Display, Outfit, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from 'react';

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sangeet Restaurant",
  description: "Authentic South Asian Cuisine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${outfit.variable} ${inter.variable} font-sans`}>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
