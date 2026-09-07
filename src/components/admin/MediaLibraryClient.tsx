"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  Copy,
  Check,
  Filter,
  Sparkles,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { UnsplashPickerModal } from "./UnsplashPickerModal";
import type { UnsplashArtImage } from "@/lib/unsplash";

interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  dimensions: string;
  byteSize: string;
  uploadedAt: string;
  provider: "imagekit" | "cloudflare";
  migrationStatus: string;
}

interface MediaHealth {
  status: string;
  activeProvider: "imagekit" | "cloudflare";
  availableProviders: string[];
  providers: {
    imagekit: { enabled: boolean; configured: boolean; urlEndpoint: string };
    cloudflare: { enabled: boolean; configured: boolean; bucketName: string };
  };
}

interface DeleteResult {
  id: string;
  fileName: string;
  provider: string;
  sourceDeleted: boolean;
  sourceError: string | null;
}

export function MediaLibraryClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [health, setHealth] = useState<MediaHealth | null>(null);
  const [filterProvider, setFilterProvider] = useState<"all" | "imagekit" | "cloudflare">("all");
  const [targetUploadProvider, setTargetUploadProvider] = useState<"active" | "imagekit" | "cloudflare">("active");
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setItems(data.media);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();

    fetch("/api/health/media")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => {});
  }, [fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (targetUploadProvider !== "active") {
      formData.append("provider", targetUploadProvider);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.media) {
        await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileUrl: data.media.variants?.optimized || data.media.fileUrl,
            fileKey: data.media.objectKey || `artworks/upload/${file.name}`,
            mimeType: file.type || "image/jpeg",
            byteSize: file.size,
            width: data.media.width || 2400,
            height: data.media.height || 1800,
            provider: data.media.provider || (health?.activeProvider || "cloudflare"),
          }),
        });
        await fetchMedia();
      } else {
        alert(data.error || "Failed to upload file");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUnsplashSelect = async (img: UnsplashArtImage) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `${img.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.webp`,
          fileUrl: img.imageUrl,
          width: img.width,
          height: img.height,
          provider: health?.activeProvider || "cloudflare",
        }),
      });
      const data = await res.json();
      if (data.success && data.media) {
        setItems((prev) => [data.media, ...prev]);
      }
    } catch (e: any) {
      console.error("Failed to import art from Unsplash:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Permanent Delete (Single) ───
  const executePermanentDelete = async (item: MediaItem) => {
    setIsDeleting(true);
    setDeleteResult(null);
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setDeleteResult({
          id: item.id,
          fileName: item.fileName,
          provider: data.provider || item.provider,
          sourceDeleted: data.sourceDeleted ?? false,
          sourceError: data.sourceError ?? null,
        });
        // Auto-dismiss result after 5s
        setTimeout(() => setDeleteResult(null), 5000);
      } else {
        setDeleteResult({
          id: item.id,
          fileName: item.fileName,
          provider: item.provider,
          sourceDeleted: false,
          sourceError: data.error || "Delete failed",
        });
      }
    } catch (e: any) {
      setDeleteResult({
        id: item.id,
        fileName: item.fileName,
        provider: item.provider,
        sourceDeleted: false,
        sourceError: e.message,
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Batch Delete ───
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const visibleIds = filteredItems.map((i) => i.id);
    setSelectedIds(new Set(visibleIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const executeBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBatchDeleting(true);

    const idsToDelete = Array.from(selectedIds);
    let deletedCount = 0;

    for (const id of idsToDelete) {
      try {
        const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          deletedCount++;
          setItems((prev) => prev.filter((i) => i.id !== id));
        }
      } catch {
        // Continue with remaining items
      }
    }

    setSelectedIds(new Set());
    setIsBatchDeleting(false);
    setBatchDeleteConfirm(false);
    setIsBatchMode(false);

    setDeleteResult({
      id: "batch",
      fileName: `${deletedCount} of ${idsToDelete.length} assets`,
      provider: "multiple",
      sourceDeleted: deletedCount > 0,
      sourceError: deletedCount < idsToDelete.length
        ? `${idsToDelete.length - deletedCount} failed`
        : null,
    });
    setTimeout(() => setDeleteResult(null), 5000);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const filteredItems = filterProvider === "all"
    ? items
    : items.filter((i) => i.provider === filterProvider);

  const activeProviderName = health?.activeProvider || "cloudflare";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Storage Status */}
      <div className="border-b border-[#1c1d25] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Media Infrastructure Layer
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real Neon DB Synced
            </span>
          </div>
          <h1 className="font-serif text-3xl text-white">Media &amp; CDN Assets</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authoritative media records from Neon PostgreSQL. Permanent deletion removes files from <span className="text-cyan-400 font-medium">ImageKit</span> and <span className="text-amber-400 font-medium">Cloudflare R2</span> source storage.
          </p>
        </div>

        {/* Upload Action Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            title="Refresh from Database"
            className="p-2.5 rounded-lg border border-[#262833] bg-[#14151a] hover:bg-[#1f212b] text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#d1a86e]" : ""}`} />
          </button>

          {/* Batch Mode Toggle */}
          <button
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) {
                setSelectedIds(new Set());
                setBatchDeleteConfirm(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
              isBatchMode
                ? "bg-rose-900/30 border-rose-500/40 text-rose-300 hover:bg-rose-900/50"
                : "border-[#262833] bg-[#14151a] hover:bg-[#1f212b] text-zinc-300 hover:text-white"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isBatchMode ? "Exit Batch" : "Batch Select"}</span>
          </button>

          <div className="flex items-center bg-[#14151a] border border-[#262833] rounded-lg p-1 text-xs">
            <span className="text-[11px] text-zinc-500 px-2">Target:</span>
            <select
              value={targetUploadProvider}
              onChange={(e) => setTargetUploadProvider(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-300 font-mono focus:outline-none pr-1"
            >
              <option value="active" className="bg-[#14151a]">Auto ({activeProviderName.toUpperCase()})</option>
              <option value="imagekit" className="bg-[#14151a]">Force ImageKit</option>
              <option value="cloudflare" className="bg-[#14151a]">Force Cloudflare R2</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsUnsplashOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#262833] bg-[#14151a] hover:bg-[#1f212b] text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Import Temp Art</span>
          </button>

          <label className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Uploading..." : "Upload Asset"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Delete Result Toast */}
      {deleteResult && (
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-xs font-medium animate-in slide-in-from-top-2 ${
            deleteResult.sourceDeleted && !deleteResult.sourceError
              ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
              : deleteResult.sourceError
              ? "bg-amber-950/60 border-amber-800/50 text-amber-300"
              : "bg-zinc-800/60 border-zinc-700/50 text-zinc-300"
          }`}
        >
          {deleteResult.sourceDeleted && !deleteResult.sourceError ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-semibold">{deleteResult.fileName}</span>
            {deleteResult.sourceDeleted ? (
              <span> — permanently purged from {deleteResult.provider} source storage and database.</span>
            ) : deleteResult.sourceError ? (
              <span> — database removed but source deletion encountered an issue: {deleteResult.sourceError}</span>
            ) : (
              <span> — database record removed.</span>
            )}
          </div>
          <button onClick={() => setDeleteResult(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Batch Action Bar */}
      {isBatchMode && (
        <div className="flex items-center justify-between px-5 py-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-rose-300 font-medium">
              {selectedIds.size} of {filteredItems.length} selected
            </span>
            <button onClick={selectAll} className="text-zinc-400 hover:text-white underline">
              Select All
            </button>
            <button onClick={deselectAll} className="text-zinc-400 hover:text-white underline">
              Deselect All
            </button>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setBatchDeleteConfirm(true)}
              disabled={isBatchDeleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isBatchDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>{isBatchDeleting ? "Deleting..." : `Permanently Delete ${selectedIds.size} Assets`}</span>
            </button>
          )}
        </div>
      )}

      {/* Storage Architecture Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#14151a] border border-[#262833] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">ImageKit CDN</div>
            <div className="text-sm font-medium text-white flex items-center gap-1.5">
              <span>Dynamic Transformations</span>
              {activeProviderName === "imagekit" && (
                <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[9px] rounded uppercase font-bold">Default</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#14151a] border border-[#262833] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Cloudflare R2</div>
            <div className="text-sm font-medium text-white flex items-center gap-1.5">
              <span>Object Storage &amp; WebP</span>
              {activeProviderName === "cloudflare" && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded uppercase font-bold">Default</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#14151a] border border-[#262833] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Neon DB Persistence</div>
            <div className="text-sm font-medium text-white">
              {items.length} Registered Media Assets
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#1c1d25] pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">Filter Provider:</span>
          {(["all", "imagekit", "cloudflare"] as const).map((prov) => (
            <button
              key={prov}
              onClick={() => setFilterProvider(prov)}
              className={`px-3 py-1 rounded-md text-xs transition-colors capitalize ${
                filterProvider === prov
                  ? "bg-zinc-800 text-white font-medium border border-zinc-700"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {prov === "all" ? `All Assets (${items.length})` : prov === "imagekit" ? "ImageKit" : "Cloudflare R2"}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500 font-mono">Showing {filteredItems.length} assets</span>
      </div>

      {/* Grid of Media Assets */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#d1a86e]" />
          <span className="text-xs tracking-wider uppercase font-medium">Loading Media from Database...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-[#14151a]/40 border border-[#262833] rounded-2xl space-y-3">
          <p className="text-sm text-zinc-400">No media assets found in database.</p>
          <button
            onClick={() => setIsUnsplashOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d1a86e] text-[#0d0e12] text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import First Artwork</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={isBatchMode ? () => toggleSelect(item.id) : undefined}
                className={`group p-4 bg-[#14151a] border rounded-2xl space-y-3 shadow-xl transition-all ${
                  isBatchMode
                    ? isSelected
                      ? "border-rose-500/60 ring-1 ring-rose-500/30 cursor-pointer"
                      : "border-[#262833] hover:border-zinc-600 cursor-pointer"
                    : "border-[#262833] hover:border-zinc-700"
                }`}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
                  <Image
                    src={item.fileUrl}
                    alt={item.fileName}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />

                  {/* Batch checkbox overlay */}
                  {isBatchMode && (
                    <div className="absolute top-2 right-2 z-10">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  )}

                  {/* Provider Badge overlay */}
                  <div className="absolute top-2 left-2">
                    {item.provider === "imagekit" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                        <Sparkles className="w-2.5 h-2.5" />
                        ImageKit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        <Cloud className="w-2.5 h-2.5" />
                        R2
                      </span>
                    )}
                  </div>

                  {/* Quick Delete overlay (only in normal mode) */}
                  {!isBatchMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      title="Permanently delete media"
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-rose-900/80 text-zinc-400 hover:text-rose-200 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-xs text-white font-medium block truncate" title={item.fileName}>
                    {item.fileName}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>{item.dimensions}</span>
                    <span>{item.byteSize}</span>
                  </div>
                </div>

                {!isBatchMode && (
                  <div className="pt-2 border-t border-[#1f212b] flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.fileUrl);
                      }}
                      className="text-[11px] text-[#d1a86e] hover:underline flex items-center gap-1"
                    >
                      {copiedUrl === item.fileUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white"
                      title="Open original in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Permanent Delete Confirmation Modal (Single) ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md mx-4 bg-[#14151a] border border-[#262833] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-white">Permanent Deletion</h3>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-[#262833] shrink-0 relative">
                <Image
                  src={deleteTarget.fileUrl}
                  alt={deleteTarget.fileName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{deleteTarget.fileName}</p>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{deleteTarget.dimensions}</p>
                <p className="text-[11px] text-zinc-400 font-mono">{deleteTarget.byteSize}</p>
                <div className="mt-1.5">
                  {deleteTarget.provider === "imagekit" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      <Sparkles className="w-2.5 h-2.5" />
                      ImageKit Source
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      <Cloud className="w-2.5 h-2.5" />
                      Cloudflare R2 Source
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-rose-300 font-medium">
                  This will permanently delete the file from {deleteTarget.provider === "imagekit" ? "ImageKit CDN" : "Cloudflare R2"}.
                </p>
                <p className="text-xs text-rose-400/70 mt-1 leading-relaxed">
                  The binary file will be removed from the storage provider and the database record will be deleted. Any artworks using this image will lose their reference. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white border border-[#262833] hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executePermanentDelete(deleteTarget)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? "Purging..." : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Batch Delete Confirmation Modal ─── */}
      {batchDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md mx-4 bg-[#14151a] border border-[#262833] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-white">Batch Permanent Deletion</h3>
              <button
                onClick={() => setBatchDeleteConfirm(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-rose-300 font-medium">
                  You are about to permanently delete {selectedIds.size} media assets.
                </p>
                <p className="text-xs text-rose-400/70 mt-1 leading-relaxed">
                  Each file will be removed from its source storage provider (ImageKit or Cloudflare R2) and the database record will be deleted. Artworks referencing these images will lose their reference. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setBatchDeleteConfirm(false)}
                disabled={isBatchDeleting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white border border-[#262833] hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBatchDelete}
                disabled={isBatchDeleting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-rose-600/20"
              >
                {isBatchDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isBatchDeleting ? "Purging..." : `Delete ${selectedIds.size} Assets Permanently`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <UnsplashPickerModal
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={handleUnsplashSelect}
      />
    </div>
  );
}
