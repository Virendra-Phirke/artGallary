import React from "react";
import { getAllExhibitionsAdmin, getAllArtworksAdmin } from "@/db/repository";
import { ExhibitionsManagerClient } from "@/components/admin/ExhibitionsManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exhibitions CMS | Studio Administration",
};

export default async function AdminExhibitionsPage() {
  const [exhibitions, artworks] = await Promise.all([
    getAllExhibitionsAdmin(),
    getAllArtworksAdmin(),
  ]);

  return (
    <ExhibitionsManagerClient
      initialExhibitions={exhibitions}
      allArtworks={artworks}
    />
  );
}
