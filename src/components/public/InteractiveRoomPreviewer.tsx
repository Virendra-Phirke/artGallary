"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Sparkles,
  ShieldCheck,
  QrCode,
  Maximize2,
  Check,
  X,
  Palette,
  Frame,
  Ruler,
  Layers,
  ArrowRight,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatDimensions } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InteractiveRoomPreviewerProps {
  artworks: MockArtwork[];
  sectionTitle?: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  ctaText?: string;
  ctaUrl?: string;
}

type WallStyle = "parisian" | "loft" | "nordic" | "concrete";
type FrameStyle = "raw" | "black" | "gold" | "oak";

export function InteractiveRoomPreviewer({
  artworks,
  sectionTitle = "View Original Works in Your Interior Space",
  sectionSubtitle = "Spatial WebAR & Room Studio",
  sectionDescription = "Calibrate any painting to its physical centimeter scale against curated architectural walls and custom frames, or launch camera WebAR directly on your phone.",
  ctaText,
  ctaUrl,
}: InteractiveRoomPreviewerProps) {
  const selectableArtworks = artworks.slice(0, 6);
  const [selectedArtwork, setSelectedArtwork] = useState<MockArtwork>(
    selectableArtworks[0] || artworks[0]
  );
  const [wallStyle, setWallStyle] = useState<WallStyle>("parisian");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("gold");
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Calculate proportional dimensions
  const aspectStyle = useMemo(() => {
    if (!selectedArtwork) return { aspectRatio: "4/3" };
    const w = selectedArtwork.widthCm || 100;
    const h = selectedArtwork.heightCm || 75;
    return {
      aspectRatio: `${w} / ${h}`,
      maxHeight: "380px",
      maxWidth: "90%",
    };
  }, [selectedArtwork]);

  // Generate QR Code when modal opens or artwork changes
  useEffect(() => {
    if (showQrModal && selectedArtwork) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const arUrl = `${origin}/ar/${selectedArtwork.slug}`;
      QRCode.toDataURL(arUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: "#0d0e12",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [showQrModal, selectedArtwork]);

  if (!selectedArtwork) return null;

  // Wall Background Styles
  const getWallClasses = () => {
    switch (wallStyle) {
      case "loft":
        return "bg-[#252321] border-[#383533]";
      case "nordic":
        return "bg-[#d8d3c7] text-[#1c1d25] border-[#c4beaf]";
      case "concrete":
        return "bg-[#1f2127] border-[#2f323c]";
      case "parisian":
      default:
        return "bg-[#111216] border-[#22242d]";
    }
  };

  // Frame Styles for the Canvas
  const getFrameStyles = () => {
    switch (frameStyle) {
      case "black":
        return "p-3 bg-[#0a0a0c] border-[6px] border-[#18181b] shadow-2xl ring-1 ring-black/40";
      case "gold":
        return "p-2.5 bg-gradient-to-tr from-[#997745] via-[#e2c18d] to-[#866332] shadow-2xl ring-1 ring-[#5c421e]";
      case "oak":
        return "p-2.5 bg-[#bfa480] shadow-2xl ring-1 ring-[#876a44]";
      case "raw":
      default:
        return "p-0 border-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]";
    }
  };

  return (
    <>
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
        <div className="rounded-3xl bg-[#14151a] border border-[#262833] p-6 sm:p-10 md:p-14 shadow-2xl space-y-10">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#1c1d25]">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs tracking-widest text-[#d1a86e] uppercase font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>{sectionSubtitle}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-medium">
                {sectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed">
                {sectionDescription}
              </p>
            </div>

            {/* Quick AR Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={() => setShowQrModal(true)}
                variant="outline"
                className="rounded-full border-[#262833] bg-[#18191e] hover:bg-[#22232a] text-zinc-300 hover:text-white text-xs uppercase tracking-wider gap-2 px-5 py-2.5"
              >
                <QrCode className="w-4 h-4 text-[#d1a86e]" />
                <span>Scan Mobile QR</span>
              </Button>

              <Button
                asChild
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs uppercase tracking-[0.18em] shadow-lg shadow-[#d1a86e]/15 px-6 py-2.5"
              >
                <Link
                  href={ctaUrl || `/ar/${selectedArtwork.slug}`}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{ctaText || "Launch Live WebAR"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Interactive Room Canvas Wall */}
          <div
            className={`relative w-full h-[480px] sm:h-[560px] md:h-[620px] rounded-2xl overflow-hidden border transition-colors duration-500 flex flex-col justify-between items-center p-6 sm:p-10 shadow-inner ${getWallClasses()}`}
          >
            {/* Ambient Wall Light Spotlight */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[300px] rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 ${
                wallStyle === "nordic"
                  ? "bg-amber-100/30"
                  : "bg-[#d1a86e]/15"
              }`}
            />

            {/* Top Dimension & Scale Marker */}
            <div className="z-10 bg-black/65 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] text-zinc-300 font-mono flex items-center gap-3 shadow-lg">
              <span className="flex items-center gap-1.5 text-[#d1a86e]">
                <Ruler className="w-3.5 h-3.5" />
                <span>Scale: 1:1 Interior Calibration</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span>
                {formatDimensions(
                  selectedArtwork.widthCm,
                  selectedArtwork.heightCm
                )}
              </span>
            </div>

            {/* Centered Artwork on the Wall with Selected Frame */}
            <div className="relative z-10 flex items-center justify-center my-auto w-full h-full max-h-[420px]">
              <div
                style={aspectStyle}
                className={`relative transition-all duration-500 rounded-sm ${getFrameStyles()}`}
              >
                <div className="relative w-full h-full overflow-hidden shadow-2xl bg-[#0a0b0d]">
                  <img
                    src={selectedArtwork.coverImageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Scale Benchmark: Curated Architectural Console */}
            <div className="w-full max-w-xl z-10 flex flex-col items-center">
              {/* Minimalist Architectural Console Table Benchmark */}
              <div
                className={`w-full h-5 rounded-t-sm shadow-2xl transition-colors duration-500 ${
                  wallStyle === "nordic"
                    ? "bg-[#6c5a4b]"
                    : "bg-[#1c1d22] border-t border-[#2d303b]"
                }`}
              />
              <div className="w-5/6 flex justify-between px-8">
                <div
                  className={`w-2 h-14 ${
                    wallStyle === "nordic" ? "bg-[#554639]" : "bg-[#15161a]"
                  }`}
                />
                <div
                  className={`w-2 h-14 ${
                    wallStyle === "nordic" ? "bg-[#554639]" : "bg-[#15161a]"
                  }`}
                />
              </div>

              {/* Plaque Note beneath Console */}
              <div className="mt-3 text-[10px] tracking-widest uppercase font-mono text-zinc-400/80">
                Eye Level: 155 cm (61 in) Standard Museum Installation Height
              </div>
            </div>
          </div>

          {/* Interactive Studio Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1. Artwork Selector */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Selected Artwork</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectableArtworks.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtwork(art)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all ${
                      selectedArtwork.id === art.id
                        ? "border-[#d1a86e] ring-2 ring-[#d1a86e]/40 scale-105"
                        : "border-[#262833] opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Preview ${art.title} in room`}
                  >
                    <img
                      src={art.coverImageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 font-serif italic truncate">
                {selectedArtwork.title} ({selectedArtwork.year})
              </p>
            </div>

            {/* 2. Architectural Wall Finish */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                <span>Wall Environment</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setWallStyle("parisian")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    wallStyle === "parisian"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#111216] border border-zinc-600" />
                    <span>Parisian Charcoal</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("loft")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    wallStyle === "loft"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#252321] border border-zinc-600" />
                    <span>Warm Taupe Loft</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("nordic")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    wallStyle === "nordic"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#d8d3c7] border border-zinc-400" />
                    <span>Nordic Plaster</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("concrete")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    wallStyle === "concrete"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#1f2127] border border-zinc-600" />
                    <span>Cast Concrete</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Framing Selector */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-2">
                <Frame className="w-3.5 h-3.5" />
                <span>Museum Framing</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setFrameStyle("raw")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    frameStyle === "raw"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Gallery Raw Edge
                </button>

                <button
                  onClick={() => setFrameStyle("black")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    frameStyle === "black"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Satin Shadowbox
                </button>

                <button
                  onClick={() => setFrameStyle("gold")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    frameStyle === "gold"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Champagne Gold
                </button>

                <button
                  onClick={() => setFrameStyle("oak")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    frameStyle === "oak"
                      ? "border-[#d1a86e] bg-[#18191e] text-white font-medium"
                      : "border-[#262833] bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  White Oak Float
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="pt-4 border-t border-[#1c1d25] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d1a86e] shrink-0" />
              <span>
                Privacy Guarantee: All WebXR spatial calculations and camera frames run 100% locally on your device.
              </span>
            </div>

            <Link
              href={`/ar/${selectedArtwork.slug}`}
              className="text-xs uppercase tracking-wider text-[#d1a86e] hover:underline shrink-0"
            >
              Open Direct Camera AR &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile QR Code Modal */}
      {showQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scan QR Code to Experience WebAR on Mobile"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#14151a] border border-[#262833] rounded-3xl p-8 shadow-2xl text-center space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1c1d25] text-zinc-400 hover:text-white border border-[#262833]"
              aria-label="Close QR dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center mx-auto text-[#d1a86e]">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-white">
                Experience in Your Space
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Scan this QR code with your smartphone camera to launch instant WebAR on your real living room or gallery wall.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-2xl border border-zinc-200">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR code for ${selectedArtwork.title} AR preview`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-500">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-500">
              Works on iOS Safari and Android Chrome with no app installation required.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
