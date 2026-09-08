"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Mail,
  Sparkles,
  Eye,
  ShoppingBag,
  Heart,
  ArrowRight,
  Clock,
  CheckCircle2,
  Box,
  Truck,
  Palette,
  Plus,
  Trash2,
  FileText,
  Maximize2,
  Compass,
} from "lucide-react";
import { formatCurrency, formatDimensions, cn } from "@/lib/utils";
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
    savedArtworkIds,
    cartArtworkIds,
    toggleCartArtwork,
    removeFromCart,
    addAllLikedToCart,
    setIsCartOpen,
    setInspectArtwork,
    triggerContact,
  } = useCollector();

  // Selected artworks in Dossier & Shortlist
  const cartArtworks = useMemo(
    () => artworks.filter((a) => cartArtworkIds.includes(a.id)),
    [artworks, cartArtworkIds]
  );
  const savedArtworks = useMemo(
    () => artworks.filter((a) => savedArtworkIds.includes(a.id)),
    [artworks, savedArtworkIds]
  );

  const totalDossierValuation = useMemo(
    () => cartArtworks.reduce((sum, a) => sum + (a.price || 0), 0),
    [cartArtworks]
  );
  const totalShortlistValuation = useMemo(
    () => savedArtworks.reduce((sum, a) => sum + (a.price || 0), 0),
    [savedArtworks]
  );
  const totalHoldingsValuation = totalDossierValuation + totalShortlistValuation;
  const preferredCurrency = artworks[0]?.currency || "USD";

  // Curated masterwork recommendations when dossier is empty
  const curatedSuggestions = useMemo(() => artworks.slice(0, 3), [artworks]);

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-5 sm:space-y-7 lg:space-y-8 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE KPI MATRIX (4 PROMINENT CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
        {/* Card 1: Portfolio Holdings */}
        <button
          type="button"
          onClick={() => (cartArtworkIds.length > 0 ? setIsCartOpen(true) : setActiveTab("gallery"))}
          className="bg-[#121319] hover:bg-[#161824] transition-all duration-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/8 hover:border-[#d1a86e]/30 shadow-lg shadow-black/50 flex flex-col justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Portfolio Holdings
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1a1c27] group-hover:bg-[#202334] flex items-center justify-center text-zinc-400 group-hover:text-[#d1a86e] transition-colors shadow-inner shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight">
              {totalHoldingsValuation > 0
                ? formatCurrency(totalHoldingsValuation, preferredCurrency)
                : "Active Suite"}
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-1.5 truncate">
              {cartArtworkIds.length} in Dossier &bull; {savedArtworkIds.length} Shortlisted
            </p>
          </div>
        </button>

        {/* Card 2: Studio Inventory */}
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className="bg-[#121319] hover:bg-[#161824] transition-all duration-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/8 hover:border-[#d1a86e]/30 shadow-lg shadow-black/50 flex flex-col justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Studio Inventory
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1a1c27] group-hover:bg-[#202334] flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors shadow-inner shrink-0">
              <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight">
              {artworks.length} Originals
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-1.5 truncate">
              Available Elena Vance Masterworks
            </p>
          </div>
        </button>

        {/* Card 3: Provenance */}
        <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/8 shadow-lg shadow-black/50 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Provenance
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1a1c27] flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight">
              100% Certified
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-1.5 truncate">
              Signed Certificate &bull; ADAGP Registered
            </p>
          </div>
        </div>

        {/* Card 4: Studio Liaison */}
        <button
          type="button"
          onClick={() => triggerContact()}
          className="bg-[#121319] hover:bg-[#161824] transition-all duration-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/8 hover:border-[#d1a86e]/30 shadow-lg shadow-black/50 flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Studio Liaison
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1a1c27] group-hover:bg-[#202334] flex items-center justify-center text-zinc-400 group-hover:text-rose-400 transition-colors shadow-inner shrink-0">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight flex items-center gap-2">
              <span>&lt; 2h Response</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-400/90 font-light mt-1.5 truncate">
              Paris Atelier Concierge Active
            </p>
          </div>
        </button>
      </div>

      {/* 2. CURATORIAL DOSSIER & CONCIERGE LIAISON (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Left: Interactive Acquisition Dossier Manager (7 cols lg, 8 cols xl) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#121319] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 space-y-5 shadow-xl border border-white/8">
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.22em] text-[#d1a86e] block font-semibold">
                Acquisition Dossier
              </span>
              <h2 className="font-serif text-lg sm:text-xl lg:text-2xl text-white font-medium mt-0.5">
                Portfolio Selections
              </h2>
            </div>
            <Badge variant="gold" className="text-xs font-mono uppercase px-3 py-1 border-0">
              {cartArtworkIds.length} {cartArtworkIds.length === 1 ? "Canvas" : "Canvases"} Selected
            </Badge>
          </div>

          {cartArtworks.length > 0 ? (
            /* ACTIVE DOSSIER ITEMS LIST */
            <div className="space-y-4">
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
                {cartArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#171822] hover:bg-[#1c1e2b] transition-colors flex items-center justify-between gap-3 sm:gap-4 border border-white/5 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        onClick={() => setInspectArtwork(art)}
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-[#0d0e12] shrink-0 relative shadow-inner cursor-pointer"
                      >
                        <ProgressiveImage
                          src={art.coverImageUrl}
                          alt={art.title}
                          fill
                          optimizeWidth={160}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4
                          onClick={() => setInspectArtwork(art)}
                          className="font-serif text-sm sm:text-base lg:text-lg text-white group-hover:text-[#d1a86e] transition-colors truncate font-medium cursor-pointer"
                        >
                          {art.title}
                        </h4>
                        <p className="text-xs text-zinc-400 font-light truncate flex items-center gap-2">
                          <span>{art.medium}</span>
                          <span>&bull;</span>
                          <span>{art.year}</span>
                          {art.widthCm && art.heightCm && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono">{formatDimensions(art.widthCm, art.heightCm)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                      <div>
                        <span className="font-mono text-sm sm:text-base lg:text-lg font-semibold text-white block">
                          {formatCurrency(art.price, art.currency)}
                        </span>
                        <span className="text-[10px] text-[#d1a86e] uppercase font-mono bg-[#d1a86e]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Available
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-2 sm:p-2.5 rounded-xl bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm"
                          title="Inspect 4K Details"
                          aria-label="Inspect artwork"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(art.id)}
                          className="p-2 sm:p-2.5 rounded-xl bg-[#222432] hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer shadow-sm"
                          title="Remove from dossier"
                          aria-label="Remove from dossier"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bar */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#171822] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block">
                    Estimated Dossier Investment
                  </span>
                  <span className="font-mono text-base sm:text-xl lg:text-2xl font-bold text-[#d1a86e]">
                    {formatCurrency(totalDossierValuation, preferredCurrency)}
                  </span>
                </div>
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-6 h-10 shadow-md shadow-[#d1a86e]/20 cursor-pointer active:scale-[0.98]"
                >
                  <span>Review &amp; Inquire Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            /* EMPTY DOSSIER STATE WITH CURATORIAL SUGGESTIONS */
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                Assemble a private dossier of Elena Vance’s original canvases to request fine-art transit, framing quotes, or private atelier viewing reservations.
              </p>

              {/* Curatorial Quick-Picks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.2em] text-[#d1a86e] font-semibold">
                    Curated Works from Current Series:
                  </span>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider cursor-pointer font-medium"
                  >
                    Full Catalogue &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                  {curatedSuggestions.map((art) => (
                    <div
                      key={art.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#171822] hover:bg-[#1d1f2d] transition-all border border-white/5 space-y-3 flex flex-col justify-between group shadow-md"
                    >
                      <div
                        onClick={() => setInspectArtwork(art)}
                        className="relative aspect-[16/11] rounded-xl overflow-hidden bg-[#0d0e12] shadow-inner cursor-pointer"
                      >
                        <ProgressiveImage
                          src={art.coverImageUrl}
                          alt={art.title}
                          fill
                          optimizeWidth={320}
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white text-[#0d0e12] flex items-center justify-center shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                          <Link
                            href={`/ar/${art.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-[#d1a86e] text-[#0d0e12] flex items-center justify-center shadow-lg"
                            title="View in AR"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-1.5">
                          <h4
                            onClick={() => setInspectArtwork(art)}
                            className="font-serif text-sm sm:text-base text-white group-hover:text-[#d1a86e] transition-colors truncate font-medium cursor-pointer"
                          >
                            {art.title}
                          </h4>
                          <span className="text-xs sm:text-sm font-mono text-[#d1a86e] font-semibold shrink-0">
                            {formatCurrency(art.price, art.currency)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-light truncate">
                          {art.medium} &bull; {art.year}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                        <Button
                          onClick={() => toggleCartArtwork(art.id)}
                          className={cn(
                            "flex-1 h-8 sm:h-8.5 rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all shadow-sm",
                            cartArtworkIds.includes(art.id)
                              ? "bg-[#252838] text-[#d1a86e] border border-[#d1a86e]/30"
                              : "bg-[#222432] hover:bg-[#2c2f42] text-zinc-200 hover:text-white"
                          )}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          <span>{cartArtworkIds.includes(art.id) ? "In Dossier" : "+ Dossier"}</span>
                        </Button>
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-2 rounded-xl bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white shrink-0 cursor-pointer shadow-sm"
                          title="Inspect details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {savedArtworkIds.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1b26] border border-[#2e2630] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-rose-300">
                    <div className="w-8 h-8 rounded-xl bg-rose-950/60 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                    </div>
                    <div>
                      <span className="font-serif text-white font-medium block">
                        {savedArtworkIds.length} Shortlisted Original Canvases
                      </span>
                      <span className="text-zinc-400 text-xs font-light">
                        Transfer directly into your Acquisition Dossier to request private viewing or transit.
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={addAllLikedToCart}
                    className="h-8.5 sm:h-9 px-4 sm:px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-sm shrink-0 active:scale-[0.98]"
                  >
                    Add All to Dossier
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Studio Concierge & Dispatches (5 cols lg, 4 cols xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 sm:space-y-6">
          <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl border border-white/8">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.22em] text-[#d1a86e] block font-semibold">
                  Curatorial Liaison
                </span>
                <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-white font-medium mt-0.5">
                  Studio Concierge
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2b22] text-[10px] font-mono text-emerald-400 font-semibold uppercase border border-emerald-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Desk
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
              Direct priority correspondence for private Paris viewing appointments, bespoke float framing, and insured international courier delivery.
            </p>

            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#171822] space-y-3 border border-white/5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Concierge Hours:</span>
                <span className="font-mono text-zinc-200">Mon–Sat 10:00–19:00 CET</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Atelier Location:</span>
                <span className="text-zinc-200">1st Arr., Paris, France</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Response Speed:</span>
                <span className="text-emerald-400 font-mono font-medium">Under 2 Hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Transit Protocol:</span>
                <span className="text-zinc-200">Insured Fine-Art Courier</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => triggerContact()}
              className="w-full h-10 sm:h-11 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs uppercase tracking-[0.16em] font-semibold shadow-md shadow-[#d1a86e]/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Contact Curatorial Team</span>
              </span>
            </Button>
          </div>

          {/* Studio Dispatches & Preferences Block */}
          {user ? (
            <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />
          ) : (
            <div className="p-5 sm:p-7 bg-[#121319] rounded-2xl sm:rounded-3xl space-y-4 shadow-xl border border-white/8">
              <div className="space-y-1.5">
                <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                  VIP Studio Dispatches
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  Sign in to receive private invitations to solo retrospectives, vernissage releases, and private acquisition previews.
                </p>
              </div>
              <Button
                asChild
                className="w-full h-10 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Link href="/login?redirect=/account">
                  <span>Sign In for VIP Dispatches</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. RECENT CORRESPONDENCE PREVIEW IF ANY */}
      {userInquiries.length > 0 && (
        <div className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] border border-white/8 space-y-4 sm:space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/8 pb-3 sm:pb-4">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.22em] text-zinc-500 block font-semibold">
                Direct Ledger
              </span>
              <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-white font-medium mt-0.5">
                Recent Correspondence
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("inquiries")}
              className="text-xs sm:text-sm text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>View Full Ledger ({userInquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {userInquiries.slice(0, 3).map((inq) => (
              <div
                key={inq.id}
                onClick={() => setActiveTab("inquiries")}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#171822] hover:bg-[#1a1c28] transition-all duration-200 space-y-2.5 border border-white/5 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono ${
                      inq.status === "replied"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                        : inq.status === "read"
                        ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                        : "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                    }`}
                  >
                    {inq.status}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="font-serif text-sm sm:text-base text-white group-hover:text-[#d1a86e] transition-colors truncate font-medium">
                  {inq.subject || "Artwork Inquiry"}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 font-light leading-relaxed">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
