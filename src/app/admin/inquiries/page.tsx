import React from "react";
import { getInquiries } from "@/db/repository";
import { InquiriesManagerClient } from "@/components/admin/InquiriesManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquiries Ledger | Studio Administration",
};

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();
  return <InquiriesManagerClient initialInquiries={inquiries} />;
}
