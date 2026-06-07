import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sangeet Restaurant — Authentic Indian & Nepali Cuisine | Hong Kong",
    template: "%s | Sangeet Restaurant",
  },
  description:
    "Experience authentic Indian and Nepali cuisine in the heart of Hong Kong. Dine-in, order via QR code, or make a reservation online.",
  keywords: [
    "Indian restaurant",
    "Nepali restaurant",
    "Hong Kong",
    "authentic cuisine",
    "dine-in",
    "QR ordering",
    "reservations",
  ],
  openGraph: {
    title: "Sangeet Restaurant — Authentic Indian & Nepali Cuisine",
    description:
      "Experience authentic Indian and Nepali cuisine in the heart of Hong Kong.",
    type: "website",
    locale: "en_HK",
    siteName: "Sangeet Restaurant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
