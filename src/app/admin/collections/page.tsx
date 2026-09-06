import React from "react";
import { getAllCollectionsAdmin, getAllArtworksAdmin } from "@/db/repository";
import { CollectionsManagerClient } from "@/components/admin/CollectionsManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections CMS | Studio Administration",
};

export default async function AdminCollectionsPage() {
  const [collections, artworks] = await Promise.all([
    getAllCollectionsAdmin(),
    getAllArtworksAdmin(),
  ]);

  return (
    <CollectionsManagerClient
      initialCollections={collections}
      allArtworks={artworks}
    />
  );
}
