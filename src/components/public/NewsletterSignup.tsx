"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer_gazette" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("You are now enrolled in Elena Vance studio dispatches.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network connection issue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-[#d1a86e]" />
        <h4 className="text-xs uppercase tracking-[0.25em] text-zinc-300 font-semibold">
          Studio Gazette &amp; Dispatches
        </h4>
      </div>

      <p className="text-xs text-[#8e92a4] leading-relaxed">
        Be the first to inspect newly completed masterworks, exhibition previews, and spatial WebAR catalog updates.
      </p>

      {status === "success" ? (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@domain.com"
              className="flex-1 bg-[#14151a] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Enroll</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {status === "error" && (
            <div className="text-[11px] text-red-400 flex items-center gap-1.5 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="text-[10px] text-zinc-600 flex items-center justify-between">
            <span>Direct studio correspondence</span>
            <span>1-click unsubscribe anytime</span>
          </div>
        </form>
      )}
    </div>
  );
}
