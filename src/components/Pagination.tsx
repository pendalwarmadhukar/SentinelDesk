import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400">
      <div className="font-mono">
        Showing <span className="font-semibold text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalItems}</span> records
      </div>
      <div className="flex items-center gap-1.5 font-mono">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="rounded p-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/60 transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded p-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/60 transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="px-2 py-1 text-slate-300 font-semibold">
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded p-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/60 transition-colors"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="rounded p-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/60 transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
