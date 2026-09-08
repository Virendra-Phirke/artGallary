"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Trash2,
  Sparkles,
  ShieldCheck,
  Package,
  Check,
  MapPin,
  Phone,
  ArrowRight,
  ShoppingBag,
  Layers,
  Ruler,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface AcquisitionCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartArtworkIds: string[];
  artworks: MockArtwork[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  onInquirySubmitted?: (inquiryId: string) => void;
}

export function AcquisitionCartModal({
  isOpen,
  onClose,
  cartArtworkIds,
  artworks,
  onRemoveItem,
  onClearCart,
  user,
  onInquirySubmitted,
}: AcquisitionCartModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Selected artworks from the cart IDs
  const cartArtworks = artworks.filter((a) => cartArtworkIds.includes(a.id));

  // Compute total investment value
  const totalValue = cartArtworks.reduce((acc, art) => acc + (art.price || 0), 0);
  const currency = cartArtworks[0]?.currency || "EUR";

  const handleSubmitAcquisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cartArtworks.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const artworkTitles = cartArtworks.map((a) => `"${a.title}"`).join(", ");
      const subject = `Multi-Artwork Acquisition Dossier (${cartArtworks.length} Works: ${artworkTitles})`;

      const formattedWorksList = cartArtworks
        .map(
          (a, i) =>
            `${i + 1}. ${a.title} (${a.year || "Original"}) — ${formatDimensions(a.widthCm, a.heightCm)} • ${a.medium || "Mixed media"} • ${a.price ? formatCurrency(a.price, a.currency) : "Price on Request"}`
        )
        .join("\n");

      const messageContent = `ACQUISITION DOSSIER INQUIRY
Collector: ${user.name} (${user.email})
${phone ? `Direct Contact Phone: ${phone}\n` : ""}${destination ? `Delivery Destination: ${destination}\n` : ""}
Selected Artworks (${cartArtworks.length} pieces):
${formattedWorksList}

Estimated Investment Total: ${formatCurrency(totalValue, currency)}

Collector Inquiries & Specifications:
${notes || "Please advise on availability, crating protocol, and private viewing / acquisition arrangements."}`;

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: cartArtworks[0]?.id,
          name: user.name,
          email: user.email,
          phone: phone || undefined,
          subject,
          message: messageContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit acquisition inquiry.");
      }

      setSubmittedInquiryId(data.inquiry?.id || "INQ-CONFIRMED");
      onClearCart();
      if (onInquirySubmitted && data.inquiry?.id) {
        onInquirySubmitted(data.inquiry.id);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedInquiryId(null);
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acquisition Portfolio Dossier"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] bg-[#121319] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#f4f4f6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between bg-[#151620] shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Private Acquisitions
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                Atelier Portfolio Dossier
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium flex items-center gap-2.5">
              <span>Acquisition Dossier</span>
              <Badge variant="outline" className="text-xs border-0 bg-[#222432] text-[#d1a86e]">
                {cartArtworks.length} {cartArtworks.length === 1 ? "Work" : "Works"}
              </Badge>
            </h2>
          </div>

          <button
            onClick={handleResetAndClose}
            aria-label="Close dossier"
            className="p-2.5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-400 hover:text-white transition-colors focus-visible:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 overscroll-contain">
          {submittedInquiryId ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-8 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d1a86e] font-bold">
                  Acquisition Protocol Initiated
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                  Inquiry Registered in Studio Ledger
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  Your acquisition request for {cartArtworks.length || "the selected"} canvases has been transmitted to Elena Vance&apos;s curatorial team. You will receive an authenticated response within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1a1b26] text-xs font-mono text-zinc-300 shadow-inner">
                Studio Reference: <span className="text-[#d1a86e] font-semibold">{submittedInquiryId}</span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={handleResetAndClose}
                  className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-6 py-2.5 w-full sm:w-auto shadow-md shadow-[#d1a86e]/15"
                >
                  Return to Viewing Room
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider px-6 py-2.5 w-full sm:w-auto shadow-sm"
                >
                  <Link href="/account?tab=inquiries" onClick={handleResetAndClose}>
                    <span>View Inquiries Ledger &rarr;</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : cartArtworks.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1b26] flex items-center justify-center text-zinc-500 mx-auto shadow-inner">
                <ShoppingBag className="w-6 h-6 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-white font-medium">
                  Your Acquisition Dossier is Empty
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Explore the private catalog and click &ldquo;+ Add to Acquisition Cart&rdquo; to build a multi-artwork acquisition inquiry.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleResetAndClose}
                  className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-6 py-2.5 shadow-md shadow-[#d1a86e]/15"
                >
                  Browse Catalog
                </Button>
              </div>
            </div>
          ) : (
            /* ACTIVE CART LIST & CHECKOUT FORM - 2-COLUMN LUXURY GRID ON DESKTOP */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Selected Originals & Financial Summary */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Selected Originals ({cartArtworks.length})
                    </span>
                    <button
                      onClick={onClearCart}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {cartArtworks.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-2xl bg-[#1a1b26] flex items-center justify-between gap-4 group hover:bg-[#202230] transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#0d0e12] shrink-0 shadow-inner">
                            <ProgressiveImage
                              src={art.coverImageUrl}
                              alt={art.title}
                              fill
                              optimizeWidth={200}
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-serif text-base text-white truncate group-hover:text-[#d1a86e] transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate font-light">
                              {art.year} • {formatDimensions(art.widthCm, art.heightCm)} • {art.medium}
                            </p>
                            <span className="text-xs font-mono text-[#d1a86e] font-semibold block">
                              {art.price ? formatCurrency(art.price, art.currency) : "Price on Inquiry"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onRemoveItem(art.id)}
                            aria-label={`Remove ${art.title} from dossier`}
                            className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Remove artwork"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Investment Summary */}
                <div className="p-5 rounded-2xl bg-[#1a1b26] space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Selected Paintings Subtotal:</span>
                    <span className="font-serif text-lg text-white font-medium">
                      {formatCurrency(totalValue, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Museum Archival Crating:</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">Included (Complimentary)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Global White-Glove Insurance:</span>
                    </span>
                    <span className="text-zinc-300 font-mono text-[11px]">Coordinated with Courier</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Dispatch Form or Guest Sign In Prompt */}
              <div className="lg:col-span-6 space-y-6">
                {user ? (
                  <form onSubmit={handleSubmitAcquisition} className="space-y-4 bg-[#1a1b26] p-6 sm:p-7 rounded-3xl shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-bold">
                        Acquisition Dispatch
                      </span>
                      <h3 className="font-serif text-xl text-white font-medium">
                        Submit Purchase &amp; Acquisition Inquiry
                      </h3>
                      <p className="text-xs text-zinc-400 font-light">
                        The studio will review your selected pieces, calculate bespoke shipping crates, and coordinate private acquisition terms.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400">
                          Collector Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="w-full bg-[#121319] rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full bg-[#121319] rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#d1a86e]" />
                          <span>Direct Telephone (Optional)</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#121319] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#d1a86e]" />
                          <span>Delivery Destination (City, Country)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Zurich, Switzerland / New York, USA"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-[#121319] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-zinc-400">
                        Acquisition Questions &amp; Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide any custom framing requirements, installation questions, or foundation collection details..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-[#121319] rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none shadow-inner"
                      />
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-[#2d1215] text-rose-300 text-xs">
                        {error}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Direct studio acquisition • ADAGP Registered
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-8 py-3 shadow-md shadow-[#d1a86e]/20 cursor-pointer"
                      >
                        {submitting ? (
                          <span>Transmitting Dossier...</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Send Acquisition Inquiry</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#1a1b26] space-y-5 shadow-xl">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#222432] flex items-center justify-center text-[#d1a86e] shrink-0 mt-0.5 shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-serif text-xl text-white font-medium">
                          Collector Sign In Required to Transmit Inquiry
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-light">
                          To submit your multi-artwork acquisition dossier to Elena Vance&apos;s studio and receive authenticated courier and viewing dispatch, please sign in. Your selected paintings will remain saved in your dossier.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        asChild
                        className="flex-1 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase h-11 shadow-md shadow-[#d1a86e]/20"
                      >
                        <Link href="/login?redirect=/account">
                          <span className="flex items-center justify-center gap-2">
                            <span>Sign In with Email</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="flex-1 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 text-xs tracking-wider uppercase h-11 shadow-sm"
                      >
                        <Link href="/register?redirect=/account">
                          <span>Register Collector Account</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
