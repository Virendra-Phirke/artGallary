import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Cormorant_Garamond,
  Inter,
} from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { DevErrorGuard } from "@/components/DevErrorGuard";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#0d0e12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Seclusion Art Gallary | Fine Contemporary Art & AR Gallery",
    template: "%s | Seclusion Art Gallary",
  },
  description:
    "Explore original fine artworks by Vishal Patil. Experience museum-grade contemporary paintings in your own living space using WebAR technology.",
  keywords: [
    "contemporary art",
    "fine art gallery",
    "Vishal Patil",
    "augmented reality art",
    "WebAR art preview",
    "oil on canvas",
    "original paintings",
  ],
  authors: [{ name: "Vishal Patil", url: "https://latelier-lumineux.art" }],
  creator: "Vishal Patil",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://latelier-lumineux.art",
    siteName: "Seclusion Art Gallary",
    title: "Seclusion Art Gallary | Fine Contemporary Art & AR Gallery",
    description:
      "Original fine artworks, museum-grade collections, and immersive WebAR wall previews by contemporary artist Vishal Patil.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${cormorant.variable} ${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script src="/dev-guard.js" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0d0e12] text-[#f4f4f6] w-full max-w-full overflow-x-hidden">
        <DevErrorGuard />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
