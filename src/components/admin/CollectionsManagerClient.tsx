"use client";

import React, { useState } from "react";
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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Thematic Series
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Collections CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize artworks into curated series with statements and exhibition essays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-[#d1a86e]/40 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs gap-1.5">
            <Link href="/admin/settings?tab=collections">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Edit Page Header &amp; Intro</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
            <Link href="/collections" target="_blank">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Storefront</span>
            </Link>
          </Button>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </Button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">No collections yet</p>
          <Button onClick={openNew} variant="secondary" className="gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            <span>Create your first collection</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col) => (
            <Card key={col.id} className="overflow-hidden">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] bg-black/40 border-b border-[#1f212b]">
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
                  <Badge variant={col.isPublished ? "success" : "secondary"}>
                    {col.isPublished ? "Published" : "Draft"}
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
                    title="View collection page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                {col.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{col.description}</p>
                )}
                {col.curatorialStatement && (
                  <p className="text-xs text-zinc-500 italic line-clamp-2">
                    &ldquo;{col.curatorialStatement}&rdquo;
                  </p>
                )}

                <Separator />

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{col.artworkSlugs.length} associated works</span>
                  <span className="font-mono text-[10px]">/{col.slug}</span>
                </div>
              </div>
            </Card>
          ))}
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
                className="bg-[#1a1c23] border-[#262833] text-white text-xs placeholder:text-zinc-600 focus:border-[#d1a86e] focus:ring-0 resize-none"
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
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-[#1a1c23] border border-[#262833] rounded-lg">
                  {allArtworks.map((art) => (
                    <label
                      key={art.id}
                      className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none p-1 rounded hover:bg-[#22242d]"
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
                        className="w-3.5 h-3.5 rounded border-[#262833] bg-[#14151a] text-[#d1a86e] focus:ring-[#d1a86e]"
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
                className="w-4 h-4 rounded border-[#262833] bg-[#1a1c23] text-[#d1a86e] focus:ring-[#d1a86e]"
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
