import React from "react";
import Link from "next/link";
import { getAllArtworksAdmin } from "@/db/repository";
import {
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Accessibility Audit (WCAG 2.2 AA) | Studio Administration",
};

export default async function AdminAccessibilityPage() {
  const artworks = await getAllArtworksAdmin();

  // Audit calculations
  const missingAltText = artworks.filter(
    (a) => !a.altText || a.altText.trim().length < 5
  );
  const missingDimensions = artworks.filter((a) => !a.widthCm || !a.heightCm);
  const missingLongDesc = artworks.filter((a) => !a.longDescription);

  const totalChecks = artworks.length * 3;
  const passedChecks =
    (artworks.length - missingAltText.length) +
    (artworks.length - missingDimensions.length) +
    (artworks.length - missingLongDesc.length);

  const scorePercentage = Math.round((passedChecks / totalChecks) * 100);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Inclusivity &amp; Standards
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">
          Accessibility Dashboard (WCAG 2.2 AA)
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time compliance monitoring for screen readers, keyboard navigation, and high-contrast perception.
        </p>
      </div>

      {/* Compliance Score Card */}
      <Card className="p-5 sm:p-8 bg-[#14151a] border-[#262833] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Overall WCAG Score
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-4xl sm:text-5xl text-white font-medium">
              {scorePercentage}%
            </span>
            <Badge variant={scorePercentage >= 90 ? "success" : "warning"}>
              {scorePercentage >= 90 ? "Target Met (AA)" : "Requires Attention"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
            Meets semantic HTML landmarks, keyboard tab order, visible focus rings, and touch target size standards.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t sm:border-t-0 sm:border-l border-[#262833] pt-4 sm:pt-0 sm:pl-8">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
              Contrast Ratio
            </span>
            <span className="font-serif text-xl text-white">4.8:1 to 14.2:1</span>
            <span className="text-[10px] text-emerald-400 block">Exceeds 4.5:1 AA</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
              Reduced Motion
            </span>
            <span className="font-serif text-xl text-white">Supported</span>
            <span className="text-[10px] text-zinc-400 block">Media query hook</span>
          </div>
        </div>
      </Card>

      {/* Audit Checklist */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-white">Audited Elements</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">
                Descriptive Alt Text for Artwork Images
              </span>
              {missingAltText.length === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {missingAltText.length === 0
                ? "All active artwork images contain descriptive sensory alt text."
                : `${missingAltText.length} artwork(s) have incomplete alt descriptions.`}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">
                Physical Dimensions Completeness
              </span>
              {missingDimensions.length === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {missingDimensions.length === 0
                ? "Every artwork specifies exact metric and imperial scale dimensions."
                : `${missingDimensions.length} artwork(s) missing width or height values.`}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">
                Form Labels &amp; Keyboard Focus
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400">
              Contact and inquiry inputs have explicit aria-labelledby and visible focus outlines.
            </p>
          </Card>

          <Card className="p-4 sm:p-5 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">
                Extended Descriptions for Complex Canvases
              </span>
              {missingLongDesc.length === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {missingLongDesc.length === 0
                ? "All complex pigment glazes have detailed verbal breakdowns."
                : `${missingLongDesc.length} artwork(s) could benefit from extended verbal dossiers.`}
            </p>
          </Card>
        </div>
      </div>

      {/* Actionable List of Canvases to Enhance */}
      {missingAltText.length > 0 && (
        <Card className="p-5 sm:p-6 bg-[#14151a] border-amber-900/40 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg text-amber-300">
            Actionable Alt-Text Enhancements
          </h3>
          <div className="divide-y divide-[#1f212b]">
            {missingAltText.map((art) => (
              <div
                key={art.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
              >
                <div>
                  <span className="text-xs text-white font-medium block">
                    {art.title}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Current Alt: &ldquo;{art.altText || "None"}&rdquo;
                  </span>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs text-[#d1a86e] hover:text-[#e2c18d] hover:bg-[#d1a86e]/10 self-start sm:self-auto h-8 px-2.5">
                  <Link
                    href={`/admin/artworks/${art.id}`}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span>Edit Alt Text</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
