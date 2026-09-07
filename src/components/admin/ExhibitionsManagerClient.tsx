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
  Calendar,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
  MoreVertical,
  Search,
} from "lucide-react";
import { MockExhibition, MockArtwork } from "@/db/mockData";
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

interface ExhibitionsManagerClientProps {
  initialExhibitions: MockExhibition[];
  allArtworks: MockArtwork[];
}

const formatDateForInput = (iso: string) => {
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const emptyForm = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  curatorNote: "",
  location: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  status: "upcoming" as "upcoming" | "current" | "past",
  coverImageUrl: "",
  isPublished: false,
};

export function ExhibitionsManagerClient({
  initialExhibitions,
  allArtworks,
}: ExhibitionsManagerClientProps) {
  const [exhibitions, setExhibitions] = useState<MockExhibition[]>(initialExhibitions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "current" | "upcoming" | "past">("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((exh) => {
      if (statusFilter !== "all" && exh.status !== statusFilter) return false;
      if (publishFilter === "published" && !exh.isPublished) return false;
      if (publishFilter === "draft" && exh.isPublished) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          exh.title.toLowerCase().includes(q) ||
          (exh.subtitle && exh.subtitle.toLowerCase().includes(q)) ||
          (exh.location && exh.location.toLowerCase().includes(q)) ||
          (exh.description && exh.description.toLowerCase().includes(q)) ||
          exh.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exhibitions, statusFilter, publishFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, publishFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredExhibitions.length / pageSize));
  const paginatedExhibitions = filteredExhibitions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const startItem = filteredExhibitions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredExhibitions.length);
  const paginationRange = getPaginationRange(currentPage, totalPages);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (exh: MockExhibition) => {
    setEditingId(exh.id);
    setForm({
      title: exh.title,
      slug: exh.slug,
      subtitle: exh.subtitle,
      description: exh.description,
      curatorNote: exh.curatorNote,
      location: exh.location,
      startDate: formatDateForInput(exh.startDate),
      endDate: formatDateForInput(exh.endDate),
      status: exh.status,
      coverImageUrl: exh.coverImageUrl,
      isPublished: exh.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.location.trim()) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const payload: Record<string, unknown> = {
        ...form,
        slug: form.slug || slugify(form.title),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      const saved = data.exhibition as MockExhibition;

      setExhibitions((prev) => {
        if (editingId) {
          return prev.map((e) => (e.id === editingId ? saved : e));
        }
        return [...prev, saved];
      });

      setSaveStatus("success");
      setTimeout(() => {
        setDialogOpen(false);
        setSaveStatus("idle");
      }, 800);
    } catch (err) {
      console.error("Save exhibition error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/exhibitions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExhibitions((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {}
  };

  const togglePublish = async (exh: MockExhibition) => {
    try {
      const res = await fetch("/api/admin/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exh, isPublished: !exh.isPublished }),
      });
      if (res.ok) {
        const data = await res.json();
        setExhibitions((prev) =>
          prev.map((e) => (e.id === exh.id ? data.exhibition : e))
        );
      }
    } catch {}
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "current":
        return "success";
      case "upcoming":
        return "warning";
      case "past":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Institutional Presence
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Exhibitions CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Curate solo and group exhibitions, manage dates, locations, and exhibited artwork sets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-[#d1a86e]/40 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs gap-1.5">
            <Link href="/admin/settings?tab=exhibitions">
              <Calendar className="w-3.5 h-3.5" />
              <span>Edit Page Header &amp; Intro</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
            <Link href="/exhibitions" target="_blank">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Storefront</span>
            </Link>
          </Button>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Exhibition</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exhibitions by title, location, curator note..."
            className="pl-10 bg-[#14151a] border-[#262833] text-xs text-white placeholder:text-zinc-500 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#14151a] p-1 rounded-xl border border-[#262833]">
            {(
              [
                { id: "all", label: "All Statuses" },
                { id: "current", label: "Current" },
                { id: "upcoming", label: "Upcoming" },
                { id: "past", label: "Past" },
              ] as const
            ).map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={statusFilter === filter.id ? "default" : "ghost"}
                onClick={() => setStatusFilter(filter.id)}
                className={`text-xs h-7 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === filter.id
                    ? "bg-[#d1a86e] text-[#0d0e12] font-semibold hover:bg-[#d1a86e]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Published/Draft Filter */}
          <div className="flex items-center gap-1 bg-[#14151a] p-1 rounded-xl border border-[#262833]">
            {(
              [
                { id: "all", label: "All" },
                { id: "published", label: "Published" },
                { id: "draft", label: "Draft" },
              ] as const
            ).map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={publishFilter === filter.id ? "default" : "ghost"}
                onClick={() => setPublishFilter(filter.id)}
                className={`text-xs h-7 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  publishFilter === filter.id
                    ? "bg-zinc-700 text-white font-medium"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Exhibitions Grid */}
      {exhibitions.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">No exhibitions yet</p>
          <Button onClick={openNew} variant="secondary" className="gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            <span>Create your first exhibition</span>
          </Button>
        </Card>
      ) : filteredExhibitions.length === 0 ? (
        <Card className="p-12 text-center bg-[#14151a]/40 border-[#262833] rounded-2xl text-xs text-zinc-500">
          No exhibitions found matching your search or filter criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {paginatedExhibitions.map((exh) => (
            <Card key={exh.id} className="overflow-hidden">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] bg-black/40 border-b border-[#1f212b]">
                {exh.coverImageUrl ? (
                  <Image
                    src={exh.coverImageUrl}
                    alt={exh.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Calendar className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge variant={statusColor(exh.status) as any}>
                    {exh.status}
                  </Badge>
                  <Badge variant={exh.isPublished ? "success" : "secondary"}>
                    {exh.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 bg-black/60 hover:bg-black/80 rounded-lg backdrop-blur-sm transition-colors">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(exh)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Exhibition
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(exh)}>
                        {exh.isPublished ? (
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
                        onClick={() => handleDelete(exh.id, exh.title)}
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
                  <h2 className="font-serif text-xl text-white">{exh.title}</h2>
                  <Link
                    href={`/exhibitions/${exh.slug}`}
                    target="_blank"
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                    title="View exhibition page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                {exh.subtitle && (
                  <p className="text-xs text-[#d1a86e] font-medium">{exh.subtitle}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>{exh.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>
                      {new Date(exh.startDate).toLocaleDateString()} — {new Date(exh.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {exh.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{exh.description}</p>
                )}

                <Separator />

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{exh.artworkSlugs.length} featured works</span>
                  <span className="font-mono text-[10px]">/{exh.slug}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination and Per-Page Control Bar */}
      {filteredExhibitions.length > 0 && (
        <div className="p-4 bg-[#14151a] border border-[#262833] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
            <span className="text-[#d1a86e] font-semibold">{filteredExhibitions.length}</span> exhibitions
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
            <div className="flex items-center rounded-lg border border-[#262833] bg-[#1a1c23] p-0.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
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
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingId ? "Edit Exhibition" : "New Exhibition"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Exhibition title"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Subtitle
                </label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="e.g., A Retrospective"
                />
              </div>
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
                Location <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Galerie Nationale, Paris"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  End Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="current">Current</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="About this exhibition..."
                rows={3}
                className="bg-[#1a1c23] border-[#262833] text-white text-xs placeholder:text-zinc-600 focus:border-[#d1a86e] focus:ring-0 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Curator&apos;s Note
              </label>
              <Textarea
                value={form.curatorNote}
                onChange={(e) => setForm((f) => ({ ...f, curatorNote: e.target.value }))}
                placeholder="Curatorial perspective and exhibition thesis..."
                rows={3}
                className="bg-[#1a1c23] border-[#262833] text-white text-xs placeholder:text-zinc-600 focus:border-[#d1a86e] focus:ring-0 resize-none"
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
              />
              {form.coverImageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#262833] mt-2">
                  <Image
                    src={form.coverImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="500px"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="exh-published"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="w-4 h-4 rounded border-[#262833] bg-[#1a1c23] text-[#d1a86e] focus:ring-[#d1a86e]"
              />
              <label htmlFor="exh-published" className="text-xs text-zinc-300">
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
              disabled={saving || !form.title.trim() || !form.location.trim()}
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
                {saveStatus === "success" ? "Saved!" : editingId ? "Save Changes" : "Create Exhibition"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
