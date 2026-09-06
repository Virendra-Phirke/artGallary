import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllCollectionsAdmin } from "@/db/repository";
import { FolderKanban, Plus, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Collections CMS | Studio Administration",
};

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsAdmin();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Thematic Series
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Collections CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize artworks into multi-year curated series with statements and exhibition essays.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4 shadow-xl"
          >
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
              <Image
                src={col.coverImageUrl}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                  {col.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-white">{col.title}</h2>
                <Link
                  href={`/collections/${col.slug}`}
                  target="_blank"
                  className="p-1 text-zinc-400 hover:text-white"
                  title="View collection page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-3">
                {col.curatorialStatement}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between text-xs text-zinc-500">
              <span>{col.artworkSlugs.length} Associated Works</span>
              <span className="font-mono text-[10px]">/{col.slug}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
