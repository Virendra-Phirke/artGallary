import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0d0e12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "L'Atelier Lumineux | Fine Contemporary Art & AR Gallery",
    template: "%s | L'Atelier Lumineux",
  },
  description:
    "Explore original fine artworks by Elena Vance. Experience museum-grade contemporary paintings in your own living space using WebAR technology.",
  keywords: [
    "contemporary art",
    "fine art gallery",
    "Elena Vance",
    "augmented reality art",
    "WebAR art preview",
    "oil on canvas",
    "original paintings",
  ],
  authors: [{ name: "Elena Vance", url: "https://latelier-lumineux.art" }],
  creator: "Elena Vance",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://latelier-lumineux.art",
    siteName: "L'Atelier Lumineux",
    title: "L'Atelier Lumineux | Fine Contemporary Art & AR Gallery",
    description:
      "Original fine artworks, museum-grade collections, and immersive WebAR wall previews by contemporary artist Elena Vance.",
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
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0e12] text-[#f4f4f6]">
        {children}
      </body>
    </html>
  );
}
