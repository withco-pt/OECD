"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, "...", totalPages - 1, totalPages];
  if (currentPage >= totalPages - 2) return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-[6px] mt-[32px]">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-[18px]" />
      </button>

      {getPageNumbers(currentPage, totalPages).map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="size-[40px] flex items-center justify-center rounded-[8px] bg-primary-100 text-primary-400 text-[14px]"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`size-[40px] flex items-center justify-center rounded-[8px] text-[14px] font-medium transition-colors ${
              page === currentPage
                ? "bg-primary-600 text-white"
                : "bg-primary-100 text-primary-800 hover:bg-primary-200"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-[18px]" />
      </button>
    </div>
  );
}
