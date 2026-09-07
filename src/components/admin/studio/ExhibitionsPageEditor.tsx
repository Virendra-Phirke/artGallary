"use client";

import React from "react";
import Link from "next/link";
import type { SiteSettingsData } from "@/db/mockData";
import {
  Calendar,
  ExternalLink,
  Plus,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExhibitionsPageEditorProps {
  settings: SiteSettingsData;
  onUpdateConfig: (field: string, value: any) => void;
  exhibitionsCount: number;
}

export function ExhibitionsPageEditor({
  settings,
  onUpdateConfig,
  exhibitionsCount,
}: ExhibitionsPageEditorProps) {
  const cfg = settings.exhibitionsPageConfig || {
    title: "Exhibitions & Retrospectives",
    subtitle: "Solo Shows & Museum Installations",
    description: "Chronology of curated exhibitions, solo institutional showcases, and private gallery presentations.",
    eyebrow: "Institutional & Gallery Showcases",
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
              Exhibitions Architecture
            </span>
            <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/50 text-[10px]">
              {exhibitionsCount} Exhibitions Listed
            </Badge>
          </div>
          <h3 className="font-serif text-lg text-white font-medium mt-0.5">
            Exhibitions Page Parameters
          </h3>
          <p className="text-xs text-zinc-400">
            Control the editorial framing for public exhibitions at <code className="text-[#d1a86e] font-mono">/exhibitions</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="outline" className="border-[#262833] text-xs text-zinc-300 hover:text-white">
            <Link href="/admin/exhibitions">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#d1a86e]" />
              <span>Exhibitions Manager</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Headline & Statement */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Curatorial Retrospective Statement
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Eyebrow / Sub-headline
            </label>
            <Input
              value={cfg.eyebrow || ""}
              onChange={(e) => onUpdateConfig("eyebrow", e.target.value)}
              placeholder="e.g. Solo Shows & Institutional Installations"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Page Title
            </label>
            <Input
              value={cfg.title || ""}
              onChange={(e) => onUpdateConfig("title", e.target.value)}
              placeholder="e.g. Exhibitions & Retrospectives"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Curatorial Description
            </label>
            <Textarea
              rows={3}
              value={cfg.description || ""}
              onChange={(e) => onUpdateConfig("description", e.target.value)}
              placeholder="Provide historical context for current, upcoming, and archive exhibitions..."
              className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Timeline Presentation Layout */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
          Exhibitions Timeline Presentation
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "cards",
              title: "Museum Cards",
              desc: "Prominent featured cover images with dates and venue metadata.",
            },
            {
              id: "timeline",
              title: "Minimal Timeline",
              desc: "Chronological vertical list ordered by year and museum location.",
            },
            {
              id: "spotlight",
              title: "Spotlight Feature",
              desc: "Current exhibition highlighted at top, past retrospectives below.",
            },
          ].map((item, idx) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-left transition-all ${
                idx === 0
                  ? "bg-[#d1a86e]/10 border-[#d1a86e] text-white shadow-sm"
                  : "bg-[#181920] border-[#262833] text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">{item.title}</span>
                {idx === 0 && <Check className="w-3.5 h-3.5 text-[#d1a86e]" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
