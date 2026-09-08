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
    savedArtworkIds,
    cartArtworkIds,
    toggleCartArtwork,
    removeFromCart,
    addAllLikedToCart,
    setIsCartOpen,
    setInspectArtwork,
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
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE KPI MATRIX (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Acquisition Portfolio Value */}
        <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#222432]/60 shadow-xl shadow-black/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Portfolio Holdings
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#222432] flex items-center justify-center text-[#d1a86e]">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-lg sm:text-2xl font-bold text-white tracking-tight">
              {totalHoldingsValuation > 0
                ? formatCurrency(totalHoldingsValuation, preferredCurrency)
                : "Active Curation"}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              {cartArtworkIds.length} in Dossier &bull; {savedArtworkIds.length} Shortlisted
            </p>
          </div>
          <button
            onClick={() => (cartArtworkIds.length > 0 ? setIsCartOpen(true) : setActiveTab("gallery"))}
            className="text-[10px] sm:text-[11px] text-[#d1a86e] hover:text-[#dfba82] transition-colors font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-1 border-t border-[#1e202b]"
          >
            <span>{cartArtworkIds.length > 0 ? "Review Dossier" : "Curate Works"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Studio Inventory Standing */}
        <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#222432]/60 shadow-xl shadow-black/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Studio Inventory
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#222432] flex items-center justify-center text-amber-400">
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-lg sm:text-2xl font-bold text-white tracking-tight">
              {artworks.length} Originals
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              {collections.length} Curatorial Series &bull; Belgian Linen
            </p>
          </div>
          <button
            onClick={() => setActiveTab("gallery")}
            className="text-[10px] sm:text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-1 border-t border-[#1e202b]"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Provenance Protocol */}
        <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#222432]/60 shadow-xl shadow-black/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Provenance Standing
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#1b2b22] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-serif font-medium text-white tracking-tight flex items-center gap-1.5">
              <span>100% Certified</span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              Hand-Signed COA &bull; Physical Wax Seal
            </p>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400 font-medium uppercase tracking-wider flex items-center gap-1 pt-1 border-t border-[#1e202b]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Museum Verified</span>
          </div>
        </div>

        {/* Card 4: Studio Liaison Desk */}
        <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#222432]/60 shadow-xl shadow-black/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Direct Studio Desk
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#2c1f24] flex items-center justify-center text-rose-400">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-serif font-medium text-white tracking-tight flex items-center gap-2">
              <span>&lt; 2h Response</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              Mon – Sat &bull; 10:00 – 19:00 Paris CET
            </p>
          </div>
          <Link
            href="/contact"
            className="text-[10px] sm:text-[11px] text-[#d1a86e] hover:text-[#dfba82] transition-colors font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-1 border-t border-[#1e202b]"
          >
            <span>Message Curatorial Desk</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. EXECUTIVE COMMAND CENTER (REPLACES FORMER LARGE IMAGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Interactive Acquisition Portfolio & Curatorial Dossier Manager (7 cols) */}
        <div className="lg:col-span-7 bg-[#121319] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-xl shadow-black/40 border border-[#222432]/60">
          <div className="flex items-center justify-between border-b border-[#222432]/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                  Curatorial Dossier Manager
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-2xl text-white mt-1">
                Active Acquisition Portfolio
              </h2>
            </div>
            <Badge variant="gold" className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 border-0">
              {cartArtworkIds.length} {cartArtworkIds.length === 1 ? "Selected Canvas" : "Selected Canvases"}
            </Badge>
          </div>

          {cartArtworks.length > 0 ? (
            /* ACTIVE DOSSIER ITEMS LIST */
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {cartArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#171822] hover:bg-[#1c1e2b] transition-colors flex items-center justify-between gap-3 border border-[#262837]/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden bg-[#0d0e12] shrink-0 relative shadow-inner">
                        <ProgressiveImage
                          src={art.coverImageUrl}
                          alt={art.title}
                          fill
                          optimizeWidth={120}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-serif text-sm sm:text-base text-white truncate font-medium">
                          {art.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                          {art.medium} &bull; {art.year}
                        </p>
                        <span className="text-[10px] font-mono text-[#d1a86e]">
                          {art.widthCm && art.heightCm ? `${art.widthCm} × ${art.heightCm} cm` : "Original Size"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <span className="font-mono text-xs sm:text-sm font-semibold text-white block">
                          {formatCurrency(art.price, art.currency)}
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase font-mono">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-1.5 rounded-lg bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect artwork"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(art.id)}
                          className="p-1.5 rounded-lg bg-[#222432] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from dossier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bar */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#191b26] flex items-center justify-between border border-[#262838]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Dossier Valuation</span>
                  <span className="font-mono text-base sm:text-xl font-bold text-[#d1a86e]">
                    {formatCurrency(totalDossierValuation, preferredCurrency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsCartOpen(true)}
                    className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[10px] sm:text-xs uppercase tracking-wider px-4 sm:px-5 h-8.5 sm:h-9 shadow-md shadow-[#d1a86e]/15 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Finalize Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY DOSSIER STATE WITH CURATORIAL SUGGESTIONS */
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#171822] space-y-2.5 border border-[#242634]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#d1a86e] font-semibold">
                    Studio Curatorial Assembly
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">0 Works Selected</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Your Acquisition Dossier allows you to assemble private suites of Elena Vance’s original canvases. Once assembled, you can submit your dossier directly to the studio desk for tailored white-glove shipping quotes and certificate preparation.
                </p>
              </div>

              {/* Curatorial Quick-Picks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                    Recommended Masterworks for Your Suite:
                  </span>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="text-[10px] text-[#d1a86e] hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    Full Catalogue &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {curatedSuggestions.map((art) => (
                    <div
                      key={art.id}
                      className="p-3 rounded-xl bg-[#171822] hover:bg-[#1e202c] transition-colors border border-[#232532] space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0d0e12] shrink-0 relative shadow-inner">
                          <ProgressiveImage
                            src={art.coverImageUrl}
                            alt={art.title}
                            fill
                            optimizeWidth={90}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs text-white truncate font-medium">{art.title}</h4>
                          <span className="text-[10px] font-mono text-[#d1a86e] font-semibold block">
                            {formatCurrency(art.price, art.currency)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#20222e]">
                        <Button
                          onClick={() => toggleCartArtwork(art.id)}
                          className={cn(
                            "w-full h-7 rounded-lg text-[9px] uppercase tracking-wider font-semibold cursor-pointer transition-all",
                            cartArtworkIds.includes(art.id)
                              ? "bg-[#252838] text-[#d1a86e]"
                              : "bg-[#222432] hover:bg-[#2c2f42] text-zinc-200 hover:text-white"
                          )}
                        >
                          <Plus className="w-2.5 h-2.5 mr-1" />
                          <span>{cartArtworkIds.includes(art.id) ? "In Dossier" : "+ Dossier"}</span>
                        </Button>
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-1.5 rounded-lg bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white shrink-0 cursor-pointer"
                          title="Inspect 4K Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {savedArtworkIds.length > 0 && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#1c1b26] border border-[#2e2630] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-rose-300">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
                    <span>You have {savedArtworkIds.length} shortlisted paintings</span>
                  </div>
                  <Button
                    onClick={addAllLikedToCart}
                    className="h-7 px-3 rounded-lg bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[9px] uppercase tracking-wider cursor-pointer shadow-sm shrink-0"
                  >
                    Transfer to Dossier
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Studio Concierge & Private Liaison Desk (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 shadow-xl shadow-black/40 border border-[#222432]/60">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b2b22] text-[9px] font-mono text-emerald-400 font-semibold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Desk
              </span>
            </div>

            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-medium">
                Direct Studio Liaison
              </h3>
              <p className="text-xs text-[#8e92a4] mt-1.5 leading-relaxed font-light">
                Direct priority correspondence with Elena Vance&apos;s studio team for bespoke acquisitions, framing advice, or private Paris viewing appointments.
              </p>
            </div>

            {/* Curatorial Protocol Highlights */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b26] space-y-2.5 border border-[#262838]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#d1a86e]">
                  Liaison Hours
                </span>
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
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Response Window:</span>
                <span className="text-emerald-400 font-mono">Under 2 Hours Guarantee</span>
              </div>
            </div>

            <div>
              <Button
                asChild
                className="w-full h-8.5 sm:h-9.5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-[10px] sm:text-xs uppercase tracking-wider font-bold shadow-md shadow-[#d1a86e]/15 transition-all active:scale-[0.98]"
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
            <div className="p-5 sm:p-7 bg-[#121319] rounded-2xl sm:rounded-3xl space-y-4 shadow-xl shadow-black/40 border border-[#222432]/60">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] shrink-0 shadow-inner">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base sm:text-lg text-white">Studio Dispatches &amp; Releases</h3>
                  <p className="text-xs text-[#8e92a4] leading-relaxed font-light">
                    Sign in to receive private VIP invitations to solo retrospectives, vernissage releases, and acquisition catalogues.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <Button
                  asChild
                  className="w-full h-8 sm:h-9 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-[10px] sm:text-xs uppercase tracking-wider font-semibold shadow-sm transition-all active:scale-[0.98]"
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

      {/* 3. SPATIAL WEBAR 1:1 SCALE WALL STUDIO FEATURE COMPONENT */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#13141d] to-[#0e0f14] border border-[#27293b] shadow-2xl shadow-black/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222432]/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                1:1 Scale Spatial Showroom
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl text-white">
              True Physical Scale Wall Simulation (WebAR)
            </h2>
          </div>
          <Button
            onClick={() => setActiveTab("ar")}
            className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[10px] sm:text-xs uppercase tracking-wider px-5 h-8.5 sm:h-9 shadow-md shadow-[#d1a86e]/20 cursor-pointer self-start sm:self-auto active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Launch Spatial AR Studio</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          <div className="p-4 rounded-xl bg-[#171824]/80 border border-[#222434] space-y-2">
            <div className="flex items-center gap-2 text-[#d1a86e]">
              <Maximize2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Vertical Wall Detection</span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-light">
              Detects vertical walls in your room using camera raycasting and surface normal analysis, rejecting floor planes automatically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#171824]/80 border border-[#222434] space-y-2">
            <div className="flex items-center gap-2 text-[#d1a86e]">
              <Compass className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Museum Eye-Level (145 cm)</span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-light">
              Positions artwork at the international gallery standard 145 cm eye-level elevation with height nudge controls.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#171824]/80 border border-[#222434] space-y-2">
            <div className="flex items-center gap-2 text-[#d1a86e]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Zero Privacy Upload</span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-light">
              Camera feeds are processed strictly client-side on your device. Zero environmental video data is uploaded to our servers.
            </p>
          </div>
        </div>
      </div>

      {/* 4. WHITE-GLOVE ACQUISITION & PROVENANCE PROTOCOL (TRUST MATRIX) */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] border border-[#222432]/60 shadow-xl shadow-black/40 space-y-5">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
            White-Glove Standard
          </span>
          <h2 className="font-serif text-lg sm:text-2xl text-white mt-0.5">
            Acquisition &amp; Museum Provenance Protocol
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#181924] border border-[#242637] space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222434] flex items-center justify-center text-[#d1a86e]">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-white font-medium">Archival Certificate (COA)</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Serialized parchment signed by Elena Vance with embossed wax seal and permanent registry accession number.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181924] border border-[#242637] space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222434] flex items-center justify-center text-[#d1a86e]">
              <Box className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-white font-medium">Custom Archival Crating</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Museum-standard ISPM-15 plywood crates, thermal insulation, and multi-layer acid-free Tyvek wrapping.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181924] border border-[#242637] space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222434] flex items-center justify-center text-[#d1a86e]">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-white font-medium">Fine Art Transit Underwriting</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Door-to-door transit by specialist art couriers with 100% full replacement value insurance coverage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181924] border border-[#242637] space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222434] flex items-center justify-center text-[#d1a86e]">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-white font-medium">Bespoke Float Framing</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Optional hand-carved Belgian oak or 24k water-gilded frames handcrafted to order by Parisian ateliers.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CURATORIAL SUITES & SERIES PREVIEW */}
      {collections.length > 0 && (
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] border border-[#222432]/60 space-y-4 sm:space-y-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
                Atelier Suites
              </span>
              <h2 className="font-serif text-lg sm:text-2xl text-white">Curatorial Cycles &amp; Series</h2>
            </div>
            <button
              onClick={() => setActiveTab("collections")}
              className="text-[11px] sm:text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All ({collections.length})</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {collections.slice(0, 3).map((col) => (
              <div
                key={col.id}
                onClick={() => setActiveTab("collections")}
                className="group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#1a1b26] hover:bg-[#202230] transition-all duration-300 space-y-3 cursor-pointer flex flex-col justify-between shadow-md border border-[#252737]"
              >
                {col.coverImageUrl && (
                  <div className="relative aspect-[16/10] w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#0d0e12]">
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
                <div className="space-y-1">
                  <h4 className="font-serif text-sm sm:text-lg text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1">
                    {col.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                    {col.curatorialStatement || col.description}
                  </p>
                </div>
                <div className="pt-1 sm:pt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-mono text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#121319] text-zinc-300">
                    {col.artworkSlugs?.length || 1} Works
                  </span>
                  <span className="text-[#d1a86e] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider">
                    View Suite &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RECENT STUDIO INQUIRIES & CORRESPONDENCE LEDGER */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] border border-[#222432]/60 space-y-4 sm:space-y-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
              Provenance &amp; Correspondence
            </span>
            <h2 className="font-serif text-lg sm:text-2xl text-white">Recent Studio Inquiries</h2>
          </div>
          <button
            onClick={() => setActiveTab("inquiries")}
            className="text-[11px] sm:text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>Full Ledger ({userInquiries.length})</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {userInquiries.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-[#1a1b26] rounded-2xl space-y-2 shadow-inner border border-[#262838]">
            <Mail className="w-6 h-6 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">No inquiries placed yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
              When you inquire about an original canvas or request a private viewing appointment, your studio correspondence will be tracked here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInquiries.slice(0, 2).map((inq) => (
              <div key={inq.id} className="p-5 sm:p-6 bg-[#1a1b26] rounded-2xl space-y-3.5 shadow-md border border-[#262838]">
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
                <div className="bg-[#121319] p-3.5 rounded-xl shadow-inner border border-[#222432]">
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
