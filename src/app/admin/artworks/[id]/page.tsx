import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById, getAllCollectionsAdmin } from "@/db/repository";
import { ArtworkFormClient } from "@/components/admin/ArtworkFormClient";
import type { Metadata } from "next";

interface EditArtworkPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditArtworkPageProps): Promise<Metadata> {
  const { id } = await params;
  const artwork = await getArtworkById(id);
  return {
    title: artwork ? `Edit: ${artwork.title} | Studio CMS` : "Edit Artwork",
  };
}

export default async function EditArtworkPage({
  params,
}: EditArtworkPageProps) {
  const { id } = await params;
  const [artwork, collections] = await Promise.all([
    getArtworkById(id),
    getAllCollectionsAdmin(),
  ]);

  if (!artwork) {
    notFound();
  }

  return <ArtworkFormClient initialArtwork={artwork} isNew={false} collections={collections} />;
}
