import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettingsData } from "@/db/mockData";

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
    ? settings.footerConfig.columns
    : [
        {
          title: "Explore",
          links: [
            { label: "All Artworks", href: "/gallery" },
            { label: "Curated Series", href: "/collections" },
            { label: "Exhibitions", href: "/exhibitions" },
            { label: "Artist Monologue & CV", href: "/about" },
            { label: "Acquisitions & Press", href: "/contact" },
          ],
        },
        {
          title: "Legal & Provenance",
          links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Acquisition", href: "/terms" },
            { label: "Collector Inquiries", href: "/contact" },
          ],
        },
      ];

  return (
    <footer className="bg-[#0a0b0d] border-t border-[#1c1d25] pt-20 pb-12 text-[#8e92a4]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Col 1: Studio Monologue */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-serif text-2xl tracking-[0.15em] text-white uppercase font-light">
              {brandTitle}
            </h3>
            <p className="text-sm leading-relaxed max-w-md text-[#a6aabf]">
              {description}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs tracking-wider uppercase">
              <span className="text-zinc-500">Studios:</span>
              <span className="text-zinc-300">{settings?.city || "Paris"}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">{settings?.location || "Côtes-d'Armor (Brittany)"}</span>
            </div>
          </div>

          {/* Dynamic Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-sm">
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

          {/* Col 3: Direct Inquiry & Provenance */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-4">
              Studio Provenance
            </h4>
            <p className="text-xs text-[#a6aabf] leading-relaxed">
              Every canvas is accompanied by an authenticated certificate of authenticity signed by {settings?.artistName || "the artist"}, registered with ADAGP France.
            </p>
            <div className="pt-3">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
              >
                <span>{contactEmail}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2 text-xs">
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
        <div className="border-t border-[#1c1d25] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>{copyright}</p>
          <div className="flex items-center space-x-6">
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
