"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Send, CheckCircle2, ShieldAlert, ArrowRight, Mail, Phone, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ContactForm() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"email" | "phone">("email");
  const [subject, setSubject] = useState("Private Acquisition Inquiry");
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
        if (parsed.preferredContactMethod) setPreferredContactMethod(parsed.preferredContactMethod);
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
      JSON.stringify({ name, email, phone, preferredContactMethod, subject, message: val })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (preferredContactMethod === "phone" && !phone.trim()) {
      setError("Please provide your mobile number so our curatorial team can contact you directly.");
      return;
    }

    // If not authenticated, preserve message and redirect to login
    if (!user) {
      sessionStorage.setItem(
        "general_contact_draft",
        JSON.stringify({ name, email, phone, preferredContactMethod, subject, message })
      );
      window.location.href = `/login?redirect=${encodeURIComponent("/#contact?restored=1")}`;
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
          phone: phone.trim() || undefined,
          preferredContactMethod,
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
      <Card className="p-8 md:p-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-[#d1a86e]/10 text-[#d1a86e] rounded-full flex items-center justify-center mx-auto border border-[#d1a86e]/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-white">Inquiry Transmitted</h2>
        <p className="text-xs sm:text-sm text-[#a6aabf] max-w-md mx-auto leading-relaxed">
          Thank you for corresponding with our curatorial office. Our gallery liaison will contact you via{" "}
          <strong className="text-[#d1a86e]">{preferredContactMethod === "phone" ? "direct phone call / mobile" : "email"}</strong> within two business days.
        </p>
        <div className="pt-4">
          <Button asChild variant="outline" size="sm" className="text-xs uppercase tracking-wider text-[#d1a86e]">
            <Link href="/account?tab=inquiries">
              Review Your Inquiries Ledger
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 md:p-10 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {!user && (
          <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Authentication Notice:</strong> Submitting inquiries requires a registered account. Your message is automatically preserved across login.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Your Name <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Genevieve Laurent"
              className="h-11 bg-[#1a1c23] border-[#262833] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Email Address <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. g.laurent@fondation.fr"
              className="h-11 bg-[#1a1c23] border-[#262833] text-sm"
            />
          </div>
        </div>

        {/* Preferred Response Method Selection Cards */}
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
            How would you prefer our curatorial desk to respond? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPreferredContactMethod("email")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                preferredContactMethod === "email"
                  ? "bg-[#1f202b] border-[#d1a86e] text-white shadow-md shadow-[#d1a86e]/10"
                  : "bg-[#161720] border-white/5 text-zinc-400 hover:border-white/10"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${preferredContactMethod === "email" ? "bg-[#d1a86e]/15 text-[#d1a86e]" : "bg-white/5 text-zinc-400"}`}>
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">Email Response</div>
                <div className="text-[11px] text-zinc-400 font-light">Curator will send formal written appraisal via email</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPreferredContactMethod("phone")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                preferredContactMethod === "phone"
                  ? "bg-[#1f202b] border-[#d1a86e] text-white shadow-md shadow-[#d1a86e]/10"
                  : "bg-[#161720] border-white/5 text-zinc-400 hover:border-white/10"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${preferredContactMethod === "phone" ? "bg-[#d1a86e]/15 text-[#d1a86e]" : "bg-white/5 text-zinc-400"}`}>
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">Direct Phone Call</div>
                <div className="text-[11px] text-zinc-400 font-light">Curator will call or WhatsApp your mobile number</div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Mobile Number {preferredContactMethod === "phone" ? <span className="text-red-400">* (Required for Direct Call)</span> : <span className="text-zinc-500 font-normal">(Optional)</span>}
            </label>
            <Input
              type="tel"
              required={preferredContactMethod === "phone"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="h-11 bg-[#1a1c23] border-[#262833] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Inquiry Type
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer h-11"
            >
              <option value="Private Acquisition Inquiry">Private Acquisition Inquiry</option>
              <option value="Curatorial Exhibition Loan">Curatorial Exhibition Loan</option>
              <option value="Press & Media Interview">Press &amp; Media Interview</option>
              <option value="General Studio Question">General Studio Question</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
            Your Message <span className="text-red-400">*</span>
          </label>
          <Textarea
            rows={5}
            required
            value={message}
            onChange={handleMessageChange}
            placeholder="Please describe your acquisition or curatorial inquiry in detail..."
            className="bg-[#1a1c23] border-[#262833] text-sm placeholder:text-zinc-600 focus-visible:ring-[#d1a86e]"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-[#d1a86e]/10"
        >
          {isSubmitting ? (
            <span>Sending...</span>
          ) : user ? (
            <>
              <Send className="w-3.5 h-3.5 mr-2" />
              <span>Transmit Inquiry to Studio</span>
            </>
          ) : (
            <>
              <span>Sign In &amp; Transmit Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

