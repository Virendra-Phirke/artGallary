import React from "react";
import { getAllArtworksAdmin } from "@/db/repository";
import { QrCodesClient } from "@/components/admin/QrCodesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Codes & Exhibition Tags | Studio Administration",
};

export default async function AdminQrCodesPage() {
  const artworks = await getAllArtworksAdmin();
  return <QrCodesClient artworks={artworks} />;
}
