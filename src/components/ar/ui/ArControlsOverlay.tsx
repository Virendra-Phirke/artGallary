"use client";

import React from "react";
import {
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Check,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Anchor,
  ShieldCheck,
} from "lucide-react";
import { FrameStyle } from "../engine/artworkMesh";
import { formatDimensions } from "@/lib/utils";

interface ArControlsOverlayProps {
  artworkTitle: string;
  widthCm: number;
  heightCm: number;
  scale: number;
  isPlaced: boolean;
  isScanning: boolean;
  surfaceDetected: boolean;
  wallDetected?: boolean;
  wallConfidence?: "high" | "medium" | "low" | null;
  anchorLocked?: boolean;
  elevationOffsetM?: number;
  elevationLocked?: boolean;
  frameStyle: FrameStyle;
  frameEnabled: boolean;
  diagnostics?: {
    mode: string;
    blendMode?: string;
    referenceSpaceType?: string;
    hitTestReady?: boolean;
    hasPlaneDetection?: boolean;
    hasLightingEstimation?: boolean;
    hasAnchors?: boolean;
  };
  onExit: () => void;
  onReset: () => void;
  onAdjustElevation?: (deltaM: number) => void;
  onToggleElevationLock?: () => void;
  onFrameChange: (style: FrameStyle, enabled: boolean) => void;
  onSwitchTo3DRoom: () => void;
}

