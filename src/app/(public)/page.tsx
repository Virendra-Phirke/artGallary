import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Mail,
  Calendar,
  Layers,
  Compass,
} from "lucide-react";
import {
  getArtworks,
  getCollections,
  getExhibitions,
  getHomepageSections,
  getSiteSettings,
} from "@/db/repository";
import { INITIAL_ARTWORKS, INITIAL_HOMEPAGE_SECTIONS } from "@/db/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { HeroShowcaseClient } from "@/components/public/HeroShowcaseClient";
import { FeaturedArtworksClient } from "@/components/public/FeaturedArtworksClient";
import { InteractiveRoomPreviewer } from "@/components/public/InteractiveRoomPreviewer";
import { ArtistAtelierSection } from "@/components/public/ArtistAtelierSection";
import { CollectorServicesSection } from "@/components/public/CollectorServicesSection";

export const revalidate = 3600; // ISR revalidation every 1 hour with instant write-invalidation

export default async function HomePage() {
  const [featuredArtworks, allArtworks, collections, exhibitions, sections, settings] =
    await Promise.all([
      getArtworks({ featuredOnly: true }),
      getArtworks(),
      getCollections(),
      getExhibitions(),
      getHomepageSections(),
      getSiteSettings(),
    ]);

  // Ensure rich data fallback if no artworks exist in DB
  let masterworks = featuredArtworks.length > 0 ? featuredArtworks : allArtworks;
  if (masterworks.length === 0) {
    masterworks = INITIAL_ARTWORKS;
  }

  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  // Active sections sorted by displayOrder (fallback to INITIAL_HOMEPAGE_SECTIONS if empty)
  const activeSections = sections.length > 0 ? sections : INITIAL_HOMEPAGE_SECTIONS;
  const sortedSections = [...activeSections]
    .filter((s) => s.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-12 sm:space-y-28 md:space-y-36 pb-20 w-full max-w-full overflow-x-hidden">
      {sortedSections.map((sec) => {
        // 1. HERO SHOWCASE
        if (sec.sectionKey === "hero") {
          return (
            <HeroShowcaseClient
              key={sec.id}
              artworks={masterworks}
              heroBadge={
                sec.subtitle ||
                sec.contentJson?.badge ||
                "Spring 2026 Collection"
              }
              heroTitle={
                sec.title || "The Architecture of Luminous Stillness"
              }
              heroDescription={
                sec.contentJson?.description ||
                "Original fine artworks by Elena Vance. Exploring the threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence alter the atmospheric presence of space."
              }
              primaryCtaText={sec.contentJson?.ctaText || "Explore Curated Catalog"}
              primaryCtaUrl={sec.contentJson?.ctaUrl || "/gallery"}
              customHeroImage={sec.contentJson?.imageUrl}
            />
          );
        }

        // 2. CURATED MASTERWORKS (FEATURED ARTWORKS)
        if (sec.sectionKey === "featured_artworks") {
          return (
            <FeaturedArtworksClient
              key={sec.id}
              artworks={masterworks}
              sectionTitle={sec.title || "Selected Works"}
              sectionSubtitle={sec.subtitle || "Curated Catalogue"}
            />
          );
        }

        // 3. LATEST COLLECTION SPOTLIGHT
        if (
          sec.sectionKey === "latest_collection" &&
          (featuredCollection || sec.contentJson?.imageUrl)
        ) {
          const colImage =
            sec.contentJson?.imageUrl || featuredCollection?.coverImageUrl;
          return (
            <section
              key={sec.id}
              className="bg-[#0e0f14] py-14 sm:py-24 w-full max-w-full overflow-hidden"
            >
              <div className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
                <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181924] text-[9px] sm:text-[10px] tracking-[0.22em] text-[#d1a86e] uppercase">
                    <Layers className="w-3 h-3" />
                    <span>{sec.subtitle || "Featured Series Spotlight"}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium">
                    {sec.title || featuredCollection?.title}
                  </h2>

                  <p className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                    {sec.contentJson?.description ||
                      featuredCollection?.curatorialStatement ||
                      featuredCollection?.description}
                  </p>

                  {featuredCollection && (
                    <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                      <Button
                        asChild
                        className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-[10px] sm:text-xs tracking-wider uppercase h-7.5 sm:h-9 px-3.5 sm:px-5 shadow-md shadow-[#d1a86e]/15 active:scale-[0.98] w-auto inline-flex"
                      >
                        <Link
                          href={`/collections/${featuredCollection.slug}`}
                          className="flex items-center justify-center gap-1.5"
                        >
                          <span>Explore Series</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </Link>
                      </Button>

                      <Button
                        asChild
                        className="rounded-full bg-[#161720] hover:bg-[#1f212c] text-zinc-300 hover:text-white text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3 sm:px-4 active:scale-[0.98] w-auto inline-flex"
                      >
                        <Link
                          href="/account?tab=collections"
                          className="flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#d1a86e] shrink-0" />
                          <span>All Series</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {colImage && (
                  <div className="lg:col-span-7 relative">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-[#14151a]">
                      <ProgressiveImage
                        src={colImage}
                        alt={
                          sec.title ||
                          featuredCollection?.title ||
                          "Featured Collection"
                        }
                        fill
                        optimizeWidth={1200}
                        optimizeQuality={85}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 sm:p-6">
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#d1a86e]">
                          {featuredCollection?.title} Series
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // 4. WEBAR SPATIAL STUDIO / INTERACTIVE ROOM PREVIEWER
        if (sec.sectionKey === "ar_experience") {
          return (
            <InteractiveRoomPreviewer
              key={sec.id}
              artworks={masterworks}
              sectionTitle={
                sec.title || "View Original Works in Your Interior Space"
              }
              sectionSubtitle={sec.subtitle || "Spatial WebAR & Room Studio"}
              sectionDescription={
                sec.contentJson?.description ||
                "Calibrate any painting to its physical centimeter scale against curated architectural walls and custom frames, or launch camera WebAR directly on your phone."
              }
              ctaText={sec.contentJson?.ctaText}
              ctaUrl={sec.contentJson?.ctaUrl}
            />
          );
        }

        // 5. ARTIST ATELIER & STATEMENT
        if (sec.sectionKey === "artist_story") {
          return (
            <React.Fragment key={sec.id}>
              <ArtistAtelierSection
                title={sec.title || "The Alchemy of Natural Earth & Luminous Glazes"}
                quote={
                  sec.contentJson?.quote ||
                  "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room."
                }
                description={
                  sec.contentJson?.description ||
                  "Elena Vance (b. 1986) divides her studio practice between Paris and the wind-sculpted granite coast of Brittany. Her monumental canvases investigate the physical threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence transform architectural interiors."
                }
                imageUrl={sec.contentJson?.imageUrl}
                subtitle={sec.subtitle || "Studio Monologue & Philosophy"}
              />

              {/* Collector Concierge & Provenance Standards */}
              <CollectorServicesSection />
            </React.Fragment>
          );
        }

        // 6. CURRENT / FEATURED EXHIBITION
        if (
          sec.sectionKey === "featured_exhibition" &&
          (currentExhibition || sec.contentJson?.imageUrl)
        ) {
          const exhImageUrl =
            sec.contentJson?.imageUrl || currentExhibition?.coverImageUrl;
          return (
            <section key={sec.id} className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden">
              <div className="pt-8 sm:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
                {exhImageUrl && (
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-[#14151a]">
                      <ProgressiveImage
                        src={exhImageUrl}
                        alt={
                          sec.title ||
                          currentExhibition?.title ||
                          "Solo Exhibition"
                        }
                        fill
                        optimizeWidth={1200}
                        optimizeQuality={85}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <Badge
                          variant="success"
                          className="backdrop-blur-md bg-black/70 border-0 text-[10px] sm:text-xs"
                        >
                          {currentExhibition?.status === "current"
                            ? "Currently Open"
                            : "Upcoming Exhibition"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                  <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                    {sec.subtitle || "Current Solo Exhibition"}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-4xl text-white font-medium">
                    {sec.title || currentExhibition?.title}
                  </h3>
                  {currentExhibition?.subtitle && (
                    <p className="text-xs text-zinc-400 font-medium">
                      {currentExhibition.subtitle}
                    </p>
                  )}
                  {currentExhibition?.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-300 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span>{currentExhibition.location}</span>
                    </div>
                  )}
                  {currentExhibition?.startDate && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span>
                        {new Date(currentExhibition.startDate).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                        {currentExhibition.endDate
                          ? ` — ${new Date(
                              currentExhibition.endDate
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : ""}
                      </span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed pt-1">
                    {sec.contentJson?.description ||
                      currentExhibition?.description ||
                      currentExhibition?.curatorNote}
                  </p>
                  {currentExhibition && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                      <Button
                        asChild
                        className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3.5 sm:px-5 shadow-md shadow-[#d1a86e]/15 active:scale-[0.98] w-auto inline-flex"
                      >
                        <Link
                          href="/account?tab=exhibitions"
                          className="flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>RSVP Salon</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="rounded-full bg-[#161720] hover:bg-[#1f212c] text-white text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-9 px-3 sm:px-4 active:scale-[0.98] w-auto inline-flex"
                      >
                        <Link
                          href={`/exhibitions/${currentExhibition.slug}`}
                          className="flex items-center justify-center gap-1.5"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3 text-[#d1a86e] shrink-0" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // 7. PRIVATE INQUIRIES & ACQUISITIONS CTA
        if (sec.sectionKey === "contact_cta") {
          return (
            <section
              key={sec.id}
              className="max-w-5xl mx-auto px-3.5 sm:px-10 md:px-12 text-center w-full max-w-full overflow-hidden"
            >
              <div className="rounded-3xl bg-gradient-to-b from-[#14151a] to-[#101116] p-6 sm:p-12 md:p-16 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden w-full min-w-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] sm:w-[500px] h-[200px] sm:h-[300px] bg-[#d1a86e]/8 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs tracking-widest text-[#d1a86e] uppercase font-semibold">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{sec.subtitle || "Inquiries & Acquisitions"}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium">
                  {sec.title || "Direct Studio Acquisitions"}
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-[#a6aabf] max-w-xl mx-auto leading-relaxed font-light">
                  {sec.contentJson?.description ||
                    "Inquire about acquiring original works, scheduling a private studio viewing in Paris, or commissioning bespoke architectural artworks directly with Elena Vance."}
                </p>

                <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                  <Button
                    asChild
                    className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] h-7.5 sm:h-9.5 px-4 sm:px-7 text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.18em] shadow-lg shadow-[#d1a86e]/15 active:scale-[0.98] w-auto inline-flex"
                  >
                    <Link
                      href={sec.contentJson?.ctaUrl || "/contact"}
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {sec.contentJson?.ctaText || "Inquire Studio"}
                      </span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="rounded-full bg-[#1a1b24] hover:bg-[#232432] text-zinc-300 hover:text-white h-7.5 sm:h-9.5 px-3.5 sm:px-6 text-[10px] sm:text-xs uppercase tracking-wider active:scale-[0.98] w-auto inline-flex"
                  >
                    <Link href="/about">About Artist</Link>
                  </Button>
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
