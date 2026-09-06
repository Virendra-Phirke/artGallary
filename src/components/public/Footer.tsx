import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0b0d] border-t border-[#1c1d25] pt-20 pb-12 text-[#8e92a4]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Studio Monologue */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl tracking-[0.15em] text-white uppercase font-light">
              L&apos;Atelier Lumineux
            </h3>
            <p className="text-sm leading-relaxed max-w-md text-[#a6aabf]">
              The independent studio and private gallery of contemporary artist Elena Vance. Dedicated to exploring lapis lazuli glazes, geological materiality, and true-scale spatial WebAR curation.
            </p>
            <div className="pt-2 flex items-center gap-6 text-xs tracking-wider uppercase">
              <span className="text-zinc-500">Studios:</span>
              <span className="text-zinc-300">Paris (75001)</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">Côtes-d&apos;Armor (Brittany)</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  All Artworks
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Curated Series
                </Link>
              </li>
              <li>
                <Link href="/exhibitions" className="hover:text-white transition-colors">
                  Exhibitions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Artist Monologue & CV
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Acquisitions & Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Inquiry & Provenance */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-4">
              Studio Provenance
            </h4>
            <p className="text-xs text-[#a6aabf] leading-relaxed">
              Every canvas is accompanied by an authenticated certificate of authenticity signed by Elena Vance, registered with ADAGP France.
            </p>
            <div className="pt-3">
              <a
                href="mailto:curator@latelier-lumineux.art"
                className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
              >
                <span>curator@latelier-lumineux.art</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1c1d25] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>© {new Date().getFullYear()} Elena Vance. All rights reserved. ADAGP Paris.</p>
          <div className="flex items-center space-x-6">
            <Link href="/gallery" className="hover:text-zinc-400 transition-colors">
              Augmented Reality Viewer
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
