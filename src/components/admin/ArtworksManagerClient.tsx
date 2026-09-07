"use client";

import React, { useState } from "react";
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

interface ArtworksManagerClientProps {
  initialArtworks: MockArtwork[];
}

export function ArtworksManagerClient({
  initialArtworks,
}: ArtworksManagerClientProps) {
  const [artworks, setArtworks] = useState<MockArtwork[]>(initialArtworks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = artworks.filter((art) => {
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

  const handleQuickStatusChange = async (
    art: MockArtwork,
    newStatus: "draft" | "published" | "reserved" | "sold" | "archived"
  ) => {
    try {
      const res = await fetch("/api/admin/artworks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: art.id, status: newStatus }),
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

        <Button asChild className="gap-2 self-start sm:self-auto shadow-lg shadow-[#d1a86e]/10">
          <Link href="/admin/artworks/new">
            <Plus className="w-4 h-4" />
            <span>New Artwork</span>
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
      </div>

      {/* Desktop / Tablet Table View (hidden on mobile) */}
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
              filtered.map((art) => (
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
                    <span className="text-zinc-300 block max-w-[160px] truncate text-xs">
                      {art.medium}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{art.year}</span>
                  </TableCell>

                  {/* Dimensions */}
                  <TableCell className="font-mono text-[11px] text-zinc-300">
                    {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-[#d1a86e] font-semibold text-xs font-mono">
                    {formatCurrency(art.price, art.currency)}
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 focus:outline-none"
                        >
                          <Badge
                            variant={statusVariantMap[art.status] || "secondary"}
                            className="cursor-pointer hover:opacity-90 gap-1 text-[10px] font-mono font-bold"
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
                  </TableCell>

                  {/* AR Readiness */}
                  <TableCell>
                    {art.arConfig?.arReadinessStatus === "ready" ? (
                      <Badge variant="success" className="gap-1 text-[9px]">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>READY</span>
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1 text-[9px]">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>NEEDS ATTENTION</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions Column (Sticky on right) */}
                  <TableCell className="text-right sticky right-0 bg-[#14151a] group-hover:bg-[#1a1c23]/90 transition-colors">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/artwork/${art.slug}`}
                        target="_blank"
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#262833] rounded-lg transition-colors"
                        title="View on Public Gallery"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/ar/${art.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#d1a86e] hover:text-[#e2c18d] hover:bg-[#262833] rounded-lg transition-colors"
                        title="Launch AR Studio"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/artworks/${art.id}`}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#262833] rounded-lg transition-colors"
                        title="Edit Artwork Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

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
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          >
                            <Archive className="w-3.5 h-3.5 mr-1" />
                            <span>Archive Canvas</span>
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

      {/* Mobile Card List View (visible only on small screens < 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-zinc-500 text-xs">
            No artworks found matching your filter criteria.
          </Card>
        ) : (
          filtered.map((art) => (
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
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
