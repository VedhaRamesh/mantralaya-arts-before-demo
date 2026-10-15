import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display on desktop
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`bg-white px-4 py-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${className}`}
    >
      {/* Left: Item range summary & Items per page selector */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full sm:w-auto text-stone-600">
        <span className="tabular-nums font-medium">
          Showing <strong className="text-stone-900 font-mono">{startItem}</strong>–
          <strong className="text-stone-900 font-mono">{endItem}</strong> of{' '}
          <strong className="text-stone-900 font-mono">{totalItems}</strong> items
        </span>

        <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
          <span className="text-stone-500 text-[11px]">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="py-1 px-2 rounded-lg border border-stone-200 text-xs font-mono font-medium focus:ring-1 focus:ring-[#701A1E] focus:outline-none bg-stone-50 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
        {/* Mobile: Compact Previous / Next with Page X of Y text */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              currentPage <= 1
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-stone-700 px-2 font-medium">
            Page <strong className="text-[#701A1E]">{currentPage}</strong> of{' '}
            <strong>{Math.max(1, totalPages)}</strong>
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              currentPage >= totalPages
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop: Full controls with Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First Page"
            className={`min-h-[36px] min-w-[36px] rounded-lg border text-xs flex items-center justify-center transition ${
              currentPage <= 1
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
            }`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
            className={`min-h-[36px] min-w-[36px] rounded-lg border text-xs flex items-center justify-center transition ${
              currentPage <= 1
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-stone-400 font-mono">
                  …
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                className={`min-h-[36px] min-w-[36px] rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  isCurrent
                    ? 'bg-[#701A1E] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            className={`min-h-[36px] min-w-[36px] rounded-lg border text-xs flex items-center justify-center transition ${
              currentPage >= totalPages
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last Page"
            className={`min-h-[36px] min-w-[36px] rounded-lg border text-xs flex items-center justify-center transition ${
              currentPage >= totalPages
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
            }`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
