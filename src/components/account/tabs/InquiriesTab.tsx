"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  Printer,
  MessageSquare,
  Check,
  ExternalLink,
  Layers,
  Ruler,
  BadgeCheck,
  DollarSign,
  Info,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";
import { PAGE_SIZE_OPTIONS } from "@/components/ui/pagination";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import type { MockInquiry, MockArtwork } from "@/db/mockData";

// ============================================================================
// ACQUISITION MILESTONE TYPES & CONFIG
// ============================================================================
export type AcquisitionMilestone =
  | "inquiry_logged"
  | "curatorial_review"
  | "crating_logistics"
  | "private_viewing"
  | "provenance_deeded";

interface MilestoneStep {
  id: AcquisitionMilestone;
  label: string;
  shortDesc: string;
  detailedNote: string;
}

const MILESTONE_STEPS: MilestoneStep[] = [
  {
    id: "inquiry_logged",
    label: "Inquiry Logged",
    shortDesc: "Recorded in studio registry",
    detailedNote: "Inquiry entered into the official studio provenance ledger. A priority timestamp has been reserved.",
  },
  {
    id: "curatorial_review",
    label: "Curatorial Review",
    shortDesc: "Availability & condition audit",
    detailedNote: "The curatorial liaison is reviewing archive status, physical condition reports, and exclusive reserve locks.",
  },
  {
    id: "crating_logistics",
    label: "Crating & Logistics",
    shortDesc: "Freight & customs appraisal",
    detailedNote: "Fine-art handlers are calculating climate-controlled museum crating and insured air-transit specifications.",
  },
  {
    id: "private_viewing",
    label: "Private Viewing",
    shortDesc: "Atelier or virtual consultation",
    detailedNote: "Arrangements for private studio inspection in Paris or a high-fidelity 1-on-1 virtual walkthrough.",
  },
  {
    id: "provenance_deeded",
    label: "Deed of Provenance",
    shortDesc: "COA & title transfer",
    detailedNote: "Final acquisition settlement, embossed Arches Vélin Certificate of Authenticity, and archival registry.",
  },
];

// Map standard inquiry status to a milestone index (0 to 4)
function getMilestoneIndex(status: MockInquiry["status"]): number {
  switch (status) {
    case "closed":
      return 4;
    case "replied":
      return 2; // Crating & Logistics stage
    case "read":
      return 1; // Curatorial Review stage
    case "new":
    default:
      return 0; // Inquiry Logged stage
  }
}

// ============================================================================
// CORRESPONDENCE THREAD TYPES
// ============================================================================
export interface ThreadMessage {
  id: string;
  sender: "collector" | "curator";
  senderName: string;
  senderRole?: string;
  timestamp: string;
  content: string;
  isVerifiedStudio?: boolean;
}

