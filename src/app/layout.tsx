import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

import "allotment/dist/style.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://polaris.app"),
  title: {
    default: "Polaris - Cloud IDE with AI",
    template: "%s | Polaris",
  },
  description: "A fully-featured browser-based IDE with AI-powered code suggestions, real-time collaboration, in-browser execution, and GitHub integration. Build, edit, and deploy projects directly in your browser.",
  keywords: [
    "cloud IDE",
    "online code editor",
    "AI code assistant",
    "browser IDE",
    "web IDE",
    "code editor",
    "AI coding",
    "real-time collaboration",
    "GitHub integration",
    "WebContainer",
    "CodeMirror",
    "Next.js IDE",
    "AI suggestions",
    "code completion",
  ],
  authors: [
    {
      name: "Polaris",
      url: "https://github.com/pouyahbb/polaris",
    },
  ],
  creator: "Polaris Team",
  publisher: "Polaris",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://polaris.app",
    siteName: "Polaris",
    title: "Polaris - Cloud IDE with AI",
    description: "A fully-featured browser-based IDE with AI-powered code suggestions, real-time collaboration, and GitHub integration.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Polaris Cloud IDE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Polaris - Cloud IDE with AI",
    description: "A fully-featured browser-based IDE with AI-powered code suggestions, real-time collaboration, and GitHub integration.",
    images: ["/og-image.png"],
    creator: "@polaris",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${plexMono.variable} antialiased`}
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
  );
}
