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
  Filter,
  ChevronDown,
} from "lucide-react";
import { MockExhibition, MockArtwork } from "@/db/mockData";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  PaginationPageSizeSelect,
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
      {/* Header - Solid Tier 1 Master Block */}
      <div className="bg-[#121319] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Institutional Presence
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-white mt-0.5 sm:mt-1">Exhibitions CMS</h1>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">
            Curate solo and group exhibitions, manage dates, locations, and exhibited artwork sets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/settings?tab=exhibitions"
            className="bg-[#1a1b26] hover:bg-[#222432] text-[11px] sm:text-xs text-[#d1a86e] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">Page Intro</span>
          </Link>
          <Link
            href="/exhibitions"
            target="_blank"
            className="bg-[#1a1b26] hover:bg-[#222432] text-[11px] sm:text-xs text-zinc-300 hover:text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate">Live View</span>
          </Link>
          <button
            onClick={openNew}
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md shadow-[#d1a86e]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">New Exhibition</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar - Compact Dropdown Bar */}
      <div className="bg-[#121319] rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exhibitions by title, location, curator note..."
            className="pl-9 h-8 sm:h-9 bg-[#1a1b26] text-xs text-white placeholder:text-zinc-500 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>
                  Timeline:{" "}
                  <strong className="font-semibold text-white capitalize">
                    {statusFilter === "all" ? "All" : statusFilter}
                  </strong>
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 p-1.5 bg-[#121319] border border-[#262833] rounded-xl shadow-2xl text-xs text-white z-[110]"
            >
              {[
                { id: "all", label: "All Statuses" },
                { id: "current", label: "Current" },
                { id: "upcoming", label: "Upcoming" },
                { id: "past", label: "Past" },
              ].map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id as any)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    statusFilter === filter.id
                      ? "bg-[#251e16] text-[#d1a86e] font-semibold"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{filter.label}</span>
                  {statusFilter === filter.id && (
                    <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Published/Draft Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
              >
                <span>
                  State:{" "}
                  <strong className="font-semibold text-white capitalize">
                    {publishFilter === "all" ? "All" : publishFilter}
                  </strong>
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 p-1.5 bg-[#121319] border border-[#262833] rounded-xl shadow-2xl text-xs text-white z-[110]"
            >
              {[
                { id: "all", label: "All" },
                { id: "published", label: "Published" },
                { id: "draft", label: "Draft" },
              ].map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => setPublishFilter(filter.id as any)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    publishFilter === filter.id
                      ? "bg-[#251e16] text-[#d1a86e] font-semibold"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{filter.label}</span>
                  {publishFilter === filter.id && (
                    <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Exhibitions Grid */}
      {exhibitions.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-[#121319] rounded-3xl shadow-xl shadow-black/40">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">No exhibitions yet</p>
          <button
            onClick={openNew}
            className="gap-2 mx-auto inline-flex items-center bg-[#1a1b26] hover:bg-[#222432] text-xs text-[#d1a86e] px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first exhibition</span>
          </button>
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div className="p-12 text-center bg-[#121319] rounded-3xl shadow-xl shadow-black/40 text-xs text-zinc-500">
          No exhibitions found matching your search or filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {paginatedExhibitions.map((exh) => (
            <div
              key={exh.id}
              className="rounded-2xl sm:rounded-3xl bg-[#1a1b26] overflow-hidden shadow-md shadow-black/30 flex flex-col justify-between hover:bg-[#1e202d] transition-all"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/9] bg-black/40">
                {exh.coverImageUrl ? (
                  <Image
                    src={exh.coverImageUrl}
                    alt={exh.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Calendar className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span
                    className={`text-[8px] sm:text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full shadow-md ${
                      exh.isPublished
                        ? "bg-[#14231b] text-emerald-300"
                        : "bg-[#222432] text-zinc-400"
                    }`}
                  >
                    {exh.isPublished ? "Published" : "Draft"}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full shadow-md ${
                      exh.status === "current"
                        ? "bg-[#251e16] text-[#d1a86e]"
                        : exh.status === "upcoming"
                        ? "bg-[#14231b] text-emerald-300"
                        : "bg-[#222432] text-zinc-400"
                    }`}
                  >
                    {exh.status}
                  </span>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 sm:p-1.5 bg-black/60 hover:bg-black/80 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors cursor-pointer">
                        <MoreVertical className="w-3.5 h-3.5 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => openEdit(exh)}>
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Edit Exhibition
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(exh)}>
                        {exh.isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(exh.id, exh.title)}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5 sm:p-5 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <h2 className="font-serif text-sm sm:text-xl text-white font-medium truncate">{exh.title}</h2>
                  <Link
                    href={`/exhibitions/${exh.slug}`}
                    target="_blank"
                    className="p-1 text-zinc-400 hover:text-white transition-colors shrink-0"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                  </Link>
                </div>
                {exh.subtitle && (
                  <p className="text-[11px] sm:text-xs text-[#d1a86e] font-medium truncate">{exh.subtitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                    <span className="truncate">{exh.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                    <span className="truncate">
                      {new Date(exh.startDate).toLocaleDateString()} — {new Date(exh.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {exh.description && (
                  <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">{exh.description}</p>
                )}

                <div className="pt-1 sm:pt-2 flex items-center justify-between text-[10px] sm:text-xs text-zinc-500">
                  <span>{exh.artworkSlugs.length} featured works</span>
                  <span className="font-mono text-[9px] sm:text-[10px]">/{exh.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination and Per-Page Control Bar */}
      {filteredExhibitions.length > 0 && (
        <div className="p-5 bg-transparent rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
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

          <PaginationPageSizeSelect
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
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
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
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
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
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
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e] font-mono text-[11px]"
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
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
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
                  className="bg-[#1a1b26] text-white text-xs rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
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
                  className="bg-[#1a1b26] text-white text-xs rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className="w-full bg-[#1a1b26] rounded-xl px-3.5 py-2.5 text-xs text-white border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
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
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
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
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
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
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
              />
              {form.coverImageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden mt-2 shadow-md">
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
                className="w-4 h-4 rounded bg-[#1a1b26] accent-[#d1a86e] border-none"
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
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 gap-1.5 rounded-xl border-none"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.location.trim()}
              className="bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-medium gap-1.5 rounded-xl border-none"
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
