"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, ShoppingBag, Mail, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollector } from "@/components/account/context/CollectorContext";

export function CollectorAuthGateModal() {
  const { loginPromptReason, setLoginPromptReason } = useCollector();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!loginPromptReason || !mounted) return null;

  const currentTab = searchParams.get("tab") || "gallery";
  const redirectPath = `/account?tab=${currentTab}`;

  const getModalContent = () => {
    switch (loginPromptReason) {
      case "like":
        return {
          icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-rose-400" />,
          tag: "Private Collector Shortlist",
          title: "Sign In to Save Paintings",
          description:
            "Sign in or register a complimentary collector account to curate your personal shortlist, synchronize liked works across devices, and request private atelier viewings.",
          features: [
            "Private portfolio curation & bookmarking",
            "Priority alerts before shortlisted works are reserved",
            "Preview paintings in 1:1 WebAR without login",
          ],
        };
      case "add":
        return {
          icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#d1a86e]" />,
          tag: "Acquisition Dossier Protocol",
          title: "Sign In to Add to Dossier",
          description:
            "An authentic collector account is required to reserve Elena Vance original canvases, calculate museum-grade crating logistics, and compile acquisition dossiers.",
          features: [
            "Direct atelier reservation without intermediary gallery markups",
            "Museum-grade crating & insured white-glove shipping quotes",
            "Synchronize acquisition dossier across all your devices",
          ],
        };
      case "contact":
        return {
          icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#d1a86e]" />,
          tag: "Curatorial Liaison Correspondence",
          title: "Sign In to Contact Atelier",
          description:
            "To correspond directly with Madame Vance's Paris atelier desk and inquire about original acquisitions, bespoke commissions, or private studio viewings, please sign in with your collector credentials.",
          features: [
            "Direct access to Elena Vance's Paris curatorial liaison",
            "Guaranteed priority response within 2 business hours",
            "Inquiries and provenance records automatically logged in your private portal",
          ],
        };
      case "inquiries":
        return {
          icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#d1a86e]" />,
          tag: "Acquisition Ledger",
          title: "Sign In to View Inquiries",
          description:
            "Sign in to access your confidential acquisition correspondence, courier dispatch confirmations, and private invoice ledger.",
          features: [
            "Historical studio correspondence archive",
            "Real-time courier dispatch & customs status",
            "Authenticated digital certificates of authenticity",
          ],
        };
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#d1a86e]" />,
          tag: "Private Collector Protocol",
          title: "Sign In to Continue",
          description:
            "Please sign in or create a complimentary collector account to access verified collector services.",
          features: [
            "Private portfolio curation & bookmarking",
            "Priority response from gallery liaison",
            "Preview paintings in AR without login",
          ],
        };
    }
  };

  const content = getModalContent();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto"
      onClick={() => setLoginPromptReason(null)}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#121319] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 text-center text-[#f4f4f6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1c1e2b] flex items-center justify-center mx-auto shadow-inner">
          {content.icon}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
            {content.tag}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-white font-medium">
            {content.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            {content.description}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1a1b26] text-left text-xs text-zinc-300 space-y-2 shadow-inner">
          {content.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-zinc-300">
              <Check className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <Button
            asChild
            className="w-full rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[11px] sm:text-xs tracking-wider uppercase h-10 sm:h-11 shadow-md shadow-[#d1a86e]/20 cursor-pointer active:scale-[0.98]"
          >
            <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`}>
              <span>Sign In with Email &amp; Password</span>
            </Link>
          </Button>

          <Button
            asChild
            className="w-full rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 text-[11px] sm:text-xs tracking-wider uppercase h-10 sm:h-11 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Link href={`/register?redirect=${encodeURIComponent(redirectPath)}`}>
              <span>Register Free Collector Account</span>
            </Link>
          </Button>

          <button
            onClick={() => setLoginPromptReason(null)}
            className="text-[11px] sm:text-xs text-zinc-500 hover:text-zinc-300 pt-1.5 transition-colors uppercase tracking-wider cursor-pointer block mx-auto"
          >
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

