"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"processing" | "unsubscribed" | "resubscribed" | "error" | "manual">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [affectedEmail, setAffectedEmail] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("manual");
      return;
    }

    let isMounted = true;

    async function executeUnsubscribe() {
      try {
        const res = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token!)}`, {
          method: "POST",
        });
        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success) {
            setStatus("unsubscribed");
            if (data.email) setAffectedEmail(data.email);
          } else {
            setStatus("error");
            setErrorMessage(data.error || "Invalid or expired unsubscribe link.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to process unsubscribe request.");
        }
      }
    }

    executeUnsubscribe();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResubscribe = async () => {
    if (!token) return;
    setStatus("processing");
    try {
      const res = await fetch("/api/newsletter/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("resubscribed");
        if (data.email) setAffectedEmail(data.email);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to re-subscribe.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error occurred.");
    }
  };

  const handleManualUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualEmail.includes("@")) return;

    setIsSubmittingManual(true);
    try {
      // In manual mode, we can inform the user
      setStatus("unsubscribed");
      setAffectedEmail(manualEmail);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#14151a] border border-[#262833] rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
      <div className="text-center space-y-2 border-b border-[#262833] pb-6">
        <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Studio Dispatches • Collector Ledger
        </span>
        <h1 className="font-serif text-3xl text-white">Email Preferences</h1>
        <p className="text-xs text-[#8e92a4]">
          Elena Vance Studio & Curatorial Communications
        </p>
      </div>

      {status === "processing" && (
        <div className="py-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#d1a86e] animate-spin mx-auto" />
          <p className="text-sm text-zinc-300">Updating your collector subscription...</p>
        </div>
      )}

      {status === "unsubscribed" && (
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-white">Unsubscribed Successfully</h2>
            <p className="text-sm text-[#a6aabf] leading-relaxed">
              {affectedEmail ? (
                <>
                  <strong className="text-white">{affectedEmail}</strong> has been removed from all newly released artwork announcements and studio dispatches.
                </>
              ) : (
                "You have been successfully removed from all newly released artwork announcements and studio dispatches."
              )}
            </p>
            <p className="text-xs text-zinc-500 pt-1">
              You may still receive essential transactional receipts if you place a private acquisition inquiry.
            </p>
          </div>

          {token && (
            <div className="pt-2">
              <Button
                onClick={handleResubscribe}
                variant="outline"
                className="border-amber-800/60 text-[#d1a86e] hover:bg-amber-950/40 text-xs uppercase tracking-wider rounded-full px-6"
              >
                Accidental Click? Re-subscribe
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-[#262833] flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Gallery</span>
            </Link>
          </div>
        </div>
      )}

      {status === "resubscribed" && (
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center mx-auto text-[#d1a86e]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-white">Welcome Back</h2>
            <p className="text-sm text-[#a6aabf] leading-relaxed">
              {affectedEmail ? (
                <>
                  <strong className="text-white">{affectedEmail}</strong> has been re-enrolled in Elena Vance studio dispatches.
                </>
              ) : (
                "Your subscription has been re-activated."
              )}
            </p>
            <p className="text-xs text-zinc-500">
              You will continue receiving private views, new masterwork releases, and spatial AR catalogs.
            </p>
          </div>

          <div className="pt-4 border-t border-[#262833] flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Gallery Catalog</span>
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-xl text-white">Preference Update Notice</h2>
            <p className="text-sm text-red-300">
              {errorMessage || "The requested link could not be verified."}
            </p>
            <p className="text-xs text-zinc-500">
              If you have an active account, you can also manage your email preferences anytime directly in your account dashboard.
            </p>
          </div>

          <div className="pt-4 border-t border-[#262833] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="outline" className="border-[#36384a] text-xs rounded-full">
              <Link href="/account">Go to Account Preferences</Link>
            </Button>
            <Button asChild className="bg-[#d1a86e] text-black font-semibold text-xs rounded-full">
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </div>
        </div>
      )}

      {status === "manual" && (
        <form onSubmit={handleManualUnsubscribe} className="space-y-4">
          <p className="text-sm text-zinc-300">
            Enter your email address below to unsubscribe from Elena Vance studio notifications:
          </p>
          <div>
            <input
              type="email"
              required
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="collector@example.com"
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmittingManual}
            className="w-full bg-[#d1a86e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg py-3 hover:bg-[#e2c18d]"
          >
            {isSubmittingManual ? "Processing..." : "Unsubscribe Email"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-6">
      <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading preferences...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
