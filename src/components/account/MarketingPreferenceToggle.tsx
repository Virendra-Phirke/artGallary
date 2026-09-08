"use client";

import React, { useState } from "react";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MarketingPreferenceToggleProps {
  initialSubscribed: boolean;
}

export function MarketingPreferenceToggle({ initialSubscribed }: MarketingPreferenceToggleProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleToggle = async () => {
    const nextState = !isSubscribed;
    setIsUpdating(true);
    setFeedback(null);
    setIsError(false);

    try {
      const res = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingSubscribed: nextState }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubscribed(nextState);
        setFeedback(
          nextState
            ? "Enrolled in Elena Vance studio dispatches and new artwork releases."
            : "Unsubscribed from marketing dispatches. You will still receive inquiry receipts."
        );
      } else {
        setIsError(true);
        setFeedback(data.error || "Failed to update email preferences.");
      }
    } catch {
      setIsError(true);
      setFeedback("Network error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-5 sm:p-7 bg-[#121319] rounded-2xl sm:rounded-3xl space-y-4 shadow-xl border border-white/8">
      <div className="flex flex-col sm:flex-row lg:flex-col min-[1380px]:flex-row lg:items-start min-[1380px]:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] shrink-0 shadow-inner">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-white">Studio Dispatches &amp; Releases</h3>
            <p className="text-xs text-[#8e92a4] max-w-xl leading-relaxed">
              Receive curated acquisition notices, newly released masterworks, and spatial AR catalogs directly in your inbox.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`text-xs uppercase tracking-wider rounded-full px-5 py-2 transition-all cursor-pointer shadow-md ${
              isSubscribed
                ? "bg-[#142e20] text-emerald-300 hover:bg-[#1a3a29]"
                : "bg-[#1c1d28] text-zinc-300 hover:bg-[#252736] hover:text-white"
            }`}
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : isSubscribed ? (
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            ) : null}
            <span>{isSubscribed ? "Subscribed" : "Unsubscribed"}</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`text-xs p-3.5 rounded-xl flex items-center gap-2 ${
            isError
              ? "bg-[#2d1215] text-red-300"
              : "bg-[#241e16] text-[#d1a86e]"
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0 text-[#d1a86e]" />}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
