import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettingsData } from "@/db/mockData";
import { NewsletterSignup } from "./NewsletterSignup";

interface FooterProps {
  settings?: SiteSettingsData;
}

export function Footer({ settings }: FooterProps) {
  const brandTitle = settings?.siteTitle || "L'Atelier Lumineux";
  const description =
    settings?.footerConfig?.description ||
    "The independent studio and private gallery of contemporary artist Elena Vance. Dedicated to exploring lapis lazuli glazes, geological materiality, and true-scale spatial WebAR curation.";
  const contactEmail = settings?.footerConfig?.contactText || settings?.contactEmail || "curator@latelier-lumineux.art";
  const copyright = settings?.copyrightText || `© ${new Date().getFullYear()} ${settings?.artistName || "Elena Vance"}. All rights reserved.`;

  const columns = settings?.footerConfig?.columns && settings.footerConfig.columns.length > 0
    ? settings.footerConfig.columns.map(col => ({
        ...col,
        links: col.links.map(lnk => ({
          ...lnk,
          href: lnk.href === "/about" ? "/#about" : lnk.href === "/contact" ? "/#contact" : lnk.href
        }))
      }))
    : [
        {
          title: "Studio",
          links: [
            { label: "Artist Monologue & CV", href: "/#about" },
            { label: "Studio Inquiries & Press", href: "/#contact" },
            { label: "Collector Portal", href: "/account" },
          ],
        },
        {
          title: "Legal & Provenance",
          links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Acquisition", href: "/terms" },
            { label: "Collector Inquiries", href: "/#contact" },
          ],
        },
      ];

  return (
    <footer className="bg-[#0a0b0d] pt-12 sm:pt-20 pb-10 sm:pb-12 text-[#8e92a4] w-full max-w-full overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-10 sm:mb-16 w-full min-w-0">
          {/* Col 1: Studio Monologue */}
          <div className="md:col-span-4 space-y-3 sm:space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl tracking-[0.15em] text-white uppercase font-light">
              {brandTitle}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-[#a6aabf] font-light">
              {description}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs tracking-wider uppercase">
              <span className="text-zinc-500">Studios:</span>
              <span className="text-zinc-300">{settings?.city || "Paris"}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">{settings?.location || "Côtes-d'Armor (Brittany)"}</span>
            </div>
          </div>

          {/* Dynamic Columns - 2 COLUMNS ON MOBILE */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 sm:gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-2 sm:space-y-3">
                <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-2 sm:mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm font-light">
                  {col.links.map((lnk, lIdx) => (
                    <li key={lIdx}>
                      <Link href={lnk.href} className="hover:text-white transition-colors">
                        {lnk.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Col 3: Newsletter Dispatch & Provenance */}
          <div className="md:col-span-4 space-y-4 sm:space-y-6">
            <NewsletterSignup />

            <div className="pt-2 space-y-1.5 sm:space-y-2">
              <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold">
                Studio Provenance
              </h4>
              <p className="text-[11px] sm:text-xs text-[#a6aabf] leading-relaxed font-light">
                Canvases are accompanied by an authenticated certificate signed by {settings?.artistName || "the artist"}, registered with ADAGP France.
              </p>
              <div className="pt-0.5">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs tracking-wider uppercase text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
                >
                  <span>{contactEmail}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-1 text-xs">
              {settings?.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Twitter/X
                </a>
              )}
              {settings?.socialLinks?.artsy && (
                <a
                  href={settings.socialLinks.artsy}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Artsy
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] sm:text-xs text-zinc-600 gap-3 sm:gap-4">
          <p>{copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:space-x-6">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Terms of Acquisition
            </Link>
            <Link href="/gallery" className="hover:text-zinc-400 transition-colors">
              WebAR Spatial Viewer
            </Link>
            <Link href="/admin/dashboard" className="hover:text-zinc-400 transition-colors">
              Studio Administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