export function InquiriesTab() {
  const { user, userInquiries, artworks } = useCollector();

  // Selection & Modal States
  const [selectedInquiry, setSelectedInquiry] = useState<MockInquiry | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Thread State for Selected Inquiry
  const [activeThread, setActiveThread] = useState<ThreadMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(userInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return userInquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [userInquiries, currentPage, pageSize]);

  const startItem = userInquiries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, userInquiries.length);

  // Find artwork matching the selected inquiry
  const associatedArtwork = useMemo<MockArtwork | null>(() => {
    if (!selectedInquiry) return null;
    return (
      artworks.find((a) => a.id === selectedInquiry.artworkId) ||
      artworks.find(
        (a) =>
          a.title.toLowerCase().trim() ===
          (selectedInquiry.artworkTitle || "").toLowerCase().trim()
      ) ||
      null
    );
  }, [selectedInquiry, artworks]);

  // Current milestone progression for selected inquiry
  const activeMilestoneIndex = useMemo(() => {
    if (!selectedInquiry) return 0;
    return getMilestoneIndex(selectedInquiry.status);
  }, [selectedInquiry]);

  // Load or initialize conversation thread whenever selectedInquiry changes
  useEffect(() => {
    if (!selectedInquiry) {
      setActiveThread([]);
      setReplyText("");
      return;
    }

    const storageKey = `atelier_inquiry_thread_${selectedInquiry.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveThread(parsed);
          return;
        }
      } catch {
        // fallback to fresh initialization
      }
    }

    // Default thread initial seed
    const initialMessages: ThreadMessage[] = [
      {
        id: `msg-collector-init-${selectedInquiry.id}`,
        sender: "collector",
        senderName: selectedInquiry.name || user?.name || "Collector",
        timestamp: selectedInquiry.createdAt,
        content: selectedInquiry.message,
      },
    ];

    // If inquiry status is read or replied, inject authentic studio response
    if (selectedInquiry.status === "read" || selectedInquiry.status === "replied" || selectedInquiry.status === "closed") {
      const artTitle = selectedInquiry.artworkTitle || associatedArtwork?.title || "this artwork";
      const collectorFirstName = (selectedInquiry.name || user?.name || "Collector").split(" ")[0];

      initialMessages.push({
        id: `msg-curator-init-${selectedInquiry.id}`,
        sender: "curator",
        senderName: "Helena Vance Atelier • Curatorial Desk",
        senderRole: "Head of Private Collections",
        timestamp: new Date(new Date(selectedInquiry.createdAt).getTime() + 1000 * 60 * 55).toISOString(),
        isVerifiedStudio: true,
        content: `Dear ${collectorFirstName},\n\nThank you for reaching out regarding "${artTitle}". Our curatorial office has formally acknowledged your inquiry and logged it into our private collection registry.\n\nThe artwork remains in excellent studio preservation. Our logistics specialists are currently calculating custom museum-grade wooden crating and climate-controlled transit quotes.\n\nPlease let us know if you have specific framing preferences or if you would like to arrange a private atelier viewing prior to formal acquisition.`,
      });
    }

    setActiveThread(initialMessages);
    try {
      localStorage.setItem(storageKey, JSON.stringify(initialMessages));
    } catch {}
  }, [selectedInquiry, user, associatedArtwork]);

  // Scroll to bottom of conversation whenever thread updates
  useEffect(() => {
    if (selectedInquiry && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeThread, selectedInquiry]);

  // Send a collector reply
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;

    const trimmed = replyText.trim();
    setIsSendingReply(true);

    const newMsg: ThreadMessage = {
      id: `msg-collector-${Date.now()}`,
      sender: "collector",
      senderName: user?.name || selectedInquiry.name || "Collector",
      timestamp: new Date().toISOString(),
      content: trimmed,
    };

    const updated = [...activeThread, newMsg];
    setActiveThread(updated);
    setReplyText("");

    const storageKey = `atelier_inquiry_thread_${selectedInquiry.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    // Simulate authentic studio acknowledgment after 1.4s
    setTimeout(() => {
      const studioAck: ThreadMessage = {
        id: `msg-curator-${Date.now()}`,
        sender: "curator",
        senderName: "Helena Vance Atelier • Curatorial Desk",
        senderRole: "Head of Private Collections",
        timestamp: new Date().toISOString(),
        isVerifiedStudio: true,
        content: `Thank you for the update. Our curatorial desk has appended your specifications to Dossier #${selectedInquiry.id.slice(0, 8).toUpperCase()}. An updated logistics and provenance ledger will be communicated shortly.`,
      };

      setActiveThread((prev) => {
        const next = [...prev, studioAck];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
      setIsSendingReply(false);
    }, 1400);
  };

  // Quick Action Chip click handler
  const handleQuickChipClick = (chipText: string) => {
    setReplyText((prev) => {
      if (!prev.trim()) return chipText;
      return `${prev.trim()}\n${chipText}`;
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {!user ? (
        <div className="p-6 sm:p-9 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-4 max-w-md mx-auto my-6 shadow-xl border border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg text-white font-medium">Acquisition Ledger Locked</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Sign in to your verified collector account to review active inquiries, curatorial correspondence, and fine-art acquisition milestones.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button asChild className="h-9 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md transition-all active:scale-[0.98]">
              <Link href="/login?redirect=/account?tab=inquiries">
                <span>Sign In</span>
              </Link>
            </Button>
            <Button asChild className="h-9 px-5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md">
              <Link href="/register?redirect=/account?tab=inquiries">
                <span>Register</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : userInquiries.length === 0 ? (
        <div className="p-7 sm:p-10 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3.5 max-w-md mx-auto shadow-xl border border-white/5">
          <Mail className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="font-serif text-base sm:text-lg text-white">No active inquiries recorded</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-light">
            When you inquire about acquiring an original painting or curatorial edition, your direct studio correspondence and acquisition milestones will appear here.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2.5">
            <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs uppercase tracking-wider font-semibold shadow-md px-4 h-8">
              <Link href="/account?tab=gallery">Browse Private Catalogue</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-transparent text-zinc-300 hover:text-white text-xs uppercase tracking-wider h-8 px-4">
              <Link href="/contact">New Inquiry</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Curatorial Ledger Summary Row + Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121319] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 shadow-md">
            {/* Compact Metric Chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1 sm:max-w-lg">
              <div className="bg-[#171822] px-3 py-2 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Total Records
                </span>
                <div className="font-serif text-sm sm:text-base text-white font-semibold">
                  {userInquiries.length}
                </div>
              </div>

              <div className="bg-[#171822] px-3 py-2 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Studio Replies
                </span>
                <div className="font-serif text-sm sm:text-base text-emerald-400 font-semibold">
                  {userInquiries.filter((i) => i.status === "replied").length}
                </div>
              </div>

              <div className="bg-[#171822] px-3 py-2 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block truncate">
                  Liaison Desk
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
              className="h-8 sm:h-9 px-4 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 self-stretch sm:self-auto cursor-pointer transition-all active:scale-[0.98] shrink-0"
            >
              <Link href="/contact" className="flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </Link>
            </Button>
          </div>

          {/* Inquiry Records - 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {paginatedInquiries.map((inq) => {
              const msIdx = getMilestoneIndex(inq.status);
              const activeStep = MILESTONE_STEPS[msIdx] || MILESTONE_STEPS[0];

              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className="p-3.5 sm:p-4 bg-[#121319] hover:bg-[#161722] rounded-xl sm:rounded-2xl border border-white/5 hover:border-[#d1a86e]/30 hover:shadow-lg transition-all space-y-2.5 shadow-md flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono ${
                            inq.status === "replied"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                              : inq.status === "read"
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                          }`}
                        >
                          {inq.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                          {inq.status === "read" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          {inq.status === "replied" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                          <span>{inq.status === "read" ? "In Review" : inq.status}</span>
                        </span>

                        {inq.artworkTitle && (
                          <span className="text-[10px] text-[#d1a86e] bg-[#d1a86e]/10 px-2 py-0.5 rounded-md font-medium truncate max-w-[140px] sm:max-w-[180px]">
                            {inq.artworkTitle}
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
                          })}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-serif text-sm text-white group-hover:text-[#d1a86e] transition-colors font-medium truncate">
                      {inq.subject || "Artwork Acquisition Inquiry"}
                    </h4>

                    {/* Milestone Mini-Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-[#171822] px-2.5 py-1.5 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#d1a86e] shrink-0" />
                      <span className="text-zinc-500 text-[10px] uppercase font-mono">Milestone:</span>
                      <span className="text-zinc-200 font-medium truncate">{activeStep.label}</span>
                    </div>

                    <div className="bg-[#171822] p-2.5 rounded-lg border border-white/5">
                      <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-2 whitespace-pre-wrap">
                        {inq.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[130px] sm:max-w-[160px]">
                      REF: {inq.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-[#d1a86e] group-hover:text-[#dfba82] text-[11px] font-medium transition-colors">
                      <span>Open correspondence</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
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
      {/* UPGRADED CURATORIAL DIALOGUE & MILESTONE MODAL                       */}
      {/* ==================================================================== */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-[#101117] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Modal Top Bar */}
            <div className="p-3.5 sm:p-4 bg-[#151620] flex items-center justify-between gap-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1e202e] flex items-center justify-center text-[#d1a86e] shrink-0 border border-white/5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Dossier Ref: {selectedInquiry.id.slice(0, 10).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider font-mono ${
                        selectedInquiry.status === "replied"
                          ? "bg-emerald-950 text-emerald-300"
                          : selectedInquiry.status === "read"
                          ? "bg-blue-950 text-blue-300"
                          : "bg-amber-950 text-amber-300"
                      }`}
                    >
                      {selectedInquiry.status === "read" ? "In Review" : selectedInquiry.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base text-white truncate font-medium pt-0.5">
                    {selectedInquiry.subject || "Artwork Acquisition Inquiry"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSlipModal(true)}
                  className="hidden sm:inline-flex h-8 px-3 rounded-full border-white/10 bg-[#1a1b26] hover:bg-[#232534] text-zinc-300 hover:text-white text-xs gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Acquisition Slip</span>
                </Button>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body: Artwork Summary, Milestone Stepper & Dialogue Thread */}
            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Artwork Summary Strip */}
              <div className="bg-[#14151e] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {associatedArtwork?.coverImageUrl ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 relative bg-black">
                      <Image
                        src={associatedArtwork.coverImageUrl}
                        alt={associatedArtwork.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#1d1f2c] flex items-center justify-center text-zinc-500 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                      Associated Artwork
                    </span>
                    <h4 className="font-serif text-sm sm:text-base text-white font-medium truncate">
                      {selectedInquiry.artworkTitle || associatedArtwork?.title || "Original Studio Piece"}
                    </h4>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2 flex-wrap">
                      {associatedArtwork?.year && <span>{associatedArtwork.year}</span>}
                      {associatedArtwork && (
                        <span>• {formatDimensions(associatedArtwork.widthCm, associatedArtwork.heightCm)}</span>
                      )}
                      {associatedArtwork?.medium && <span>• {associatedArtwork.medium}</span>}
                    </div>
                  </div>
                </div>

                {associatedArtwork?.price && (
                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 shrink-0">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block">
                      Valuation Lock
                    </span>
                    <div className="font-serif text-sm sm:text-base text-[#d1a86e] font-semibold">
                      {formatCurrency(associatedArtwork.price, associatedArtwork.currency)}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Certificate Included</span>
                  </div>
                )}
              </div>

              {/* 3. Acquisition Milestone Stepper */}
              <div className="bg-[#14151e] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Acquisition Lifecycle
                    </span>
                    <Badge variant="gold" className="text-[9px] py-0 h-4">
                      Stage {activeMilestoneIndex + 1} of 5
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Active: {MILESTONE_STEPS[activeMilestoneIndex].label}
                  </span>
                </div>

                {/* Connected Stepper Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-1 relative">
                  {MILESTONE_STEPS.map((step, idx) => {
                    const isCompleted = idx < activeMilestoneIndex;
                    const isActive = idx === activeMilestoneIndex;

                    return (
                      <div
                        key={step.id}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isActive
                            ? "bg-[#1d1e2b] border-[#d1a86e] shadow-md shadow-[#d1a86e]/10"
                            : isCompleted
                            ? "bg-[#161722] border-emerald-500/30 text-zinc-300"
                            : "bg-[#111219] border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono uppercase text-zinc-500">0{idx + 1}</span>
                          {isCompleted ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full bg-[#d1a86e] animate-pulse" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-zinc-700" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-serif font-medium truncate ${
                              isActive ? "text-[#d1a86e]" : isCompleted ? "text-white" : "text-zinc-500"
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate leading-tight pt-0.5">
                            {step.shortDesc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Milestone Detail Callout */}
                <div className="p-2.5 bg-[#181a26] rounded-xl border border-white/5 flex items-start gap-2.5 text-[11px] text-zinc-300">
                  <Info className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white font-serif mr-1">
                      {MILESTONE_STEPS[activeMilestoneIndex].label}:
                    </span>
                    <span className="text-zinc-400 font-light">
                      {MILESTONE_STEPS[activeMilestoneIndex].detailedNote}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Curatorial Correspondence Dialogue Stream */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#d1a86e]" />
                    <span>Curatorial Dialogue Stream</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeThread.length} {activeThread.length === 1 ? "entry" : "entries"} recorded
                  </span>
                </div>

                <div className="bg-[#12131b] rounded-2xl border border-white/5 p-3 sm:p-4 space-y-3.5 max-h-[340px] overflow-y-auto">
                  {activeThread.map((msg) => {
                    const isCurator = msg.sender === "curator";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCurator ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 space-y-1.5 ${
                            isCurator
                              ? "bg-[#181a26] border border-[#d1a86e]/25 text-zinc-200 shadow-md"
                              : "bg-[#1c1d29] border border-white/5 text-zinc-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] pb-1 border-b border-white/5">
                            <div className="flex items-center gap-1.5">
                              {isCurator ? (
                                <>
                                  <Sparkles className="w-3 h-3 text-[#d1a86e]" />
                                  <span className="font-serif text-[#d1a86e] font-medium">
                                    {msg.senderName}
                                  </span>
                                  {msg.senderRole && (
                                    <span className="text-zinc-400 hidden sm:inline">
                                      • {msg.senderRole}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 text-[8px] flex items-center justify-center text-zinc-300 font-mono uppercase">
                                    {msg.senderName.slice(0, 2)}
                                  </div>
                                  <span className="text-zinc-300 font-medium">
                                    {msg.senderName} (Collector)
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-zinc-500 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-xs leading-relaxed font-light whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {isCurator && msg.isVerifiedStudio && (
                            <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-[#d1a86e]/80">
                              <BadgeCheck className="w-3 h-3 text-[#d1a86e]" />
                              <span>ATELIER-VERIFIED PROVENANCE CORRESPONDENCE</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>
              </div>

              {/* 5. Quick Action Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block px-1">
                  Prompt Studio Desk
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickChipClick("Could you provide a quote for climate-controlled museum crating and insured air-freight?")
                    }
                    className="px-2.5 py-1 rounded-full bg-[#181924] hover:bg-[#202232] border border-white/5 hover:border-[#d1a86e]/40 text-[10px] text-zinc-300 transition-colors cursor-pointer"
                  >
                    + Request Crating & Freight Quote
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickChipClick("I would like to inquire about arranging a private atelier viewing or virtual consultation.")
                    }
                    className="px-2.5 py-1 rounded-full bg-[#181924] hover:bg-[#202232] border border-white/5 hover:border-[#d1a86e]/40 text-[10px] text-zinc-300 transition-colors cursor-pointer"
                  >
                    + Arrange Private Atelier Viewing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickChipClick("Please confirm inclusion of the physical embossed Arches Vélin Certificate of Authenticity.")
                    }
                    className="px-2.5 py-1 rounded-full bg-[#181924] hover:bg-[#202232] border border-white/5 hover:border-[#d1a86e]/40 text-[10px] text-zinc-300 transition-colors cursor-pointer"
                  >
                    + Inquire About Physical COA
                  </button>
                </div>
              </div>

              {/* 6. In-Place Reply Composer */}
              <form onSubmit={handleSendReply} className="space-y-2">
                <div className="relative rounded-xl border border-white/10 bg-[#151622] overflow-hidden focus-within:border-[#d1a86e]/50 focus-within:ring-1 focus-within:ring-[#d1a86e]/20 transition-all">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Compose your correspondence for the curatorial desk..."
                    className="w-full bg-transparent p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <div className="p-2 bg-[#12131d] border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 pl-1">
                      Press Return to submit message
                    </span>
                    <Button
                      type="submit"
                      disabled={!replyText.trim() || isSendingReply}
                      size="sm"
                      className="h-7 px-3 rounded-lg bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSendingReply ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          <span>Dispatching</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span>Dispatch</span>
                          <Send className="w-3 h-3" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* 7. Modal Bottom Utilities Bar */}
            <div className="p-3 sm:p-4 bg-[#151620] border-t border-white/5 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSlipModal(true)}
                  className="sm:hidden h-8 px-3 rounded-full border-white/10 bg-[#1a1b26] text-zinc-300 text-xs gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Slip</span>
                </Button>

                {/* WhatsApp Concierge Shortcut */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-full border-emerald-700/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs gap-1.5 cursor-pointer"
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hello Helena Vance Studio, I am following up on Acquisition Dossier #${selectedInquiry.id.slice(0, 8).toUpperCase()} regarding "${selectedInquiry.artworkTitle || "artwork"}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>VIP Concierge</span>
                  </a>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInquiry(null)}
                className="h-8 px-4 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 text-xs cursor-pointer"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FORMAL ACQUISITION SLIP / PRINTABLE VOUCHER MODAL                    */}
      {/* ==================================================================== */}
      {showSlipModal && selectedInquiry && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowSlipModal(false)}
        >
          <div
            className="bg-[#0e0f14] rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#d1a86e]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Slip Header */}
            <div className="p-4 bg-[#14151e] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#d1a86e]" />
                <span className="font-serif text-sm text-white font-medium">
                  Official Acquisition Dossier Slip
                </span>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Document Body (Print-Optimized) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-zinc-300">
              <div className="text-center space-y-1 pb-4 border-b border-white/10">
                <span className="text-[10px] font-mono tracking-widest text-[#d1a86e] uppercase block">
                  HELENA VANCE ATELIER • CONTEMPORARY ART ARCHIVES
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-white font-normal tracking-wide">
                  Formal Acquisition Inquiry Dossier
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  REGISTRY NUMBER: {selectedInquiry.id.toUpperCase()}
                </p>
              </div>

              {/* 2-Column Ledger Record */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#14151f] p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                    Collector Dossier
                  </span>
                  <div className="space-y-1">
                    <div className="text-white font-medium">{selectedInquiry.name}</div>
                    <div className="text-zinc-400 font-mono text-[11px]">{selectedInquiry.email}</div>
                    {selectedInquiry.phone && (
                      <div className="text-zinc-400 font-mono text-[11px]">{selectedInquiry.phone}</div>
                    )}
                    <div className="text-[10px] text-zinc-500 pt-1">
                      Logged: {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-[#14151f] p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                    Artwork Specification
                  </span>
                  <div className="space-y-1">
                    <div className="text-white font-serif text-sm">
                      {selectedInquiry.artworkTitle || associatedArtwork?.title || "Original Piece"}
                    </div>
                    {associatedArtwork && (
                      <div className="text-zinc-400 text-[11px]">
                        {associatedArtwork.medium} • {formatDimensions(associatedArtwork.widthCm, associatedArtwork.heightCm)}
                      </div>
                    )}
                    {associatedArtwork?.price && (
                      <div className="text-[#d1a86e] font-serif font-semibold pt-0.5">
                        Valuation: {formatCurrency(associatedArtwork.price, associatedArtwork.currency)}
                      </div>
                    )}
                    <div className="text-[10px] text-emerald-400 font-mono pt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Reserve Lock Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Message Log */}
              <div className="bg-[#14151f] p-4 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Original Collector Specification
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Official Seal & Signature */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#d1a86e]/40 flex items-center justify-center text-[#d1a86e] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono leading-tight">
                    <div className="text-white font-medium">CURATORIAL ARCHIVE SEAL</div>
                    <div className="text-zinc-500">HELENA VANCE ATELIER • PARIS / NEW YORK</div>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-zinc-500">
                  Document generated for collector verification.
                </div>
              </div>
            </div>

            {/* Slip Footer Actions */}
            <div className="p-4 bg-[#14151e] border-t border-white/5 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSlipModal(false)}
                className="h-8 px-4 rounded-full text-zinc-400 hover:text-white text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 px-4 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Formal Slip</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
