"use client";

import React, { useState } from "react";
import type { ThemeSettingsData } from "@/db/mockData";
import { Paintbrush, Check, Sparkles, Loader2, ArrowRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppearanceClientProps {
  initialTheme: ThemeSettingsData;
}

export function AppearanceClient({ initialTheme }: AppearanceClientProps) {
  const [theme, setTheme] = useState<ThemeSettingsData>(initialTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (!res.ok) throw new Error("Failed to save theme");
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (e) {
      console.error("Theme save error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const accentHues = [
    { id: "#d1a86e", name: "Champagne Gold", hex: "#d1a86e" },
    { id: "#c59b63", name: "Florentine Amber", hex: "#c59b63" },
    { id: "#e2c18d", name: "Luminous Ochre", hex: "#e2c18d" },
    { id: "#9fa3b0", name: "Platinum Slate", hex: "#9fa3b0" },
    { id: "#3d5a80", name: "Deep Lapis", hex: "#3d5a80" },
    { id: "#9c6644", name: "Venetian Terracotta", hex: "#9c6644" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Design Tokens &amp; Styling
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Appearance &amp; Theme</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure gallery typography tokens, luxury accent hues, corner radius, and motion animation intensity.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : saved ? (
            <Check className="w-4 h-4 text-emerald-950" />
          ) : (
            <Paintbrush className="w-4 h-4" />
          )}
          <span>{isSaving ? "Saving..." : saved ? "Tokens Saved" : "Save Appearance"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Accent Color Palette */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Curated Accent Hues</h2>
            <p className="text-xs text-zinc-400">
              Select a verified museum accent token. Arbitrary CSS/JS injection is strictly prohibited for security.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {accentHues.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTheme((prev) => ({ ...prev, primaryColor: c.id }))}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    theme.primaryColor === c.id
                      ? "bg-[#1a1c23] border-[#d1a86e] shadow-lg ring-1 ring-[#d1a86e]/30"
                      : "bg-[#14151a] border-[#262833] hover:border-zinc-600"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs text-white font-medium truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Configuration */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Typography Hierarchy</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Editorial Heading Serif
                </label>
                <select
                  value={theme.headingFont}
                  onChange={(e) => setTheme((prev) => ({ ...prev, headingFont: e.target.value }))}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                >
                  <option value="Playfair Display">Playfair Display (Default Luxury Serif)</option>
                  <option value="Cormorant Garamond">Cormorant Garamond (Classical Venetian)</option>
                  <option value="Cinzel">Cinzel (Lapidary Inscriptional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Body Sans-Serif
                </label>
                <select
                  value={theme.bodyFont}
                  onChange={(e) => setTheme((prev) => ({ ...prev, bodyFont: e.target.value }))}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary Clean)</option>
                  <option value="Inter">Inter (High-Legibility Neutral)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Radius & Container Tokens */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Border Geometry &amp; Container Width</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Corner Radius Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "0px", label: "Sharp" },
                    { id: "0.375rem", label: "Subtle (6px)" },
                    { id: "0.75rem", label: "Curved (12px)" },
                    { id: "1.25rem", label: "Expressive (20px)" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, borderRadius: r.id }))}
                      className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                        theme.borderRadius === r.id
                          ? "bg-[#1a1c23] border-[#d1a86e] text-white font-semibold"
                          : "bg-[#14151a] border-[#262833] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Container Layout Width
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "1280px", label: "Standard (1280px)" },
                    { id: "1440px", label: "Wide (1440px)" },
                    { id: "1600px", label: "Cinematic (1600px)" },
                    { id: "100%", label: "Edge-to-Edge" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, containerWidth: w.id }))}
                      className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                        theme.containerWidth === w.id
                          ? "bg-[#1a1c23] border-[#d1a86e] text-white font-semibold"
                          : "bg-[#14151a] border-[#262833] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Animation Level */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Motion Choreography</h2>
            <p className="text-xs text-zinc-400">
              Control the cadence of page reveals, artwork zooms, and spatial transitions. Respects prefers-reduced-motion.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { id: "minimal", label: "Minimal", desc: "Instant reveals, subtle fades" },
                { id: "standard", label: "Standard", desc: "Balanced editorial transitions" },
                { id: "cinematic", label: "Cinematic", desc: "Museum-grade slow parallax" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setTheme((prev) => ({ ...prev, animationLevel: lvl.id as any }))}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    theme.animationLevel === lvl.id
                      ? "bg-[#1a1c23] border-[#d1a86e]"
                      : "bg-[#14151a] border-[#262833] hover:border-zinc-600"
                  }`}
                >
                  <span className="text-xs font-medium text-white block">
                    {lvl.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {lvl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Token Preview Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Live Token Sandbox
            </span>
            <Badge variant="outline" className="text-[10px] border-[#262833] text-zinc-400">
              Dynamic Render
            </Badge>
          </div>

          <Card
            className="p-6 bg-[#14151a] border-[#262833] space-y-5 shadow-2xl transition-all"
            style={{ borderRadius: theme.borderRadius }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-semibold"
                style={{ color: theme.primaryColor }}
              >
                Collection Preview
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>

            <div>
              <h3
                className="text-2xl text-white font-medium"
                style={{ fontFamily: theme.headingFont === "Cinzel" ? "Cinzel, serif" : theme.headingFont === "Cormorant Garamond" ? "Cormorant Garamond, serif" : "Playfair Display, serif" }}
              >
                Lapis Lazuli Stratum IV
              </h3>
              <p
                className="text-xs text-zinc-400 mt-1.5 leading-relaxed"
                style={{ fontFamily: theme.bodyFont === "Inter" ? "Inter, sans-serif" : "Plus Jakarta Sans, sans-serif" }}
              >
                The selected typography pairings and corner radiuses will apply dynamically across all public storefront catalogue cards and headers.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0d0e12] transition-colors shadow-lg"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.borderRadius,
                }}
              >
                Inquire Canvas
              </button>
              <button
                type="button"
                className="px-4 py-2.5 text-xs text-zinc-300 border border-[#262833] hover:text-white transition-colors"
                style={{ borderRadius: theme.borderRadius }}
              >
                WebAR Preview
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
