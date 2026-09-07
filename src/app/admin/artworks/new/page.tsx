import React from "react";
import { ArtworkFormClient } from "@/components/admin/ArtworkFormClient";
import { getAllCollectionsAdmin } from "@/db/repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Artwork | Studio CMS",
};

export default async function NewArtworkPage() {
  const collections = await getAllCollectionsAdmin();
  return <ArtworkFormClient isNew={true} collections={collections} />;
}
