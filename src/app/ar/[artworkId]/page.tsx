import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/db/repository";
import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";
import type { Metadata } from "next";

const ArStudioViewer = dynamic(
  () => import("@/components/ar/ArStudioViewer").then((mod) => mod.ArStudioViewer),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-16 h-16 rounded-2xl bg-[#14151a] border border-[#d1a86e]/30 flex items-center justify-center relative shadow-2xl">
          <Sparkles className="w-7 h-7 text-[#d1a86e] animate-pulse" />
          <Loader2 className="w-12 h-12 text-[#d1a86e]/40 animate-spin absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-serif text-lg text-white font-medium">Initializing Spatial AR Engine</p>
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Calibrating WebXR & Virtual Wall</p>
        </div>
      </div>
    ),
  }
);

interface ArPageProps {
  params: Promise<{ artworkId: string }>;
}

export async function generateMetadata({ params }: ArPageProps): Promise<Metadata> {
  const { artworkId } = await params;
  const artwork = await getArtworkById(artworkId);

  if (!artwork) {
    return { title: "AR Studio | Artwork Not Found" };
  }

  return {
    title: `View "${artwork.title}" in Your Space (WebAR) | L'Atelier Lumineux`,
    description: `Experience Elena Vance's painting "${artwork.title}" calibrated to exact 1:1 scale on your wall via WebAR and interactive 3D virtual preview.`,
  };
}

export default async function ArPage({ params }: ArPageProps) {
  const { artworkId } = await params;
  const artwork = await getArtworkById(artworkId);

  if (!artwork) {
    notFound();
  }

  return <ArStudioViewer artwork={artwork} />;
}
