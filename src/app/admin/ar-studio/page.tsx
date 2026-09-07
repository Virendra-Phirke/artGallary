import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllArtworksAdmin } from "@/db/repository";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Settings,
  QrCode,
} from "lucide-react";
import { formatDimensions } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "AR Studio & Spatial Calibration | Studio Administration",
};

export default async function AdminArStudioPage() {
  const artworks = await getAllArtworksAdmin();

  return (
    <div className="space-y-8 w-full">
      <div className="border-b border-[#1c1d25] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Spatial Computing &amp; Physical Gallery Experience
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">
            Spatial &amp; QR Studio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor true-scale 1:1 physical dimensions, virtual frame extrusions, and generate museum wall QR plaques.
          </p>
        </div>

        {/* Physical Space Sub-Navigation */}
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link href="/admin/ar-studio">
              <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>WebAR Calibration</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2 text-zinc-400 hover:text-white border-[#262833]">
            <Link href="/admin/qr-codes">
              <QrCode className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Wall QR Tags</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Calibration Checklist Overview */}
      <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
            Scale Formula
          </span>
          <span className="font-mono text-white text-sm font-semibold">
            1 Three.js Unit = 1.0 Meter
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Physical wall centimeter lock
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
            Distortion Safeguard
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Strict Aspect Ratio Lock</span>
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Never stretches artwork geometry
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
            Eye-Level Anchor
          </span>
          <span className="font-mono text-white text-sm font-semibold">
            150 cm (Standard Gallery Center)
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Default camera viewing altitude
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
            Camera Privacy Protocol
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Client-Side Isolated</span>
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Zero video transmission
          </span>
        </div>
      </div>

      {/* Artworks AR Readiness Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-white">
          Artwork Calibration Roster ({artworks.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {artworks.map((art) => {
            const isReady =
              art.widthCm > 0 &&
              art.heightCm > 0 &&
              Boolean(art.coverImageUrl) &&
              art.arConfig.isArEnabled;

            return (
              <div
                key={art.id}
                className="p-5 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-black/40 border border-[#262833] shrink-0">
                    <Image
                      src={art.coverImageUrl}
                      alt={art.altText}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base text-white">
                        {art.title}
                      </h3>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
                          isReady
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {isReady ? "AR Ready" : "Needs Attention"}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400">
                      Dimensions: {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                    </p>

                    <p className="text-[11px] text-zinc-500">
                      Default Frame: <strong className="text-zinc-300">{art.arConfig.frameType}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/artworks/${art.id}`}
                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configure AR</span>
                  </Link>

                  <Link
                    href={`/ar/${art.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[#d1a86e] hover:underline uppercase text-[10px] tracking-wider font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Launch 3D/AR Studio</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
