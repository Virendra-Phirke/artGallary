"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Send, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

export function ContactForm() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Studio Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth session
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

    // Check preserved draft in sessionStorage
    const saved = sessionStorage.getItem("general_contact_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.email && !email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.message) setMessage(parsed.message);
      } catch {}
    }
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    sessionStorage.setItem(
      "general_contact_draft",
      JSON.stringify({ name, email, phone, subject, message: val })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If not authenticated, preserve message and redirect to login
    if (!user) {
      sessionStorage.setItem(
        "general_contact_draft",
        JSON.stringify({ name, email, phone, subject, message })
      );
      window.location.href = `/login?redirect=${encodeURIComponent("/contact?restored=1")}`;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || user.name,
          email: email || user.email,
          phone,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setIsSuccess(true);
      sessionStorage.removeItem("general_contact_draft");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 md:p-12 bg-[#14151a] border border-[#262833] rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-[#d1a86e]/10 text-[#d1a86e] rounded-full flex items-center justify-center mx-auto border border-[#d1a86e]/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl text-white">Inquiry Transmitted</h2>
        <p className="text-sm text-[#a6aabf] max-w-md mx-auto leading-relaxed">
          Thank you for writing to Madame Vance&apos;s curatorial office. Our gallery liaison will reply within two business days.
        </p>
        <div className="pt-4">
          <Link
            href="/account/inquiries"
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
          >
            Review Your Inquiries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 md:p-10 bg-[#14151a] border border-[#262833] rounded-2xl space-y-5 shadow-2xl"
    >
      {!user && (
        <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
          <p>
            <strong>Authentication Notice:</strong> Submitting inquiries to Elena Vance requires a registered account to protect against spam. Any message you type is automatically saved and preserved across authentication.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
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
            placeholder="e.g. Genevieve Laurent"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
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
            placeholder="e.g. g.laurent@fondation.fr"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Phone (Optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 1 42 00 00 00"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Inquiry Type
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
          >
            <option value="Private Acquisition Inquiry">Private Acquisition Inquiry</option>
            <option value="Curatorial Exhibition Loan">Curatorial Exhibition Loan</option>
            <option value="Press & Media Interview">Press &amp; Media Interview</option>
            <option value="General Studio Question">General Studio Question</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
          Your Message
        </label>
        <textarea
          rows={5}
          required
          value={message}
          onChange={handleMessageChange}
          placeholder="Please describe your acquisition or curatorial inquiry in detail..."
          className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>Sending...</span>
        ) : user ? (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Transmit Inquiry to Studio</span>
          </>
        ) : (
          <>
            <span>Sign In &amp; Transmit Inquiry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
