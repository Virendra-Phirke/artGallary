"use client";

import React, { useState } from "react";
import { MockInquiry } from "@/db/mockData";
import { Mail, Phone, Clock, CheckCircle2, MessageSquare, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InquiriesManagerClientProps {
  initialInquiries: MockInquiry[];
}

export function InquiriesManagerClient({
  initialInquiries,
}: InquiriesManagerClientProps) {
  const [inquiries, setInquiries] = useState<MockInquiry[]>(initialInquiries);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filtered = inquiries.filter((inq) => {
    if (selectedStatus !== "all" && inq.status !== selectedStatus) return false;
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: any) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    try {
      await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update inquiry status in DB:", e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1c1d25] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Collector Relations &amp; Ledger
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Inquiries CMS</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review incoming acquisition requests, institutional loans, and direct studio correspondence.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 max-w-full">
          {["all", "new", "read", "replied", "closed"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={selectedStatus === st ? "default" : "secondary"}
              onClick={() => setSelectedStatus(st)}
              className={`text-[11px] uppercase tracking-wider h-8 px-3 rounded-md transition-colors ${
                selectedStatus === st
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "bg-[#181920] text-zinc-400 hover:text-zinc-200 border border-[#262833]"
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center bg-[#14151a]/40 border-[#262833] rounded-2xl text-xs text-zinc-500">
            No inquiries matching status &ldquo;{selectedStatus}&rdquo;.
          </Card>
        ) : (
          filtered.map((inq) => (
            <Card
              key={inq.id}
              className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-2xl space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border cursor-pointer focus:outline-none ${
                      inq.status === "new"
                        ? "bg-amber-950/80 text-amber-300 border-amber-800"
                        : inq.status === "read"
                        ? "bg-blue-950/80 text-blue-300 border-blue-800"
                        : inq.status === "replied"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>

                  <h3 className="font-serif text-lg text-white">{inq.name}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <a
                      href={`mailto:${inq.email}`}
                      className="hover:text-white transition-colors"
                    >
                      {inq.email}
                    </a>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{inq.phone}</span>
                    </div>
                  )}
                  <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {inq.artworkTitle && (
                <div className="text-xs text-[#d1a86e] font-medium">
                  Associated Canvas: {inq.artworkTitle}
                </div>
              )}

              <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl text-xs text-zinc-300 leading-relaxed">
                {inq.message}
              </div>

              <div className="pt-2 flex justify-end">
                <Button asChild size="sm" variant="outline" className="border-[#262833] bg-[#22242e] hover:bg-[#2c2f3d] text-white text-xs font-medium uppercase tracking-wider">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                    className="inline-flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>Reply via Email</span>
                  </a>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
