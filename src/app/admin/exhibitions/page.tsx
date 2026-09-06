import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllExhibitionsAdmin } from "@/db/repository";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Exhibitions CMS | Studio Administration",
};

export default async function AdminExhibitionsPage() {
  const exhibitions = await getAllExhibitionsAdmin();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Institutional Presence
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Exhibitions CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Curate solo and group exhibitions, institution dates, and exhibited artwork sets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exhibitions.map((exh) => (
          <div
            key={exh.id}
            className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4 shadow-xl"
          >
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
              <Image
                src={exh.coverImageUrl}
                alt={exh.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium ${
                    exh.status === "current"
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                      : "bg-amber-950/90 text-amber-300 border border-amber-800"
                  }`}
                >
                  {exh.status}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-white">{exh.title}</h2>
                <Link
                  href={`/exhibitions/${exh.slug}`}
                  target="_blank"
                  className="p-1 text-zinc-400 hover:text-white"
                  title="View exhibition catalog"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-xs text-[#d1a86e] font-medium mt-0.5">
                {exh.subtitle}
              </p>

              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                <MapPin className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>{exh.location}</span>
              </div>

              <p className="text-xs text-zinc-400 mt-3 line-clamp-2">
                {exh.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between text-xs text-zinc-500">
              <span>{exh.artworkSlugs.length} Featured Canvases</span>
              <span className="text-[11px]">
                {new Date(exh.startDate).toLocaleDateString()} — {new Date(exh.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
