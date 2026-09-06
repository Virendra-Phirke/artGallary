"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Send, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { formatCurrency, formatDimensions } from "@/lib/utils";

interface ArtworkSummary {
  id: string;
  slug: string;
  title: string;
  medium: string;
  year: number;
  widthCm: number;
  heightCm: number;
  price?: number;
  currency: string;
  coverImageUrl: string;
}

interface InquiryModalProps {
  artwork: ArtworkSummary;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryModal({ artwork, isOpen, onClose }: InquiryModalProps) {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore preserved draft message if any exists
  useEffect(() => {
    // Check auth
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.user) {
          setUser(data.session.user);
          setName(data.session.user.name || "");
          setEmail(data.session.user.email || "");
        }
      })
      .catch(() => {});

    // Check saved draft in sessionStorage
    const savedDraft = sessionStorage.getItem(`inquiry_draft_${artwork.slug}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.message) setMessage(parsed.message);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.email && !email) setEmail(parsed.email);
      } catch {}
    } else {
      setMessage(
        `I would like to inquire about the acquisition details and shipping for "${artwork.title}" (${artwork.year}, ${formatDimensions(artwork.widthCm, artwork.heightCm)}).`
      );
    }
  }, [artwork]);

  // Persist message on change so a user never loses typed data
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    sessionStorage.setItem(
      `inquiry_draft_${artwork.slug}`,
      JSON.stringify({ name, email, phone, message: val })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If unauthenticated, redirect to login while preserving destination and message
    if (!user) {
      sessionStorage.setItem(
        `inquiry_draft_${artwork.slug}`,
        JSON.stringify({ name, email, phone, message })
      );
      window.location.href = `/login?redirect=${encodeURIComponent(
        `/artwork/${artwork.slug}?inquire=open`
      )}`;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: artwork.id,
          name: name || user.name,
          email: email || user.email,
          phone,
          subject: `Acquisition Inquiry: ${artwork.title}`,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setIsSuccess(true);
      sessionStorage.removeItem(`inquiry_draft_${artwork.slug}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#14151a] border border-[#262833] rounded-lg shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close inquiry dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-[#d1a86e]/10 text-[#d1a86e] rounded-full flex items-center justify-center mx-auto border border-[#d1a86e]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-white">Inquiry Received</h3>
            <p className="text-sm text-[#a6aabf] max-w-md mx-auto leading-relaxed">
              Thank you. Madame Vance&apos;s curatorial team has received your inquiry for{" "}
              <strong className="text-white font-medium">&ldquo;{artwork.title}&rdquo;</strong>. A detailed dossier with provenance and shipping estimates has been sent to your registered email.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/account/inquiries"
                className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
              >
                View Your Inquiries
              </Link>
              <span className="text-zinc-600">•</span>
              <button
                onClick={onClose}
                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
              >
                Return to Artwork
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="border-b border-[#262833] pb-5 mb-6">
              <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                Private Acquisition Inquiry
              </span>
              <h2
                id="inquiry-modal-title"
                className="font-serif text-2xl md:text-3xl text-white mt-1"
              >
                {artwork.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
                <span>{artwork.year}</span>
                <span>•</span>
                <span>{artwork.medium}</span>
                <span>•</span>
                <span>{formatDimensions(artwork.widthCm, artwork.heightCm)}</span>
                <span>•</span>
                <span className="text-[#d1a86e] font-medium">
                  {formatCurrency(artwork.price, artwork.currency)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded text-xs text-amber-200/90 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                  <p>
                    <strong>Authentication Required:</strong> Contacting the artist requires an account to prevent spam and track correspondence. Your message will be preserved while you sign in.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lord Sterling"
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. collector@estate.com"
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Phone (Optional for shipping logistics)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Message / Inquiries
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={handleMessageChange}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-3 rounded text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : user ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Acquisition Inquiry</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In &amp; Send Inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
