import React from "react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e12] text-[#f4f4f6]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pt-32 pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
