"use client";

import React, { useState } from "react";
import { Paintbrush, Check, Sparkles } from "lucide-react";

export function AppearanceClient() {
  const [primaryColor, setPrimaryColor] = useState("#d1a86e");
  const [headingFont, setHeadingFont] = useState("Playfair Display");
  const [bodyFont, setBodyFont] = useState("Plus Jakarta Sans");
  const [borderRadius, setBorderRadius] = useState("0.375rem");
  const [animationLevel, setAnimationLevel] = useState<"minimal" | "standard" | "cinematic">("cinematic");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Design Tokens &amp; Styling
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Appearance &amp; Theme</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure gallery typography tokens, luxury accent hues, and motion animation intensity.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Paintbrush className="w-4 h-4" />}
          <span>{saved ? "Tokens Applied" : "Save Appearance"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Accent Color Palette */}
        <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
          <h2 className="font-serif text-lg text-white">Curated Accent Hues</h2>
          <p className="text-xs text-zinc-400">
            Select a verified museum accent token. Arbitrary CSS/JS injection is strictly prohibited for security.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { id: "#d1a86e", name: "Champagne Gold", hex: "#d1a86e" },
              { id: "#c59b63", name: "Florentine Amber", hex: "#c59b63" },
              { id: "#e2c18d", name: "Luminous Ochre", hex: "#e2c18d" },
              { id: "#9fa3b0", name: "Platinum Slate", hex: "#9fa3b0" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPrimaryColor(c.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  primaryColor === c.id
                    ? "bg-[#1a1c23] border-[#d1a86e] shadow-lg"
                    : "bg-[#14151a] border-[#262833] hover:border-zinc-600"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs text-white font-medium">{c.name}</span>
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
                value={headingFont}
                onChange={(e) => setHeadingFont(e.target.value)}
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
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value)}
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary Clean)</option>
                <option value="Inter">Inter (High-Legibility Neutral)</option>
              </select>
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
                onClick={() => setAnimationLevel(lvl.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  animationLevel === lvl.id
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
    </div>
  );
}
