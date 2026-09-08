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
  PaginationPageSizeSelect,
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
      className={`pt-3 pb-1 px-1 flex items-center justify-between gap-2 sm:gap-4 w-full flex-wrap sm:flex-nowrap ${className}`}
    >
      <div className="text-xs text-zinc-400 font-mono shrink-0">
        <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
        <span className="text-[#d1a86e] font-semibold">{totalItems}</span>
      </div>

      <div className="flex items-center justify-center order-last sm:order-none w-full sm:w-auto">
        <Pagination className="w-auto mx-0">
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
        <div className="shrink-0">
          <PaginationPageSizeSelect
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            options={pageSizeOptions}
          />
        </div>
      )}
    </div>
  );
}
