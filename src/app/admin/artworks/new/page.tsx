import React from "react";
import { ArtworkFormClient } from "@/components/admin/ArtworkFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Artwork | Studio CMS",
};

export default function NewArtworkPage() {
  return <ArtworkFormClient isNew={true} />;
}
