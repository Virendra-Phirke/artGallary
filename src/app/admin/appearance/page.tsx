import React from "react";
import { AppearanceClient } from "@/components/admin/AppearanceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearance & Theme | Studio Administration",
};

export default function AdminAppearancePage() {
  return <AppearanceClient />;
}
