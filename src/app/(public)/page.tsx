import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Eye,
  ShieldCheck,
  MapPin,
  Mail,
} from "lucide-react";
import {
  getArtworks,
  getCollections,
  getExhibitions,
  getHomepageSections,
  getSiteSettings,
} from "@/db/repository";
import { formatCurrency, formatDimensions } from "@/lib/utils";

export const revalidate = 60; // ISR revalidation every 60s

export default async function HomePage() {
  const [artworks, collections, exhibitions, sections, settings] =
    await Promise.all([
      getArtworks({ featuredOnly: true }),
      getCollections(),
      getExhibitions(),
      getHomepageSections(),
      getSiteSettings(),
    ]);

  const heroArtwork = artworks[0];
  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  // Active sections sorted by displayOrder
  const sortedSections = [...sections]
    .filter((s) => s.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-28 md:space-y-36 pb-20">
      {sortedSections.map((sec) => {
        // 1. HERO SECTION
        if (sec.sectionKey === "hero") {
          const heroImageUrl =
            sec.contentJson?.imageUrl || heroArtwork?.coverImageUrl;
          const badgeText =
            sec.contentJson?.badge || sec.subtitle || "Spring 2026 Retrospective";
          const title =
            sec.title || "The Architecture of Luminous Stillness";
          const description =
            sec.contentJson?.description ||
            "Original fine artworks by Elena Vance. Exploring the threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence alter the atmospheric presence of space.";
          const ctaText = sec.contentJson?.ctaText || "Explore Catalog";
          const ctaUrl = sec.contentJson?.ctaUrl || "/gallery";

          return (
            <section
              key={sec.id}
              className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-6 md:px-12 overflow-hidden"
            >
              {/* Subtle Ambient Light Glow */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d1a86e]/5 rounded-full blur-[140px] pointer-events-none" />

              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* Left Hero Narrative */}
                <div className="lg:col-span-6 space-y-6 md:space-y-8 z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18191e] border border-[#262833] text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
                    <span>{badgeText}</span>
                  </div>

                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-white tracking-tight font-medium">
                    {title}
                  </h1>

                  <p className="text-sm md:text-base text-[#a6aabf] max-w-lg leading-relaxed">
                    {description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href={ctaUrl}
                      className="flex items-center gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#d1a86e]/15"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {heroArtwork && (
                      <Link
                        href={`/ar/${heroArtwork.slug}`}
                        className="flex items-center gap-2 bg-[#18191e] hover:bg-[#22232a] border border-[#262833] text-white px-6 py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-[#d1a86e]" />
                        <span>View in Your Space (AR)</span>
                      </Link>
                    )}
                  </div>

                  {/* Quick Metrics */}
                  <div className="pt-8 border-t border-[#1c1d25] grid grid-cols-3 gap-6 text-left">
                    <div>
                      <span className="block font-serif text-2xl text-white">20+</span>
                      <span className="text-[10px] tracking-widest uppercase text-zinc-500">
                        Oil Glaze Layers
                      </span>
                    </div>
                    <div>
                      <span className="block font-serif text-2xl text-white">1:1</span>
                      <span className="text-[10px] tracking-widest uppercase text-zinc-500">
                        Spatial Scale AR
                      </span>
                    </div>
                    <div>
                      <span className="block font-serif text-2xl text-white">Paris</span>
                      <span className="text-[10px] tracking-widest uppercase text-zinc-500">
                        Permanent Studio
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Hero Featured Artwork Plaque */}
                {heroImageUrl && (
                  <div className="lg:col-span-6 relative flex justify-center z-10">
                    <div className="relative group w-full max-w-lg">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#262833] bg-[#14151a] shadow-2xl shadow-black/80">
                        <Image
                          src={heroImageUrl}
                          alt={heroArtwork?.altText || title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {heroArtwork && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <Link
                              href={`/artwork/${heroArtwork.slug}`}
                              className="text-xs uppercase tracking-widest text-[#d1a86e] flex items-center gap-2 hover:underline"
                            >
                              <span>Examine Provenance</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Floating Artwork Provenance Card */}
                      {heroArtwork && (
                        <div className="mt-4 p-4 rounded-lg bg-[#14151a]/90 backdrop-blur-md border border-[#262833] flex items-center justify-between">
                          <div>
                            <h2 className="font-serif text-base text-white">
                              {heroArtwork.title}
                            </h2>
                            <p className="text-xs text-[#8e92a4]">
                              {heroArtwork.year} • {formatDimensions(heroArtwork.widthCm, heroArtwork.heightCm)}
                            </p>
                          </div>
                          <Link
                            href={`/ar/${heroArtwork.slug}`}
                            className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#d1a86e] hover:text-white transition-colors bg-[#1a1c23] px-3.5 py-1.5 rounded-full border border-[#262833]"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Try AR</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        {/* 2. CURATED MASTERWORKS (FEATURED ARTWORKS) */}
        if (sec.sectionKey === "featured_artworks") {
          return (
            <section key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#1c1d25] pb-6 gap-4">
                <div>
                  <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                    {sec.subtitle || "Curated Catalogue"}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-white mt-1">
                    {sec.title || "Selected Works"}
                  </h2>
                </div>
                <Link
                  href="/gallery"
                  className="text-xs uppercase tracking-[0.2em] text-[#a6aabf] hover:text-[#d1a86e] flex items-center gap-2 transition-colors"
                >
                  <span>View Complete Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {artworks.slice(0, 6).map((art) => (
                  <div key={art.id} className="group flex flex-col space-y-4">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#14151a] border border-[#262833]">
                      <Image
                        src={art.coverImageUrl}
                        alt={art.altText}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-medium ${
                            art.status === "published"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : art.status === "reserved"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                              : "bg-zinc-900/80 text-zinc-400 border border-zinc-700/60"
                          }`}
                        >
                          {art.status}
                        </span>
                      </div>

                      {/* Quick AR Action Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                        <Link
                          href={`/artwork/${art.slug}`}
                          className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg"
                          title="Examine Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/ar/${art.slug}`}
                          className="p-3 bg-[#d1a86e] text-black rounded-full hover:bg-[#e2c18d] transition-colors shadow-lg"
                          title="View in Your Space (AR)"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <Link
                          href={`/artwork/${art.slug}`}
                          className="font-serif text-xl text-white hover:text-[#d1a86e] transition-colors"
                        >
                          {art.title}
                        </Link>
                        <span className="text-xs text-[#d1a86e] font-medium">
                          {formatCurrency(art.price, art.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-[#8e92a4] mt-1 line-clamp-1">
                        {art.medium}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
                        <span>{formatDimensions(art.widthCm, art.heightCm)}</span>
                        <span>{art.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        {/* 3. LATEST COLLECTION SPOTLIGHT */}
        if (sec.sectionKey === "latest_collection" && (featuredCollection || sec.contentJson?.imageUrl)) {
          const colImage =
            sec.contentJson?.imageUrl || featuredCollection?.coverImageUrl;
          return (
            <section key={sec.id} className="bg-[#101116] border-y border-[#1c1d25] py-24">
              <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                    {sec.subtitle || "Featured Series"}
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl text-white">
                    {sec.title || featuredCollection?.title}
                  </h2>
                  <p className="text-sm text-[#a6aabf] leading-relaxed">
                    {sec.contentJson?.description || featuredCollection?.curatorialStatement}
                  </p>
                  {featuredCollection && (
                    <div className="pt-2">
                      <Link
                        href={`/collections/${featuredCollection.slug}`}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d1a86e] hover:text-[#e2c18d] font-semibold transition-colors"
                      >
                        <span>Explore All Works in Series</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {colImage && (
                  <div className="lg:col-span-7 relative">
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[#262833] shadow-2xl">
                      <Image
                        src={colImage}
                        alt={sec.title || featuredCollection?.title || "Featured Collection"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        {/* 4. WEBAR SPATIAL PREVIEW CALLOUT */}
        if (sec.sectionKey === "ar_experience") {
          const arCustomImage = sec.contentJson?.imageUrl;
          const ctaLink =
            sec.contentJson?.ctaUrl ||
            (heroArtwork ? `/ar/${heroArtwork.slug}` : "/gallery");

          return (
            <section key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="relative rounded-2xl bg-gradient-to-br from-[#14151a] to-[#181920] border border-[#262833] p-8 md:p-14 overflow-hidden shadow-2xl">
                <div className="max-w-2xl space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest text-[#d1a86e] uppercase font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>{sec.subtitle || "Spatial WebAR Technology"}</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-5xl text-white">
                    {sec.title || "View Original Works in Your Interior Space"}
                  </h2>
                  <p className="text-sm md:text-base text-[#a6aabf] leading-relaxed">
                    {sec.contentJson?.description ||
                      "Experience any painting calibrated to its exact physical centimeter dimensions on your living room, office, or private gallery wall. No external app installation required."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={ctaLink}
                      className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#d1a86e]/10"
                    >
                      <span>{sec.contentJson?.ctaText || "Launch Spatial Studio"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-3">
                    <ShieldCheck className="w-4 h-4 text-[#d1a86e]" />
                    <span>Privacy Guarantee: Camera computations stay 100% strictly on your local browser.</span>
                  </div>
                </div>

                {arCustomImage && (
                  <div className="mt-8 relative aspect-[21/9] rounded-xl overflow-hidden border border-[#262833] shadow-2xl">
                    <Image
                      src={arCustomImage}
                      alt="AR spatial preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 1000px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </section>
          );
        }

        {/* 5. ARTIST ESSAY / STATEMENT */}
        if (sec.sectionKey === "artist_story") {
          const storyImageUrl = sec.contentJson?.imageUrl;
          return (
            <section key={sec.id} className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-8">
              <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                {sec.subtitle || "Studio Monologue"}
              </span>
              <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-light italic leading-snug">
                &ldquo;
                {sec.contentJson?.quote ||
                  "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room."}
                &rdquo;
              </blockquote>

              {storyImageUrl && (
                <div className="relative aspect-[16/9] max-w-xl mx-auto rounded-xl overflow-hidden border border-[#262833] shadow-2xl">
                  <Image
                    src={storyImageUrl}
                    alt="Artist Atelier"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-[#a6aabf] max-w-xl mx-auto leading-relaxed">
                {sec.contentJson?.description ||
                  "Elena Vance lives and works between her studio in the 1st arrondissement of Paris and the wind-sculpted granite coast of Brittany. Her canvases are represented in distinguished private collections across Europe, North America, and Japan."}
              </p>
              <div>
                <Link
                  href="/about"
                  className="text-xs uppercase tracking-[0.2em] text-[#d1a86e] hover:underline"
                >
                  Read Full Artist Biography &amp; CV
                </Link>
              </div>
            </section>
          );
        }

        {/* 6. CURRENT EXHIBITION */}
        if (sec.sectionKey === "featured_exhibition" && (currentExhibition || sec.contentJson?.imageUrl)) {
          const exhImageUrl =
            sec.contentJson?.imageUrl || currentExhibition?.coverImageUrl;
          return (
            <section key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="border-t border-[#1c1d25] pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {exhImageUrl && (
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#262833]">
                      <Image
                        src={exhImageUrl}
                        alt={sec.title || currentExhibition?.title || "Exhibition"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                    {sec.subtitle || "Current Exhibition"}
                  </span>
                  <h3 className="font-serif text-3xl text-white">
                    {sec.title || currentExhibition?.title}
                  </h3>
                  {currentExhibition?.subtitle && (
                    <p className="text-xs text-zinc-400 font-medium">
                      {currentExhibition.subtitle}
                    </p>
                  )}
                  {currentExhibition?.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-300 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>{currentExhibition.location}</span>
                    </div>
                  )}
                  <p className="text-sm text-[#a6aabf] leading-relaxed pt-2">
                    {sec.contentJson?.description || currentExhibition?.description}
                  </p>
                  {currentExhibition && (
                    <div className="pt-3">
                      <Link
                        href={`/exhibitions/${currentExhibition.slug}`}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d1a86e] hover:underline"
                      >
                        <span>View Exhibition Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        {/* 7. CONTACT / INQUIRY CTA */}
        if (sec.sectionKey === "contact_cta") {
          return (
            <section key={sec.id} className="max-w-5xl mx-auto px-6 md:px-12 text-center">
              <div className="rounded-3xl border border-[#262833] bg-[#14151a] p-10 md:p-16 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="inline-flex items-center gap-2 text-xs tracking-widest text-[#d1a86e] uppercase font-medium">
                  <Mail className="w-4 h-4" />
                  <span>{sec.subtitle || "Inquiries & Acquisitions"}</span>
                </div>
                <h2 className="font-serif text-3xl md:text-5xl text-white">
                  {sec.title || "Direct Studio Acquisitions"}
                </h2>
                <p className="text-sm text-[#a6aabf] max-w-xl mx-auto leading-relaxed">
                  {sec.contentJson?.description ||
                    "Inquire about acquiring original works, scheduling a private studio viewing, or commissioning bespoke architectural artworks directly with Elena Vance."}
                </p>
                <div className="pt-3">
                  <Link
                    href={sec.contentJson?.ctaUrl || "/contact"}
                    className="inline-flex items-center gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#d1a86e]/15"
                  >
                    <span>{sec.contentJson?.ctaText || "Inquire with Studio"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
