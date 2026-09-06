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
  QrCode,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";

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
    newStatus: "draft" | "published" | "reserved" | "sold"
  ) => {
    try {
      const res = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: art.id, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setArtworks((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, status: newStatus } : a))
        );
      }
    } catch {}
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

        <Link
          href="/admin/artworks/new"
          className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Artwork</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#14151a] border border-[#262833] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by title, slug, or medium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            Status:
          </span>
          {["all", "published", "draft", "reserved", "sold", "archived"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === st
                    ? "bg-[#262833] text-[#d1a86e] font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14151a] border border-[#262833] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#101116] border-b border-[#262833] text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              <tr>
                <th className="p-4">Artwork</th>
                <th className="p-4">Medium &amp; Year</th>
                <th className="p-4">Dimensions</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">AR Readiness</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f212b]">
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-[#1a1c23]/60 transition-colors">
                  {/* Artwork Image & Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-10 rounded overflow-hidden bg-black/40 border border-[#262833] shrink-0">
                        <Image
                          src={art.coverImageUrl}
                          alt={art.altText}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-serif text-sm text-white font-medium block">
                          {art.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          /{art.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Medium & Year */}
                  <td className="p-4">
                    <span className="text-zinc-300 block max-w-xs truncate">
                      {art.medium}
                    </span>
                    <span className="text-[10px] text-zinc-500">{art.year}</span>
                  </td>

                  {/* Dimensions */}
                  <td className="p-4 font-mono text-[11px]">
                    {formatDimensions(art.widthCm, art.heightCm, art.depthCm)}
                  </td>

                  {/* Price */}
                  <td className="p-4 text-[#d1a86e] font-medium">
                    {formatCurrency(art.price, art.currency)}
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-4">
                    <select
                      value={art.status}
                      onChange={(e: any) =>
                        handleQuickStatusChange(art, e.target.value)
                      }
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium border cursor-pointer focus:outline-none ${
                        art.status === "published"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                          : art.status === "draft"
                          ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                          : art.status === "reserved"
                          ? "bg-amber-950/80 text-amber-300 border-amber-800"
                          : "bg-red-950/60 text-red-300 border-red-800"
                      }`}
                    >
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                      <option value="reserved">reserved</option>
                      <option value="sold">sold</option>
                      <option value="archived">archived</option>
                    </select>
                  </td>

                  {/* AR Readiness */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {art.arConfig.arReadinessStatus === "ready" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            Ready
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                            Calibrate
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/artwork/${art.slug}`}
                        target="_blank"
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        title="View on Public Gallery"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/ar/${art.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
                        title="Launch AR Studio"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/artworks/${art.id}`}
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        title="Edit Artwork Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleArchive(art.id, art.title)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Archive Artwork"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
