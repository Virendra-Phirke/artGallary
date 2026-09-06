"use client";

import React, { useState } from "react";
import { MockHomepageSection } from "@/db/mockData";
import { Eye, Check, MoveUp, MoveDown, Save, Sparkles } from "lucide-react";

interface HomepageBuilderClientProps {
  initialSections: MockHomepageSection[];
}

export function HomepageBuilderClient({
  initialSections,
}: HomepageBuilderClientProps) {
  const [sections, setSections] = useState<MockHomepageSection[]>(initialSections);
  const [saved, setSaved] = useState(false);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    if (!temp || !updated[targetIndex]) return;

    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;

    // Update display orders
    updated.forEach((s, idx) => {
      s.displayOrder = idx + 1;
    });

    setSections(updated);
  };

  const updateSectionText = (id: string, field: "title" | "subtitle", val: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async () => {
    try {
      await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save homepage sections:", err);
      alert("Failed to save homepage sections");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Modular Editorial Structure
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Homepage Builder</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Toggle visibility, reorder controlled gallery sections, and customize curatorial titles.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Saved to Memory" : "Save Sections"}</span>
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-6 rounded-2xl border transition-all ${
              sec.isEnabled
                ? "bg-[#14151a] border-[#262833]"
                : "bg-[#14151a]/40 border-[#1f212b] opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a1c23] border border-[#262833] flex items-center justify-center text-xs font-mono text-[#d1a86e]">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-white">{sec.title}</h3>
                  <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
                    Section Key: {sec.sectionKey}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1 border border-[#262833] rounded-lg p-1 bg-[#1a1c23]">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === sections.length - 1}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                    sec.isEnabled
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {sec.isEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Editable Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1f212b] mt-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => updateSectionText(sec.id, "title", e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                  Section Subheading
                </label>
                <input
                  type="text"
                  value={sec.subtitle}
                  onChange={(e) => updateSectionText(sec.id, "subtitle", e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
