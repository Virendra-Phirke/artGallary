import React from "react";
import { getAllArtworksAdmin } from "@/db/repository";
import { ArtworksManagerClient } from "@/components/admin/ArtworksManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artworks CMS | Studio Administration",
};

export default async function AdminArtworksPage() {
  const artworks = await getAllArtworksAdmin();
  return <ArtworksManagerClient initialArtworks={artworks} />;
}
