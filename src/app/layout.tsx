import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ICMA.IO — Event Discovery & Hackathon Platform",
    template: "%s | ICMA.IO",
  },
  description:
    "Discover trending tech events, hackathons, and workshops. Create and manage communities, run hackathon submissions, and connect with builders worldwide.",
  keywords: [
    "events",
    "hackathons",
    "tech events",
    "workshops",
    "community",
    "ICMA",
    "developer events",
    "startup events",
  ],
  authors: [{ name: "ICMA.IO" }],
  creator: "ICMA.IO",
  metadataBase: new URL("https://icma.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ICMA.IO",
    title: "ICMA.IO — Event Discovery & Hackathon Platform",
    description:
      "Discover trending tech events, hackathons, and workshops. Create and manage communities, run hackathon submissions, and connect with builders worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICMA.IO — Event Discovery & Hackathon Platform",
    description:
      "Discover trending tech events, hackathons, and workshops.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
