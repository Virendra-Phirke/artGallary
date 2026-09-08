"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MockArtwork } from "@/db/mockData";
import { Download, Printer, Sparkles, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8 w-full">
      {/* Header Actions - Clean floating right */}
      <div className="flex items-center justify-end gap-2 flex-wrap w-full">
        {/* Physical Space Sub-Navigation */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-2 bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 rounded-xl border-none">
            <a href="/admin/ar-studio">
              <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>WebAR Calibration</span>
            </a>
          </Button>
          <Button asChild size="sm" className="gap-2 bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold rounded-xl border-none">
            <a href="/admin/qr-codes">
              <QrCode className="w-3.5 h-3.5 text-black" />
              <span>Wall QR Tags</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 Cols) */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-[#121319] border-none rounded-3xl shadow-xl shadow-black/40 space-y-5">
          <h2 className="font-serif text-lg text-white">Select Artwork &amp; Target</h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
              Artwork
            </label>
            <select
              value={selectedArtwork.id}
              onChange={(e) => {
                const found = artworks.find((a) => a.id === e.target.value);
                if (found) setSelectedArtwork(found);
              }}
              className="w-full bg-[#1a1b26] border-none rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-[#d1a86e] focus:outline-none cursor-pointer shadow-inner"
            >
              {artworks.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
              Scan Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => setTargetType("artwork")}
                className={`py-2 px-3 text-xs font-medium h-10 rounded-xl border-none transition-all ${
                  targetType === "artwork"
                    ? "bg-[#d1a86e] text-black font-semibold shadow-md shadow-black/30"
                    : "bg-[#1a1b26] hover:bg-[#222432] text-zinc-400"
                }`}
              >
                Artwork Dossier
              </Button>
              <Button
                type="button"
                onClick={() => setTargetType("ar")}
                className={`py-2 px-3 text-xs font-medium h-10 rounded-xl border-none transition-all ${
                  targetType === "ar"
                    ? "bg-[#d1a86e] text-black font-semibold shadow-md shadow-black/30"
                    : "bg-[#1a1b26] hover:bg-[#222432] text-zinc-400"
                }`}
              >
                Direct AR Studio
              </Button>
            </div>
          </div>

          <div className="text-xs text-zinc-500 font-mono break-all p-3 bg-[#1a1b26] rounded-xl">
            Target URL: <br />
            <span className="text-[#d1a86e]">{targetUrl}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePrint}
              className="flex-1 border-none bg-[#1a1b26] hover:bg-[#222432] text-white py-2.5 text-xs font-medium uppercase tracking-wider h-11 rounded-xl shadow-md"
            >
              <Printer className="w-3.5 h-3.5 mr-2 text-[#d1a86e]" />
              <span>Print Plaque</span>
            </Button>
            {qrDataUrl && (
              <Button asChild className="flex-1 bg-[#d1a86e] hover:bg-[#c49a5f] text-black py-2.5 text-xs font-semibold uppercase tracking-wider h-11 rounded-xl shadow-lg shadow-black/40 border-none">
                <a
                  href={qrDataUrl}
                  download={`qr-${selectedArtwork.slug}-${targetType}.png`}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PNG</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Live Exhibition Plaque Preview (7 Cols) */}
        <div className="md:col-span-7 flex justify-center">
          {/* Museum Wall Plaque Simulation */}
          <div
            id="printable-plaque"
            className="w-full max-w-md bg-white text-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl border-none space-y-6 text-center"
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

            <div className="p-6 bg-zinc-100 rounded-2xl inline-block border-none shadow-inner">
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
