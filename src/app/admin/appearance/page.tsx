import React from "react";
import { getThemeSettings } from "@/db/repository";
import { AppearanceClient } from "@/components/admin/AppearanceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearance & Theme | Studio Administration",
};

export default async function AdminAppearancePage() {
  const theme = await getThemeSettings();
  return <AppearanceClient initialTheme={theme} />;
}
