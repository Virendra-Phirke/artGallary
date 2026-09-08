import React from "react";
import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { getSiteSettings, getThemeSettings } from "@/db/repository";
import { getSession } from "@/lib/auth/auth";
import { Clock } from "lucide-react";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, theme, session] = await Promise.all([
    getSiteSettings(),
    getThemeSettings(),
    getSession().catch(() => null),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  // If maintenance mode is enabled and user is not admin
  if (settings.maintenanceMode?.isEnabled && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0e12] text-[#f4f4f6] px-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#18191e] border border-[#262833] flex items-center justify-center mx-auto text-[#d1a86e]">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#d1a86e] font-semibold">
              {settings.siteTitle || "L'Atelier Lumineux"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-white">
              {settings.maintenanceMode.title || "Studio Under Curation"}
            </h1>
          </div>
          <p className="text-sm text-[#a6aabf] leading-relaxed">
            {settings.maintenanceMode.message ||
              "The digital gallery is currently undergoing curatorial updates. Normal visitor access will resume shortly."}
          </p>
          {settings.maintenanceMode.expectedReturn && (
            <div className="inline-block px-4 py-2 rounded-full bg-[#14151a] border border-[#262833] text-xs text-zinc-400">
              {settings.maintenanceMode.expectedReturn}
            </div>
          )}
          <div className="pt-4 border-t border-[#1c1d25]">
            <Link
              href="/login"
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Studio Administration Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e12] text-[#f4f4f6] w-full max-w-full overflow-x-hidden relative">
      {/* Dynamic Theme Custom Properties */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --accent: ${theme.primaryColor};
              --accent-hover: ${theme.accentColor};
              --radius: ${theme.borderRadius};
              ${
                theme.headingFont === "Cormorant Garamond"
                  ? "--font-heading: var(--font-cormorant), Georgia, serif;"
                  : "--font-heading: var(--font-playfair), 'Playfair Display', Georgia, serif;"
              }
              ${
                theme.bodyFont === "Inter"
                  ? "--font-sans: var(--font-inter), 'Inter', sans-serif;"
                  : "--font-sans: var(--font-jakarta), 'Plus Jakarta Sans', sans-serif;"
              }
            }
          `,
        }}
      />
      <AnnouncementBar announcement={settings.announcementBar} />
      <Header settings={settings} />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
