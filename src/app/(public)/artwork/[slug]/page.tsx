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
    return { title: "Artwork Not Found | Seclusion Art Gallary" };
  }

  return {
    title: `${artwork.title} (${artwork.year}) | Vishal Patil`,
    description: `${artwork.title} by Vishal Patil. ${artwork.medium}, ${artwork.widthCm}x${artwork.heightCm} cm. Explore curatorial provenance and view in your space via WebAR.`,
    openGraph: {
      title: `${artwork.title} | Fine Art by Vishal Patil`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    image: artwork.coverImageUrl,
    description: artwork.description || artwork.longDescription,
    artMedium: artwork.medium,
    dateCreated: artwork.year?.toString(),
    width: {
      "@type": "Distance",
      name: `${artwork.widthCm} cm`,
    },
    height: {
      "@type": "Distance",
      name: `${artwork.heightCm} cm`,
    },
    ...(artwork.depthCm
      ? {
          depth: {
            "@type": "Distance",
            name: `${artwork.depthCm} cm`,
          },
        }
      : {}),
    creator: {
      "@type": "Person",
      name: "Vishal Patil",
      jobTitle: "Contemporary Master Painter",
      nationality: "French",
      birthDate: "1986",
      sameAs: "https://adagp.fr",
    },
    offers: {
      "@type": "Offer",
      price: artwork.price || 0,
      priceCurrency: artwork.currency || "USD",
      availability:
        artwork.status === "sold"
          ? "https://schema.org/Discontinued"
          : artwork.status === "reserved"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
      seller: {
        "@type": "ArtGallery",
        name: "Seclusion Art Gallary",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1800px] mx-auto px-3 sm:px-10 md:px-14 lg:px-16 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <ArtworkDetailClient artwork={artwork} relatedArtworks={related} />
      </div>
    </>
  );
}
