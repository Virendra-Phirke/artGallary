import React from "react";
import { getSession } from "@/lib/auth/auth";
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

  return (
    <AdminSidebar
      user={{
        name: session.user.name || "Curator",
        email: session.user.email || "curator@atelier.art",
        role: session.user.role,
      }}
    >
      {children}
    </AdminSidebar>
  );
}
