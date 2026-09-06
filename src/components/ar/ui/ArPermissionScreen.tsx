"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Eye,
  Box,
  Monitor,
} from "lucide-react";
import { formatDimensions } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ARCapabilities } from "../engine/arCapability";

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
  capabilities?: ARCapabilities | null;
  onStartAr: () => void;
  onLaunchRoomFallback: () => void;
  isStarting?: boolean;
}

export function ArPermissionScreen({
  artwork,
  capabilities,
  onStartAr,
  onLaunchRoomFallback,
  isStarting = false,
}: ArPermissionScreenProps) {
  const isDesktopWithoutAR =
    capabilities && !capabilities.hasWebXr && !capabilities.isMobile;

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

        <div className="flex items-center gap-2">
          {capabilities?.hasWebXr ? (
            <Badge variant="gold" className="text-[9px] tracking-wider">
              WebXR Spatial AR Ready
            </Badge>
          ) : isDesktopWithoutAR ? (
            <Badge variant="secondary" className="text-[9px] tracking-wider">
              Desktop 3D Studio Ready
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[9px] tracking-wider">
              Camera AR & 3D Ready
            </Badge>
          )}
        </div>
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
            <span>Calibrated 1:1 Metric Scale</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-white font-medium">
            View &ldquo;{artwork.title}&rdquo; in Scale
          </h1>

          <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed max-w-sm mx-auto">
            {isDesktopWithoutAR
              ? "Preview this original artwork rendered with true-to-life centimeter proportions, customizable gallery wall colors, and museum lighting."
              : "Point your camera at a wall to preview this original artwork placed in your physical room at exact centimeter dimensions."}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3 pt-2">
          {/* Primary CTA */}
          {isDesktopWithoutAR ? (
            <Button
              onClick={onLaunchRoomFallback}
              className="w-full h-12 gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] rounded-xl text-xs font-semibold uppercase tracking-[0.2em]"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Room Studio</span>
            </Button>
          ) : (
            <Button
              onClick={onStartAr}
              disabled={isStarting}
              className="w-full h-12 gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] rounded-xl text-xs font-semibold uppercase tracking-[0.2em] shadow-xl shadow-[#d1a86e]/15 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isStarting ? "Initializing..." : "Start AR Experience"}</span>
            </Button>
          )}

          {/* Secondary CTA */}
          {!isDesktopWithoutAR ? (
            <Button
              variant="outline"
              onClick={onLaunchRoomFallback}
              className="w-full h-11 gap-2 bg-[#14151a] hover:bg-[#1a1c23] border-[#262833] text-zinc-300 hover:text-white rounded-xl text-xs font-medium uppercase tracking-[0.15em]"
            >
              <Eye className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Interactive 3D Room (No Camera)</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onStartAr}
              className="w-full h-10 gap-2 text-zinc-400 hover:text-zinc-200 text-xs tracking-wider"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-500" />
              <span>Attempt Camera AR On This Device</span>
            </Button>
          )}
        </div>

        {/* Strict Privacy Guarantee Note */}
        <Card className="p-3.5 rounded-xl bg-[#14151a] border border-[#262833] text-[11px] text-zinc-400 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-zinc-200 font-medium">Privacy Guaranteed:</strong> Camera frames are processed strictly locally in your browser for surface detection. No video or spatial data is ever recorded or uploaded.
          </span>
        </Card>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Standard Gallery Calibration • 150 cm Eye-Level Hang Height
      </div>
    </div>
  );
}
