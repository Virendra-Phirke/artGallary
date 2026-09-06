import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/db/repository";
import { ArStudioViewer } from "@/components/ar/ArStudioViewer";
import type { Metadata } from "next";

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
