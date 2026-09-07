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
    <Card className="p-6 bg-[#14151a] border-[#262833] rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-[#d1a86e] shrink-0">
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
            variant="outline"
            className={`text-xs uppercase tracking-wider rounded-full px-5 py-2 transition-all ${
              isSubscribed
                ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60"
                : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-white"
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
          className={`text-xs p-3 rounded-lg flex items-center gap-2 ${
            isError
              ? "bg-red-950/40 border border-red-800/60 text-red-300"
              : "bg-amber-950/30 border border-amber-800/40 text-amber-200"
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0 text-[#d1a86e]" />}
          <span>{feedback}</span>
        </div>
      )}
    </Card>
  );
}
