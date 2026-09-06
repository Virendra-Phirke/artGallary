"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MockArtwork } from "@/db/mockData";
import { QrCode, Download, Printer, Sparkles, ExternalLink } from "lucide-react";

interface QrCodesClientProps {
  artworks: MockArtwork[];
}

export function QrCodesClient({ artworks }: QrCodesClientProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<MockArtwork>(artworks[0] || {} as any);
  const [targetType, setTargetType] = useState<"artwork" | "ar">("artwork");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const targetUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${targetType === "ar" ? "ar" : "artwork"}/${selectedArtwork.slug}`
      : `/${targetType === "ar" ? "ar" : "artwork"}/${selectedArtwork.slug}`;

  useEffect(() => {
    if (!selectedArtwork.slug) return;
    setIsLoading(true);
    fetch(`/api/qr?url=${encodeURIComponent(targetUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedArtwork, targetType, targetUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Exhibition Labels &amp; Print Tags
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">QR Code Generator</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Generate high-resolution QR tags for physical gallery labels, museum catalogues, and direct AR wall-viewing invitations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 Cols) */}
        <div className="md:col-span-5 p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-5">
          <h2 className="font-serif text-lg text-white">Select Artwork &amp; Target</h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Artwork
            </label>
            <select
              value={selectedArtwork.id}
              onChange={(e) => {
                const found = artworks.find((a) => a.id === e.target.value);
                if (found) setSelectedArtwork(found);
              }}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
            >
              {artworks.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Scan Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("artwork")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  targetType === "artwork"
                    ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e] font-semibold"
                    : "bg-[#1a1c23] text-zinc-400 border-[#262833]"
                }`}
              >
                Artwork Dossier
              </button>
              <button
                type="button"
                onClick={() => setTargetType("ar")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  targetType === "ar"
                    ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e] font-semibold"
                    : "bg-[#1a1c23] text-zinc-400 border-[#262833]"
                }`}
              >
                Direct AR Studio
              </button>
            </div>
          </div>

          <div className="text-xs text-zinc-500 font-mono break-all pt-2">
            Target URL: <br />
            <span className="text-[#d1a86e]">{targetUrl}</span>
          </div>

          <div className="pt-3 border-t border-[#1f212b] flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-[#22242e] hover:bg-[#2c2f3d] border border-[#262833] text-white py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plaque</span>
            </button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`qr-${selectedArtwork.slug}-${targetType}.png`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </a>
            )}
          </div>
        </div>

        {/* Live Exhibition Plaque Preview (7 Cols) */}
        <div className="md:col-span-7 flex justify-center">
          {/* Museum Wall Plaque Simulation */}
          <div
            id="printable-plaque"
            className="w-full max-w-md bg-white text-zinc-900 rounded-lg p-8 shadow-2xl border border-zinc-200 space-y-6 text-center"
          >
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">
                L&apos;Atelier Lumineux • Paris
              </span>
              <h3 className="font-serif text-2xl text-black font-semibold">
                {selectedArtwork.title}
              </h3>
              <p className="text-xs text-zinc-600 font-light">
                Elena Vance, {selectedArtwork.year}
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-lg inline-block border border-zinc-200">
              {isLoading ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${selectedArtwork.title}`}
                  className="w-48 h-48 mx-auto"
                />
              ) : null}
            </div>

            <div className="space-y-1 text-xs text-zinc-600">
              <p className="font-medium text-zinc-800">
                {targetType === "ar"
                  ? "Scan to launch 1:1 scale Augmented Reality wall preview"
                  : "Scan for curatorial provenance, dimensions & acquisition details"}
              </p>
              <p className="text-[10px] text-zinc-400">
                {selectedArtwork.medium} • {selectedArtwork.widthCm} × {selectedArtwork.heightCm} cm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
