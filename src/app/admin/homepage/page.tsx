import React, { Suspense } from "react";
import {
  getAllHomepageSectionsAdmin,
  getArtworks,
  getCollections,
  getExhibitions,
  getSiteSettings,
} from "@/db/repository";
import { HomepageBuilderClient } from "@/components/admin/HomepageBuilderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storefront Studio & Page Builder | Studio Administration",
};

interface AdminHomepagePageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function AdminHomepagePage({ searchParams }: AdminHomepagePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const [sections, artworks, collections, exhibitions, siteSettings] = await Promise.all([
    getAllHomepageSectionsAdmin(),
    getArtworks(),
    getCollections(),
    getExhibitions(),
    getSiteSettings(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading Studio...</div>}>
      <HomepageBuilderClient
        initialSections={sections}
        artworks={artworks}
        collections={collections}
        exhibitions={exhibitions}
        initialSiteSettings={siteSettings}
        initialPage={(resolvedParams.page as any) || "home"}
      />
    </Suspense>
  );
}

