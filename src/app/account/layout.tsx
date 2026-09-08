import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getInquiries } from "@/db/repository";
import { CollectorNav } from "@/components/account/CollectorNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login?redirect=/account");
  }

  const allInquiries = await getInquiries().catch(() => []);
  const userInquiries = allInquiries.filter(
    (i) => i.email.toLowerCase() === session.user.email.toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b0e] text-[#f4f4f6]">
      <CollectorNav
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          image: session.user.image,
        }}
        inquiriesCount={userInquiries.length}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pt-8 pb-36">
        {children}
      </main>
    </div>
  );
}
