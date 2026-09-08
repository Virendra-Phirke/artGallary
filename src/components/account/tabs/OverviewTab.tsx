"use client";

import React from "react";
import Link from "next/link";
import {
  Eye,
  ShoppingBag,
  Sparkles,
  Award,
  Mail,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { MarketingPreferenceToggle } from "@/components/account/MarketingPreferenceToggle";
import { useCollector } from "@/components/account/context/CollectorContext";

export function OverviewTab() {
  const {
    user,
    artworks,
    collections,
    userInquiries,
    marketingSubscribed,
    setActiveTab,
    cartArtworkIds,
    toggleCartArtwork,
    setInspectArtwork,
  } = useCollector();

  const spotlightArtwork = artworks[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Top Grid: Curatorial Spotlight & Concierge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Spotlight Original Canvas (Tier 1 Master Block) */}
        {spotlightArtwork && (
          <div className="lg:col-span-7 bg-[#121319] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Atelier Spotlight Original
              </span>
              <Badge variant="gold" className="text-[10px] uppercase font-mono border-0">
                {spotlightArtwork.collectionName || "Solitary Series"}
              </Badge>
            </div>

            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0d0e12] group shadow-inner">
              <ProgressiveImage
                src={spotlightArtwork.coverImageUrl}
                alt={spotlightArtwork.title}
                fill
                optimizeWidth={900}
                optimizeQuality={85}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                    {spotlightArtwork.title}
                  </h3>
                  <p className="text-xs text-[#d1a86e] mt-0.5">
                    {spotlightArtwork.medium} &bull; {spotlightArtwork.year}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono block">
                    Estimated Valuation
                  </span>
                  <span className="text-lg sm:text-xl font-mono text-white font-semibold">
                    {formatCurrency(spotlightArtwork.price, spotlightArtwork.currency)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-2 font-light">
              {spotlightArtwork.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                onClick={() => setInspectArtwork(spotlightArtwork)}
                className="h-10 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                <span>Inspect Details</span>
              </Button>

              <Button
                onClick={() => toggleCartArtwork(spotlightArtwork.id)}
                className={cn(
                  "h-10 px-5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-[0.98]",
                  cartArtworkIds.includes(spotlightArtwork.id)
                    ? "bg-[#252838] text-[#d1a86e]"
                    : "bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white"
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-2 text-[#d1a86e]" />
                <span>
                  {cartArtworkIds.includes(spotlightArtwork.id)
                    ? "In Dossier"
                    : "+ Add to Dossier"}
                </span>
              </Button>

              <Button
                asChild
                className="h-10 px-5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-white text-xs font-medium uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
              >
                <Link href={`/ar/${spotlightArtwork.slug}`} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>View in Your Space (AR)</span>
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Right: Studio Concierge & Private Liaison */}
        <div className="lg:col-span-5 space-y-6">
          {/* Master Block: Studio Liaison */}
          <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-black/40">
            <div className="w-10 h-10 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-white">
                Direct Studio Liaison
              </h3>
              <p className="text-xs text-[#8e92a4] mt-1.5 leading-relaxed font-light">
                As a verified collector, you have direct priority correspondence with Elena Vance's studio team for bespoke acquisitions, framing advice, or private Paris viewing appointments.
              </p>
            </div>

            {/* Distinct Liaison Hours Content Block */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b26] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#d1a86e]">Liaison Hours</span>
                <span className="font-mono text-zinc-200">Mon – Sat (10:00 – 19:00 CET)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Studio Location:</span>
                <span className="text-zinc-200">1st Arrondissement, Paris</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Handling Protocol:</span>
                <span className="text-[#d1a86e] font-medium">Custom Archival Crate</span>
              </div>
            </div>

            <div>
              <Button
                asChild
                className="w-full h-10 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                <Link href="/contact" className="flex items-center justify-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Start Acquisition Inquiry</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Studio Dispatches & Releases Block */}
          {user ? (
            <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />
          ) : (
            <div className="p-6 sm:p-7 bg-[#121319] rounded-3xl space-y-4 shadow-xl shadow-black/40">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] shrink-0 shadow-inner">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-white">Studio Dispatches &amp; Releases</h3>
                  <p className="text-xs text-[#8e92a4] leading-relaxed font-light">
                    Sign in to receive private VIP invitations to solo retrospectives, vernissage releases, and acquisition catalogues.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <Button
                  asChild
                  className="w-full h-10 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  <Link href="/login?redirect=/account">
                    <span>Sign In for VIP Dispatches</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curatorial Cycles & Series Preview (Tier 1 Master Block) */}
      {collections.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121319] space-y-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
                Atelier Suites
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-white">Curatorial Cycles &amp; Series</h2>
            </div>
            <button
              onClick={() => setActiveTab("collections")}
              className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Series ({collections.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {collections.slice(0, 3).map((col) => (
              <div
                key={col.id}
                onClick={() => setActiveTab("collections")}
                className="group p-5 rounded-2xl bg-[#1a1b26] hover:bg-[#202230] transition-all duration-300 space-y-4 cursor-pointer flex flex-col justify-between shadow-md"
              >
                {col.coverImageUrl && (
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0d0e12]">
                    <ProgressiveImage
                      src={col.coverImageUrl}
                      alt={col.title}
                      fill
                      optimizeWidth={500}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <h4 className="font-serif text-lg text-white group-hover:text-[#d1a86e] transition-colors">
                    {col.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {col.curatorialStatement || col.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-[#121319] text-zinc-300">
                    {col.artworkSlugs?.length || 1} Works
                  </span>
                  <span className="text-[#d1a86e] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
                    View Suite &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Studio Inquiries (Tier 1 Master Block with Tier 2 Contained Cards) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121319] space-y-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Provenance &amp; Correspondence
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white">Recent Studio Inquiries</h2>
          </div>
          <button
            onClick={() => setActiveTab("inquiries")}
            className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger ({userInquiries.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userInquiries.length === 0 ? (
          <div className="p-8 text-center bg-[#1a1b26] rounded-2xl space-y-2 shadow-inner">
            <Mail className="w-6 h-6 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">No inquiries placed yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              When you inquire about an original canvas or request a private viewing, your studio correspondence is tracked here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInquiries.slice(0, 2).map((inq) => (
              <div key={inq.id} className="p-5 sm:p-6 bg-[#1a1b26] rounded-2xl space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      inq.status === "replied"
                        ? "success"
                        : inq.status === "read"
                        ? "gold"
                        : "warning"
                    }
                    className="border-0 text-[10px] uppercase font-mono"
                  >
                    {inq.status}
                  </Badge>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="font-serif text-base text-white truncate">{inq.subject}</h4>
                <div className="bg-[#121319] p-3.5 rounded-xl shadow-inner">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
