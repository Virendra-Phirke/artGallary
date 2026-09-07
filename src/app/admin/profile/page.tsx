import React from "react";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/admin/ProfileClient";

export const metadata = {
  title: "Admin Profile & Credentials | L'Atelier Studio",
  description: "Manage personal administrator authentication credentials and security settings.",
};

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?redirect=/admin/profile");
  }

  return (
    <ProfileClient
      initialUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    />
  );
}
