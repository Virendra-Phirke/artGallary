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
} from "@/components/ui/pagination";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getPaginationRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

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
      {/* Header Plaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Artworks CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage inventory, publish new canvases, configure WebAR dimensions, and monitor readiness.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button asChild variant="outline" size="sm" className="border-[#262833] text-xs text-zinc-300 hover:text-white gap-1.5">
            <Link href="/admin/media">
              <Layers className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Media Library</span>
            </Link>
          </Button>

          <Button asChild className="gap-2 shadow-lg shadow-[#d1a86e]/10">
            <Link href="/admin/artworks/new">
              <Plus className="w-4 h-4" />
              <span>New Artwork</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar with View Mode Toggle */}
      <div className="bg-[#14151a] border border-[#262833] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Filter by title, slug, or medium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
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
                <Button
                  key={st}
                  variant={statusFilter === st ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] h-7 px-2.5 ${
                    statusFilter === st
                      ? "text-[#d1a86e] border-[#d1a86e]/40 font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {st}
                </Button>
              )
            )}
          </div>

          {/* Table vs Grid View Toggle */}
          <div className="flex items-center p-1 bg-[#1a1c23] border border-[#262833] rounded-xl ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => setViewLayout("table")}
              className={`p-1.5 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
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
              className={`p-1.5 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
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

      {/* 1. TABLE VIEW (Default Desktop/Tablet) */}
      {viewLayout === "table" && (
        <div className="hidden md:block bg-[#14151a] border border-[#262833] rounded-2xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Artwork</TableHead>
                <TableHead className="min-w-[160px]">Medium &amp; Year</TableHead>
                <TableHead className="min-w-[140px]">Dimensions</TableHead>
                <TableHead className="min-w-[100px]">Price</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[110px]">AR Readiness</TableHead>
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
                  <TableRow key={art.id} className="group">
                    {/* Artwork Image & Title */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-black/40 border border-[#262833] shrink-0">
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
                          <span className="font-serif text-sm text-white font-medium block truncate max-w-[180px]">
                            {art.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono block truncate">
                            /{art.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Medium & Year */}
                    <TableCell>
                      <span className="text-xs text-zinc-300 block truncate max-w-[160px]">
                        {art.medium}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {art.year}
                      </span>
                    </TableCell>

                    {/* Dimensions */}
                    <TableCell>
                      <span className="text-xs text-zinc-300 font-mono block">
                        {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="text-xs font-semibold text-[#d1a86e] font-mono">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#14151a] border border-[#262833] rounded-2xl">
              No artworks found matching your filter criteria.
            </div>
          ) : (
            paginatedArtworks.map((art) => (
              <div
                key={art.id}
                className="group rounded-2xl border border-[#262833] bg-[#14151a] overflow-hidden hover:border-[#d1a86e]/40 transition-all flex flex-col shadow-lg"
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
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="focus:outline-none">
                          <Badge
                            variant={statusVariantMap[art.status] || "secondary"}
                            className="text-[9px] font-mono font-bold shadow-md cursor-pointer"
                          >
                            <span>{art.status}</span>
                            <ChevronDown className="w-2.5 h-2.5 ml-1 opacity-70" />
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
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {art.arConfig?.arReadinessStatus === "ready" ? (
                      <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 font-mono shadow-md">
                        AR READY
                      </span>
                    ) : (
                      <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 font-mono shadow-md">
                        AR ATTENTION
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#d1a86e] font-mono shadow-md">
                    {formatCurrency(art.price, art.currency)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-base text-white font-medium truncate group-hover:text-[#d1a86e] transition-colors">
                        {art.title}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {art.year}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {art.medium}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                        className="h-8 w-8 text-[#d1a86e] hover:text-[#e2c18d] hover:bg-zinc-800"
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
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                      className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40"
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

      {/* 3. MOBILE CARD LIST VIEW (shown when screen < 768px in table mode) */}
      {viewLayout === "table" && (
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-zinc-500 text-xs">
              No artworks found matching your filter criteria.
            </Card>
          ) : (
            paginatedArtworks.map((art) => (
              <Card key={art.id} className="p-4 bg-[#14151a] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-14 rounded-lg overflow-hidden bg-black/40 border border-[#262833] shrink-0">
                    <ProgressiveImage
                      src={art.coverImageUrl}
                      alt={art.altText || art.title}
                      fill
                      optimizeWidth={140}
                      optimizeQuality={75}
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span className="font-serif text-sm text-white font-medium block truncate">
                      {art.title}
                    </span>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {art.medium} ({art.year})
                    </p>
                    <p className="text-xs font-semibold text-[#d1a86e] font-mono">
                      {formatCurrency(art.price, art.currency)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1f212b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 focus:outline-none"
                        >
                          <Badge
                            variant={statusVariantMap[art.status] || "secondary"}
                            className="cursor-pointer text-[10px] font-mono font-bold"
                          >
                            <span>{art.status}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
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

                    {art.arConfig?.arReadinessStatus === "ready" ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1.5">
                        AR READY
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                        ATTENTION
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                      <Link href={`/artwork/${art.slug}`} target="_blank" title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-[#d1a86e] hover:text-[#e2c18d]">
                      <Link href={`/ar/${art.slug}`} target="_blank" title="AR">
                        <Sparkles className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                      <Link href={`/admin/artworks/${art.id}`}>
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setArtworkToDelete(art)}
                      className="h-8 w-8 text-zinc-500 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination and Per-Page Control Bar */}
      {totalPages > 1 && (
        <div className="p-4 bg-[#14151a] border border-[#262833] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
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

      {/* 4. PERMANENT DELETE CONFIRMATION MODAL */}
      {artworkToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121317] border border-[#262833] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
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
            <div className="p-3 rounded-xl bg-[#161820] border border-[#262833] flex items-center gap-3">
              <div className="relative w-14 h-12 rounded-lg overflow-hidden bg-black/40 border border-[#262833] shrink-0">
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
