"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { slugify, formatDimensions } from "@/lib/utils";
import { UnsplashPickerModal } from "./UnsplashPickerModal";

interface ArtworkFormClientProps {
  initialArtwork?: MockArtwork;
  isNew?: boolean;
}

export function ArtworkFormClient({
  initialArtwork,
  isNew = false,
}: ArtworkFormClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialArtwork?.title || "");
  const [slug, setSlug] = useState(initialArtwork?.slug || "");
  const [description, setDescription] = useState(initialArtwork?.description || "");
  const [longDescription, setLongDescription] = useState(initialArtwork?.longDescription || "");
  const [year, setYear] = useState<number>(initialArtwork?.year || new Date().getFullYear());
  const [medium, setMedium] = useState(initialArtwork?.medium || "Oil on Belgian linen");
  const [widthCm, setWidthCm] = useState<number>(initialArtwork?.widthCm || 120);
  const [heightCm, setHeightCm] = useState<number>(initialArtwork?.heightCm || 90);
  const [depthCm, setDepthCm] = useState<number>(initialArtwork?.depthCm || 3.5);
  const [price, setPrice] = useState<number | undefined>(initialArtwork?.price || 15000);
  const [currency, setCurrency] = useState(initialArtwork?.currency || "USD");
  const [status, setStatus] = useState<"draft" | "published" | "reserved" | "sold" | "archived">(
    initialArtwork?.status || "draft"
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialArtwork?.coverImageUrl || ""
  );
  const [altText, setAltText] = useState(initialArtwork?.altText || "");
  const [isFeatured, setIsFeatured] = useState(initialArtwork?.isFeatured || false);

  // AR Settings
  const [isArEnabled, setIsArEnabled] = useState(
    initialArtwork?.arConfig?.isArEnabled ?? true
  );
  const [frameEnabled, setFrameEnabled] = useState(
    initialArtwork?.arConfig?.frameEnabled ?? true
  );
  const [frameType, setFrameType] = useState(
    initialArtwork?.arConfig?.frameType || "minimal_black"
  );
  const [matColor, setMatColor] = useState(
    initialArtwork?.arConfig?.matColor || "#FFFFFF"
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when title changes in new mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isNew) {
      setSlug(slugify(val));
    }
  };

  // Image Upload via /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.media?.fileUrl) {
        setCoverImageUrl(data.media.fileUrl);
        if (!altText) {
          setAltText(`Original painting: ${title || file.name}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setIsUploading(false);
    }
  };

  // Publication Readiness Evaluation
  const checks = {
    title: Boolean(title.trim().length >= 2),
    slug: Boolean(slug.trim().length >= 2),
    description: Boolean(description.trim().length >= 10),
    coverImage: Boolean(coverImageUrl.trim().length > 0),
    altText: Boolean(altText.trim().length >= 5),
    dimensions: Boolean(widthCm > 0 && heightCm > 0),
    arConfig: Boolean(isArEnabled ? widthCm > 0 && heightCm > 0 : true),
  };

  const isReadyToPublish = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: Partial<MockArtwork> = {
        id: initialArtwork?.id,
        title,
        slug,
        description,
        longDescription,
        year,
        medium,
        widthCm,
        heightCm,
        depthCm,
        price,
        currency,
        status,
        coverImageUrl,
        altText,
        isFeatured,
        arConfig: {
          isArEnabled,
          defaultWidthCm: widthCm,
          defaultHeightCm: heightCm,
          defaultScale: 1.0,
          defaultRotation: 0.0,
          frameEnabled,
          frameType: frameType as any,
          frameDepthCm: 3.5,
          frameWidthCm: 3.0,
          matColor,
          arReadinessStatus: isReadyToPublish ? "ready" : "needs_attention",
          arInstructions: "Point camera at eye-level on a flat wall surface.",
        },
      };

      const res = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      router.push("/admin/artworks");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-6xl">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/artworks"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Artworks</span>
          </Link>
          <h1 className="font-serif text-3xl text-white">
            {isNew ? "Create New Artwork" : `Edit: ${initialArtwork?.title}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && slug && (
            <Link
              href={`/artwork/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 bg-[#18191e] hover:bg-[#22232a] border border-[#262833] text-zinc-300 hover:text-white px-4 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Preview</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-[#d1a86e]/10 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Canvas"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Metadata Fields (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">General Information</h2>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Artwork Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Solitude in Ultramarine"
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. solitude-in-ultramarine"
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Year of Creation
                </label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Catalog Visible)</option>
                  <option value="reserved">Reserved (Collector Hold)</option>
                  <option value="sold">Sold (Permanent Archive)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Medium &amp; Pigment Specifications
              </label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="e.g. Oil, crushed lapis lazuli and gold leaf on Belgian linen"
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Curatorial Excerpt (Catalog Summary)
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief evocative description for cards and search..."
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Extended Provenance &amp; Studio Dossier
              </label>
              <textarea
                rows={5}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Detailed curatorial essay, technique notes, and history..."
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>
          </div>

          {/* Dimensions & Pricing */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Dimensions &amp; Valuation</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Width (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Depth (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={depthCm}
                  onChange={(e) => setDepthCm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-500">
              Formatted: {formatDimensions(widthCm, heightCm, depthCm)}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Price (Optional)
                </label>
                <input
                  type="number"
                  value={price || ""}
                  onChange={(e) =>
                    setPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g. 18500"
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media, AR Configuration & Publication Checklist (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Publication Readiness Audit Plaque */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f212b] pb-3">
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold">
                Publication Audit
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded font-bold ${
                  isReadyToPublish
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}
              >
                {isReadyToPublish ? "Ready to Publish" : "Needs Attention"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: "Valid Title & Slug", ok: checks.title && checks.slug },
                { label: "Description excerpt", ok: checks.description },
                { label: "Cover image provided", ok: checks.coverImage },
                { label: "Accessible Alt Text", ok: checks.altText },
                { label: "Physical dimensions (W × H)", ok: checks.dimensions },
                { label: "AR Calibration verified", ok: checks.arConfig },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">{item.label}</span>
                  {item.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media Upload & Alt Text */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <h2 className="font-serif text-lg text-white">Artwork Imagery</h2>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={altText || "Cover Image"}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                  No image selected
                </div>
              )}
            </div>

            {/* Upload or Unsplash Selection Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-zinc-400">
                  Upload Image
                </label>
                <button
                  type="button"
                  onClick={() => setIsUnsplashOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#d1a86e]/30 bg-[#d1a86e]/10 text-[#d1a86e] hover:bg-[#d1a86e]/20 text-[11px] font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Unsplash Temp Art</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#262833] file:text-white hover:file:bg-[#323544] file:cursor-pointer cursor-pointer"
                />
                {isUploading && (
                  <span className="text-[11px] text-[#d1a86e] mt-1 block">
                    Processing high-res image variants with Sharp...
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Accessibility Alt Text (Required for WCAG 2.2 AA)
              </label>
              <input
                type="text"
                required
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Visual description for visually impaired visitors..."
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>
          </div>

          {/* WebAR Calibration Studio Settings */}
          <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d1a86e]" />
              <h2 className="font-serif text-lg text-white">Spatial AR Studio</h2>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-300">Enable WebAR Wall Preview</span>
              <input
                type="checkbox"
                checked={isArEnabled}
                onChange={(e) => setIsArEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#d1a86e] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-300">Default Frame Enabled</span>
              <input
                type="checkbox"
                checked={frameEnabled}
                onChange={(e) => setFrameEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#d1a86e] cursor-pointer"
              />
            </div>

            {frameEnabled && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Default Virtual Frame Style
                </label>
                <select
                  value={frameType}
                  onChange={(e: any) => setFrameType(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                >
                  <option value="minimal_black">Minimal Black (Sleek Modern)</option>
                  <option value="classic_gold">Antique Florentine Gold</option>
                  <option value="natural_wood">Natural Waxed Oak</option>
                  <option value="white_gallery">Gallery Chalk White</option>
                  <option value="none">Frameless Museum Canvas</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <UnsplashPickerModal
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={(img) => {
          setCoverImageUrl(img.imageUrl);
          setAltText(img.altText);
          if (!title || title === "Untitled" || isNew) {
            setTitle(img.title);
            if (isNew) {
              setSlug(slugify(img.title));
            }
          }
        }}
      />
    </form>
  );
}
