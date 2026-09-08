"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Save,
  X,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  Check,
  AlertCircle,
  MoreVertical,
  Search,
} from "lucide-react";
import { MockCollection, MockArtwork } from "@/db/mockData";
import { slugify } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PAGE_SIZE_OPTIONS,
  getPaginationRange,
} from "@/components/ui/pagination";

interface CollectionsManagerClientProps {
  initialCollections: MockCollection[];
  allArtworks: MockArtwork[];
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  curatorialStatement: "",
  coverImageUrl: "",
  isPublished: false,
  artworkIds: [] as string[],
};

export function CollectionsManagerClient({
  initialCollections,
  allArtworks,
}: CollectionsManagerClientProps) {
  const [collections, setCollections] = useState<MockCollection[]>(initialCollections);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      if (statusFilter === "published" && !col.isPublished) return false;
      if (statusFilter === "draft" && col.isPublished) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          col.title.toLowerCase().includes(q) ||
          (col.description && col.description.toLowerCase().includes(q)) ||
          col.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [collections, statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCollections.length / pageSize));
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const startItem = filteredCollections.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredCollections.length);
  const paginationRange = getPaginationRange(currentPage, totalPages);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (col: MockCollection) => {
    setEditingId(col.id);
    const selectedArtworkIds = allArtworks
      .filter((a) => col.artworkSlugs.includes(a.slug))
      .map((a) => a.id);
    setForm({
      title: col.title,
      slug: col.slug,
      description: col.description,
      curatorialStatement: col.curatorialStatement,
      coverImageUrl: col.coverImageUrl,
      isPublished: col.isPublished,
      artworkIds: selectedArtworkIds,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const payload: Record<string, unknown> = {
        ...form,
        slug: form.slug || slugify(form.title),
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      const saved = data.collection as MockCollection;

      setCollections((prev) => {
        if (editingId) {
          return prev.map((c) => (c.id === editingId ? saved : c));
        }
        return [...prev, saved];
      });

      setSaveStatus("success");
      setTimeout(() => {
        setDialogOpen(false);
        setSaveStatus("idle");
      }, 800);
    } catch (err) {
      console.error("Save collection error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {}
  };

  const togglePublish = async (col: MockCollection) => {
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...col, isPublished: !col.isPublished }),
      });
      if (res.ok) {
        const data = await res.json();
        setCollections((prev) =>
          prev.map((c) => (c.id === col.id ? data.collection : c))
        );
      }
    } catch {}
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header - Solid Tier 1 Master Block */}
      <div className="bg-[#121319] p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Thematic Series
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Collections CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize artworks into curated series with statements and exhibition essays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/settings?tab=collections"
            className="bg-[#1a1b26] hover:bg-[#222432] text-xs text-[#d1a86e] px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Edit Page Header &amp; Intro</span>
          </Link>
          <Link
            href="/collections"
            target="_blank"
            className="bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Storefront</span>
          </Link>
          <button
            onClick={openNew}
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs px-4 py-2 rounded-xl shadow-md shadow-[#d1a86e]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar - Solid Tier 2 Block */}
      <div className="bg-[#121319] rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search series by title, slug, or theme..."
            className="pl-10 bg-[#1a1b26] text-xs text-white placeholder:text-zinc-500 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "all", label: "All Series" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`text-xs h-8 px-3.5 rounded-xl transition-colors cursor-pointer ${
                statusFilter === filter.id
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-sm"
                  : "bg-[#1a1b26] text-zinc-400 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-[#121319] rounded-3xl shadow-xl shadow-black/40">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">No collections yet</p>
          <button
            onClick={openNew}
            className="gap-2 mx-auto inline-flex items-center bg-[#1a1b26] hover:bg-[#222432] text-xs text-[#d1a86e] px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first collection</span>
          </button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="p-12 text-center bg-[#121319] rounded-3xl shadow-xl shadow-black/40 text-xs text-zinc-500">
          No collections found matching your search or filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {paginatedCollections.map((col) => (
            <div
              key={col.id}
              className="rounded-3xl bg-[#1a1b26] overflow-hidden shadow-md shadow-black/30 flex flex-col justify-between hover:bg-[#1e202d] transition-all"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/9] bg-black/40">
                {col.coverImageUrl ? (
                  <Image
                    src={col.coverImageUrl}
                    alt={col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderKanban className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[9px] uppercase font-mono font-bold px-2.5 py-1 rounded-full shadow-md ${
                      col.isPublished
                        ? "bg-[#14231b] text-emerald-300"
                        : "bg-[#222432] text-zinc-400"
                    }`}
                  >
                    {col.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 bg-black/60 hover:bg-black/80 rounded-xl backdrop-blur-sm transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(col)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Collection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(col)}>
                        {col.isPublished ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(col.id, col.title)}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl text-white">{col.title}</h2>
                  <Link
                    href={`/collections/${col.slug}`}
                    target="_blank"
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4 text-[#d1a86e]" />
                  </Link>
                </div>
                {col.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-mono text-[11px] bg-[#121319] px-2.5 py-0.5 rounded-full">
                    {col.artworkSlugs.length} artworks
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    /{col.slug}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination and Per-Page Control Bar - Solid Tier 2 Block */}
      {filteredCollections.length > 0 && (
        <div className="p-5 bg-[#121319] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-black/40">
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
            <span className="text-[#d1a86e] font-semibold">{filteredCollections.length}</span> collections
          </div>

          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {paginationRange.map((item, idx) => (
                  <PaginationItem key={idx}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === currentPage}
                        onClick={() => setCurrentPage(Number(item))}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
            <div className="flex items-center rounded-xl bg-[#1a1b26] p-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    pageSize === size
                      ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingId ? "Edit Collection" : "New Collection"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Title <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editingId ? f.slug : slugify(e.target.value),
                  }));
                }}
                placeholder="e.g., Oceanic Silences"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                URL Slug
              </label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated-from-title"
                className="font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this collection..."
                rows={3}
                className="bg-[#1a1c23] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Curatorial Statement
              </label>
              <Textarea
                value={form.curatorialStatement}
                onChange={(e) => setForm((f) => ({ ...f, curatorialStatement: e.target.value }))}
                placeholder="Art-historical context and curatorial intention..."
                rows={4}
                className="bg-[#1a1c23] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Cover Image URL
              </label>
              <Input
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-[#1a1c23] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
              />
              {form.coverImageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden mt-2 shadow-md">
                  <Image
                    src={form.coverImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              )}
            </div>

            {allArtworks.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Associated Artworks ({form.artworkIds.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2.5 bg-[#1a1c23] rounded-xl">
                  {allArtworks.map((art) => (
                    <label
                      key={art.id}
                      className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none p-1.5 rounded-lg hover:bg-[#22242d]"
                    >
                      <input
                        type="checkbox"
                        checked={form.artworkIds.includes(art.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((f) => ({
                            ...f,
                            artworkIds: checked
                              ? [...f.artworkIds, art.id]
                              : f.artworkIds.filter((id) => id !== art.id),
                          }));
                        }}
                        className="w-3.5 h-3.5 rounded bg-[#14151a] accent-[#d1a86e]"
                      />
                      <span className="truncate">{art.title}</span>
                      <span className="text-[10px] text-zinc-500 ml-auto font-mono">
                        {art.status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="col-published"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="w-4 h-4 rounded bg-[#1a1c23] accent-[#d1a86e]"
              />
              <label htmlFor="col-published" className="text-xs text-zinc-300">
                Publish immediately
              </label>
            </div>
          </div>

          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed to save. Please try again.</span>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saveStatus === "success" ? "Saved!" : editingId ? "Save Changes" : "Create Collection"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
