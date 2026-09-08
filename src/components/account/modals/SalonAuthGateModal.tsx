"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollector } from "@/components/account/context/CollectorContext";

export function SalonAuthGateModal() {
  const { loginPromptReason, setLoginPromptReason } = useCollector();

  if (!loginPromptReason) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setLoginPromptReason(null)}
    >
      <div
        className="relative w-full max-w-md bg-[#121319] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-[#f4f4f6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
          {loginPromptReason === "like" ? (
            <Heart className="w-6 h-6 fill-current" />
          ) : (
            <ShieldCheck className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
            Private Salon Protocol
          </span>
          <h3 className="font-serif text-2xl text-white font-medium">
            {loginPromptReason === "like"
              ? "Sign In to Save Paintings"
              : "Sign In to Contact Studio"}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            {loginPromptReason === "like"
              ? "Sign in or create a complimentary collector account to curate your personal shortlist, synchronize liked works across devices, and request private studio viewings."
              : "To correspond directly with Madame Vance's curatorial desk and inquire about original acquisitions, please sign in with your collector credentials."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1b26] text-left text-xs text-zinc-300 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Private portfolio curation &amp; bookmarking</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Priority response from gallery liaison</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Preview paintings in AR without login</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <Button
            asChild
            className="w-full rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase h-11 shadow-md shadow-[#d1a86e]/20 cursor-pointer"
          >
            <Link href={`/login?redirect=${encodeURIComponent("/account?tab=gallery")}`}>
              <span>Sign In with Email &amp; Password</span>
            </Link>
          </Button>

          <Button
            asChild
            className="w-full rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 text-xs tracking-wider uppercase h-11 cursor-pointer shadow-sm"
          >
            <Link href={`/register?redirect=${encodeURIComponent("/account?tab=gallery")}`}>
              <span>Register Free Collector Account</span>
            </Link>
          </Button>

          <button
            onClick={() => setLoginPromptReason(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 pt-2 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
