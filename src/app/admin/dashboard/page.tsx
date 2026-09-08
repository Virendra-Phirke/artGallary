import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAllArtworksAdmin,
  getInquiries,
  getActivityLogs,
} from "@/db/repository";
import {
  Palette,
  Eye,
  Mail,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Server,
  HardDrive,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [artworks, inquiries, activityLogs] = await Promise.all([
    getAllArtworksAdmin(),
    getInquiries(),
    getActivityLogs(),
  ]);

  const totalArtworks = artworks.length;
  const publishedArtworks = artworks.filter((a) => a.status === "published").length;
  const draftArtworks = artworks.filter((a) => a.status === "draft").length;
  const soldArtworks = artworks.filter((a) => a.status === "sold").length;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;

  // Attention Required Audit
  const missingAltText = artworks.filter((a) => !a.altText || a.altText.trim().length < 5);
  const missingDimensions = artworks.filter((a) => !a.widthCm || !a.heightCm);
  const arIncomplete = artworks.filter(
    (a) => a.arConfig.arReadinessStatus === "needs_attention"
  );
  const unpublishedDrafts = artworks.filter((a) => a.status === "draft");

  const totalWarnings =
    missingAltText.length +
    missingDimensions.length +
    arIncomplete.length +
    newInquiries;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full">
      {/* Page Title & Quick Actions - Compact Solid Master Block */}
      <div className="bg-[#121319] p-3.5 sm:p-5 rounded-2xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Studio Command Center
          </span>
          <h1 className="font-serif text-xl sm:text-2xl text-white mt-0.5">Curator Dashboard</h1>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Real-time catalog readiness, collector inquiries ledger, and studio operational telemetry.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/gallery"
            target="_blank"
            className="flex items-center justify-center gap-1.5 bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors text-center"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span className="truncate">Live Store</span>
          </Link>
          <Link
            href="/admin/artworks/new"
            className="flex items-center justify-center gap-1.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-md shadow-[#d1a86e]/20 transition-colors text-center"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="truncate">New Art</span>
          </Link>
          <Link
            href="/admin/ar-studio"
            className="flex items-center justify-center gap-1.5 bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span className="truncate">AR Studio</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row: 2 Columns on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121319] shadow-xl shadow-black/40 space-y-1 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate">
              Total Artworks
            </span>
            <div className="w-6 h-6 rounded-full bg-[#1a1b26] flex items-center justify-center shrink-0">
              <Palette className="w-3 h-3 text-zinc-400" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl text-white font-medium">{totalArtworks}</div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 block truncate">
            {publishedArtworks} pub • {draftArtworks} drafts
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121319] shadow-xl shadow-black/40 space-y-1 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate">
              Collector Inquiries
            </span>
            <div className="w-6 h-6 rounded-full bg-[#251e16] flex items-center justify-center shrink-0">
              <Mail className="w-3 h-3 text-[#d1a86e]" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl text-[#d1a86e] font-medium">{inquiries.length}</div>
          <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium block truncate">
            {newInquiries} pending replies
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121319] shadow-xl shadow-black/40 space-y-1 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate">
              Spatial AR
            </span>
            <div className="w-6 h-6 rounded-full bg-[#16252b] flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl text-white font-medium">1:1 Scale</div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 block truncate">WebXR & Three.js</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121319] shadow-xl shadow-black/40 space-y-1 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate">
              Acquisitions
            </span>
            <div className="w-6 h-6 rounded-full bg-[#262016] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl text-white font-medium">{soldArtworks}</div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 block truncate">Canvases acquired</span>
        </div>
      </div>

      {/* Readiness & Attention Required: 2 Columns on Mobile, 4 Columns on Desktop */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4 sm:space-y-6 w-full">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#2a1d14] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <h2 className="font-serif text-base sm:text-xl text-white truncate">
              Readiness & Attention ({totalWarnings})
            </h2>
          </div>
          <Link
            href="/admin/accessibility"
            className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full transition-colors font-medium shrink-0"
          >
            Audit WCAG →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          {/* Inquiry alert */}
          {newInquiries > 0 ? (
            <Link
              href="/admin/inquiries"
              className="p-3 sm:p-4 bg-[#2a1d14] hover:bg-[#342419] rounded-xl sm:rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div className="min-w-0 flex-1 pr-1">
                <span className="text-amber-300 font-semibold text-[11px] sm:text-xs block truncate group-hover:text-amber-200">
                  {newInquiries} Unreplied
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 mt-0.5 block truncate">
                  Collectors waiting
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-300 transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="p-3 sm:p-4 bg-[#14231b] rounded-xl sm:rounded-2xl flex items-center gap-2 text-[11px] sm:text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Inquiries clean</span>
            </div>
          )}

          {/* Alt text check */}
          {missingAltText.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-3 sm:p-4 bg-[#2d1616] hover:bg-[#3a1d1d] rounded-xl sm:rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div className="min-w-0 flex-1 pr-1">
                <span className="text-red-300 font-semibold text-[11px] sm:text-xs block truncate group-hover:text-red-200">
                  {missingAltText.length} No Alt Text
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 mt-0.5 block truncate">
                  Accessibility risk
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-300 transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="p-3 sm:p-4 bg-[#14231b] rounded-xl sm:rounded-2xl flex items-center gap-2 text-[11px] sm:text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Alt text complete</span>
            </div>
          )}

          {/* AR readiness check */}
          {arIncomplete.length > 0 ? (
            <Link
              href="/admin/ar-studio"
              className="p-3 sm:p-4 bg-[#2a1d14] hover:bg-[#342419] rounded-xl sm:rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div className="min-w-0 flex-1 pr-1">
                <span className="text-amber-300 font-semibold text-[11px] sm:text-xs block truncate group-hover:text-amber-200">
                  {arIncomplete.length} AR Scale
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 mt-0.5 block truncate">
                  Missing dimensions
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-300 transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="p-3 sm:p-4 bg-[#14231b] rounded-xl sm:rounded-2xl flex items-center gap-2 text-[11px] sm:text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">AR calibrated</span>
            </div>
          )}

          {/* Unpublished drafts */}
          {unpublishedDrafts.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-3 sm:p-4 bg-[#1a1b26] hover:bg-[#222432] rounded-xl sm:rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div className="min-w-0 flex-1 pr-1">
                <span className="text-zinc-200 font-semibold text-[11px] sm:text-xs block truncate group-hover:text-white">
                  {unpublishedDrafts.length} Drafts
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 mt-0.5 block truncate">
                  Pending publishing
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="p-3 sm:p-4 bg-[#1a1b26] rounded-xl sm:rounded-2xl flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Catalog current</span>
            </div>
          )}
        </div>
      </div>

      {/* Executive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start w-full">
        {/* Column 1 (5 Cols): Recent Collector Inquiries */}
        <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#251e16] flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e]" />
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-white">Recent Inquiries</h2>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-2.5 sm:px-3 py-1 rounded-full transition-colors font-medium"
            >
              All ({inquiries.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {inquiries.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No collector inquiries received yet.</p>
            ) : (
              inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  className="p-3 sm:p-4 bg-[#1a1b26] rounded-xl sm:rounded-2xl space-y-1.5 hover:bg-[#202230] transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] sm:text-[9px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded-full ${
                          inq.status === "new"
                            ? "bg-[#2a1d14] text-amber-300"
                            : inq.status === "read"
                            ? "bg-[#222432] text-zinc-300"
                            : "bg-[#14231b] text-emerald-300"
                        }`}
                      >
                        {inq.status}
                      </span>
                      <span className="text-xs text-white font-medium truncate max-w-[140px]">
                        {inq.name}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#a6aabf] line-clamp-2 leading-relaxed bg-[#121319] p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-inner">
                    {inq.message}
                  </p>
                  {inq.email && (
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 block truncate font-mono pt-0.5">
                      {inq.email}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2 (4 Cols): Curated Catalog Highlights */}
        <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#251e16] flex items-center justify-center shrink-0">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e]" />
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-white">Catalog Highlights</h2>
            </div>
            <Link
              href="/admin/artworks"
              className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-2.5 sm:px-3 py-1 rounded-full transition-colors font-medium"
            >
              All ({artworks.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {artworks.slice(0, 4).map((art) => (
              <Link
                key={art.id}
                href={`/admin/artworks/${art.id}`}
                className="p-2.5 sm:p-3 bg-[#1a1b26] rounded-xl sm:rounded-2xl flex items-center gap-3 hover:bg-[#202230] transition-colors group shadow-sm"
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-black/40 shrink-0">
                  {art.coverImageUrl ? (
                    <Image
                      src={art.coverImageUrl}
                      alt={art.title}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Palette className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-medium text-white truncate group-hover:text-[#d1a86e] transition-colors">
                      {art.title}
                    </h3>
                    <span
                      className={`text-[8px] sm:text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                        art.status === "published"
                          ? "bg-[#14231b] text-emerald-300"
                          : art.status === "sold"
                          ? "bg-[#251e16] text-[#d1a86e]"
                          : "bg-[#222432] text-zinc-400"
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                    <span className="truncate">{art.medium} ({art.year})</span>
                    <span className="font-mono text-[#d1a86e] font-semibold shrink-0 ml-1.5">
                      {formatCurrency(art.price, art.currency)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3 (3 Cols): Studio Infrastructure & Live Activity */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Infrastructure Health Status - 3 Columns on Mobile for maximum space efficiency! */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                System Telemetry
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-[#14231b] px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-2 text-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1a1b26] shadow-sm gap-1">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">Neon DB</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400">PostgreSQL</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1a1b26] shadow-sm gap-1">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">R2 Storage</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400">Edge CDN</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#1a1b26] shadow-sm gap-1">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                  <span className="text-[11px] font-medium truncate">WebXR AR</span>
                </div>
                <span className="text-[9px] font-mono text-[#d1a86e]">Three.js</span>
              </div>
            </div>
          </div>

          {/* Activity Log Trail */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Activity Trail
              </span>
              <Link
                href="/admin/activity"
                className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-2 py-0.5 rounded-full transition-colors font-medium"
              >
                Log
              </Link>
            </div>

            <div className="space-y-2">
              {activityLogs.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 sm:p-3 bg-[#1a1b26] rounded-xl sm:rounded-2xl text-xs space-y-0.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#d1a86e] truncate max-w-[120px]">
                      {act.action}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[10px] sm:text-[11px] line-clamp-1">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
