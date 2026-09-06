import React from "react";
import { getAllHomepageSectionsAdmin } from "@/db/repository";
import { HomepageBuilderClient } from "@/components/admin/HomepageBuilderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homepage Builder | Studio Administration",
};

export default async function AdminHomepagePage() {
  const sections = await getAllHomepageSectionsAdmin();
  return <HomepageBuilderClient initialSections={sections} />;
}
