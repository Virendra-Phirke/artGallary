import React from "react";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Library | Studio Administration",
};

export default function AdminMediaPage() {
  return <MediaLibraryClient />;
}
