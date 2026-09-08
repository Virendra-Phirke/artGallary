"use client";

import React from "react";
import Image from "next/image";
import {
  MockHomepageSection,
  MockArtwork,
  MockCollection,
  MockExhibition,
  SiteSettingsData,
} from "@/db/mockData";
import {
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Mail,
  Phone,
  Clock,
  Send,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDimensions } from "@/lib/utils";

interface PageLivePreviewProps {
  activePage: "home" | "gallery" | "collections" | "exhibitions" | "about" | "contact";
  sections: MockHomepageSection[];
  siteSettings: SiteSettingsData;
  artworks: MockArtwork[];
  collections: MockCollection[];
  exhibitions: MockExhibition[];
  deviceMode: "desktop" | "tablet" | "mobile";
  zoom?: number;
}

export function PageLivePreview({
  activePage,
  sections,
  siteSettings,
  artworks = [],
  collections = [],
  exhibitions = [],
  deviceMode,
  zoom = 100,
}: PageLivePreviewProps) {
  const heroArtwork = artworks[0];
  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  const brandTitle = siteSettings.siteTitle || "L'Atelier Lumineux";
  const artistName = siteSettings.artistName || "Elena Vance";
  const navItems = (siteSettings.navigationItems || [])
    .filter((i) => i.isEnabled)
    .sort((a, b) => a.order - b.order);

  const galleryCfg = siteSettings.galleryPageConfig || {
    title: "Original Canvases & Pigments",
    subtitle: "The Studio Catalogue",
    description: "Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen.",
    defaultLayout: "grid",
    enabledFilters: { medium: true, price: true, year: true, availability: true, collection: true },
    defaultSort: "featured",
  };

  const collectionsCfg = siteSettings.collectionsPageConfig || {
    title: "Curated Series",
    eyebrow: "Thematic Bodies of Work",
    description: "Elena Vance groups her artistic inquiries into multi-year cycles exploring mineral glazes and raw linen.",
  };

  const exhibitionsCfg = siteSettings.exhibitionsPageConfig || {
    title: "Exhibitions & Retrospectives",
    eyebrow: "Solo Shows & Museum Installations",
    description: "Chronology of curated exhibitions, solo institutional showcases, and private gallery presentations.",
  };

  const aboutCfg = siteSettings.aboutPageConfig || {};
  const contactCfg = siteSettings.contactPageConfig || {};

  return (
    <div className="w-full flex justify-center">
      <div
        style={zoom && zoom !== 100 ? { zoom: `${zoom}%` } : undefined}
        className={`transition-all duration-300 bg-[#0d0e12] overflow-y-auto max-h-[85vh] shadow-2xl relative scrollbar-thin scrollbar-thumb-[#2a2c38] scrollbar-track-transparent ${
          deviceMode === "desktop"
            ? "w-full rounded-2xl border border-[#232530]"
            : deviceMode === "tablet"
            ? "w-[768px] max-w-full rounded-2xl border-2 border-[#2b2d3b] my-2"
            : "w-[390px] max-w-full rounded-[36px] border-4 border-zinc-800 my-2"
        }`}
      >
        {/* Mobile Phone Speaker Notch */}
        {deviceMode === "mobile" && (
          <div className="w-full flex justify-center pt-2 pb-1 bg-[#0d0e12] sticky top-0 z-30">
            <div className="w-28 h-4 bg-zinc-800 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700" />
            </div>
          </div>
        )}

        {/* 1. SIMULATED STOREFRONT HEADER */}
        {siteSettings.announcementBar?.isEnabled && (
          <div
            className="py-1.5 px-4 text-center text-[10px] tracking-wider uppercase font-medium border-b border-white/5"
            style={{
              backgroundColor: siteSettings.announcementBar.bg || "#18191e",
              color: siteSettings.announcementBar.textColor || "#d1a86e",
            }}
          >
            <span>{siteSettings.announcementBar.message}</span>
            {siteSettings.announcementBar.linkLabel && (
              <span className="ml-2 underline cursor-pointer">
                {siteSettings.announcementBar.linkLabel} →
              </span>
            )}
          </div>
        )}

        <header className="px-5 py-4 border-b border-[#1c1d25] flex items-center justify-between bg-[#0d0e12]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex flex-col">
            <span className="font-serif text-sm tracking-[0.2em] font-medium text-white uppercase">
              {brandTitle}
            </span>
            <span className="text-[8px] tracking-[0.25em] text-[#8e92a4] uppercase -mt-0.5">
              {artistName} Studio
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-4 text-[11px] uppercase tracking-wider">
            <span
              className={`transition-colors cursor-pointer ${
                activePage === "home" ? "text-[#d1a86e] font-semibold" : "text-zinc-400"
              }`}
            >
              Home
            </span>
            {navItems.map((item) => {
              const itemKey = item.label.toLowerCase().includes("gallery")
                ? "gallery"
                : item.label.toLowerCase().includes("collection")
                ? "collections"
                : item.label.toLowerCase().includes("exhibit")
                ? "exhibitions"
                : item.label.toLowerCase().includes("about")
                ? "about"
                : item.label.toLowerCase().includes("contact")
                ? "contact"
                : "";

              const isCurrent = itemKey === activePage;
              return (
                <span
                  key={item.id}
                  className={`transition-colors cursor-pointer ${
                    isCurrent ? "text-[#d1a86e] font-semibold" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </span>
              );
            })}
          </nav>

          {siteSettings.headerConfig?.showCta && (
            <div className="shrink-0">
              <span className="inline-block bg-[#d1a86e] text-[#0d0e12] px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                {siteSettings.headerConfig.ctaLabel || "Inquire"}
              </span>
            </div>
          )}
        </header>

        {/* 2. DYNAMIC PAGE BODY PREVIEWS */}

        {/* === A. HOME PAGE PREVIEW === */}
        {activePage === "home" && (
          <div className="space-y-16 md:space-y-24 pb-16 pt-6">
            {sections
              .filter((s) => s.isEnabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((sec) => {
                // HERO
                if (sec.sectionKey === "hero") {
                  const heroImage = sec.contentJson?.imageUrl || heroArtwork?.coverImageUrl;
                  return (
                    <div key={sec.id} className="relative px-6 py-10 md:py-16 text-left overflow-hidden border-b border-[#1c1d25]/60">
                      <div className="absolute top-0 right-0 w-72 h-72 bg-[#d1a86e]/10 rounded-full blur-[90px] pointer-events-none" />
                      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-7 space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
                            <span>{sec.subtitle || sec.contentJson?.badge || "Spring 2026 Collection"}</span>
                          </div>
                          <h2 className="font-serif text-3xl md:text-5xl text-white font-medium leading-[1.1]">
                            {sec.title || "The Architecture of Luminous Stillness"}
                          </h2>
                          <p className="text-xs md:text-sm text-[#a6aabf] leading-relaxed line-clamp-3">
                            {sec.contentJson?.description || "Original fine artworks by Elena Vance. Exploring the threshold where lapis lazuli glazes and raw Belgian linen meet."}
                          </p>
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button className="bg-[#d1a86e] text-[#0d0e12] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-md">
                              {sec.contentJson?.ctaText || "Explore Catalog"}
                            </button>
                            <button className="border border-[#262833] text-white px-4 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-wider bg-[#18191e]">
                              Spatial AR
                            </button>
                          </div>
                        </div>
                        <div className="md:col-span-5 flex justify-center">
                          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#262833] bg-[#14151a] shadow-xl">
                            {heroImage && (
                              <Image src={heroImage} alt={sec.title} fill sizes="300px" className="object-cover" />
                            )}
                            <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/70 backdrop-blur-md rounded border border-white/10 flex items-center justify-between">
                              <span className="text-[11px] font-serif text-white truncate">{heroArtwork?.title || "Hero Piece"}</span>
                              <span className="text-[9px] uppercase tracking-wider text-[#d1a86e]">Try AR</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // FEATURED ARTWORKS
                if (sec.sectionKey === "featured_artworks") {
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto space-y-6">
                      <div className="flex items-end justify-between border-b border-[#1c1d25] pb-4">
                        <div>
                          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                            {sec.subtitle || "Curated Catalogue"}
                          </span>
                          <h3 className="font-serif text-2xl text-white mt-0.5">{sec.title || "Selected Works"}</h3>
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-zinc-400">View All ({artworks.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {artworks.slice(0, 3).map((art) => (
                          <div key={art.id} className="bg-[#14151a] rounded-lg border border-[#262833] overflow-hidden p-2.5 space-y-2">
                            <div className="relative aspect-[4/3] rounded overflow-hidden bg-black/40">
                              <Image src={art.coverImageUrl} alt={art.title} fill sizes="200px" className="object-cover" />
                              <span className="absolute top-1.5 left-1.5 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                                {art.status}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="font-serif text-white font-medium truncate">{art.title}</span>
                              <span className="text-[#d1a86e] font-mono text-[11px]">{formatCurrency(art.price, art.currency)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // LATEST COLLECTION
                if (sec.sectionKey === "latest_collection") {
                  const collectionImage = sec.contentJson?.imageUrl || featuredCollection?.coverImageUrl;
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto">
                      <div className="relative rounded-2xl overflow-hidden border border-[#262833] bg-[#14151a]">
                        <div className="relative aspect-[21/9] w-full">
                          {collectionImage && (
                            <Image src={collectionImage} alt={sec.title} fill sizes="600px" className="object-cover opacity-60" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/40 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 space-y-2">
                            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase">{sec.subtitle || "Curated Series"}</span>
                            <h3 className="font-serif text-2xl md:text-3xl text-white font-medium">{sec.title || "The Mineral Horizons Cycle"}</h3>
                            <p className="text-xs text-zinc-300 max-w-lg line-clamp-2">{sec.contentJson?.description || featuredCollection?.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // AR FEATURE
                if (sec.sectionKey === "ar_experience") {
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto">
                      <div className="rounded-2xl border border-[#d1a86e]/30 bg-gradient-to-br from-[#1c1d25] via-[#14151a] to-[#0d0e12] p-8 md:p-12 text-center space-y-4 shadow-xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1a86e]/10 border border-[#d1a86e]/30 text-[10px] text-[#d1a86e] uppercase tracking-widest">
                          <Sparkles className="w-3 h-3" />
                          <span>Spatial WebAR Curation</span>
                        </span>
                        <h3 className="font-serif text-2xl md:text-4xl text-white max-w-xl mx-auto">{sec.title || "Experience Art in Your Space"}</h3>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">{sec.contentJson?.description || "Preview real scale 1:1 paintings directly on your wall."}</p>
                      </div>
                    </div>
                  );
                }

                // ARTIST STORY
                if (sec.sectionKey === "artist_story") {
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto border-y border-[#1c1d25] py-12">
                      <div className="max-w-2xl mx-auto text-center space-y-3">
                        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase">{sec.subtitle || "The Artist Statement"}</span>
                        <h3 className="font-serif text-2xl md:text-3xl text-white italic font-normal">&ldquo;{sec.contentJson?.quote || sec.title || "A painting is an alteration of the atmospheric silence within a room."}&rdquo;</h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 pt-1">{sec.contentJson?.description}</p>
                        <span className="text-xs text-[#d1a86e] font-serif block">— {artistName}</span>
                      </div>
                    </div>
                  );
                }

                // FEATURED EXHIBITION
                if (sec.sectionKey === "featured_exhibition") {
                  const exhImage = sec.contentJson?.imageUrl || currentExhibition?.coverImageUrl;
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto border-t border-[#1c1d25] pt-8">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {exhImage && (
                          <div className="md:col-span-6 relative aspect-[16/9] rounded-lg overflow-hidden border border-[#262833] bg-[#14151a]">
                            <Image src={exhImage} alt={sec.title || "Exhibition"} fill sizes="300px" className="object-cover" />
                          </div>
                        )}
                        <div className="md:col-span-6 space-y-2">
                          <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">{sec.subtitle || "Current Exhibition"}</span>
                          <h3 className="font-serif text-xl md:text-2xl text-white font-medium">{sec.title || currentExhibition?.title || "Solo Exhibition"}</h3>
                          <p className="text-xs text-zinc-400 line-clamp-3">{sec.contentJson?.description || currentExhibition?.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // CONTACT CTA
                if (sec.sectionKey === "contact_cta") {
                  return (
                    <div key={sec.id} className="px-6 max-w-4xl mx-auto text-center">
                      <div className="rounded-2xl border border-[#262833] bg-[#14151a] p-8 space-y-3">
                        <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">{sec.subtitle || "Inquiries & Acquisitions"}</span>
                        <h3 className="font-serif text-2xl text-white font-medium">{sec.title || "Direct Studio Acquisitions"}</h3>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">{sec.contentJson?.description || "Inquire about acquiring original works."}</p>
                        <div className="pt-2">
                          <button className="bg-[#d1a86e] text-[#0d0e12] px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider">
                            {sec.contentJson?.ctaText || "Inquire with Studio"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
          </div>
        )}

        {/* === B. GALLERY PAGE PREVIEW === */}
        {activePage === "gallery" && (
          <div className="space-y-8 pb-16 pt-8 px-6 max-w-5xl mx-auto">
            {/* Gallery Hero Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                {galleryCfg.subtitle || "The Studio Catalogue"}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">
                {galleryCfg.title || "Original Canvases & Pigments"}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {galleryCfg.description || "Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen."}
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-[#14151a] border border-[#262833]">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] uppercase tracking-wider">
                <span className="px-2.5 py-1 rounded-lg bg-[#d1a86e] text-[#0d0e12] font-semibold">
                  All Works ({artworks.length})
                </span>
                <span className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white">
                  Oil on Linen
                </span>
                <span className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white">
                  Mineral Glaze
                </span>
                <span className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white">
                  Available
                </span>
              </div>
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  disabled
                  placeholder="Search catalogue..."
                  className="w-full bg-[#101115] border border-[#262833] rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-zinc-400"
                />
              </div>
            </div>

            {/* Artwork Grid */}
            <div
              className={`grid gap-4 ${
                galleryCfg.defaultLayout === "editorial"
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              }`}
            >
              {artworks.map((art) => (
                <div
                  key={art.id}
                  className="group bg-[#14151a] rounded-xl border border-[#262833] overflow-hidden p-3 space-y-2.5 hover:border-[#d1a86e]/40 transition-colors"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/40">
                    <Image src={art.coverImageUrl} alt={art.title} fill sizes="300px" className="object-cover" />
                    <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 font-mono">
                      {art.status}
                    </span>
                    <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 text-[#d1a86e] border border-white/10 font-mono">
                      1:1 WebAR
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm text-white font-medium truncate">{art.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {art.medium} • {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                    </p>
                  </div>
                  {galleryCfg.enabledFilters?.price && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#1f212b] text-xs">
                      <span className="text-[#d1a86e] font-mono font-medium">
                        {formatCurrency(art.price, art.currency)}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Inquire →
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === C. COLLECTIONS PAGE PREVIEW === */}
        {activePage === "collections" && (
          <div className="space-y-8 pb-16 pt-8 px-6 max-w-4xl mx-auto">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                {collectionsCfg.eyebrow || "Thematic Bodies of Work"}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">
                {collectionsCfg.title || "Curated Series"}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {collectionsCfg.description}
              </p>
            </div>

            <div className="space-y-6">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="rounded-2xl overflow-hidden border border-[#262833] bg-[#14151a] shadow-lg group"
                >
                  <div className="relative aspect-[21/9] w-full">
                    <Image src={col.coverImageUrl} alt={col.title} fill sizes="600px" className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#d1a86e] font-mono">Curated Series</span>
                        <h3 className="font-serif text-2xl text-white font-medium">{col.title}</h3>
                        <p className="text-xs text-zinc-300 max-w-md line-clamp-2">{col.description}</p>
                      </div>
                      <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#d1a86e] font-mono shrink-0">
                        View Series →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === D. EXHIBITIONS PAGE PREVIEW === */}
        {activePage === "exhibitions" && (
          <div className="space-y-8 pb-16 pt-8 px-6 max-w-4xl mx-auto">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                {exhibitionsCfg.eyebrow || "Solo Shows & Museum Installations"}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">
                {exhibitionsCfg.title || "Exhibitions & Retrospectives"}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {exhibitionsCfg.description}
              </p>
            </div>

            <div className="space-y-4">
              {exhibitions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-md"
                >
                  <div className="relative w-full sm:w-36 aspect-[4/3] rounded-xl overflow-hidden bg-black/50 shrink-0">
                    <Image src={ex.coverImageUrl} alt={ex.title} fill sizes="180px" className="object-cover" />
                    <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#d1a86e] text-[#0d0e12] font-semibold font-mono">
                      {ex.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#d1a86e] font-mono">
                      {ex.startDate} – {ex.endDate}
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium">{ex.title}</h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{ex.location}</span>
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2 pt-1">{ex.description}</p>
                  </div>
                  <button className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider shrink-0 font-medium">
                    Showcase Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === E. ABOUT PAGE PREVIEW === */}
        {activePage === "about" && (
          <div className="space-y-10 pb-16 pt-8 px-6 max-w-3xl mx-auto">
            {/* Artist Header & Portrait */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[#1c1d25] pb-8">
              <div className="relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-[#d1a86e]/40 shadow-2xl shrink-0">
                {aboutCfg.artistImageUrl ? (
                  <Image src={aboutCfg.artistImageUrl} alt={artistName} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#161820] flex items-center justify-center text-zinc-600 text-xs">
                    Portrait
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d1a86e] font-semibold">
                  {aboutCfg.intro || "The Artist & Studio"}
                </span>
                <h1 className="font-serif text-3xl text-white font-medium">{artistName}</h1>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
                  {aboutCfg.bio || siteSettings.bioSummary || "Contemporary fine artist exploring oceanic silence and mineral materiality."}
                </p>
              </div>
            </div>

            {/* Statement */}
            <div className="space-y-3 p-6 rounded-2xl bg-[#14151a] border border-[#262833]">
              <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-mono">Curatorial Monologue</span>
              <p className="font-serif text-lg text-white italic leading-relaxed">
                &ldquo;{aboutCfg.story || siteSettings.statement || "A painting is an alteration of the atmospheric silence within a room."}&rdquo;
              </p>
            </div>

            {/* Studio Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#14151a] border border-[#262833] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Atelier Studio</span>
                <p className="text-xs text-white font-medium">{siteSettings.location}</p>
                <p className="text-[11px] text-zinc-500">{siteSettings.address}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#14151a] border border-[#262833] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Viewing Hours</span>
                <p className="text-xs text-white font-medium">{siteSettings.businessHours}</p>
                <p className="text-[11px] text-[#d1a86e]">Private Liaison Available</p>
              </div>
            </div>
          </div>
        )}

        {/* === F. CONTACT PAGE PREVIEW === */}
        {activePage === "contact" && (
          <div className="space-y-8 pb-16 pt-8 px-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                Studio Acquisition Desk
              </span>
              <h1 className="font-serif text-3xl text-white font-medium">
                {contactCfg.title || "Inquiries & Acquisitions"}
              </h1>
              <p className="text-xs text-zinc-400">
                {contactCfg.description || siteSettings.contactInstructions}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Studio Direct Info */}
              <div className="md:col-span-5 space-y-3">
                <div className="p-4 rounded-xl bg-[#14151a] border border-[#262833] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#d1a86e]" />
                    <span>Liaison Email</span>
                  </span>
                  <p className="text-xs text-white font-mono">{siteSettings.contactEmail}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#14151a] border border-[#262833] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#d1a86e]" />
                    <span>Telephone &amp; WhatsApp</span>
                  </span>
                  <p className="text-xs text-white font-mono">{siteSettings.phone || "+33 1 42 68 55 00"}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#14151a] border border-[#262833] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#d1a86e]" />
                    <span>Atelier Visits</span>
                  </span>
                  <p className="text-xs text-white">{siteSettings.businessHours}</p>
                </div>
              </div>

              {/* Inquiry Form Preview */}
              <div className="md:col-span-7 p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Direct Acquisition Inquiry
                </h4>
                <div className="space-y-2.5">
                  <input
                    disabled
                    placeholder="Collector Full Name"
                    className="w-full bg-[#101115] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-zinc-400"
                  />
                  <input
                    disabled
                    placeholder="Email Address"
                    className="w-full bg-[#101115] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-zinc-400"
                  />
                  {contactCfg.formFields?.phone && (
                    <input
                      disabled
                      placeholder="Telephone / WhatsApp Number"
                      className="w-full bg-[#101115] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-zinc-400"
                    />
                  )}
                  <textarea
                    disabled
                    rows={3}
                    placeholder="Inquiry message regarding private acquisition, provenance, or studio visit..."
                    className="w-full bg-[#101115] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-zinc-400"
                  />
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-[#d1a86e] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 opacity-90"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Studio Inquiry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SIMULATED STOREFRONT FOOTER */}
        <footer className="border-t border-[#1c1d25] p-6 text-center text-xs text-zinc-500 bg-[#0d0e12] space-y-2">
          <p className="font-serif text-zinc-400 text-sm">{brandTitle}</p>
          <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
            {siteSettings.footerConfig?.description || "The independent studio and private gallery of contemporary artist Elena Vance."}
          </p>
          <p className="text-[10px] text-zinc-600 font-mono pt-2">
            {siteSettings.footerConfig?.copyrightText || "© 2026 Elena Vance Studio. All rights reserved."}
          </p>
        </footer>
      </div>
    </div>
  );
}
