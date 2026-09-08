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
    <div className="space-y-24 sm:space-y-32 md:space-y-40 pb-24">
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
              className="bg-[#101116] border-y border-[#1c1d25] py-20 sm:py-28"
            >
              <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase">
                    <Layers className="w-3 h-3" />
                    <span>{sec.subtitle || "Featured Series Spotlight"}</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-medium">
                    {sec.title || featuredCollection?.title}
                  </h2>

                  <p className="text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                    {sec.contentJson?.description ||
                      featuredCollection?.curatorialStatement ||
                      featuredCollection?.description}
                  </p>

                  {featuredCollection && (
                    <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        asChild
                        className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs tracking-[0.18em] uppercase px-7 py-3 shadow-lg shadow-[#d1a86e]/15"
                      >
                        <Link
                          href={`/collections/${featuredCollection.slug}`}
                          className="flex items-center gap-2"
                        >
                          <span>Explore Full Series</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>

                      <Link
                        href="/account?tab=collections"
                        className="text-xs uppercase tracking-[0.18em] text-zinc-400 hover:text-[#d1a86e] transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-[#d1a86e]" />
                        <span>All Series in Collector Salon &rarr;</span>
                      </Link>
                    </div>
                  )}
                </div>

                {colImage && (
                  <div className="lg:col-span-7 relative">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#262833] shadow-2xl bg-[#14151a]">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#d1a86e]">
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
            <section key={sec.id} className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="border-t border-[#1c1d25] pt-16 sm:pt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {exhImageUrl && (
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#262833] shadow-2xl bg-[#14151a]">
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
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="success"
                          className="backdrop-blur-md bg-black/60 border border-white/10"
                        >
                          {currentExhibition?.status === "current"
                            ? "Currently Open"
                            : "Upcoming Exhibition"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="lg:col-span-5 space-y-5">
                  <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                    {sec.subtitle || "Current Solo Exhibition"}
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-white font-medium">
                    {sec.title || currentExhibition?.title}
                  </h3>
                  {currentExhibition?.subtitle && (
                    <p className="text-xs text-zinc-400 font-medium">
                      {currentExhibition.subtitle}
                    </p>
                  )}
                  {currentExhibition?.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-300 pt-1">
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
                  <p className="text-sm text-[#a6aabf] leading-relaxed pt-2">
                    {sec.contentJson?.description ||
                      currentExhibition?.description ||
                      currentExhibition?.curatorNote}
                  </p>
                  {currentExhibition && (
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <Button
                        asChild
                        className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-5 py-2.5 shadow-md shadow-[#d1a86e]/15"
                      >
                        <Link
                          href="/account?tab=exhibitions"
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>RSVP in Collector Salon</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-[#262833] bg-[#14151a] hover:bg-[#1a1c23] hover:border-[#d1a86e]/40 text-white text-xs uppercase tracking-wider"
                      >
                        <Link
                          href={`/exhibitions/${currentExhibition.slug}`}
                          className="flex items-center gap-2"
                        >
                          <span>Exhibition Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#d1a86e]" />
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
              className="max-w-5xl mx-auto px-6 md:px-12 text-center"
            >
              <div className="rounded-3xl border border-[#262833] bg-gradient-to-b from-[#14151a] to-[#101116] p-8 sm:p-12 md:p-16 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#d1a86e]/8 rounded-full blur-[140px] pointer-events-none" />

                <div className="inline-flex items-center gap-2 text-xs tracking-widest text-[#d1a86e] uppercase font-semibold">
                  <Mail className="w-4 h-4" />
                  <span>{sec.subtitle || "Inquiries & Acquisitions"}</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-medium">
                  {sec.title || "Direct Studio Acquisitions"}
                </h2>

                <p className="text-sm md:text-base text-[#a6aabf] max-w-xl mx-auto leading-relaxed font-light">
                  {sec.contentJson?.description ||
                    "Inquire about acquiring original works, scheduling a private studio viewing in Paris, or commissioning bespoke architectural artworks directly with Elena Vance."}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-xl shadow-[#d1a86e]/15"
                  >
                    <Link
                      href={sec.contentJson?.ctaUrl || "/contact"}
                      className="inline-flex items-center gap-2.5"
                    >
                      <span>
                        {sec.contentJson?.ctaText || "Inquire with Studio"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-[#262833] bg-[#14151a] hover:bg-[#1a1c23] text-zinc-300 hover:text-white px-7 py-3.5 text-xs uppercase tracking-wider"
                  >
                    <Link href="/about">About the Artist</Link>
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
