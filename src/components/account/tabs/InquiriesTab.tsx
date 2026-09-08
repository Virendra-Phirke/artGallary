"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Phone,
  PhoneCall,
  Send,
  Plus,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";
import { PAGE_SIZE_OPTIONS } from "@/components/ui/pagination";
import { ClientDate } from "@/components/ui/client-date";
import type { MockInquiry } from "@/db/mockData";

export function InquiriesTab() {
  const { user, userInquiries, artworks } = useCollector();

  // Selection & Preview Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<MockInquiry | null>(null);

  // New Inquiry Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState("");
  const [newPreference, setNewPreference] = useState<"email" | "phone">("email");
  const [newArtwork, setNewArtwork] = useState("");
  const [newSubject, setNewSubject] = useState("Private Acquisition Inquiry");
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Local Inquiries override for optimistic additions
  const [localInquiries, setLocalInquiries] = useState<MockInquiry[]>(userInquiries);

  // Sync if context updates
  React.useEffect(() => {
    setLocalInquiries(userInquiries);
  }, [userInquiries]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(localInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return localInquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [localInquiries, currentPage, pageSize]);

  const startItem = localInquiries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, localInquiries.length);

  // Handle New Inquiry Submission
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPreference === "phone" && !newPhone.trim()) {
      setSubmitError("Please enter your mobile phone number for direct contact.");
      return;
    }

    if (!newMessage.trim()) {
      setSubmitError("Please enter your message or question for the studio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: newName || user?.name || "Collector",
        email: newEmail || user?.email || "",
        phone: newPhone.trim() || undefined,
        preferredContactMethod: newPreference,
        subject: newArtwork ? `Acquisition Inquiry: ${newArtwork}` : newSubject,
        message: newMessage.trim(),
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      // Optimistic local add
      const createdInq: MockInquiry = {
        id: data.inquiry?.id || `inq-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        preferredContactMethod: newPreference,
        subject: payload.subject,
        message: payload.message,
        artworkTitle: newArtwork || undefined,
        status: "new",
        createdAt: new Date().toISOString(),
      };

      setLocalInquiries((prev) => [createdInq, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsNewModalOpen(false);
        setSubmitSuccess(false);
        setNewMessage("");
        setNewPhone("");
        setNewArtwork("");
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
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
      ) : localInquiries.length === 0 ? (
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
            <Button
              onClick={() => setIsNewModalOpen(true)}
              variant="outline"
              className="rounded-full border-white/10 bg-transparent text-zinc-300 hover:text-white text-xs uppercase tracking-wider h-8 px-3.5 cursor-pointer"
            >
              New Inquiry
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
                  {localInquiries.length}
                </div>
              </div>

              <div className="bg-[#171822] px-2.5 py-1.5 rounded-lg sm:rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Replies
                </span>
                <div className="font-serif text-sm sm:text-base text-emerald-400 font-semibold">
                  {localInquiries.filter((i) => i.status === "replied").length}
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

            {/* Action Button: Opens In-Portal New Inquiry Modal */}
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className="h-8 px-3.5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 self-stretch sm:self-auto cursor-pointer transition-all active:scale-[0.98] shrink-0 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Inquiry</span>
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

                      {/* Response Preference Flag Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                          inq.preferredContactMethod === "phone"
                            ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/30"
                            : "bg-blue-950/50 text-blue-400 border border-blue-800/30"
                        }`}
                      >
                        {inq.preferredContactMethod === "phone" ? (
                          <>
                            <Phone className="w-2.5 h-2.5" />
                            <span>Direct Call</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-2.5 h-2.5" />
                            <span>Email</span>
                          </>
                        )}
                      </span>

                      {inq.artworkTitle && (
                        <span className="text-[10px] text-[#d1a86e] bg-[#d1a86e]/10 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px] sm:max-w-[160px]">
                          {inq.artworkTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                      <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                      <ClientDate date={inq.createdAt} format="date" />
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
            totalItems={localInquiries.length}
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
                  <ClientDate
                    date={selectedInquiry.createdAt}
                    className="text-[10px] font-mono text-zinc-500"
                  />
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
              {/* Preferred Contact Method Strip */}
              <div className="bg-[#171822] p-2.5 sm:p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 text-[11px]">Requested Response:</span>
                <span className="text-xs font-medium flex items-center gap-1.5 font-mono">
                  {selectedInquiry.preferredContactMethod === "phone" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" />
                      <span>Direct Phone Call {selectedInquiry.phone ? `(${selectedInquiry.phone})` : ""}</span>
                    </span>
                  ) : (
                    <span className="text-blue-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>Email Response ({selectedInquiry.email})</span>
                    </span>
                  )}
                </span>
              </div>

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
                  href={`/#contact?subject=Follow-up%20re:%20${encodeURIComponent(
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

      {/* ==================================================================== */}
      {/* IN-PORTAL NEW INQUIRY MODAL                                          */}
      {/* ==================================================================== */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="bg-[#121319] rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#161720] flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d1a86e]/15 text-[#d1a86e] flex items-center justify-center border border-[#d1a86e]/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-white">Transmit Curatorial Inquiry</h3>
                  <p className="text-[11px] text-zinc-400">Direct query to the artist studio &amp; liaison desk</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: The Form */}
            <form onSubmit={handleCreateInquiry} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {submitError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Inquiry logged successfully! Updating ledger...</span>
                </div>
              )}

              {/* Collector Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">
                    Collector Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Your Name"
                    className="h-9 bg-[#171822] border-white/10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="your.email@estate.com"
                    className="h-9 bg-[#171822] border-white/10 text-xs"
                  />
                </div>
              </div>

              {/* Preferred Response Method Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">
                  Preferred Response Method <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewPreference("email")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      newPreference === "email"
                        ? "bg-[#1d1f2d] border-[#d1a86e] text-white shadow"
                        : "bg-[#161722] border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <Mail className={`w-4 h-4 shrink-0 ${newPreference === "email" ? "text-[#d1a86e]" : "text-zinc-500"}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white">Email Response</div>
                      <div className="text-[10px] text-zinc-400 truncate">Written appraisal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPreference("phone")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      newPreference === "phone"
                        ? "bg-[#1d1f2d] border-[#d1a86e] text-white shadow"
                        : "bg-[#161722] border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <PhoneCall className={`w-4 h-4 shrink-0 ${newPreference === "phone" ? "text-[#d1a86e]" : "text-zinc-500"}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white">Direct Phone Call</div>
                      <div className="text-[10px] text-zinc-400 truncate">Call or WhatsApp</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Number & Optional Artwork Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">
                    Mobile Number {newPreference === "phone" ? <span className="text-red-400">* (Required)</span> : <span className="text-zinc-500">(Optional)</span>}
                  </label>
                  <Input
                    type="tel"
                    required={newPreference === "phone"}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="h-9 bg-[#171822] border-white/10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">
                    Associated Artwork (Optional)
                  </label>
                  {artworks && artworks.length > 0 ? (
                    <select
                      value={newArtwork}
                      onChange={(e) => setNewArtwork(e.target.value)}
                      className="w-full h-9 bg-[#171822] border border-white/10 rounded-md px-3 text-xs text-white focus:outline-none focus:border-[#d1a86e] cursor-pointer"
                    >
                      <option value="">General Studio Inquiry</option>
                      {artworks.map((art) => (
                        <option key={art.id} value={art.title}>
                          {art.title} ({art.year})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      value={newArtwork}
                      onChange={(e) => setNewArtwork(e.target.value)}
                      placeholder="e.g. Solitude in Ultramarine"
                      className="h-9 bg-[#171822] border-white/10 text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">
                  Your Inquiry / Specifications <span className="text-red-400">*</span>
                </label>
                <Textarea
                  rows={4}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Please describe your acquisition or curatorial question..."
                  className="bg-[#171822] border-white/10 text-xs placeholder:text-zinc-600 focus-visible:ring-[#d1a86e]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                  className="h-8 px-3 rounded-full text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  size="sm"
                  className="h-8 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-[0.98] gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <span>Transmit Inquiry</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
