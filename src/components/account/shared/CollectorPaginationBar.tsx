"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "@/components/ui/pagination";

export interface CollectorPaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  itemName: string;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export function CollectorPaginationBar({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  itemName,
  pageSize,
  pageSizeOptions = [6, 12, 18, 24],
  onPageChange,
  onPageSizeChange,
  className = "",
}: CollectorPaginationBarProps) {
  if (totalItems === 0) return null;

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div
      className={`p-4 bg-transparent rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="text-xs text-zinc-400 font-mono">
        Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
        <span className="text-[#d1a86e] font-semibold">{totalItems}</span> {itemName}
      </div>

      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage <= 1
                    ? "pointer-events-none opacity-40 border-0 bg-[#1a1b26]"
                    : "cursor-pointer border-0 bg-[#1a1b26] hover:bg-[#222432] text-zinc-300"
                }
              />
            </PaginationItem>

            {paginationRange.map((item, idx) => (
              <PaginationItem key={idx}>
                {item === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={item === currentPage}
                    onClick={() => onPageChange(Number(item))}
                    className={`cursor-pointer border-0 ${
                      item === currentPage
                        ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                        : "bg-[#1a1b26] text-zinc-300 hover:bg-[#222432] hover:text-white"
                    }`}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-40 border-0 bg-[#1a1b26]"
                    : "cursor-pointer border-0 bg-[#1a1b26] hover:bg-[#222432] text-zinc-300"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
          <div className="flex items-center rounded-xl bg-[#1a1b26] p-1 shadow-inner">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  pageSize === size
                    ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
