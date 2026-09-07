import React from "react";
import { getSession } from "@/lib/auth/auth";
import { getInquiries } from "@/db/repository";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?redirect=/admin/dashboard");
  }

  const inquiries = await getInquiries().catch(() => []);
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <AdminSidebar
      user={{
        name: session.user.name || "Curator",
        email: session.user.email || "curator@atelier.art",
        role: session.user.role,
      }}
      pendingInquiriesCount={pendingInquiriesCount}
    >
      {children}
    </AdminSidebar>
  );
}
