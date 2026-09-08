"use client";

import React, { useRef, useState, useEffect } from "react";
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
  Eye,
  Ruler,
  Layers,
  Award,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { useStudioSelection } from "./StudioSelectionManager";
import { StudioSelectionOverlay } from "./StudioSelectionOverlay";

interface PageLivePreviewProps {
  activePage: "home" | "gallery" | "collections" | "exhibitions" | "about" | "contact";
  sections: MockHomepageSection[];
  siteSettings: SiteSettingsData;
  artworks: MockArtwork[];
  collections: MockCollection[];
  exhibitions: MockExhibition[];
  deviceMode: "desktop" | "tablet" | "mobile";
  zoom?: number;
  onMoveSection?: (sectionId: string, direction: "up" | "down") => void;
  onToggleSection?: (sectionId: string) => void;
  onOpenMediaPicker?: (sectionId: string) => void;
}

function CuratorialPreviewDivider() {
  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 my-8 sm:my-14 md:my-20 flex items-center justify-center pointer-events-none">
      <div className="relative w-full flex items-center justify-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#d1a86e]/20 to-transparent" />
        <div className="absolute px-3 bg-[#0a0b0e] flex items-center gap-1.5">
          <span className="w-1 h-1 rotate-45 bg-[#d1a86e]/40" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#d1a86e]/80" />
          <span className="w-1 h-1 rotate-45 bg-[#d1a86e]/40" />
        </div>
      </div>
    </div>
  );
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
  onMoveSection,
  onToggleSection,
  onOpenMediaPicker,
}: PageLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode, hoverElement, selectElement } = useStudioSelection();

  // Hero carousel preview state
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);

  useEffect(() => {
    const heroSec = sections.find((s) => s.sectionKey === "hero");
    const count = Math.max(
      1,
      Math.min(6, Number(heroSec?.contentJson?.heroSlideCount) || 4)
    );
    if (count <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % count);
    }, 9000);
    return () => clearInterval(timer);
  }, [sections]);

  const heroArtwork = artworks[0];
  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  const brandTitle = siteSettings.siteTitle || "SECLUSION ART GALLARY";
  const artistName = siteSettings.artistName || "Elena Vance";
  const brandSubtitle = siteSettings.shortBrandName
    ? `${siteSettings.shortBrandName} Studio`
    : siteSettings.artistName
    ? `${siteSettings.artistName} Studio`
    : "L'ATELIER STUDIO";

  const excludedNavPatterns = ["/gallery", "/collections", "/exhibitions"];
  const rawLinks = siteSettings?.navigationItems
    ? siteSettings.navigationItems.filter((i) => i.isEnabled).sort((a, b) => a.order - b.order)
    : [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ];
  const filteredLinks = rawLinks.filter(
    (l) =>
      !excludedNavPatterns.some((p) => l.href.startsWith(p)) &&
      !["gallery", "collection", "exhibition"].some((k) => l.label.toLowerCase().includes(k))
  );
  const navLinks = filteredLinks.length > 0 ? filteredLinks : [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

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

  // Event delegation for on-canvas hover and click selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === "preview") return;
    const target = (e.target as HTMLElement).closest("[data-studio-id]");
    if (target) {
      const id = target.getAttribute("data-studio-id") || "";
      const type = (target.getAttribute("data-studio-type") || "heading") as any;
      const label = target.getAttribute("data-studio-label") || id;
      const sectionId = target.getAttribute("data-studio-section") || undefined;
      const fieldKey = target.getAttribute("data-studio-field") || undefined;

      const path: any[] = [
        { id: `page:${activePage}`, label: activePage.toUpperCase(), type: "section" },
      ];
      if (sectionId) {
        const sec = sections.find((s) => s.id === sectionId);
        path.push({
          id: `sec:${sectionId}`,
          label: sec?.title || sec?.sectionKey || "Section",
          type: "section",
        });
      }
      path.push({ id, label, type });

      hoverElement({
        id,
        type,
        label,
        path,
        sectionId,
        fieldKey,
      });
    } else {
      hoverElement(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (mode === "preview") return;
    const target = (e.target as HTMLElement).closest("[data-studio-id]");
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const id = target.getAttribute("data-studio-id") || "";
      const type = (target.getAttribute("data-studio-type") || "heading") as any;
      const label = target.getAttribute("data-studio-label") || id;
      const sectionId = target.getAttribute("data-studio-section") || undefined;
      const fieldKey = target.getAttribute("data-studio-field") || undefined;

      const path: any[] = [
        { id: `page:${activePage}`, label: activePage.toUpperCase(), type: "section" },
      ];
      if (sectionId) {
        const sec = sections.find((s) => s.id === sectionId);
        path.push({
          id: `sec:${sectionId}`,
          label: sec?.title || sec?.sectionKey || "Section",
          type: "section",
        });
      }
      path.push({ id, label, type });

      selectElement({
        id,
        type,
        label,
        path,
        sectionId,
        fieldKey,
      });
    }
  };

  return (
    <div className="w-full flex justify-center select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => hoverElement(null)}
        onClick={handleClick}
        style={zoom && zoom !== 100 ? { zoom: `${zoom}%` } : undefined}
        className={`transition-all duration-300 bg-[#0d0e12] overflow-y-auto max-h-[85vh] shadow-2xl relative scrollbar-thin scrollbar-thumb-[#2a2c38] scrollbar-track-transparent ${
          deviceMode === "desktop"
            ? "w-full rounded-2xl border border-[#232530]"
            : deviceMode === "tablet"
            ? "w-[768px] max-w-full rounded-2xl border-2 border-[#2b2d3b] my-2"
            : "w-[390px] max-w-full rounded-[36px] border-4 border-zinc-800 my-2"
        }`}
      >
        {/* On-Canvas Visual Selection Overlay & Floating Toolbar */}
        <StudioSelectionOverlay
          containerRef={containerRef}
          onMoveSection={onMoveSection}
          onToggleSection={onToggleSection}
          onOpenMediaPicker={onOpenMediaPicker}
        />

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
            data-studio-id="announcement:message"
            data-studio-type="banner"
            data-studio-label="Announcement Message"
            className="py-1.5 px-4 text-center text-[10px] tracking-wider uppercase font-medium border-b border-white/5 cursor-pointer"
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

        <header className="px-3.5 sm:px-8 md:px-12 py-3 sm:py-5 border-b border-[#1c1d25] flex items-center justify-between bg-[#0d0e12]/95 backdrop-blur-md sticky top-0 z-20">
          {/* Brand & Studio Monogram */}
          <div className="flex flex-col items-start cursor-pointer min-w-0 shrink group">
            <span
              data-studio-id="navbar:brand"
              data-studio-type="heading"
              data-studio-label="Brand Title"
              className="font-serif text-sm sm:text-xl md:text-2xl tracking-[0.1em] sm:tracking-[0.2em] font-medium text-white group-hover:text-[#d1a86e] transition-colors uppercase truncate max-w-[200px] sm:max-w-none"
            >
              {brandTitle}
            </span>
            <span
              data-studio-id="navbar:artist"
              data-studio-type="eyebrow"
              data-studio-label="Studio Subtitle"
              className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#8e92a4] uppercase font-light -mt-0.5 group-hover:text-[#d1a86e] transition-colors truncate"
            >
              {brandSubtitle}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <span
                key={link.label}
                className="text-xs uppercase tracking-[0.2em] font-medium text-[#a6aabf] hover:text-white transition-colors cursor-pointer py-1"
              >
                {link.label}
              </span>
            ))}
          </nav>

          {/* Right Action Buttons & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              data-studio-id="navbar:cta"
              data-studio-type="button"
              data-studio-label="Collector Portal CTA"
              className="cursor-pointer"
            >
              <span className="rounded-full bg-gradient-to-r from-[#d1a86e] to-[#b38947] text-[#0d0e12] font-semibold text-[10px] sm:text-xs h-7.5 sm:h-8 px-3 sm:px-3.5 flex items-center gap-1.5 shadow-md shadow-[#d1a86e]/20 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Collector Portal</span>
              </span>
            </div>

            {/* Authenticated Collector Profile Preview */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#14151a] border border-[#232530] text-xs text-zinc-300">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1e2028] border border-[#d1a86e]/30 flex items-center justify-center text-[10px] text-[#d1a86e] font-serif font-semibold">
                V
              </div>
              <span className="text-[11px] sm:text-xs font-medium max-w-[80px] truncate hidden xs:inline">
                virendra
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </div>
          </div>
        </header>

        {/* 2. DYNAMIC PAGE BODY PREVIEWS */}

        {/* === A. HOME PAGE PREVIEW === */}
        {activePage === "home" && (
          <div className="pb-20 w-full max-w-full overflow-x-hidden">
            {sections
              .filter((s) => s.isEnabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((sec, secIdx) => {
                const renderDivider = secIdx > 0;

                // 1. HERO SHOWCASE
                if (sec.sectionKey === "hero") {
                  const heroSlideCount = Math.max(
                    1,
                    Math.min(6, Number(sec.contentJson?.heroSlideCount) || 4)
                  );
                  const heroImages: string[] = Array.isArray(sec.contentJson?.heroImages)
                    ? sec.contentJson.heroImages
                    : [];
                  const heroArtworkIds: string[] = Array.isArray(sec.contentJson?.heroArtworkIds)
                    ? sec.contentJson.heroArtworkIds
                    : [];

                  const heroSlides = Array.from({ length: heroSlideCount }).map((_, idx) => {
                    const linkedArtId = heroArtworkIds[idx];
                    const linkedArt = linkedArtId
                      ? artworks.find((a) => a.id === linkedArtId) || artworks[idx] || artworks[0]
                      : artworks[idx] || artworks[0];

                    const customImg =
                      heroImages[idx] ||
                      (idx === 0 ? sec.contentJson?.imageUrl : undefined);
                    const slideImage =
                      customImg ||
                      linkedArt?.coverImageUrl ||
                      "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

                    return {
                      index: idx,
                      artwork: linkedArt,
                      image: slideImage,
                      title: linkedArt?.title || (idx === 0 ? sec.title : `Showcase Piece 0${idx + 1}`),
                      price: linkedArt?.price,
                      currency: linkedArt?.currency || "USD",
                    };
                  });

                  const safeHeroIndex = activeHeroIndex >= heroSlides.length ? 0 : activeHeroIndex;
                  const currentSlide = heroSlides[safeHeroIndex] || heroSlides[0];
                  const activeArt = currentSlide.artwork || {
                    id: "art-1",
                    title: currentSlide.title,
                    year: 2026,
                    medium: "Natural lapis lazuli & oil on Belgian linen",
                    widthCm: 120,
                    heightCm: 90,
                    price: currentSlide.price ?? 12500,
                    currency: currentSlide.currency,
                    status: "published",
                    coverImageUrl: currentSlide.image,
                  };
                  const heroImage = currentSlide.image;

                  const heroBadge =
                    sec.subtitle ||
                    sec.contentJson?.badge ||
                    "• OPENING VISUAL STATEMENT AND FEATURED CANVAS REVEAL";
                  const heroTitle =
                    sec.title || "The Architecture of Luminous Stillness";
                  const heroDesc =
                    sec.contentJson?.description ||
                    "Original fine artworks by Elena Vance. Exploring the threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence alter the atmospheric presence of space.";
                  const heroCtaText =
                    sec.contentJson?.ctaText || "Collector Portal";

                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Hero Showcase"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 relative min-h-[85vh] flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-3.5 sm:px-10 md:px-14 lg:px-16 overflow-hidden w-full max-w-full"
                      >
                      {/* Ambient Golden Radial Light Glow */}
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[650px] h-[300px] sm:h-[650px] bg-[#d1a86e]/8 rounded-full blur-[140px] pointer-events-none" />

                      <div className="max-w-[1800px] mx-auto w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                        {/* Left Hero Narrative */}
                        <div className="lg:col-span-6 space-y-4 sm:space-y-6 md:space-y-8 z-10 w-full min-w-0">
                          <div
                            data-studio-id={`sec:${sec.id}:subtitle`}
                            data-studio-type="eyebrow"
                            data-studio-label="Opening Statement Pill"
                            data-studio-section={sec.id}
                            data-studio-field="subtitle"
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[9px] xs:text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.25em] text-[#d1a86e] uppercase max-w-full cursor-pointer hover:border-[#d1a86e]/60 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse shrink-0" />
                            <span className="truncate">{heroBadge}</span>
                          </div>

                          <h1
                            data-studio-id={`sec:${sec.id}:title`}
                            data-studio-type="heading"
                            data-studio-label="Hero Title"
                            data-studio-section={sec.id}
                            data-studio-field="title"
                            className="font-serif text-2xl xs:text-3xl sm:text-5xl md:text-6xl leading-[1.15] sm:leading-[1.08] text-white tracking-tight font-medium break-words cursor-pointer hover:text-[#e2c18d] transition-colors"
                          >
                            {heroTitle}
                          </h1>

                          <p
                            data-studio-id={`sec:${sec.id}:description`}
                            data-studio-type="paragraph"
                            data-studio-label="Hero Narrative Description"
                            data-studio-section={sec.id}
                            data-studio-field="description"
                            className="text-xs sm:text-sm md:text-base text-[#a6aabf] max-w-lg leading-relaxed font-light break-words cursor-pointer hover:text-white transition-colors"
                          >
                            {heroDesc}
                          </p>

                          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3 w-full min-w-0">
                            <button
                              data-studio-id={`sec:${sec.id}:cta`}
                              data-studio-type="button"
                              data-studio-label="Primary CTA Button"
                              data-studio-section={sec.id}
                              data-studio-field="ctaText"
                              className="rounded-full bg-gradient-to-r from-[#d1a86e] via-[#e2c18d] to-[#b98e54] text-[#0d0e12] px-3.5 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.18em] shadow-md shadow-[#d1a86e]/20 hover:shadow-[#d1a86e]/30 transition-all active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3 h-3 text-[#0d0e12] shrink-0" />
                              <span className="truncate">{heroCtaText}</span>
                              <ArrowRight className="w-3 h-3 shrink-0" />
                            </button>

                            <button
                              className="rounded-full bg-[#14151a]/90 hover:bg-[#1f212a] text-white px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider sm:tracking-[0.18em] backdrop-blur-md transition-all shadow-sm border border-[#232530] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3 h-3 text-[#d1a86e] shrink-0" />
                              <span className="truncate">View in AR</span>
                            </button>
                          </div>

                          {/* Curatorial Highlights Metrics - 3 columns */}
                          <div className="pt-4 sm:pt-8 grid grid-cols-3 gap-1.5 sm:gap-6 text-left w-full min-w-0 border-t border-[#1c1d25]">
                            <div className="min-w-0">
                              <span className="block font-serif text-base sm:text-2xl text-white truncate">20+</span>
                              <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                                Oil Glaze Layers
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span className="block font-serif text-base sm:text-2xl text-white truncate">1:1</span>
                              <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                                Spatial Scale AR
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span className="block font-serif text-base sm:text-2xl text-white truncate">Paris</span>
                              <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                                Atelier &amp; Studio
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Hero: Dynamic Masterpiece Plaque & Showcase */}
                        <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end z-10 w-full min-w-0">
                          <div className="relative group w-full max-w-xl xl:max-w-2xl min-w-0">
                            {/* Frame & Canvas Presentation */}
                            <div
                              data-studio-id={`sec:${sec.id}:image`}
                              data-studio-type="image"
                              data-studio-label="Hero Masterpiece Canvas"
                              data-studio-section={sec.id}
                              data-studio-field="imageUrl"
                              className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl shadow-black/90 cursor-pointer border border-[#262833] group"
                            >
                              <Image
                                src={heroImage}
                                alt={activeArt.title || heroTitle}
                                fill
                                sizes="600px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />

                              {/* Interactive Overlay on Hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6 pointer-events-none">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs uppercase tracking-wider text-white">
                                    <Eye className="w-3.5 h-3.5 text-[#d1a86e]" />
                                    <span>Inspect Details</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#d1a86e]">
                                    <span>Examine</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Masterpiece Specification Plaque */}
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-[#14151a]/95 border border-[#232530] backdrop-blur-md flex items-center justify-between shadow-xl w-full min-w-0">
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <h2 className="font-serif text-sm sm:text-base text-white font-medium truncate">
                                    {activeArt.title}
                                  </h2>
                                  {activeArt.price && (
                                    <span className="text-[11px] sm:text-xs text-[#d1a86e] font-mono shrink-0">
                                      {formatCurrency(activeArt.price, activeArt.currency)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <span className="p-1.5 sm:p-2 rounded-full bg-[#1c1d25] text-zinc-300">
                                  <Eye className="w-3.5 h-3.5" />
                                </span>
                                <span className="flex items-center gap-1 text-[10px] sm:text-xs tracking-wider uppercase text-[#d1a86e] bg-[#1a1c23] px-2.5 sm:px-3 py-1.5 rounded-full">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AR</span>
                                </span>
                              </div>
                            </div>

                            {/* Multi-piece Showcase Selectors (Carousel Dots & Chevrons) */}
                            {heroSlides.length > 1 && (
                              <div className="mt-3 flex items-center justify-between px-2 text-xs text-zinc-400 w-full min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {heroSlides.map((slide, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveHeroIndex(idx);
                                      }}
                                      className={`transition-all rounded-full cursor-pointer ${
                                        safeHeroIndex === idx
                                          ? "w-7 h-2 bg-[#d1a86e]"
                                          : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
                                      }`}
                                      aria-label={`Select masterpiece slide ${idx + 1}`}
                                    />
                                  ))}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveHeroIndex(
                                        (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                                      );
                                    }}
                                    className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Previous artwork"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <span className="text-[11px] font-mono text-zinc-500">
                                    0{safeHeroIndex + 1} / 0{heroSlides.length}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length);
                                    }}
                                    className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Next artwork"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </React.Fragment>
                );
              }

              // 2. FEATURED ARTWORKS CATALOGUE
              if (sec.sectionKey === "featured_artworks") {
                const maxCount = Number(sec.contentJson?.maxDisplayCount) || 4;
                const showFilters = sec.contentJson?.showFilters !== false;
                const curatorialIntro = sec.contentJson?.curatorialIntro;
                const displayArtworks = artworks.slice(0, maxCount);

                return (
                  <React.Fragment key={sec.id}>
                    {renderDivider && <CuratorialPreviewDivider />}
                    <section
                      key={sec.id}
                      data-studio-id={`sec:${sec.id}`}
                      data-studio-type="section"
                      data-studio-label="Selected Artworks Catalogue"
                      data-studio-section={sec.id}
                      className="scroll-mt-28 relative py-12 sm:py-20 md:py-24 px-3.5 sm:px-10 md:px-14 lg:px-16 border-t border-[#1c1d25] w-full max-w-full"
                    >
                      <div className="max-w-[1800px] mx-auto w-full min-w-0">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
                          <div>
                            <span
                              data-studio-id={`sec:${sec.id}:subtitle`}
                              data-studio-type="eyebrow"
                              data-studio-label="Catalogue Subtitle"
                              data-studio-section={sec.id}
                              data-studio-field="subtitle"
                              className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium cursor-pointer hover:text-white transition-colors"
                            >
                              {sec.subtitle || "Curated Catalogue"}
                            </span>
                            <h2
                              data-studio-id={`sec:${sec.id}:title`}
                              data-studio-type="heading"
                              data-studio-label="Catalogue Heading"
                              data-studio-section={sec.id}
                              data-studio-field="title"
                              className="font-serif text-2xl sm:text-3xl md:text-5xl text-white mt-1 cursor-pointer hover:text-[#d1a86e] transition-colors"
                            >
                              {sec.title || "Selected Works"}
                            </h2>
                            {curatorialIntro && (
                              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-2 font-light">
                                {curatorialIntro}
                              </p>
                            )}
                          </div>

                          {/* Quick Categories Filter */}
                          {showFilters && (
                            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full max-w-full min-w-0">
                              <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase bg-[#d1a86e] text-[#0d0e12] font-semibold shrink-0">
                                All Works
                              </span>
                              <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase bg-[#14151a] text-zinc-400 shrink-0">
                                Available
                              </span>
                              <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase bg-[#14151a] text-zinc-400 shrink-0">
                                Monumental
                              </span>
                              <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase bg-[#14151a] text-zinc-400 shrink-0">
                                Mineral &amp; Lapis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Artwork Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8 w-full min-w-0">
                          {displayArtworks.map((art) => (
                            <div
                              key={art.id}
                              className="group flex flex-col space-y-2.5 sm:space-y-4 bg-[#14151a] border border-[#262833] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl shadow-black/40 hover:border-[#d1a86e]/40 hover:shadow-2xl"
                            >
                              <div className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#101116]">
                                <Image
                                  src={art.coverImageUrl}
                                  alt={art.altText || art.title}
                                  fill
                                  sizes="350px"
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              </div>

                              {/* Clean Metadata: Name & Price Only */}
                              <div className="pt-0.5 px-0.5">
                                <div className="flex items-baseline justify-between gap-1.5">
                                  <span className="font-serif text-xs sm:text-base text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1 font-medium">
                                    {art.title}
                                  </span>
                                  {art.price && (
                                    <span className="text-xs sm:text-sm text-[#d1a86e] font-mono font-semibold shrink-0">
                                      {formatCurrency(art.price, art.currency)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View Complete Collection Footer CTA */}
                        <div className="mt-8 sm:mt-12 text-center px-2">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#262833] bg-[#14151a] hover:bg-[#1f212c] text-white hover:text-[#d1a86e] text-xs uppercase tracking-widest h-10 px-8 transition-colors cursor-pointer shadow-xl">
                            <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                            <span>Explore Full Private Catalogue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </section>
                  </React.Fragment>
                );
              }

                // 3. LATEST COLLECTION SPOTLIGHT
                if (sec.sectionKey === "latest_collection") {
                  const targetCol = sec.contentJson?.collectionId
                    ? collections.find((c) => c.id === sec.contentJson?.collectionId) || featuredCollection
                    : featuredCollection;
                  const collectionImage =
                    sec.contentJson?.imageUrl ||
                    targetCol?.coverImageUrl ||
                    heroArtwork?.coverImageUrl;
                  const collectionTitle = sec.title || targetCol?.title || "The Mineral Horizons Cycle";
                  const collectionStatement =
                    sec.contentJson?.curatorialStatement ||
                    sec.contentJson?.description ||
                    targetCol?.curatorialStatement ||
                    targetCol?.description ||
                    "Elena Vance groups her artistic inquiries into multi-year cycles exploring mineral glazes, crushed pigments, and Belgian linen.";
                  const collectionCta = sec.contentJson?.ctaText || "Explore Series";

                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Latest Collection Spotlight"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 bg-[#0e0f14] py-14 sm:py-24 w-full max-w-full overflow-hidden border-y border-[#181924]"
                      >
                        <div className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
                          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                            <div
                              data-studio-id={`sec:${sec.id}:subtitle`}
                              data-studio-type="eyebrow"
                              data-studio-label="Collection Eyebrow"
                              data-studio-section={sec.id}
                              data-studio-field="subtitle"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181924] text-[9px] sm:text-[10px] tracking-[0.22em] text-[#d1a86e] uppercase cursor-pointer hover:text-white transition-colors"
                            >
                              <Layers className="w-3 h-3" />
                              <span>{sec.subtitle || "Featured Series Spotlight"}</span>
                            </div>

                            <h2
                              data-studio-id={`sec:${sec.id}:title`}
                              data-studio-type="heading"
                              data-studio-label="Collection Title"
                              data-studio-section={sec.id}
                              data-studio-field="title"
                              className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium cursor-pointer hover:text-[#d1a86e] transition-colors"
                            >
                              {collectionTitle}
                            </h2>

                            <p
                              data-studio-id={`sec:${sec.id}:description`}
                              data-studio-type="paragraph"
                              data-studio-label="Collection Description"
                              data-studio-section={sec.id}
                              data-studio-field="description"
                              className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light cursor-pointer hover:text-white transition-colors"
                            >
                              {collectionStatement}
                            </p>

                            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="rounded-full bg-[#d1a86e] text-[#0d0e12] font-semibold text-[10px] sm:text-xs tracking-wider uppercase h-7.5 sm:h-9 px-3.5 sm:px-5 shadow-md inline-flex items-center gap-1.5">
                                <span>{collectionCta}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                              <span className="rounded-full bg-[#161720] text-zinc-300 text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3 sm:px-4 inline-flex items-center gap-1.5">
                                <Sparkles className="w-2.5 h-2.5 text-[#d1a86e]" />
                                <span>All Series</span>
                              </span>
                            </div>
                          </div>

                          {collectionImage && (
                            <div className="lg:col-span-7 relative">
                              <div
                                data-studio-id={`sec:${sec.id}:image`}
                                data-studio-type="image"
                                data-studio-label="Collection Panoramic Cover"
                                data-studio-section={sec.id}
                                data-studio-field="imageUrl"
                                className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-[#14151a] border border-[#232530] cursor-pointer"
                              >
                                <Image
                                  src={collectionImage}
                                  alt={collectionTitle}
                                  fill
                                  sizes="800px"
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6 pointer-events-none">
                                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#d1a86e]">
                                    {targetCol?.title || "Curated"} Series
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    </React.Fragment>
                  );
                }

                // 4. WEBAR SPATIAL STUDIO / INTERACTIVE ROOM PREVIEWER
                if (sec.sectionKey === "ar_experience") {
                  const arPreviewArt = heroArtwork || artworks[0];
                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Spatial WebAR Studio Section"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden space-y-6 sm:space-y-8"
                      >
                        <div className="max-w-3xl mx-auto text-center space-y-3">
                          <span
                            data-studio-id={`sec:${sec.id}:subtitle`}
                            data-studio-type="eyebrow"
                            data-studio-label="AR Studio Eyebrow"
                            data-studio-section={sec.id}
                            data-studio-field="subtitle"
                            className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer hover:text-white transition-colors"
                          >
                            {sec.subtitle || "Spatial WebAR & Room Studio"}
                          </span>
                          <h2
                            data-studio-id={`sec:${sec.id}:title`}
                            data-studio-type="heading"
                            data-studio-label="AR Studio Title"
                            data-studio-section={sec.id}
                            data-studio-field="title"
                            className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium cursor-pointer hover:text-[#d1a86e] transition-colors"
                          >
                            {sec.title || "View Original Works in Your Interior Space"}
                          </h2>
                          <p
                            data-studio-id={`sec:${sec.id}:description`}
                            data-studio-type="paragraph"
                            data-studio-label="AR Studio Description"
                            data-studio-section={sec.id}
                            data-studio-field="description"
                            className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed cursor-pointer hover:text-white transition-colors"
                          >
                            {sec.contentJson?.description ||
                              "Calibrate any painting to its physical centimeter scale against curated architectural walls and custom frames, or launch camera WebAR directly on your phone."}
                          </p>
                        </div>

                        {/* Simulated Room Studio Canvas */}
                        <div className="rounded-3xl border border-[#2a2c3a] bg-[#12131a] p-5 sm:p-8 space-y-6">
                          {/* Wall Texture Selector */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#20222e]">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Architectural Wall:</span>
                              <span className="px-2.5 py-1 rounded-full bg-[#1e202c] text-white text-[10px] uppercase font-medium">Parisian White</span>
                              <span className="px-2.5 py-1 rounded-full text-zinc-400 text-[10px] uppercase">Loft Brick</span>
                              <span className="px-2.5 py-1 rounded-full text-zinc-400 text-[10px] uppercase">Nordic Oak</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-[#d1a86e] font-mono">1:1 True Centimeter Scale</span>
                            </div>
                          </div>

                          {/* Room Interior Wall Display */}
                          <div className="relative min-h-[300px] sm:min-h-[420px] rounded-2xl bg-gradient-to-b from-[#25262f] via-[#1c1d25] to-[#12131a] flex items-center justify-center p-6 shadow-inner border border-white/5">
                            {arPreviewArt && (
                              <div className="relative aspect-[4/3] w-64 sm:w-80 shadow-[0_25px_50px_rgba(0,0,0,0.8)] border-4 border-[#d1a86e]/60 rounded-sm overflow-hidden">
                                <Image
                                  src={arPreviewArt.coverImageUrl}
                                  alt={arPreviewArt.title}
                                  fill
                                  sizes="400px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-zinc-400 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
                              Physical: {arPreviewArt?.widthCm || 120} cm × {arPreviewArt?.heightCm || 90} cm
                            </div>
                          </div>
                        </div>
                      </section>
                    </React.Fragment>
                  );
                }

                // 5. ARTIST ATELIER & STATEMENT
                if (sec.sectionKey === "artist_story") {
                  const atelierImg =
                    sec.contentJson?.imageUrl ||
                    siteSettings.aboutPageConfig?.artistImageUrl ||
                    "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";
                  const bioEssay =
                    sec.contentJson?.biography ||
                    sec.contentJson?.description ||
                    siteSettings.aboutPageConfig?.bio ||
                    "Elena Vance (b. 1986) divides her studio practice between Paris and the wind-sculpted granite coast of Brittany. Her monumental canvases investigate the physical threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence transform architectural interiors.";
                  const quoteText =
                    sec.contentJson?.quote ||
                    "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room.";
                  const locationText =
                    sec.contentJson?.location || "Studio 04 • Rue Vivienne, Paris";
                  const monologueTagline =
                    sec.subtitle || "Studio Monologue & Philosophy";
                  const atelierHeadline =
                    sec.title || "The Alchemy of Natural Earth & Luminous Glazes";

                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Artist Atelier & Statement"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden space-y-16 sm:space-y-24"
                      >
                        {/* Curatorial Quote Banner */}
                        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
                          <span
                            data-studio-id={`sec:${sec.id}:subtitle`}
                            data-studio-type="eyebrow"
                            data-studio-label="Monologue Eyebrow"
                            data-studio-section={sec.id}
                            data-studio-field="subtitle"
                            className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer hover:text-white transition-colors"
                          >
                            {monologueTagline}
                          </span>
                          <blockquote
                            data-studio-id={`sec:${sec.id}:quote`}
                            data-studio-type="heading"
                            data-studio-label="Philosophy Quote"
                            data-studio-section={sec.id}
                            data-studio-field="quote"
                            className="font-serif text-xl sm:text-3xl md:text-4xl text-white font-light italic leading-snug cursor-pointer hover:text-[#e2c18d] transition-colors"
                          >
                            &ldquo;{quoteText}&rdquo;
                          </blockquote>
                          <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-xs tracking-widest text-zinc-400 uppercase font-mono">
                            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
                            <span>{artistName} — {locationText}</span>
                            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
                          </div>
                        </div>

                        {/* 2-Column Editorial Spread */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
                          <div className="lg:col-span-6 relative">
                            <div
                              data-studio-id={`sec:${sec.id}:image`}
                              data-studio-type="image"
                              data-studio-label="Atelier Photo"
                              data-studio-section={sec.id}
                              data-studio-field="imageUrl"
                              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl border border-[#232530] cursor-pointer"
                            >
                              <Image
                                src={atelierImg}
                                alt="Atelier Studio"
                                fill
                                sizes="600px"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6 pointer-events-none">
                                <p className="text-[10px] sm:text-xs text-zinc-300 font-mono tracking-wider uppercase">
                                  {locationText}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
                            <div className="space-y-3 sm:space-y-4">
                              <h3
                                data-studio-id={`sec:${sec.id}:title`}
                                data-studio-type="heading"
                                data-studio-label="Atelier Headline"
                                data-studio-section={sec.id}
                                data-studio-field="title"
                                className="font-serif text-2xl sm:text-4xl text-white font-medium cursor-pointer hover:text-[#d1a86e] transition-colors"
                              >
                                {atelierHeadline}
                              </h3>
                              <p
                                data-studio-id={`sec:${sec.id}:description`}
                                data-studio-type="paragraph"
                                data-studio-label="Atelier Curatorial Essay"
                                data-studio-section={sec.id}
                                data-studio-field="description"
                                className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light cursor-pointer hover:text-white transition-colors"
                              >
                                {bioEssay}
                              </p>
                            </div>

                            {/* 4 Pillars of Studio Craftsmanship */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
                              <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530]">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                                  01 / Lapis Lazuli
                                </span>
                                <p className="text-[10px] sm:text-xs text-zinc-400 font-light">
                                  Hand-ground mineral stone with pure walnut oil.
                                </p>
                              </div>
                              <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530]">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                                  02 / Belgian Linen
                                </span>
                                <p className="text-[10px] sm:text-xs text-zinc-400 font-light">
                                  Triple-primed Claessens linen on tulipwood.
                                </p>
                              </div>
                              <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530]">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                                  03 / Glaze Optics
                                </span>
                                <p className="text-[10px] sm:text-xs text-zinc-400 font-light">
                                  20+ translucent layers shifting in natural daylight.
                                </p>
                              </div>
                              <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530]">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                                  04 / Archival
                                </span>
                                <p className="text-[10px] sm:text-xs text-zinc-400 font-light">
                                  Museum archival longevity for centuries.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collector Concierge & Provenance Standards */}
                        <div className="rounded-3xl bg-[#101116] border border-[#232530] p-5 sm:p-10 md:p-14 space-y-8 shadow-2xl">
                          <div className="max-w-2xl space-y-2">
                            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                              Private Acquisition Standards
                            </span>
                            <h3 className="font-serif text-2xl sm:text-4xl text-white font-medium">
                              Museum-Grade Handling for Distinguished Collectors
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
                            <div className="space-y-2 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] border border-[#232530]">
                              <Award className="w-5 h-5 text-[#d1a86e]" />
                              <h4 className="font-serif text-xs sm:text-base text-white font-medium">Signed Certificate</h4>
                              <p className="text-[10px] sm:text-xs text-zinc-400 font-light">Embossed provenance paper.</p>
                            </div>
                            <div className="space-y-2 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] border border-[#232530]">
                              <Package className="w-5 h-5 text-[#d1a86e]" />
                              <h4 className="font-serif text-xs sm:text-base text-white font-medium">Thermal Crate</h4>
                              <p className="text-[10px] sm:text-xs text-zinc-400 font-light">Multi-ply insulated packaging.</p>
                            </div>
                            <div className="space-y-2 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] border border-[#232530]">
                              <ShieldCheck className="w-5 h-5 text-[#d1a86e]" />
                              <h4 className="font-serif text-xs sm:text-base text-white font-medium">White-Glove Air</h4>
                              <p className="text-[10px] sm:text-xs text-zinc-400 font-light">Insured door-to-door courier.</p>
                            </div>
                            <div className="space-y-2 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] border border-[#232530]">
                              <Sparkles className="w-5 h-5 text-[#d1a86e]" />
                              <h4 className="font-serif text-xs sm:text-base text-white font-medium">Spatial AR</h4>
                              <p className="text-[10px] sm:text-xs text-zinc-400 font-light">Lighting calibrated preview.</p>
                            </div>
                          </div>
                        </div>

                        {/* Curriculum Vitae (CV) & Provenance Ledger */}
                        <div className="border-t border-[#1c1d25] pt-12 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                          <div className="lg:col-span-4 space-y-2">
                            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                              Curriculum Vitae
                            </span>
                            <h4 className="font-serif text-2xl sm:text-3xl text-white">
                              Exhibitions &amp; Provenance
                            </h4>
                            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm pt-1">
                              Institutional record, solo museum presentations, and permanent foundation collections.
                            </p>
                          </div>

                          <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-3">
                              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#d1a86e]" />
                                <span>Selected Exhibitions</span>
                              </div>
                              <div className="space-y-2.5 text-xs sm:text-sm">
                                {[
                                  { year: "2026", title: "Luminescence at Twilight — Galerie Vivienne", location: "Paris, France" },
                                  { year: "2024", title: "The Mineral Horizon — Marlborough Fine Art", location: "London, UK" },
                                  { year: "2023", title: "Subterranean Glazes — Ginza Contemporary", location: "Tokyo, Japan" },
                                ].map((ex, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2.5 gap-1 sm:gap-4"
                                  >
                                    <span className="text-white font-medium">{ex.title} — {ex.location}</span>
                                    <span className="text-zinc-500 font-mono text-[11px] sm:text-xs">{ex.year}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#d1a86e]" />
                                <span>Honors &amp; Museum Acquisitions</span>
                              </div>
                              <div className="space-y-2.5 text-xs sm:text-sm">
                                {[
                                  "Prix Jean-François Millet pour la Peinture Contemporaine",
                                  "Permanent Collection Acquisition, Geneva Heritage Trust",
                                  "ADAGP France Registered Contemporary Master",
                                ].map((ach, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2.5 gap-1 sm:gap-4"
                                  >
                                    <span className="text-white font-medium">{ach}</span>
                                    <span className="text-[#d1a86e] text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>Verified Provenance</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </React.Fragment>
                  );
                }

                // 6. CURRENT / FEATURED EXHIBITION
                if (sec.sectionKey === "featured_exhibition") {
                  const targetExh = sec.contentJson?.exhibitionId
                    ? exhibitions.find((e) => e.id === sec.contentJson?.exhibitionId) || currentExhibition
                    : currentExhibition;
                  const exhImageUrl =
                    sec.contentJson?.imageUrl ||
                    targetExh?.coverImageUrl ||
                    heroArtwork?.coverImageUrl;
                  const exhTitle = sec.title || targetExh?.title || "Silence & Sediment: The Paris Cycle";
                  const exhLocation =
                    sec.contentJson?.location || targetExh?.location || "Galerie Vivienne • Paris, France";
                  const exhDates =
                    sec.contentJson?.dates || "April 15 — June 28, 2026";
                  const exhDesc =
                    sec.contentJson?.curatorNote ||
                    sec.contentJson?.description ||
                    targetExh?.description ||
                    "A comprehensive showcase of monumental lapis lazuli compositions exploring architectural quietude and pigment geology.";

                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Solo Exhibition Section"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden"
                      >
                        <div className="pt-8 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
                          {exhImageUrl && (
                            <div className="lg:col-span-7">
                              <div
                                data-studio-id={`sec:${sec.id}:image`}
                                data-studio-type="image"
                                data-studio-label="Exhibition Poster"
                                data-studio-section={sec.id}
                                data-studio-field="imageUrl"
                                className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-[#14151a] border border-[#232530] cursor-pointer"
                              >
                                <Image
                                  src={exhImageUrl}
                                  alt={exhTitle}
                                  fill
                                  sizes="800px"
                                  className="object-cover"
                                />
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                                  <span className="backdrop-blur-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide uppercase">
                                    Currently Open
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                            <span
                              data-studio-id={`sec:${sec.id}:subtitle`}
                              data-studio-type="eyebrow"
                              data-studio-label="Exhibition Eyebrow"
                              data-studio-section={sec.id}
                              data-studio-field="subtitle"
                              className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer hover:text-white transition-colors"
                            >
                              {sec.subtitle || "Current Solo Exhibition"}
                            </span>

                            <h3
                              data-studio-id={`sec:${sec.id}:title`}
                              data-studio-type="heading"
                              data-studio-label="Exhibition Title"
                              data-studio-section={sec.id}
                              data-studio-field="title"
                              className="font-serif text-2xl sm:text-4xl text-white font-medium cursor-pointer hover:text-[#d1a86e] transition-colors"
                            >
                              {exhTitle}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-zinc-300 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                              <span>{exhLocation}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Calendar className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                              <span>{exhDates}</span>
                            </div>

                            <p
                              data-studio-id={`sec:${sec.id}:description`}
                              data-studio-type="paragraph"
                              data-studio-label="Exhibition Description"
                              data-studio-section={sec.id}
                              data-studio-field="description"
                              className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed pt-1 cursor-pointer hover:text-white transition-colors"
                            >
                              {exhDesc}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="rounded-full bg-[#d1a86e] text-[#0d0e12] font-semibold text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3.5 sm:px-5 shadow-md inline-flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span>RSVP Exhibition</span>
                              </span>
                              <span className="rounded-full bg-[#161720] text-white text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3 sm:px-4 inline-flex items-center gap-1.5">
                                <span>Dossier</span>
                                <ArrowRight className="w-3 h-3 text-[#d1a86e]" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </section>
                    </React.Fragment>
                  );
                }

                // 7. PRIVATE INQUIRIES & ACQUISITIONS (MERGED CONTACT EXPERIENCE)
                if (sec.sectionKey === "contact_cta") {
                  const recipientEmail =
                    sec.contentJson?.email || siteSettings.contactEmail || "curator@latelier-lumineux.art";
                  const phone =
                    sec.contentJson?.phone || siteSettings.phone || "+33 (0)1 42 68 55 00";
                  const whatsapp =
                    sec.contentJson?.whatsapp || siteSettings.whatsapp || "+33 6 12 34 56 78";
                  const address =
                    sec.contentJson?.address || siteSettings.address || "14 Rue de Beaune, 7th Arrondissement, 75007 Paris, France";
                  const hours =
                    sec.contentJson?.businessHours || siteSettings.businessHours || "Tuesday – Saturday, 10:00 – 18:00 CET (By Appointment)";
                  const contactDesc =
                    sec.contentJson?.description ||
                    "For private acquisitions, curatorial exhibition loans, bespoke commissions, and private atelier viewings, please correspond directly with Madame Vance's Paris liaison desk.";

                  return (
                    <React.Fragment key={sec.id}>
                      {renderDivider && <CuratorialPreviewDivider />}
                      <section
                        id="contact"
                        key={sec.id}
                        data-studio-id={`sec:${sec.id}`}
                        data-studio-type="section"
                        data-studio-label="Contact & Studio Inquiries Section"
                        data-studio-section={sec.id}
                        className="scroll-mt-28 max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden space-y-8 sm:space-y-12"
                      >
                        <div className="max-w-3xl space-y-3">
                          <div
                            data-studio-id={`sec:${sec.id}:subtitle`}
                            data-studio-type="eyebrow"
                            data-studio-label="Liaison Eyebrow"
                            data-studio-section={sec.id}
                            data-studio-field="subtitle"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181924] border border-[#262833] text-[9px] sm:text-[10px] tracking-[0.22em] text-[#d1a86e] uppercase font-semibold cursor-pointer hover:text-white transition-colors"
                          >
                            <Mail className="w-3 h-3 text-[#d1a86e]" />
                            <span>{sec.subtitle || "Curatorial Liaison & Private Acquisitions"}</span>
                          </div>

                          <h2
                            data-studio-id={`sec:${sec.id}:title`}
                            data-studio-type="heading"
                            data-studio-label="Contact Section Title"
                            data-studio-section={sec.id}
                            data-studio-field="title"
                            className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium cursor-pointer hover:text-[#d1a86e] transition-colors"
                          >
                            {sec.title || "Contact & Studio Inquiries"}
                          </h2>

                          <p
                            data-studio-id={`sec:${sec.id}:description`}
                            data-studio-type="paragraph"
                            data-studio-label="Contact Description"
                            data-studio-section={sec.id}
                            data-studio-field="description"
                            className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light cursor-pointer hover:text-white transition-colors"
                          >
                            {contactDesc}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                          {/* Interactive Form Mockup Column */}
                          <div className="lg:col-span-7 bg-[#14151a] border border-[#262833] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                                  Collector Name *
                                </span>
                                <div className="h-10 px-3.5 rounded-lg bg-[#1a1c23] border border-[#262833] text-xs text-zinc-400 flex items-center">
                                  e.g. Genevieve Laurent
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                                  Email Address *
                                </span>
                                <div className="h-10 px-3.5 rounded-lg bg-[#1a1c23] border border-[#262833] text-xs text-zinc-400 flex items-center">
                                  e.g. g.laurent@fondation.fr
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                                  Direct Phone
                                </span>
                                <div className="h-10 px-3.5 rounded-lg bg-[#1a1c23] border border-[#262833] text-xs text-zinc-400 flex items-center">
                                  {phone}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                                  Inquiry Nature
                                </span>
                                <div className="h-10 px-3.5 rounded-lg bg-[#1a1c23] border border-[#262833] text-xs text-white flex items-center justify-between">
                                  <span>Private Acquisition Inquiry</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                                Your Inquiry Message *
                              </span>
                              <div className="h-24 p-3.5 rounded-lg bg-[#1a1c23] border border-[#262833] text-xs text-zinc-500">
                                Please describe your acquisition or curatorial inquiry in detail...
                              </div>
                            </div>

                            <button
                              data-studio-id={`sec:${sec.id}:cta`}
                              data-studio-type="button"
                              data-studio-label="Inquiry Transmit Button"
                              data-studio-section={sec.id}
                              data-studio-field="ctaText"
                              className="w-full h-11 rounded-lg bg-[#d1a86e] text-[#0d0e12] text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-[#d1a86e]/10 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sec.contentJson?.ctaText || "Transmit Inquiry to Studio"}</span>
                            </button>
                          </div>

                          {/* Studio Dossier Info Column */}
                          <div className="lg:col-span-5 space-y-6 lg:pl-4">
                            <div className="p-6 sm:p-8 bg-[#14151a] border border-[#262833] rounded-2xl space-y-6 shadow-xl">
                              <h3 className="font-serif text-xl sm:text-2xl text-white">Direct Correspondence</h3>

                              <div className="space-y-4 text-xs">
                                <div
                                  data-studio-id="contact:email"
                                  data-studio-type="paragraph"
                                  data-studio-label="Curatorial Email"
                                  className="flex items-start gap-3 cursor-pointer"
                                >
                                  <Mail className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                                      Curatorial Email
                                    </span>
                                    <span className="text-white hover:text-[#d1a86e] transition-colors font-medium text-xs sm:text-sm">
                                      {recipientEmail}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  data-studio-id="contact:phone"
                                  data-studio-type="paragraph"
                                  data-studio-label="Studio Desk Phone"
                                  className="flex items-start gap-3 cursor-pointer"
                                >
                                  <Phone className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                                      Studio Desk
                                    </span>
                                    <span className="text-white">
                                      {phone}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  data-studio-id="contact:whatsapp"
                                  data-studio-type="paragraph"
                                  data-studio-label="WhatsApp Liaison"
                                  className="flex items-start gap-3 cursor-pointer"
                                >
                                  <MessageCircle className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                                      WhatsApp Liaison
                                    </span>
                                    <span className="text-white">{whatsapp}</span>
                                  </div>
                                </div>

                                <div
                                  data-studio-id="contact:address"
                                  data-studio-type="paragraph"
                                  data-studio-label="Atelier Address"
                                  className="flex items-start gap-3 cursor-pointer"
                                >
                                  <MapPin className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                                      Atelier &amp; Private Gallery
                                    </span>
                                    <span className="text-white leading-relaxed">
                                      {address}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  data-studio-id="contact:hours"
                                  data-studio-type="paragraph"
                                  data-studio-label="Studio Hours"
                                  className="flex items-start gap-3 cursor-pointer"
                                >
                                  <Clock className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                                      Studio Hours
                                    </span>
                                    <span className="text-white">
                                      {hours}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Privacy & Provenance Guarantee */}
                            <div className="p-5 sm:p-6 bg-[#14151a]/70 border border-[#262833] rounded-2xl space-y-2.5 text-xs text-[#8e92a4]">
                              <div className="flex items-center gap-2 text-white font-medium">
                                <ShieldCheck className="w-4 h-4 text-[#d1a86e]" />
                                <span className="text-xs uppercase tracking-wider text-[#d1a86e]">Confidentiality Protocol</span>
                              </div>
                              <p className="leading-relaxed text-[11px] sm:text-xs">
                                All collector inquiries, institutional loans, and client identities are maintained under strict non-disclosure conventions. Authenticated certificates of provenance accompany all acquisitions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </React.Fragment>
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
              <span
                data-studio-id="gallery:subtitle"
                data-studio-type="eyebrow"
                data-studio-label="Gallery Subtitle"
                data-studio-field="subtitle"
                className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer"
              >
                {galleryCfg.subtitle || "The Studio Catalogue"}
              </span>
              <h1
                data-studio-id="gallery:title"
                data-studio-type="heading"
                data-studio-label="Gallery Main Title"
                data-studio-field="title"
                className="font-serif text-3xl md:text-4xl text-white font-medium cursor-pointer"
              >
                {galleryCfg.title || "Original Canvases & Pigments"}
              </h1>
              <p
                data-studio-id="gallery:description"
                data-studio-type="paragraph"
                data-studio-label="Gallery Statement Description"
                data-studio-field="description"
                className="text-xs text-zinc-400 leading-relaxed cursor-pointer"
              >
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
              <span
                data-studio-id="collections:eyebrow"
                data-studio-type="eyebrow"
                data-studio-label="Collections Eyebrow"
                data-studio-field="eyebrow"
                className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer"
              >
                {collectionsCfg.eyebrow || "Thematic Bodies of Work"}
              </span>
              <h1
                data-studio-id="collections:title"
                data-studio-type="heading"
                data-studio-label="Collections Heading"
                data-studio-field="title"
                className="font-serif text-3xl md:text-4xl text-white font-medium cursor-pointer"
              >
                {collectionsCfg.title || "Curated Series"}
              </h1>
              <p
                data-studio-id="collections:description"
                data-studio-type="paragraph"
                data-studio-label="Collections Description"
                data-studio-field="description"
                className="text-xs text-zinc-400 leading-relaxed cursor-pointer"
              >
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
              <span
                data-studio-id="exhibitions:eyebrow"
                data-studio-type="eyebrow"
                data-studio-label="Exhibitions Eyebrow"
                data-studio-field="eyebrow"
                className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer"
              >
                {exhibitionsCfg.eyebrow || "Solo Shows & Museum Installations"}
              </span>
              <h1
                data-studio-id="exhibitions:title"
                data-studio-type="heading"
                data-studio-label="Exhibitions Heading"
                data-studio-field="title"
                className="font-serif text-3xl md:text-4xl text-white font-medium cursor-pointer"
              >
                {exhibitionsCfg.title || "Exhibitions & Retrospectives"}
              </h1>
              <p
                data-studio-id="exhibitions:description"
                data-studio-type="paragraph"
                data-studio-label="Exhibitions Description"
                data-studio-field="description"
                className="text-xs text-zinc-400 leading-relaxed cursor-pointer"
              >
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
              <div
                data-studio-id="about:portrait"
                data-studio-type="image"
                data-studio-label="Artist Portrait"
                data-studio-field="artistImageUrl"
                className="relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-[#d1a86e]/40 shadow-2xl shrink-0 cursor-pointer"
              >
                {aboutCfg.artistImageUrl ? (
                  <Image src={aboutCfg.artistImageUrl} alt={artistName} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#161820] flex items-center justify-center text-zinc-600 text-xs">
                    Portrait
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <span
                  data-studio-id="about:intro"
                  data-studio-type="eyebrow"
                  data-studio-label="About Intro Eyebrow"
                  data-studio-field="intro"
                  className="text-[10px] uppercase tracking-[0.25em] text-[#d1a86e] font-semibold cursor-pointer"
                >
                  {aboutCfg.intro || "The Artist & Studio"}
                </span>
                <h1 className="font-serif text-3xl text-white font-medium">{artistName}</h1>
                <p
                  data-studio-id="about:bio"
                  data-studio-type="paragraph"
                  data-studio-label="Artist Bio Statement"
                  data-studio-field="bio"
                  className="text-xs text-zinc-300 leading-relaxed max-w-md cursor-pointer"
                >
                  {aboutCfg.bio || siteSettings.bioSummary || "Contemporary fine artist exploring oceanic silence and mineral materiality."}
                </p>
              </div>
            </div>

            {/* Statement */}
            <div className="space-y-3 p-6 rounded-2xl bg-[#14151a] border border-[#262833]">
              <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-mono">Curatorial Monologue</span>
              <p
                data-studio-id="about:story"
                data-studio-type="paragraph"
                data-studio-label="Curatorial Statement"
                data-studio-field="story"
                className="font-serif text-lg text-white italic leading-relaxed cursor-pointer"
              >
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
              <span
                data-studio-id="contact:eyebrow"
                data-studio-type="eyebrow"
                data-studio-label="Contact Eyebrow"
                data-studio-field="eyebrow"
                className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold cursor-pointer"
              >
                Studio Acquisition Desk
              </span>
              <h1
                data-studio-id="contact:title"
                data-studio-type="heading"
                data-studio-label="Contact Title"
                data-studio-field="title"
                className="font-serif text-3xl text-white font-medium cursor-pointer"
              >
                {contactCfg.title || "Inquiries & Acquisitions"}
              </h1>
              <p
                data-studio-id="contact:description"
                data-studio-type="paragraph"
                data-studio-label="Contact Instructions"
                data-studio-field="description"
                className="text-xs text-zinc-400 cursor-pointer"
              >
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

        {/* 3. AUTHENTIC STOREFRONT FOOTER */}
        <footer
          data-studio-id="footer:main"
          data-studio-type="section"
          data-studio-label="Public Footer"
          className="border-t border-[#1c1d25] bg-[#0a0b0d] pt-12 sm:pt-16 pb-10 text-[#8e92a4] w-full max-w-full overflow-hidden"
        >
          <div className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-10 w-full min-w-0">
              {/* Col 1: Studio Monologue */}
              <div className="md:col-span-4 space-y-3">
                <h3 className="font-serif text-xl tracking-[0.15em] text-white uppercase font-light">
                  {brandTitle}
                </h3>
                <p className="text-xs leading-relaxed max-w-md text-[#a6aabf] font-light">
                  {siteSettings.footerConfig?.description ||
                    "The independent studio and private gallery of contemporary artist Elena Vance. Dedicated to exploring lapis lazuli glazes, geological materiality, and true-scale spatial WebAR curation."}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
                  <span className="text-zinc-500">Studios:</span>
                  <span className="text-zinc-300">Paris</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300">Côtes-d'Armor (Brittany)</span>
                </div>
              </div>

              {/* Col 2: Navigation Columns */}
              <div className="md:col-span-4 grid grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-2">
                    Studio
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400 font-light">
                    <li className="hover:text-white cursor-pointer">Artist Monologue &amp; CV</li>
                    <li className="hover:text-white cursor-pointer">Studio Inquiries &amp; Press</li>
                    <li className="hover:text-white cursor-pointer">Collector Portal</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-2">
                    Provenance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400 font-light">
                    <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                    <li className="hover:text-white cursor-pointer">Terms of Acquisition</li>
                    <li className="hover:text-white cursor-pointer">Collector Inquiries</li>
                  </ul>
                </div>
              </div>

              {/* Col 3: Provenance Standards */}
              <div className="md:col-span-4 space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">
                  Studio Provenance
                </h4>
                <p className="text-[11px] text-[#a6aabf] leading-relaxed font-light">
                  Canvases are accompanied by an authenticated certificate signed by {artistName}, registered with ADAGP France.
                </p>
                <p className="text-[10px] text-zinc-600 font-mono pt-2">
                  {siteSettings.footerConfig?.copyrightText || `© ${new Date().getFullYear()} ${artistName}. All rights reserved.`}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
