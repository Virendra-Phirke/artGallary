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
    <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE KPI MATRIX (4 COMPACT TILES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Card 1: Portfolio Holdings */}
        <button
          type="button"
          onClick={() => (cartArtworkIds.length > 0 ? setIsCartOpen(true) : setActiveTab("gallery"))}
          className="bg-[#121319] hover:bg-[#161722] transition-colors rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/5 shadow-md flex flex-col justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] sm:text-[10px] tracking-wider text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Holdings
            </span>
            <ShoppingBag className="w-3 h-3 text-zinc-500 group-hover:text-[#d1a86e] transition-colors shrink-0" />
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white tracking-tight mt-1">
            {totalHoldingsValuation > 0
              ? formatCurrency(totalHoldingsValuation, preferredCurrency)
              : "Active"}
          </div>
        </button>

        {/* Card 2: Studio Inventory */}
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className="bg-[#121319] hover:bg-[#161722] transition-colors rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/5 shadow-md flex flex-col justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] sm:text-[10px] tracking-wider text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Inventory
            </span>
            <Palette className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white tracking-tight mt-1">
            {artworks.length} Originals
          </div>
        </button>

        {/* Card 3: Provenance */}
        <div className="bg-[#121319] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/5 shadow-md flex flex-col justify-between text-left">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] sm:text-[10px] tracking-wider text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Provenance
            </span>
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-serif font-medium text-white tracking-tight mt-1">
            100% Certified
          </div>
        </div>

        {/* Card 4: Studio Liaison */}
        <button
          type="button"
          onClick={() => triggerContact()}
          className="bg-[#121319] hover:bg-[#161722] transition-colors rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/5 shadow-md flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] sm:text-[10px] tracking-wider text-[#d1a86e] uppercase font-mono font-semibold truncate">
              Liaison
            </span>
            <Clock className="w-3 h-3 text-zinc-500 group-hover:text-rose-400 transition-colors shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-serif font-medium text-white tracking-tight flex items-center gap-1.5 mt-1">
            <span>&lt; 2h Response</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </button>
      </div>

      {/* 2. CURATORIAL DOSSIER & CONCIERGE LIAISON (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        {/* Left: Interactive Acquisition Dossier Manager (7 cols) */}
        <div className="lg:col-span-7 bg-[#121319] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-md border border-white/5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Acquisition Dossier
              </span>
              <h2 className="font-serif text-sm sm:text-base text-white font-medium">
                Portfolio Selections
              </h2>
            </div>
            <Badge variant="gold" className="text-[9px] font-mono uppercase px-2 py-0.5 border-0">
              {cartArtworkIds.length} {cartArtworkIds.length === 1 ? "Canvas" : "Canvases"}
            </Badge>
          </div>

          {cartArtworks.length > 0 ? (
            /* ACTIVE DOSSIER ITEMS LIST */
            <div className="space-y-3">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cartArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#171822] hover:bg-[#1c1e2b] transition-colors flex items-center justify-between gap-2.5 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-[#0d0e12] shrink-0 relative shadow-inner">
                        <ProgressiveImage
                          src={art.coverImageUrl}
                          alt={art.title}
                          fill
                          optimizeWidth={100}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-serif text-xs sm:text-sm text-white truncate font-medium">
                          {art.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {art.medium} &bull; {art.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-right">
                      <div>
                        <span className="font-mono text-xs font-semibold text-white block">
                          {formatCurrency(art.price, art.currency)}
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase font-mono">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-1 rounded-lg bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect artwork"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(art.id)}
                          className="p-1 rounded-lg bg-[#222432] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from dossier"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bar */}
              <div className="p-3 rounded-xl bg-[#171822] flex items-center justify-between border border-white/5">
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500 block">Dossier Valuation</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#d1a86e]">
                    {formatCurrency(totalDossierValuation, preferredCurrency)}
                  </span>
                </div>
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-3.5 h-8 shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <span>Review Dossier</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            /* EMPTY DOSSIER STATE WITH CURATORIAL SUGGESTIONS */
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Assemble a private dossier of Elena Vance’s original canvases to request fine-art transit, framing quotes, or private viewing reservations.
              </p>

              {/* Curatorial Quick-Picks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                    Recommended Works:
                  </span>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="text-[10px] text-[#d1a86e] hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    Full Catalogue &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {curatedSuggestions.map((art) => (
                    <div
                      key={art.id}
                      className="p-2.5 rounded-xl bg-[#171822] hover:bg-[#1e202c] transition-colors border border-white/5 space-y-1.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#0d0e12] shrink-0 relative shadow-inner">
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
                      <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                        <Button
                          onClick={() => toggleCartArtwork(art.id)}
                          className={cn(
                            "w-full h-6 rounded-lg text-[9px] uppercase tracking-wider font-semibold cursor-pointer transition-all",
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
                          className="p-1 rounded-lg bg-[#222432] hover:bg-[#2c2f42] text-zinc-300 hover:text-white shrink-0 cursor-pointer"
                          title="Inspect details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {savedArtworkIds.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#1c1b26] border border-[#2e2630] flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-rose-300">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
                    <span>{savedArtworkIds.length} shortlisted works</span>
                  </div>
                  <Button
                    onClick={addAllLikedToCart}
                    className="h-6 px-2.5 rounded-lg bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[9px] uppercase tracking-wider cursor-pointer shadow-sm shrink-0"
                  >
                    Add All to Dossier
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Studio Concierge & Dispatches (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-[#121319] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-md border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Curatorial Liaison
                </span>
                <h3 className="font-serif text-sm sm:text-base text-white font-medium">
                  Studio Concierge
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1b2b22] text-[9px] font-mono text-emerald-400 font-semibold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Desk
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Direct priority correspondence for private Paris viewing appointments, bespoke float framing, and insured courier delivery.
            </p>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#171822] space-y-1.5 border border-white/5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Hours:</span>
                <span className="font-mono text-zinc-200 text-[11px]">Mon–Sat 10:00–19:00 CET</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Location:</span>
                <span className="text-zinc-200 text-[11px]">1st Arr., Paris, France</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Response:</span>
                <span className="text-emerald-400 font-mono text-[11px]">Under 2 Hours</span>
              </div>
            </div>

            <div className="flex justify-center sm:block">
              <Button
                type="button"
                onClick={() => triggerContact()}
                className="w-auto sm:w-full h-7 sm:h-7.5 px-3.5 sm:px-4 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold shadow-sm cursor-pointer transition-all active:scale-[0.98] mx-auto sm:mx-0"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  <span>Contact Curatorial Team</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Studio Dispatches & Preferences Block */}
          {user ? (
            <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />
          ) : (
            <div className="p-3.5 sm:p-5 bg-[#121319] rounded-xl sm:rounded-2xl space-y-3 shadow-md border border-white/5">
              <div className="space-y-1">
                <h4 className="font-serif text-xs sm:text-sm text-white font-medium">VIP Studio Dispatches</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Sign in to receive private VIP invitations to solo retrospectives and vernissage releases.
                </p>
              </div>
              <div className="flex justify-center sm:block">
                <Button
                  asChild
                  className="w-auto sm:w-full h-7 sm:h-7.5 px-3.5 sm:px-4 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold shadow-sm transition-all active:scale-[0.98] mx-auto sm:mx-0"
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

      {/* 3. RECENT CORRESPONDENCE PREVIEW IF ANY */}
      {userInquiries.length > 0 && (
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121319] border border-white/5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Direct Ledger
              </span>
              <h3 className="font-serif text-xs sm:text-sm text-white font-medium">
                Recent Correspondence
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("inquiries")}
              className="text-[11px] text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View All ({userInquiries.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {userInquiries.slice(0, 2).map((inq) => (
              <div
                key={inq.id}
                onClick={() => setActiveTab("inquiries")}
                className="p-3 rounded-xl bg-[#171822] hover:bg-[#1a1c28] transition-colors space-y-2 border border-white/5 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider font-mono ${
                      inq.status === "replied"
                        ? "bg-emerald-950/80 text-emerald-300"
                        : inq.status === "read"
                        ? "bg-blue-950/80 text-blue-300"
                        : "bg-amber-950/80 text-amber-300"
                    }`}
                  >
                    {inq.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="font-serif text-xs text-white group-hover:text-[#d1a86e] transition-colors truncate font-medium">
                  {inq.subject || "Artwork Inquiry"}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1 font-light">
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