export function ArControlsOverlay({
  artworkTitle,
  widthCm,
  heightCm,
  scale,
  isPlaced,
  isScanning,
  surfaceDetected,
  wallDetected = false,
  wallConfidence = null,
  anchorLocked = false,
  elevationOffsetM = 0,
  elevationLocked = false,
  frameStyle,
  frameEnabled,
  diagnostics,
  onExit,
  onReset,
  onAdjustElevation,
  onToggleElevationLock,
  onFrameChange,
  onSwitchTo3DRoom,
}: ArControlsOverlayProps) {
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);
  const currentWidthCm = (widthCm * scale).toFixed(1);
  const currentHeightCm = (heightCm * scale).toFixed(1);
  const scalePercent = Math.round(scale * 100);

  // Gallery standard elevation is 145cm center-line from floor
  const currentElevationCm = Math.round(145 + elevationOffsetM * 100);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-3.5 sm:p-6 select-none">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-2.5 pointer-events-auto relative">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/15 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium uppercase tracking-wider hover:bg-black/95 transition-all shadow-lg active:scale-95"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Exit AR</span>
        </button>

        {/* Current Dimension & Scale Badge */}
        <div className="bg-black/75 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-center shadow-lg max-w-[200px] sm:max-w-none truncate">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[11px] font-serif text-white font-medium truncate">
              {artworkTitle}
            </span>
            {anchorLocked && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                title="Spatial Anchor Active"
              >
                <Anchor className="w-2.5 h-2.5" />
                <span>Anchored</span>
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-widest text-[#d1a86e] font-mono block">
            {scalePercent}% • {currentWidthCm} × {currentHeightCm} cm
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Diagnostics HUD Toggle */}
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="p-2 sm:p-2.5 bg-black/75 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white rounded-full transition-colors shadow-lg active:scale-95"
            title="Toggle Spatial AR Diagnostics"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e]" />
          </button>

          {/* Switch to 3D Room */}
          <button
            onClick={onSwitchTo3DRoom}
            className="p-2 sm:p-2.5 bg-black/75 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white rounded-full transition-colors shadow-lg active:scale-95"
            title="Switch to 3D Room Studio"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e]" />
          </button>
        </div>

        {/* Diagnostic HUD Floating Panel */}
        {showDiagnostics && (
          <div className="absolute top-14 right-0 p-3.5 rounded-xl bg-black/95 backdrop-blur-md border border-white/20 text-[10px] font-mono text-zinc-300 space-y-1.5 shadow-2xl z-50 pointer-events-auto min-w-[230px] animate-in fade-in-0 zoom-in-95">
            <div className="text-[#d1a86e] font-semibold text-[11px] border-b border-white/15 pb-1 flex items-center justify-between">
              <span>SPATIAL AR ENGINE</span>
              <span className="text-emerald-400">PASSTHROUGH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Mode:</span>
              <span className="text-white">{diagnostics?.mode === "webxr-ar" ? "WebXR immersive-ar" : "Camera Stream"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Wall Engine:</span>
              <span className={wallDetected ? "text-emerald-400" : "text-amber-400"}>
                {wallDetected ? `Locked (${wallConfidence || "normal"}) ✓` : "Searching"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Planes API:</span>
              <span className={diagnostics?.hasPlaneDetection ? "text-emerald-400" : "text-zinc-500"}>
                {diagnostics?.hasPlaneDetection ? "Active ✓" : "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Light Estimation:</span>
              <span className={diagnostics?.hasLightingEstimation ? "text-emerald-400" : "text-zinc-500"}>
                {diagnostics?.hasLightingEstimation ? "Active ✓" : "Museum Baseline"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Anchoring:</span>
              <span className={anchorLocked ? "text-emerald-400" : "text-zinc-400"}>
                {anchorLocked ? "Locked (XRAnchor) ✓" : "Pose Tracking"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">RefSpace:</span>
              <span className="text-white">{diagnostics?.referenceSpaceType || "local"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Blend:</span>
              <span className="text-[#d1a86e]">{diagnostics?.blendMode || "alpha-blend"}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. SCANNING & SURFACE DETECTION GUIDANCE OVERLAY */}
      {!isPlaced && (
        <div className="my-auto mx-auto text-center space-y-3 pointer-events-none max-w-xs px-4">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-[#d1a86e] animate-spin flex items-center justify-center bg-black/40 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-[#d1a86e]" />
          </div>

          <div className="bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 shadow-2xl space-y-1.5">
            <p className="text-xs font-medium text-white flex items-center justify-center gap-1.5">
              {wallDetected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vertical Wall Locked</span>
                </>
              ) : surfaceDetected ? (
                <span>Surface Found (Aim at Wall)</span>
              ) : (
                <span>Scanning Room for Walls...</span>
              )}
            </p>
            <p className="text-[11px] text-[#d1a86e] font-semibold">
              {wallDetected
                ? "Tap anywhere on screen to mount artwork"
                : surfaceDetected
                ? "Pan camera up toward a flat vertical wall"
                : "Slowly move your phone across your space"}
            </p>
            <p className="text-[10px] text-zinc-400 font-mono">
              Artwork hanging standard: 145 cm eye-level
            </p>
          </div>
        </div>
      )}

      {/* 3. BOTTOM CONTROLS WHEN ARTWORK IS PLACED */}
      {isPlaced && (
        <div className="space-y-2 sm:space-y-3 pointer-events-auto max-w-lg mx-auto w-full">
          {/* Elevation Fine-Tuning & Lock Toolbar */}
          <div className="flex items-center justify-between gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs text-zinc-300 shadow-xl">
            {/* Elevation Adjust Up/Down */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Height:
              </span>
              <span className="text-[11px] font-mono text-white font-semibold">
                {currentElevationCm} cm
              </span>

              {onAdjustElevation && (
                <div className="flex items-center gap-1 pl-1">
                  <button
                    onClick={() => onAdjustElevation(0.05)}
                    className="p-1 rounded bg-[#1f212a] hover:bg-[#2c2f3b] text-zinc-200 active:scale-95 transition-colors"
                    title="Raise hanging height by 5cm"
                  >
                    <ChevronUp className="w-3 h-3 text-[#d1a86e]" />
                  </button>
                  <button
                    onClick={() => onAdjustElevation(-0.05)}
                    className="p-1 rounded bg-[#1f212a] hover:bg-[#2c2f3b] text-zinc-200 active:scale-95 transition-colors"
                    title="Lower hanging height by 5cm"
                  >
                    <ChevronDown className="w-3 h-3 text-[#d1a86e]" />
                  </button>
                </div>
              )}
            </div>

            {/* Height Lock Toggle */}
            {onToggleElevationLock && (
              <button
                onClick={onToggleElevationLock}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                  elevationLocked
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium"
                    : "bg-[#1f212a] border-white/10 text-zinc-400 hover:text-white"
                }`}
                title="Lock height so artwork slides only horizontally along the wall"
              >
                {elevationLocked ? (
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Unlock className="w-2.5 h-2.5 text-zinc-400" />
                )}
                <span>{elevationLocked ? "Height Locked" : "Free Move"}</span>
              </button>
            )}

            {/* Reset to 1:1 Scale */}
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-zinc-300 hover:text-white bg-[#1a1c23] border border-white/10 transition-colors active:scale-95"
              title="Reset scale to 1:1 and center elevation"
            >
              <RotateCcw className="w-2.5 h-2.5 text-[#d1a86e]" />
              <span>1:1 Scale</span>
            </button>
          </div>

          {/* Frame Styles Selector */}
          <div className="bg-[#14151a]/95 backdrop-blur-md border border-[#262833] p-1.5 sm:p-2 rounded-2xl flex items-center justify-between gap-2 shadow-2xl">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono pl-2 hidden sm:inline">
              Frame:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 w-full justify-around sm:justify-start">
              {[
                { id: "none", label: "Frameless" },
                { id: "minimal_black", label: "Black" },
                { id: "classic_gold", label: "Gold" },
                { id: "natural_wood", label: "Wood" },
                { id: "white_gallery", label: "White" },
              ].map((f) => {
                const isCurrent = frameEnabled && frameStyle === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (f.id === "none") {
                        onFrameChange("none", false);
                      } else {
                        onFrameChange(f.id as FrameStyle, true);
                      }
                    }}
                    className={`text-[10px] px-2 sm:px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
                      isCurrent || (!frameEnabled && f.id === "none")
                        ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md"
                        : "text-zinc-400 hover:text-white hover:bg-[#1a1c23]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
