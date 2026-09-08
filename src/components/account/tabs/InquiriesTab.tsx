"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, Clock, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";
import { PAGE_SIZE_OPTIONS } from "@/components/ui/pagination";
import type { MockInquiry } from "@/db/mockData";

export function InquiriesTab() {
  const { user, userInquiries } = useCollector();

  // Selection & Preview Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<MockInquiry | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(userInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return userInquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [userInquiries, currentPage, pageSize]);

  const startItem = userInquiries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, userInquiries.length);

  return (
    <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {!user ? (
        <div className="p-5 sm:p-7 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3 max-w-md mx-auto my-3 shadow-xl border border-white/5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="font-serif text-base sm:text-lg text-white">Acquisition Ledger Locked</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Sign in to your collector account to review active inquiries, curatorial correspondence, and acquisition status.
          </p>
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button asChild className="h-8 px-4 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              <Link href="/login?redirect=/account?tab=inquiries">
                <span>Sign In</span>
              </Link>
            </Button>
            <Button asChild className="h-8 px-4 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md">
              <Link href="/register?redirect=/account?tab=inquiries">
                <span>Register</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : userInquiries.length === 0 ? (
        <div className="p-5 sm:p-7 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3 max-w-md mx-auto shadow-xl border border-white/5">
          <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-600 mx-auto" />
          <h3 className="font-serif text-base sm:text-lg text-white">No active inquiries recorded</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-light">
            When you inquire about acquiring an original painting, your studio correspondence will be tracked here.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs uppercase tracking-wider font-semibold shadow-md px-3.5 h-8">
              <Link href="/account?tab=gallery">Browse Gallery</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-transparent text-zinc-300 hover:text-white text-xs uppercase tracking-wider h-8 px-3.5">
              <Link href="/contact">New Inquiry</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* Curatorial Ledger Summary Row + Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#121319] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 shadow-md">
            {/* Compact Metric Chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 flex-1 sm:max-w-md">
              <div className="bg-[#171822] px-2.5 py-1.5 rounded-lg sm:rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Total
                </span>
                <div className="font-serif text-sm sm:text-base text-white font-semibold">
                  {userInquiries.length}
                </div>
              </div>

              <div className="bg-[#171822] px-2.5 py-1.5 rounded-lg sm:rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Replies
                </span>
                <div className="font-serif text-sm sm:text-base text-emerald-400 font-semibold">
                  {userInquiries.filter((i) => i.status === "replied").length}
                </div>
              </div>

              <div className="bg-[#171822] px-2.5 py-1.5 rounded-lg sm:rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Liaison
                </span>
                <div className="font-serif text-sm sm:text-base text-[#d1a86e] font-semibold flex items-center gap-1.5">
                  <span>Active</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              asChild
              className="h-8 px-3.5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 self-stretch sm:self-auto cursor-pointer transition-all active:scale-[0.98] shrink-0"
            >
              <Link href="/contact" className="flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </Link>
            </Button>
          </div>

          {/* Inquiry Records - 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {paginatedInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className="p-3 sm:p-3.5 bg-[#121319] hover:bg-[#161722] rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 hover:shadow-lg transition-all space-y-2 shadow-md flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider font-mono ${
                          inq.status === "replied"
                            ? "bg-emerald-950/80 text-emerald-300"
                            : inq.status === "read"
                            ? "bg-blue-950/80 text-blue-300"
                            : "bg-amber-950/80 text-amber-300"
                        }`}
                      >
                        {inq.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        {inq.status === "read" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        {inq.status === "replied" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        <span>{inq.status === "read" ? "In Review" : inq.status}</span>
                      </span>

                      {inq.artworkTitle && (
                        <span className="text-[10px] text-[#d1a86e] bg-[#d1a86e]/10 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px] sm:max-w-[160px]">
                          Canvas: {inq.artworkTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                      <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>
                        {new Date(inq.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-serif text-xs sm:text-sm text-white group-hover:text-[#d1a86e] transition-colors font-medium truncate">
                    {inq.subject || "Artwork Acquisition Inquiry"}
                  </h4>

                  <div className="bg-[#171822] p-2 sm:p-2.5 rounded-lg border border-white/5">
                    <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-2 whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1.5 border-t border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[130px] sm:max-w-[160px]">
                    ID: {inq.id.slice(0, 8)}...
                  </span>
                  <div className="flex items-center gap-1 text-[#d1a86e] group-hover:text-[#dfba82] text-[11px] font-medium transition-colors">
                    <span>View details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Standardized Collector Pagination Bar */}
          <CollectorPaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={userInquiries.length}
            startItem={startItem}
            endItem={endItem}
            itemName="inquiries"
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* ==================================================================== */}
      {/* INQUIRY PREVIEW MODAL                                                */}
      {/* ==================================================================== */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-[#121319] rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#161720] flex items-center justify-between gap-3 border-b border-white/5">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider font-mono ${
                      selectedInquiry.status === "replied"
                        ? "bg-emerald-950/80 text-emerald-300"
                        : selectedInquiry.status === "read"
                        ? "bg-blue-950/80 text-blue-300"
                        : "bg-amber-950/80 text-amber-300"
                    }`}
                  >
                    {selectedInquiry.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                    {selectedInquiry.status === "read" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    {selectedInquiry.status === "replied" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                    <span>{selectedInquiry.status === "read" ? "In Review" : selectedInquiry.status}</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(selectedInquiry.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <h3 className="font-serif text-sm sm:text-base text-white truncate pt-0.5">
                  {selectedInquiry.subject || "Artwork Acquisition Inquiry"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              {selectedInquiry.artworkTitle && (
                <div className="bg-[#171822] p-2.5 sm:p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2">
                  <span className="text-zinc-400 text-[11px]">Associated Artwork:</span>
                  <span className="text-[#d1a86e] font-serif text-xs sm:text-sm font-medium">
                    {selectedInquiry.artworkTitle}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
                  Recorded Collector Message
                </span>
                <div className="bg-[#171822] p-3 sm:p-3.5 rounded-xl border border-white/5 text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="text-[10px] font-mono text-zinc-500 pt-1">
                Studio Reference ID: {selectedInquiry.id}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-[#161720] border-t border-white/5 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInquiry(null)}
                className="h-8 px-3.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 px-4 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <Link
                  href={`/contact?subject=Follow-up%20re:%20${encodeURIComponent(
                    selectedInquiry.subject || "Inquiry"
                  )}`}
                  onClick={() => setSelectedInquiry(null)}
                  className="flex items-center gap-1.5"
                >
                  <span>Send Follow-up</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

