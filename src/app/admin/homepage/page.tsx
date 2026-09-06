import React from "react";
import {
  getAllHomepageSectionsAdmin,
  getArtworks,
  getCollections,
  getExhibitions,
} from "@/db/repository";
import { HomepageBuilderClient } from "@/components/admin/HomepageBuilderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homepage Builder | Studio Administration",
};

export default async function AdminHomepagePage() {
  const [sections, artworks, collections, exhibitions] = await Promise.all([
    getAllHomepageSectionsAdmin(),
    getArtworks(),
    getCollections(),
    getExhibitions(),
  ]);

  return (
    <HomepageBuilderClient
      initialSections={sections}
      artworks={artworks}
      collections={collections}
      exhibitions={exhibitions}
    />
  );
}

