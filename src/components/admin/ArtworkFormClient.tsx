"use client";

import React, { useState, useEffect } from "react";
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
  FolderOpen,
  Loader2,
  Image as ImageIcon,
  Mail,
} from "lucide-react";
import { MockArtwork, MockCollection } from "@/db/mockData";
import { slugify, formatDimensions } from "@/lib/utils";
import { UnsplashPickerModal } from "./UnsplashPickerModal";
import { MediaLibraryModal, MediaItem } from "./MediaLibraryModal";
import { ProgressBar } from "@/components/ui/progress-bar";
import dynamic from "next/dynamic";

const ArStudioViewer = dynamic(
  () => import("@/components/ar/ArStudioViewer").then((mod) => mod.ArStudioViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] rounded-2xl bg-[#121319] shadow-xl shadow-black/40 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#d1a86e]" />
        <span className="text-xs font-mono tracking-wider uppercase">Loading 3D AR Studio Engine...</span>
      </div>
    ),
  }
);

interface ArtworkFormClientProps {
  initialArtwork?: MockArtwork;
  isNew?: boolean;
  collections?: MockCollection[];
}

export function ArtworkFormClient({
  initialArtwork,
  isNew = false,
  collections = [],
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
  const [collectionSlug, setCollectionSlug] = useState(
    initialArtwork?.collectionSlug || "none"
  );

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
  const [minScale, setMinScale] = useState<number>(
    initialArtwork?.arConfig?.minScale ?? 0.5
  );
  const [maxScale, setMaxScale] = useState<number>(
    initialArtwork?.arConfig?.maxScale ?? 2.0
  );
  const [placementMode, setPlacementMode] = useState<"wall" | "floor">(
    initialArtwork?.arConfig?.placementMode || "wall"
  );
  const [isTestArOpen, setIsTestArOpen] = useState(false);

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "complete" | "error"
  >("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Marketing & Collector Broadcast
  const [notifySubscribers, setNotifySubscribers] = useState(
    !(initialArtwork as any)?.notifiedSubscribersAt
  );
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [previewFeedback, setPreviewFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/marketing/broadcast")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setSubscriberCount(data.stats.activeCount);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendCuratorPreview = async () => {
    if (!initialArtwork?.id) return;
    setIsSendingPreview(true);
    setPreviewFeedback(null);
    try {
      const res = await fetch("/api/admin/marketing/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId: initialArtwork.id, mode: "test" }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewFeedback("✓ Preview dispatched to curator inbox!");
      } else {
        setPreviewFeedback(data.error || "Preview send failed");
      }
    } catch {
      setPreviewFeedback("Failed to send preview email");
    } finally {
      setIsSendingPreview(false);
    }
  };

  // Memory cleanup for local object blob URLs
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  // Auto-generate slug when title changes in new mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isNew) {
      setSlug(slugify(val));
    }
  };

  // Image Upload via XMLHttpRequest for real-time progress reporting
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous blob if any
    if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    // 1. Instant local preview
    const blobUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(blobUrl);
    setUploadStatus("uploading");
    setUploadProgress(0);
    setIsUploading(true);
    setError(null);

    // 2. Setup FormData and XHR
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
        if (percentComplete >= 100) {
          setUploadStatus("processing");
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const resolvedUrl =
            data.media?.fileUrl ||
            data.media?.variants?.optimized ||
            data.media?.variants?.original ||
            data.media?.url;
          if (resolvedUrl) {
            setCoverImageUrl(resolvedUrl);
            setUploadStatus("complete");
            if (!altText) {
              setAltText(`Original artwork: ${title || file.name.replace(/\.[^/.]+$/, "")}`);
            }
          } else {
            throw new Error("No media file URL returned from upload server");
          }
        } catch (err: any) {
          setError(err.message || "Failed to parse upload response");
          setUploadStatus("error");
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || "Upload failed");
        } catch {
          setError(`Upload failed with status ${xhr.status}`);
        }
        setUploadStatus("error");
      }
      setIsUploading(false);
    };

    xhr.onerror = () => {
      setError("Network error occurred during image upload");
      setUploadStatus("error");
      setIsUploading(false);
    };

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  };

  // Select existing asset from gallery media library
  const handleMediaSelect = (item: MediaItem) => {
    if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(null);
    setCoverImageUrl(item.fileUrl);
    setUploadStatus("complete");
    if (!altText) {
      setAltText(`Master painting: ${title || item.fileName.replace(/\.[^/.]+$/, "")}`);
    }
  };

  // Select art from Unsplash
  const handleUnsplashSelect = (img: any) => {
    if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(null);
    setCoverImageUrl(img.imageUrl);
    setUploadStatus("complete");
    setAltText(img.altText);
    if (!title || title === "Untitled" || isNew) {
      setTitle(img.title);
      if (isNew) {
        setSlug(slugify(img.title));
      }
    }
  };

  // Publication Readiness Evaluation
  const checks = {
    title: Boolean(title.trim().length >= 2),
    slug: Boolean(slug.trim().length >= 2),
    description: Boolean(description.trim().length >= 10),
    coverImage: Boolean(coverImageUrl.trim().length > 0 || localPreviewUrl),
    altText: Boolean(altText.trim().length >= 5),
    dimensions: Boolean(widthCm > 0 && heightCm > 0),
    arConfig: Boolean(isArEnabled ? widthCm > 0 && heightCm > 0 : true),
  };

  const isReadyToPublish =
    Object.values(checks).every(Boolean) &&
    uploadStatus !== "uploading" &&
    uploadStatus !== "processing" &&
    Boolean(coverImageUrl.trim().length > 0);

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
        collectionSlug: collectionSlug === "none" ? "" : collectionSlug,
        notifySubscribers: status === "published" && notifySubscribers,
        arConfig: {
          isArEnabled,
          defaultWidthCm: widthCm,
          defaultHeightCm: heightCm,
          defaultScale: 1.0,
          defaultRotation: 0.0,
          minScale,
          maxScale,
          placementMode,
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
    <form onSubmit={handleSubmit} className="space-y-10 w-full">
      {/* Top Breadcrumb & Action Header - Clean floating */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div>
          <Link
            href="/admin/artworks"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-[#1a1b26] px-3 py-1.5 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Artworks</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsTestArOpen(true)}
            className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#222432] text-[#d1a86e] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            title="Launch live 1:1 AR and 3D room calibration test"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test AR</span>
          </button>

          {!isNew && slug && (
            <Link
              href={`/artwork/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={
              isSaving ||
              isUploading ||
              uploadStatus === "uploading" ||
              uploadStatus === "processing"
            }
            className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#d1a86e]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving
                ? "Saving..."
                : uploadStatus === "uploading"
                ? "Uploading..."
                : uploadStatus === "processing"
                ? "Processing..."
                : "Save"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-[#2d1616] rounded-2xl text-xs text-red-300 shadow-md">
          {error}
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Metadata Fields (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-5">
            <h2 className="font-serif text-xl text-white">General Information</h2>

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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Year of Creation
                </label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => {
                    const newStatus = e.target.value;
                    setStatus(newStatus);
                    if (newStatus === "published" && !(initialArtwork as any)?.notifiedSubscribersAt) {
                      setNotifySubscribers(true);
                    }
                  }}
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e] cursor-pointer"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Catalog Visible)</option>
                  <option value="reserved">Reserved (Collector Hold)</option>
                  <option value="sold">Sold (Permanent Archive)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {status === "published" && (
                <div className="sm:col-span-2 bg-[#161722] rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#251e16] flex items-center justify-center text-[#d1a86e] shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="notify-subscribers"
                          className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 cursor-pointer"
                        >
                          <span>Email Announcement Broadcast</span>
                          {subscriberCount !== null && (
                            <span className="text-[10px] lowercase bg-[#251e16] text-[#d1a86e] px-2.5 py-0.5 rounded-full font-mono">
                              {subscriberCount} interested collector{subscriberCount === 1 ? "" : "s"}
                            </span>
                          )}
                        </label>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Dispatches an editorial release notice with 1:1 spatial AR launch link and private inquiry button.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      id="notify-subscribers"
                      checked={notifySubscribers}
                      onChange={(e) => setNotifySubscribers(e.target.checked)}
                      className="w-4 h-4 mt-1 accent-[#d1a86e] cursor-pointer rounded"
                    />
                  </div>

                  {(initialArtwork as any)?.notifiedSubscribersAt && (
                    <div className="text-[11px] text-zinc-400 bg-[#121319] p-3 rounded-xl flex items-center justify-between gap-2 shadow-inner">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Collectors notified on {new Date((initialArtwork as any).notifiedSubscribersAt).toLocaleDateString()}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">Checking box will send an update</span>
                    </div>
                  )}

                  {!isNew && initialArtwork?.id && (
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleSendCuratorPreview}
                        disabled={isSendingPreview}
                        className="text-[11px] text-[#d1a86e] hover:text-[#e2c18d] hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{isSendingPreview ? "Sending preview..." : "Send Test Preview to Curator Email"}</span>
                      </button>

                      {previewFeedback && (
                        <span className="text-[11px] text-amber-300">{previewFeedback}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Thematic Collection
              </label>
              <select
                value={collectionSlug}
                onChange={(e) => setCollectionSlug(e.target.value)}
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e] cursor-pointer"
              >
                <option value="none">None (Independent Canvas)</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.slug}>
                    {col.title}
                  </option>
                ))}
              </select>
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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
              />
            </div>
          </div>

          {/* Dimensions & Pricing - Solid Tier 1 Block */}
          <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-5">
            <h2 className="font-serif text-xl text-white">Dimensions &amp; Valuation</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
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
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
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
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono">
              Formatted: {formatDimensions(widthCm, heightCm, depthCm)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e] cursor-pointer"
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
          {/* Publication Readiness Audit Plaque - Solid Tier 1 Block */}
          <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold">
                Publication Audit
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                  isReadyToPublish
                    ? "bg-[#14231b] text-emerald-300"
                    : "bg-[#2a1d14] text-amber-300"
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
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#1a1b26]">
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

          {/* Media Upload & Alt Text - Solid Tier 1 Block */}
          <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-white">Artwork Imagery</h2>
              {coverImageUrl && !localPreviewUrl && (
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-[#14231b] px-2.5 py-1 rounded-full">
                  Cloud Asset Linked
                </span>
              )}
            </div>

            {/* Display Image Box */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 group shadow-md">
              {localPreviewUrl || coverImageUrl ? (
                <>
                  <Image
                    src={localPreviewUrl || coverImageUrl}
                    alt={altText || "Cover Image"}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    unoptimized={Boolean(localPreviewUrl)}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Overlay when uploading or processing */}
                  {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                      <div className="w-full max-w-xs bg-[#121319] p-5 rounded-2xl shadow-2xl space-y-2">
                        <ProgressBar
                          label={
                            uploadStatus === "processing"
                              ? "Optimizing variants with Sharp..."
                              : "Uploading high-res image..."
                          }
                          value={uploadProgress}
                          isIndeterminate={uploadStatus === "processing"}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs p-6 text-center">
                  <ImageIcon className="w-8 h-8 stroke-1 text-zinc-600" />
                  <p>No image selected yet.</p>
                  <p className="text-[11px] text-zinc-600">
                    Upload a file from your device, pick from Media Library, or use temporary art.
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar (Visible under preview while actively uploading/processing) */}
            {(uploadStatus === "uploading" || uploadStatus === "processing") && (
              <div className="p-4 bg-[#1a1b26] rounded-2xl">
                <ProgressBar
                  label={
                    uploadStatus === "processing"
                      ? "Generating WebP, thumbnail, and AR texture..."
                      : `Uploading file (${uploadProgress}%)`
                  }
                  value={uploadProgress}
                  isIndeterminate={uploadStatus === "processing"}
                />
              </div>
            )}

            {uploadStatus === "complete" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#14231b] text-emerald-400 text-xs shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Image uploaded &amp; processed successfully. Ready to save.</span>
              </div>
            )}

            {/* Upload & Asset Picker Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-zinc-400">
                  Select Artwork File
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer shadow-sm"
                  >
                    <FolderOpen className="w-3 h-3 text-[#d1a86e]" />
                    <span>Media Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnsplashOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#251e16] text-[#d1a86e] hover:bg-[#342419] text-[11px] font-medium transition-colors cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Unsplash Art</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1a1b26] file:text-white hover:file:bg-[#222432] file:cursor-pointer cursor-pointer disabled:opacity-50"
                />
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
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
              />
            </div>
          </div>

          {/* WebAR Calibration Studio Settings - Solid Tier 1 Block */}
          <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#251e16] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              </div>
              <h2 className="font-serif text-xl text-white">Spatial AR Studio</h2>
            </div>

            <div className="flex items-center justify-between py-1 px-3 rounded-xl bg-[#1a1b26]">
              <span className="text-xs text-zinc-300">Enable WebAR Wall Preview</span>
              <input
                type="checkbox"
                checked={isArEnabled}
                onChange={(e) => setIsArEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#d1a86e] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 px-3 rounded-xl bg-[#1a1b26]">
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
                  className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e] cursor-pointer"
                >
                  <option value="minimal_black">Minimal Black (Sleek Modern)</option>
                  <option value="classic_gold">Antique Florentine Gold</option>
                  <option value="natural_wood">Natural Waxed Oak</option>
                  <option value="white_gallery">Gallery Chalk White</option>
                  <option value="none">Frameless Museum Canvas</option>
                </select>
              </div>
            )}

            {/* Placement Mode */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                Spatial Placement Mode
              </label>
              <select
                value={placementMode}
                onChange={(e: any) => setPlacementMode(e.target.value)}
                className="w-full bg-[#1a1b26] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e] cursor-pointer"
              >
                <option value="wall">Wall Placement (Primary)</option>
                <option value="floor">Floor / Easel Placement</option>
              </select>
            </div>

            {/* Scale Constraint Bounds */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  Min Scale Clamp
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={minScale}
                  onChange={(e) => setMinScale(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-[#1a1b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  Max Scale Clamp
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={maxScale}
                  onChange={(e) => setMaxScale(parseFloat(e.target.value) || 2.0)}
                  className="w-full bg-[#1a1b26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d1a86e]"
                />
              </div>
            </div>

            {/* Quick Test AR Button inside card */}
            <button
              type="button"
              onClick={() => setIsTestArOpen(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1a1b26] hover:bg-[#222432] text-zinc-200 hover:text-white py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Launch Live AR Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Test AR Modal */}
      {isTestArOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="fixed top-4 right-4 z-[110] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTestArOpen(false)}
              className="bg-black/90 hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-2xl transition-all cursor-pointer"
            >
              Close Studio Preview
            </button>
          </div>

          <div className="flex-1 w-full h-full">
            <ArStudioViewer
              artwork={{
                id: initialArtwork?.id || "test-preview",
                slug: slug || "test-preview",
                title: title || "Untitled Preview",
                year: year || new Date().getFullYear(),
                medium: medium || "Oil on Belgian linen",
                widthCm,
                heightCm,
                depthCm,
                price,
                currency,
                coverImageUrl:
                  localPreviewUrl ||
                  coverImageUrl ||
                  "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
                arConfig: {
                  isArEnabled,
                  frameEnabled,
                  frameType: frameType as any,
                  frameDepthCm: 3.5,
                  frameWidthCm: 3.0,
                  matColor,
                  defaultScale: 1.0,
                  defaultRotation: 0.0,
                  minScale,
                  maxScale,
                  placementMode,
                },
              }}
            />
          </div>
        </div>
      )}

      <UnsplashPickerModal
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={handleUnsplashSelect}
      />

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
      />
    </form>
  );
}
