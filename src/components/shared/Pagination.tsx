import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { UsePaginationResult } from '../../hooks/usePagination';

interface PaginationProps {
  pagination: UsePaginationResult<unknown>;
  noun?: string;
}

export function Pagination({ pagination, noun = 'items' }: PaginationProps) {
  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    pageSizeOptions,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    setPageSize,
  } = pagination;

  if (totalItems === 0) return null;

  // Generate visible page numbers with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
      {/* Left: showing X-Y of Z */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          <span className="font-medium text-slate-700">{startIndex}</span>
          {' - '}
          <span className="font-medium text-slate-700">{endIndex}</span>
          {' of '}
          <span className="font-medium text-slate-700">{totalItems}</span>
          {' '}{noun}
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <label className="hidden sm:flex items-center gap-1.5">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-1.5 py-0.5 border border-slate-200 rounded text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={prevPage}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-0.5 mx-1">
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    page === currentPage
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={nextPage}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
