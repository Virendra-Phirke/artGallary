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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { MarketingPreferenceToggle } from "@/components/account/MarketingPreferenceToggle";
import { useCollector } from "@/components/account/context/CollectorContext";

export function OverviewTab() {
  const {
    user,
    artworks,
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
        {/* Left: Spotlight Original Canvas */}
        {spotlightArtwork && (
          <div className="lg:col-span-7 bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Atelier Spotlight Original
              </span>
              <Badge variant="gold" className="text-[10px] uppercase font-mono">
                {spotlightArtwork.collectionName || "Solitary Series"}
              </Badge>
            </div>

            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#262833] bg-[#0d0e12] group">
              <ProgressiveImage
                src={spotlightArtwork.coverImageUrl}
                alt={spotlightArtwork.title}
                fill
                optimizeWidth={900}
                optimizeQuality={85}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
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

            <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-2">
              {spotlightArtwork.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => setInspectArtwork(spotlightArtwork)}
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                <span>Inspect Details</span>
              </Button>

              <Button
                onClick={() => toggleCartArtwork(spotlightArtwork.id)}
                className={cn(
                  "rounded-full text-xs font-semibold uppercase tracking-wider px-5 border transition-all cursor-pointer",
                  cartArtworkIds.includes(spotlightArtwork.id)
                    ? "bg-[#1f2230] text-[#d1a86e] border-[#d1a86e]"
                    : "bg-[#181920] hover:bg-[#22242e] text-zinc-200 hover:text-white border-[#262833]"
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
                variant="outline"
                className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-white text-xs uppercase tracking-wider"
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
          <div className="bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-white">
                Direct Studio Liaison
              </h3>
              <p className="text-xs text-[#8e92a4] mt-1 leading-relaxed">
                As a verified collector, you have direct priority correspondence with Elena Vance's studio team for bespoke acquisitions, framing advice, or private Paris viewing appointments.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#1c1d25] text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Liaison Hours:</span>
                <span className="font-mono">Mon – Sat (10:00 – 19:00 CET)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Studio Location:</span>
                <span>1st Arrondissement, Paris</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Handling Protocol:</span>
                <span className="text-[#d1a86e]">Custom Archival Crate</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider"
              >
                <Link href="/contact" className="flex items-center justify-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Start Acquisition Inquiry</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Collector Email Preferences */}
          {user ? (
            <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />
          ) : (
            <Card className="p-6 bg-[#14151a] border-[#262833] rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-white">Studio Dispatches &amp; Releases</h3>
                  <p className="text-xs text-[#8e92a4] leading-relaxed">
                    Sign in to receive private VIP invitations to solo retrospectives, vernissage releases, and acquisition catalogues.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-[#262833] bg-[#181920] text-zinc-300 text-xs uppercase tracking-wider"
                >
                  <Link href="/login?redirect=/account">
                    <span>Sign In for VIP Dispatches</span>
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Inquiries Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#262833] pb-3">
          <h2 className="font-serif text-xl text-white">Recent Studio Inquiries</h2>
          <button
            onClick={() => setActiveTab("inquiries")}
            className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger ({userInquiries.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userInquiries.length === 0 ? (
          <Card className="p-8 text-center bg-[#14151a]/50 border-[#262833] rounded-2xl space-y-2">
            <Mail className="w-6 h-6 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">No inquiries placed yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              When you inquire about an original canvas or request a private viewing, your studio correspondence is tracked here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInquiries.slice(0, 2).map((inq) => (
              <Card key={inq.id} className="p-5 bg-[#14151a] border-[#262833] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      inq.status === "replied"
                        ? "success"
                        : inq.status === "read"
                        ? "gold"
                        : "warning"
                    }
                  >
                    {inq.status}
                  </Badge>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="font-serif text-base text-white truncate">{inq.subject}</h4>
                <p className="text-xs text-zinc-400 line-clamp-2 bg-[#101116] p-3 rounded-lg border border-[#22242f]">
                  {inq.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
