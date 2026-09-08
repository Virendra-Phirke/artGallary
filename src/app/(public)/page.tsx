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
  Phone,
  Clock,
  ShieldCheck,
  MessageCircle,
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
import { ContactForm } from "@/components/public/ContactForm";

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

  // Curated masterworks: prioritize featured works, then fill remaining slots with published artworks up to 6
  const featuredIds = new Set(featuredArtworks.map((a) => a.id));
  const remaining = allArtworks.filter(
    (a) => !featuredIds.has(a.id) && (a.status === "published" || !a.status)
  );
  let masterworks = [...featuredArtworks, ...remaining].slice(0, 6);
  if (masterworks.length === 0) {
    masterworks = allArtworks.length > 0 ? allArtworks.slice(0, 6) : INITIAL_ARTWORKS.slice(0, 6);
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
              heroImages={sec.contentJson?.heroImages}
              heroSlideCount={
                sec.contentJson?.heroSlideCount
                  ? Number(sec.contentJson.heroSlideCount)
                  : undefined
              }
              heroArtworkIds={sec.contentJson?.heroArtworkIds}
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

        // 5. ARTIST ATELIER & STATEMENT (MERGED ABOUT THE ARTIST EXPERIENCE)
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
                  settings.aboutPageConfig?.bio ||
                  settings.bioSummary ||
                  "Elena Vance (b. 1986) divides her studio practice between Paris and the wind-sculpted granite coast of Brittany. Her monumental canvases investigate the physical threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence transform architectural interiors."
                }
                imageUrl={sec.contentJson?.imageUrl || settings.aboutPageConfig?.artistImageUrl}
                subtitle={sec.subtitle || "Studio Monologue & Biography"}
                artistName={settings.artistName || "Elena Vance"}
                location={settings.location || "Paris & Côtes-d'Armor, France"}
                tagline={settings.tagline || "Contemporary Mineral & Oil Paintings"}
                bio={settings.aboutPageConfig?.bio || settings.bioSummary}
                philosophy={settings.aboutPageConfig?.philosophy}
                exhibitions={settings.aboutPageConfig?.exhibitions}
                achievements={settings.aboutPageConfig?.achievements}
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
                          <span>RSVP Exhibition</span>
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

        // 7. PRIVATE INQUIRIES & ACQUISITIONS (MERGED CONTACT EXPERIENCE)
        if (sec.sectionKey === "contact_cta") {
          const cfg = settings.contactPageConfig;
          const recipientEmail = cfg?.recipientEmail || settings.contactEmail || "curator@latelier-lumineux.art";
          const phone = settings.phone || "+33 (0)1 42 68 55 00";
          const address = settings.address || "14 Rue de Beaune, 7th Arrondissement, 75007 Paris, France";
          const hours = settings.businessHours || "Tuesday – Saturday, 10:00 – 18:00 CET (By Appointment)";

          return (
            <section
              id="contact"
              key={sec.id}
              className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden scroll-mt-24 sm:scroll-mt-32 space-y-8 sm:space-y-12"
            >
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181924] border border-[#262833] text-[9px] sm:text-[10px] tracking-[0.22em] text-[#d1a86e] uppercase font-semibold">
                  <Mail className="w-3 h-3 text-[#d1a86e]" />
                  <span>{sec.subtitle || "Curatorial Liaison & Private Acquisitions"}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium">
                  {sec.title || "Contact & Studio Inquiries"}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                  {sec.contentJson?.description ||
                    cfg?.description ||
                    "For private acquisitions, curatorial exhibition loans, bespoke commissions, and private salon viewings, please correspond directly with Madame Vance's Paris liaison desk."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Interactive Contact Form Column */}
                <div className="lg:col-span-7">
                  <ContactForm />
                </div>

                {/* Studio Dossier Info Column */}
                <div className="lg:col-span-5 space-y-6 lg:pl-4">
                  <div className="p-6 sm:p-8 bg-[#14151a] border border-[#262833] rounded-2xl space-y-6 shadow-xl">
                    <h3 className="font-serif text-xl sm:text-2xl text-white">Direct Correspondence</h3>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                            Curatorial Email
                          </span>
                          <a
                            href={`mailto:${recipientEmail}`}
                            className="text-white hover:text-[#d1a86e] transition-colors font-medium text-xs sm:text-sm"
                          >
                            {recipientEmail}
                          </a>
                        </div>
                      </div>

                      {phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                              Studio Desk
                            </span>
                            <a href={`tel:${phone}`} className="text-white hover:text-[#d1a86e] transition-colors">
                              {phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {settings.whatsapp && (
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">
                              WhatsApp Liaison
                            </span>
                            <span className="text-white">{settings.whatsapp}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
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

                      <div className="flex items-start gap-3">
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
          );
        }

        return null;
      })}
    </div>
  );
}
