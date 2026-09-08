"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Sparkles,
  Edit,
  Archive,
  Eye,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  ExternalLink,
  Trash2,
  LayoutGrid,
  List,
  AlertTriangle,
  Loader2,
  Layers,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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

interface ArtworksManagerClientProps {
  initialArtworks: MockArtwork[];
}

export function ArtworksManagerClient({
  initialArtworks,
}: ArtworksManagerClientProps) {
  const [artworks, setArtworks] = useState<MockArtwork[]>(initialArtworks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewLayout, setViewLayout] = useState<"table" | "grid">("table");

  // Permanent Delete Modal State
  const [artworkToDelete, setArtworkToDelete] = useState<MockArtwork | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return artworks.filter((art) => {
      if (statusFilter !== "all" && art.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.medium.toLowerCase().includes(q) ||
          art.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [artworks, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedArtworks = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filtered.length);
  const paginationRange = getPaginationRange(currentPage, totalPages);

  const handleArchive = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to archive "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/artworks?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArtworks((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "archived" } : a))
        );
      }
    } catch {}
  };

  const handleDeletePermanent = async (art: MockArtwork) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/artworks?id=${art.id}&mode=permanent`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setArtworks((prev) => prev.filter((a) => a.id !== art.id));
        setArtworkToDelete(null);
      } else {
        alert(data.error || "Failed to permanently delete artwork");
      }
    } catch (err) {
      console.error("Delete artwork failed:", err);
      alert("Failed to delete artwork");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (
    art: MockArtwork,
    newStatus: "draft" | "published" | "reserved" | "sold" | "archived"
  ) => {
    try {
      const res = await fetch("/api/admin/artworks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: art.id,
          status: newStatus,
          notifySubscribers: newStatus === "published" && !art.notifiedSubscribersAt,
        }),
      });
      if (res.ok) {
        setArtworks((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, status: newStatus } : a))
        );
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Status update error:", data.error);
      }
    } catch (err) {
      console.error("Quick status change failed:", err);
    }
  };

  const statusVariantMap: Record<
    string,
    "success" | "secondary" | "warning" | "gold" | "destructive"
  > = {
    published: "success",
    draft: "secondary",
    reserved: "warning",
    sold: "gold",
    archived: "destructive",
  };

  return (
    <div className="space-y-6">
      {/* Header Plaque - Solid Tier 1 Master Block */}
      <div className="bg-[#121319] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Catalog Inventory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-white mt-0.5 sm:mt-1">Artworks CMS</h1>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">
            Manage your masterworks, calibrate 1:1 physical spatial dimensions, and publish canvases.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href="/admin/media"
            className="bg-[#1a1b26] hover:bg-[#222432] text-[11px] sm:text-xs text-zinc-300 hover:text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Media</span>
          </Link>

          <Link
            href="/admin/artworks/new"
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md shadow-[#d1a86e]/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Artwork</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar with View Mode Toggle - Solid Tier 2 Block */}
      <div className="bg-[#121319] rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Filter by title, slug, or medium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-[#1a1b26] rounded-xl border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1">
              Status:
            </span>
            {["all", "published", "draft", "reserved", "sold", "archived"].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] h-7 px-3 rounded-full transition-colors ${
                    statusFilter === st
                      ? "bg-[#251e16] text-[#d1a86e] font-semibold shadow-sm"
                      : "bg-[#1a1b26] text-zinc-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          {/* Table vs Grid View Toggle */}
          <div className="flex items-center p-1 bg-[#1a1b26] rounded-xl ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => setViewLayout("table")}
              className={`p-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewLayout === "table"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("grid")}
              className={`p-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewLayout === "grid"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Visual Image Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Image Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TABLE VIEW (Default Desktop/Tablet) - Solid Block */}
      {viewLayout === "table" && (
        <div className="hidden md:block bg-[#121319] rounded-3xl overflow-hidden shadow-xl shadow-black/40">
          <Table>
            <TableHeader className="bg-[#161720]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="min-w-[260px]">Artwork</TableHead>
                <TableHead className="min-w-[180px]">Medium &amp; Year</TableHead>
                <TableHead className="min-w-[160px]">Dimensions</TableHead>
                <TableHead className="min-w-[110px]">Price</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">AR Readiness</TableHead>
                <TableHead className="text-right min-w-[130px] sticky right-0 bg-[#101116]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                    No artworks found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedArtworks.map((art) => (
                  <TableRow key={art.id} className="group hover:bg-[#1a1b26]/50 transition-colors border-none">
                    {/* Artwork Image & Title */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-xl overflow-hidden bg-black/40 shrink-0">
                          <ProgressiveImage
                            src={art.coverImageUrl}
                            alt={art.altText || art.title}
                            fill
                            optimizeWidth={120}
                            optimizeQuality={75}
                            sizes="48px"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-serif text-[15px] text-white font-medium block truncate max-w-[260px] tracking-tight">
                            {art.title}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono block truncate">
                            /{art.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Medium & Year */}
                    <TableCell>
                      <span className="text-xs text-zinc-300 block truncate max-w-[180px]">
                        {art.medium}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {art.year}
                      </span>
                    </TableCell>

                    {/* Dimensions */}
                    <TableCell>
                      <span className="text-xs text-zinc-300 font-mono block tracking-tight">
                        {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="text-sm font-semibold text-[#d1a86e] font-mono tracking-tight">
                        {formatCurrency(art.price, art.currency)}
                      </span>
                    </TableCell>

                    {/* Status Dropdown */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 focus:outline-none group/btn"
                          >
                            <Badge
                              variant={statusVariantMap[art.status] || "secondary"}
                              className="cursor-pointer text-[10px] font-mono font-bold"
                            >
                              <span>{art.status}</span>
                              <ChevronDown className="w-2.5 h-2.5 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {(
                            [
                              "published",
                              "draft",
                              "reserved",
                              "sold",
                              "archived",
                            ] as const
                          ).map((st) => (
                            <DropdownMenuItem
                              key={st}
                              onClick={() => handleQuickStatusChange(art, st)}
                              className="capitalize font-mono text-xs"
                            >
                              {st}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* AR Readiness */}
                    <TableCell>
                      {art.arConfig?.arReadinessStatus === "ready" ? (
                        <Badge
                          variant="success"
                          className="text-[10px] tracking-wider font-mono gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>READY</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="warning"
                          className="text-[10px] tracking-wider font-mono gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>NEEDS ATTENTION</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions with Delete Option */}
                    <TableCell className="text-right sticky right-0 bg-[#101116] group-hover:bg-[#15161d] transition-colors">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-white"
                        >
                          <Link
                            href={`/artwork/${art.slug}`}
                            target="_blank"
                            title="Public Live Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#d1a86e] hover:text-[#e2c18d]"
                        >
                          <Link
                            href={`/ar/${art.slug}`}
                            target="_blank"
                            title="AR Experience"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-400 hover:text-white"
                        >
                          <Link
                            href={`/admin/artworks/${art.id}`}
                            title="Edit Spec"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setArtworkToDelete(art)}
                          className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                          title="Delete Artwork Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#262833] rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/artwork/${art.slug}`}
                                target="_blank"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Live Preview</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/artworks/${art.id}`}
                                className="flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Edit Full Spec</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleArchive(art.id, art.title)}
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                            >
                              <Archive className="w-3.5 h-3.5 mr-2" />
                              <span>Archive Canvas</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setArtworkToDelete(art)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/50 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2 text-red-400" />
                              <span>Delete Permanently</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 2. VISUAL IMAGE GRID VIEW */}
      {viewLayout === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#121319] rounded-3xl shadow-xl shadow-black/40">
              No artworks found matching your filter criteria.
            </div>
          ) : (
            paginatedArtworks.map((art) => (
              <div
                key={art.id}
                className="group rounded-2xl sm:rounded-3xl bg-[#1a1b26] overflow-hidden hover:bg-[#202230] transition-all flex flex-col shadow-md shadow-black/30"
              >
                {/* Visual Image Preview */}
                <div className="relative aspect-[4/3] w-full bg-black/50 overflow-hidden">
                  <ProgressiveImage
                    src={art.coverImageUrl}
                    alt={art.altText || art.title}
                    fill
                    optimizeWidth={380}
                    optimizeQuality={80}
                    sizes="320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status & AR Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="focus:outline-none">
                          <span
                            className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-md cursor-pointer inline-flex items-center gap-1 ${
                              art.status === "published"
                                ? "bg-[#14231b] text-emerald-300"
                                : art.status === "sold"
                                ? "bg-[#251e16] text-[#d1a86e]"
                                : "bg-[#222432] text-zinc-300"
                            }`}
                          >
                            <span>{art.status}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                          </span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(
                          [
                            "published",
                            "draft",
                            "reserved",
                            "sold",
                            "archived",
                          ] as const
                        ).map((st) => (
                          <DropdownMenuItem
                            key={st}
                            onClick={() => handleQuickStatusChange(art, st)}
                            className="capitalize font-mono text-xs"
                          >
                            {st}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute top-2 right-2">
                    {art.arConfig?.arReadinessStatus === "ready" ? (
                      <span className="text-[7px] sm:text-[8px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#14231b] text-emerald-300 font-mono shadow-md">
                        AR READY
                      </span>
                    ) : (
                      <span className="text-[7px] sm:text-[8px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#2a1d14] text-amber-300 font-mono shadow-md">
                        AR REQ
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2 right-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-black/80 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-[#d1a86e] font-mono shadow-md">
                    {formatCurrency(art.price, art.currency)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-1.5">
                      <h3 className="font-serif text-xs sm:text-sm text-white font-medium truncate group-hover:text-[#d1a86e] transition-colors">
                        {art.title}
                      </h3>
                      <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                        {art.year}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {art.medium}
                    </p>
                    <p className="text-[9px] sm:text-[11px] text-zinc-500 font-mono mt-0.5">
                      {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
                        title="Live Preview"
                      >
                        <Link href={`/artwork/${art.slug}`} target="_blank">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#d1a86e] hover:text-[#e2c18d]"
                        title="Spatial WebAR"
                      >
                        <Link href={`/ar/${art.slug}`} target="_blank">
                          <Sparkles className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-300 hover:text-white"
                        title="Edit Full Spec"
                      >
                        <Link href={`/admin/artworks/${art.id}`}>
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setArtworkToDelete(art)}
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                      title="Permanently Delete Artwork"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. MOBILE 2-COLUMN GRID VIEW (shown when screen < 768px in table mode) */}
      {viewLayout === "table" && (
        <div className="md:hidden grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {filtered.length === 0 ? (
            <div className="col-span-full p-8 text-center text-zinc-500 text-xs bg-[#121319] rounded-2xl">
              No artworks found matching your filter criteria.
            </div>
          ) : (
            paginatedArtworks.map((art) => (
              <div key={art.id} className="p-3 bg-[#1a1b26] rounded-2xl space-y-2.5 shadow-md shadow-black/30 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black/40">
                    <ProgressiveImage
                      src={art.coverImageUrl}
                      alt={art.altText || art.title}
                      fill
                      optimizeWidth={280}
                      optimizeQuality={80}
                      sizes="180px"
                      className="object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span
                        className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          art.status === "published"
                            ? "bg-[#14231b] text-emerald-300"
                            : art.status === "sold"
                            ? "bg-[#251e16] text-[#d1a86e]"
                            : "bg-[#222432] text-zinc-300"
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono font-semibold text-[#d1a86e]">
                      {formatCurrency(art.price, art.currency)}
                    </div>
                  </div>
                  <div className="pt-2 space-y-0.5">
                    <span className="font-serif text-xs text-white font-medium block truncate">
                      {art.title}
                    </span>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {art.medium} ({art.year})
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-transparent">
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white">
                      <Link href={`/artwork/${art.slug}`} target="_blank" title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[#d1a86e] hover:text-[#e2c18d]">
                      <Link href={`/ar/${art.slug}`} target="_blank" title="AR">
                        <Sparkles className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-zinc-300 hover:text-white">
                      <Link href={`/admin/artworks/${art.id}`} title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setArtworkToDelete(art)}
                    className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination and Per-Page Control Bar - Solid Tier 2 Block */}
      {filtered.length > 0 && (
        <div className="p-5 bg-transparent rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
            <span className="text-[#d1a86e] font-semibold">{filtered.length}</span> artworks
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

      {/* 4. PERMANENT DELETE CONFIRMATION MODAL - Solid Block */}
      {artworkToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121319] rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2d1616] flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-white font-medium">
                  Permanently Delete Artwork?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This action cannot be undone. It will permanently remove{" "}
                  <span className="text-white font-semibold">&ldquo;{artworkToDelete.title}&rdquo;</span>,
                  along with its catalogue associations and spatial WebAR configuration.
                </p>
              </div>
            </div>

            {/* Artwork Preview Card */}
            <div className="p-3.5 rounded-2xl bg-[#1a1b26] flex items-center gap-3">
              <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0">
                <Image
                  src={artworkToDelete.coverImageUrl}
                  alt={artworkToDelete.title}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-serif text-white font-medium block truncate">
                  {artworkToDelete.title}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {formatCurrency(artworkToDelete.price, artworkToDelete.currency)} • {artworkToDelete.medium}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setArtworkToDelete(null)}
                disabled={isDeleting}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDeletePermanent(artworkToDelete)}
                disabled={isDeleting}
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
