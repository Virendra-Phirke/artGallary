"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ShieldCheck,
  Sparkles,
  Maximize2,
  Layers,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { formatDimensions } from "@/lib/utils";

interface ArPermissionScreenProps {
  artwork: {
    title: string;
    slug: string;
    coverImageUrl: string;
    widthCm: number;
    heightCm: number;
    depthCm?: number;
    medium: string;
  };
  onStartAr: () => void;
  onLaunchRoomFallback: () => void;
  isStarting?: boolean;
}

export function ArPermissionScreen({
  artwork,
  onStartAr,
  onLaunchRoomFallback,
  isStarting = false,
}: ArPermissionScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/artwork/${artwork.slug}`}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-[#14151a] px-4 py-2 rounded-full border border-[#262833]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Artwork</span>
        </Link>

        <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          WebAR Spatial Studio
        </span>
      </div>

      {/* Main Content Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8 space-y-8 text-center">
        {/* Artwork Thumbnail Card */}
        <div className="relative w-48 h-36 mx-auto rounded-xl overflow-hidden border border-[#262833] bg-[#14151a] shadow-2xl shadow-black/80">
          <Image
            src={artwork.coverImageUrl}
            alt={artwork.title}
            fill
            sizes="192px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2">
            <span className="text-[10px] tracking-wider uppercase text-zinc-300 font-mono">
              {formatDimensions(artwork.widthCm, artwork.heightCm)}
            </span>
          </div>
        </div>

        {/* Narrative & Value Proposition */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Calibrated 1:1 Wall Placement</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-white font-medium">
            View &ldquo;{artwork.title}&rdquo; in Your Room
          </h1>

          <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed max-w-sm mx-auto">
            Point your camera at a wall to preview this original artwork rendered to its exact physical centimeter dimensions.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onStartAr}
            disabled={isStarting}
            className="w-full flex items-center justify-center gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#d1a86e]/15 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{isStarting ? "Starting Camera..." : "Start AR Experience"}</span>
          </button>

          <button
            onClick={onLaunchRoomFallback}
            className="w-full flex items-center justify-center gap-2 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] text-zinc-300 hover:text-white py-3.5 rounded-xl text-xs font-medium uppercase tracking-[0.15em] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Interactive 3D Room (No Camera)</span>
          </button>
        </div>

        {/* Strict Privacy Guarantee Note */}
        <div className="p-3.5 rounded-xl bg-[#14151a] border border-[#262833] text-[11px] text-zinc-400 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-zinc-200 font-medium">Camera Privacy:</strong> Camera frames are processed strictly locally in your browser to detect surfaces. Zero video or spatial data is ever recorded or transmitted to our servers.
          </span>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Standard Gallery Calibration • 150 cm Eye-Level Hang Height
      </div>
    </div>
  );
}
