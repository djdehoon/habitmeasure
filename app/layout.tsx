import type { Metadata } from "next";
import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HabitMeasure — Kleine gewoontes. Grote verandering.",
  description: "Start een timer. HabitMeasure logt de rest.",
  icons: {
    icon: "/images/icons/favicon.png",
    apple: "/images/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "HabitMeasure — Kleine gewoontes. Grote verandering.",
    description: "Start een timer. HabitMeasure logt de rest.",
    url: "https://habitmeasure.com",
    siteName: "HabitMeasure",
    images: [
      {
        url: "/images/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitMeasure",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitMeasure",
    description: "Start een timer. HabitMeasure logt de rest.",
    images: ["/images/icons/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HabitMeasure",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0F14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no,email=no,address=no,date=no,url=no" />
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
