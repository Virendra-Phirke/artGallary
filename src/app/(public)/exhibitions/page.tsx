import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { getExhibitions } from "@/db/repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exhibitions & Museum Shows | Elena Vance",
  description:
    "Current, upcoming, and archival solo and group exhibitions of Elena Vance's contemporary oil and mineral works.",
};

export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      <div className="max-w-2xl space-y-3">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Public &amp; Museum History
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">
          Exhibitions
        </h1>
        <p className="text-sm text-[#a6aabf] leading-relaxed">
          Chronological record of curated solo exhibitions, biennale participations, and institutional showcases across Paris, New York, London, and Tokyo.
        </p>
      </div>

      <div className="space-y-12">
        {exhibitions.map((exh) => (
          <div
            key={exh.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-2xl bg-[#14151a] border border-[#262833]"
          >
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
                <Image
                  src={exh.coverImageUrl}
                  alt={exh.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium ${
                    exh.status === "current"
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800/80"
                      : exh.status === "upcoming"
                      ? "bg-amber-950/90 text-amber-300 border border-amber-800/80"
                      : "bg-zinc-900/90 text-zinc-400 border border-zinc-700/80"
                  }`}
                >
                  {exh.status}
                </span>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  {new Date(exh.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  —{" "}
                  {new Date(exh.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="font-serif text-3xl text-white">{exh.title}</h2>
              <p className="text-xs text-[#d1a86e] font-medium">{exh.subtitle}</p>

              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <MapPin className="w-4 h-4 text-[#d1a86e]" />
                <span>{exh.location}</span>
              </div>

              <p className="text-sm text-[#a6aabf] leading-relaxed">
                {exh.description}
              </p>

              <div className="pt-2">
                <Link
                  href={`/exhibitions/${exh.slug}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d1a86e] hover:text-[#e2c18d] font-semibold transition-colors"
                >
                  <span>Exhibition Dossier &amp; Canvases</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
