"use client";

import React, { useState } from "react";
import { AlertCircle, Box, RefreshCw, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ARError } from "../engine/arErrors";

interface ArErrorBannerProps {
  error: ARError;
  onSwitchTo3D: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export function ArErrorBanner({
  error,
  onSwitchTo3D,
  onRetry,
  onBack,
}: ArErrorBannerProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200">
      <Card className="w-full max-w-md p-6 bg-[#14151a] border border-[#262833] text-[#f4f4f6] space-y-5 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold block">
              Spatial Visualization
            </span>
            <h3 className="font-serif text-lg text-white font-medium mt-0.5">
              {error.code === "AR_PERMISSION_DENIED"
                ? "Camera Access Required"
                : "Real-World AR Unavailable"}
            </h3>
          </div>
        </div>

        {/* User-friendly message */}
        <p className="text-xs text-zinc-300 leading-relaxed font-light">
          {error.userMessage}
        </p>

        {/* Technical Details Accordion (for dev/debugging) */}
        {error.technicalDetails && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span>Technical Diagnostics</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showTechnicalDetails && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#0d0e12] border border-[#1f212b] font-mono text-[10px] text-zinc-400 break-all">
                <code>{error.technicalDetails}</code>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Button
            onClick={onSwitchTo3D}
            className="flex-1 gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider"
          >
            <Box className="w-4 h-4" />
            <span>Interactive 3D Room</span>
          </Button>

          {error.suggestedAction === "retry" || error.suggestedAction === "check_permission" ? (
            <Button
              variant="outline"
              onClick={onRetry}
              className="gap-1.5 text-xs text-zinc-300 border-[#262833] hover:border-zinc-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          ) : null}

          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-1.5 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
