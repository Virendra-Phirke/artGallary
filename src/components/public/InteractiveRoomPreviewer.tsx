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

  // Wall Background Styles - Zero borders, rich architectural contrast
  const getWallClasses = () => {
    switch (wallStyle) {
      case "loft":
        return "bg-[#252321]";
      case "nordic":
        return "bg-[#d8d3c7] text-[#1c1d25]";
      case "concrete":
        return "bg-[#1f2127]";
      case "parisian":
      default:
        return "bg-[#111216]";
    }
  };

  // Frame Styles for the Canvas
  const getFrameStyles = () => {
    switch (frameStyle) {
      case "black":
        return "p-2 sm:p-3 bg-[#0a0a0c] shadow-2xl ring-2 ring-[#18181b]";
      case "gold":
        return "p-2 sm:p-2.5 bg-gradient-to-tr from-[#997745] via-[#e2c18d] to-[#866332] shadow-2xl ring-1 ring-[#5c421e]";
      case "oak":
        return "p-2 sm:p-2.5 bg-[#bfa480] shadow-2xl ring-1 ring-[#876a44]";
      case "raw":
      default:
        return "p-0 border-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]";
    }
  };

  return (
    <>
      <section className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16">
        <div className="rounded-3xl bg-[#14151a] p-4 sm:p-8 md:p-12 shadow-2xl space-y-6 sm:space-y-10">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 pb-2 sm:pb-4">
            <div className="max-w-2xl space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs tracking-widest text-[#d1a86e] uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{sectionSubtitle}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-medium">
                {sectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed font-light">
                {sectionDescription}
              </p>
            </div>

            {/* Quick AR Actions - 2 COLUMNS ON MOBILE */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 shrink-0">
              <Button
                onClick={() => setShowQrModal(true)}
                className="rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-300 hover:text-white text-[11px] sm:text-xs uppercase tracking-wider h-10 px-3 sm:px-5 active:scale-[0.98]"
              >
                <QrCode className="w-3.5 h-3.5 text-[#d1a86e] shrink-0 mr-1.5" />
                <span className="truncate">Scan QR</span>
              </Button>

              <Button
                asChild
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-[11px] sm:text-xs uppercase tracking-wider h-10 px-4 sm:px-6 shadow-lg shadow-[#d1a86e]/15 active:scale-[0.98]"
              >
                <Link
                  href={ctaUrl || `/ar/${selectedArtwork.slug}`}
                  className="flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ctaText || "Live WebAR"}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Interactive Room Canvas Wall */}
          <div
            className={`relative w-full h-[360px] sm:h-[480px] md:h-[580px] rounded-2xl overflow-hidden transition-colors duration-500 flex flex-col justify-between items-center p-4 sm:p-8 md:p-10 shadow-inner ${getWallClasses()}`}
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
            <div className="z-10 bg-black/75 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] text-zinc-300 font-mono flex items-center gap-2 sm:gap-3 shadow-lg">
              <span className="flex items-center gap-1 sm:gap-1.5 text-[#d1a86e]">
                <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>1:1 Interior Scale</span>
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
            <div className="relative z-10 flex items-center justify-center my-auto w-full h-full max-h-[260px] sm:max-h-[380px]">
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
                className={`w-full h-4 sm:h-5 rounded-t-sm shadow-2xl transition-colors duration-500 ${
                  wallStyle === "nordic"
                    ? "bg-[#6c5a4b]"
                    : "bg-[#1c1d22]"
                }`}
              />
              <div className="w-5/6 flex justify-between px-6 sm:px-8">
                <div
                  className={`w-2 h-8 sm:h-12 ${
                    wallStyle === "nordic" ? "bg-[#554639]" : "bg-[#15161a]"
                  }`}
                />
                <div
                  className={`w-2 h-8 sm:h-12 ${
                    wallStyle === "nordic" ? "bg-[#554639]" : "bg-[#15161a]"
                  }`}
                />
              </div>

              {/* Plaque Note beneath Console */}
              <div className="mt-2 text-[9px] sm:text-[10px] tracking-widest uppercase font-mono text-zinc-400/80">
                Eye Level: 155 cm (61 in) Museum Standard Height
              </div>
            </div>
          </div>

          {/* Interactive Studio Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1">
            {/* 1. Artwork Selector - 6 COLUMNS ON MOBILE, 3 COLUMNS ON DESKTOP */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-1.5 sm:gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Selected Artwork</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {selectableArtworks.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtwork(art)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all active:scale-95 ${
                      selectedArtwork.id === art.id
                        ? "ring-2 ring-[#d1a86e] scale-105 shadow-md shadow-[#d1a86e]/20"
                        : "opacity-60 hover:opacity-100 bg-[#161720]"
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
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-serif italic truncate">
                {selectedArtwork.title} ({selectedArtwork.year})
              </p>
            </div>

            {/* 2. Architectural Wall Finish - 2 COLUMNS ON MOBILE */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-1.5 sm:gap-2">
                <Palette className="w-3.5 h-3.5" />
                <span>Wall Environment</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <button
                  onClick={() => setWallStyle("parisian")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                    wallStyle === "parisian"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#111216] shadow-sm shrink-0" />
                    <span className="truncate">Parisian Charcoal</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("loft")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                    wallStyle === "loft"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#252321] shadow-sm shrink-0" />
                    <span className="truncate">Warm Taupe</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("nordic")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                    wallStyle === "nordic"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d8d3c7] shadow-sm shrink-0" />
                    <span className="truncate">Nordic Plaster</span>
                  </div>
                </button>

                <button
                  onClick={() => setWallStyle("concrete")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                    wallStyle === "concrete"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1f2127] shadow-sm shrink-0" />
                    <span className="truncate">Cast Concrete</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Framing Selector - 2 COLUMNS ON MOBILE */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#d1a86e] font-semibold flex items-center gap-1.5 sm:gap-2">
                <Frame className="w-3.5 h-3.5" />
                <span>Museum Framing</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <button
                  onClick={() => setFrameStyle("raw")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] truncate ${
                    frameStyle === "raw"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Raw Canvas Edge
                </button>

                <button
                  onClick={() => setFrameStyle("black")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] truncate ${
                    frameStyle === "black"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Satin Shadowbox
                </button>

                <button
                  onClick={() => setFrameStyle("gold")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] truncate ${
                    frameStyle === "gold"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  Champagne Gold
                </button>

                <button
                  onClick={() => setFrameStyle("oak")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all active:scale-[0.98] truncate ${
                    frameStyle === "oak"
                      ? "bg-[#1c1d28] text-white font-medium ring-1 ring-[#d1a86e]"
                      : "bg-[#101116] text-zinc-400 hover:text-white"
                  }`}
                >
                  White Oak Float
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] sm:text-xs text-zinc-400 font-light">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d1a86e] shrink-0" />
              <span>
                Privacy Guarantee: WebXR spatial calculations and camera frames run 100% locally on your device.
              </span>
            </div>

            <Link
              href={`/ar/${selectedArtwork.slug}`}
              className="text-[11px] sm:text-xs uppercase tracking-wider text-[#d1a86e] hover:underline shrink-0 font-medium"
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
            className="relative w-full max-w-sm sm:max-w-md bg-[#14151a] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 sm:space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1c1d28] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close QR dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1c1d28] flex items-center justify-center mx-auto text-[#d1a86e]">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white">
                Experience in Your Space
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto font-light">
                Scan this QR code with your smartphone camera to launch instant WebAR on your real living room or gallery wall.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl w-fit mx-auto shadow-2xl">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR code for ${selectedArtwork.title} AR preview`}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs text-zinc-500">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] text-zinc-500 font-light">
              Works on iOS Safari and Android Chrome with no app installation required.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
