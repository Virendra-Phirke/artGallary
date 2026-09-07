import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-10 max-w-7xl">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Studio Command Center
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="gap-2">
            <Link href="/admin/artworks/new">
              <Palette className="w-3.5 h-3.5" />
              <span>New Artwork</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link href="/admin/ar-studio">
              <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>AR Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Card className="p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Total Artworks
          </span>
          <div className="font-serif text-3xl text-white">{totalArtworks}</div>
          <span className="text-xs text-zinc-400">
            {publishedArtworks} published • {draftArtworks} drafts
          </span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Collector Inquiries
          </span>
          <div className="font-serif text-3xl text-[#d1a86e]">{inquiries.length}</div>
          <span className="text-xs text-emerald-400 font-medium">
            {newInquiries} pending reply
          </span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Spatial AR Sessions
          </span>
          <div className="font-serif text-3xl text-white">—</div>
          <span className="text-xs text-zinc-400">Analytics tracking active</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Acquisitions / Sold
          </span>
          <div className="font-serif text-3xl text-white">{soldArtworks}</div>
          <span className="text-xs text-zinc-400">Private collections</span>
        </Card>
      </div>

      {/* Attention Required Panel */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f212b] pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl text-white">
              Attention Required ({totalWarnings})
            </h2>
          </div>
          <Link
            href="/admin/accessibility"
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
          >
            Audit WCAG Score
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newInquiries > 0 && (
            <Link
              href="/admin/inquiries"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-amber-900/40 rounded-xl transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-amber-300 font-semibold text-xs block">
                  {newInquiries} Unreplied Inquiry
                </span>
                <span className="text-[11px] text-zinc-400">
                  Prospective collectors waiting for reply
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          )}

          {missingAltText.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-red-900/40 rounded-xl transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-red-300 font-semibold text-xs block">
                  {missingAltText.length} Missing Alt Text
                </span>
                <span className="text-[11px] text-zinc-400">
                  Accessibility requirement for screen readers
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>All artworks have descriptive alt text</span>
            </div>
          )}

          {unpublishedDrafts.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-[#262833] rounded-xl transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-zinc-200 font-semibold text-xs block">
                  {unpublishedDrafts.length} Unpublished Drafts
                </span>
                <span className="text-[11px] text-zinc-400">
                  Awaiting publication validation
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Catalog current with no pending drafts</span>
            </div>
          )}
        </div>
      </Card>

      {/* Two Column Layout: Recent Inquiries & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Inquiries (7 Cols) */}
        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f212b] pb-3">
            <h2 className="font-serif text-xl text-white">Recent Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
            >
              View All ({inquiries.length})
            </Link>
          </div>

          <div className="space-y-3">
            {inquiries.slice(0, 4).map((inq) => (
              <div
                key={inq.id}
                className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        inq.status === "new"
                          ? "warning"
                          : inq.status === "read"
                          ? "secondary"
                          : "success"
                      }
                    >
                      {inq.status}
                    </Badge>
                    <span className="text-xs text-white font-medium">
                      {inq.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[#a6aabf] line-clamp-2">
                  {inq.message}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Logs (5 Cols) */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f212b] pb-3">
            <h2 className="font-serif text-xl text-white">Activity Trail</h2>
            <Link
              href="/admin/activity"
              className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-3 bg-[#1a1c23] border border-[#262833] rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#d1a86e]">
                    {act.action}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-zinc-300">{act.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
