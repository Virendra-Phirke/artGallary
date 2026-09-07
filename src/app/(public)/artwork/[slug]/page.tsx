import React from "react";
import { notFound } from "next/navigation";
import { getArtworkBySlug, getArtworks } from "@/db/repository";
import { ArtworkDetailClient } from "@/components/artwork/ArtworkDetailClient";
import type { Metadata } from "next";

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return { title: "Artwork Not Found | L'Atelier Lumineux" };
  }

  return {
    title: `${artwork.title} (${artwork.year}) | Elena Vance`,
    description: `${artwork.title} by Elena Vance. ${artwork.medium}, ${artwork.widthCm}x${artwork.heightCm} cm. Explore curatorial provenance and view in your space via WebAR.`,
    openGraph: {
      title: `${artwork.title} | Fine Art by Elena Vance`,
      description: artwork.description,
      images: [{ url: artwork.coverImageUrl, width: 1200, height: 900, alt: artwork.altText }],
    },
  };
}

export const revalidate = 3600; // Cache ISR for 1 hour with instant write-invalidation

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  // Find related artworks in the same collection
  const allArtworks = await getArtworks();
  const related = allArtworks
    .filter((a) => a.collectionSlug === artwork.collectionSlug && a.id !== artwork.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
      <ArtworkDetailClient artwork={artwork} relatedArtworks={related} />
    </div>
  );
}
