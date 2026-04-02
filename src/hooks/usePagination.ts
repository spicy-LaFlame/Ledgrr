import { useState, useMemo, useCallback, useEffect } from 'react';

export interface UsePaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationResult<T> {
  /** The items for the current page */
  pageItems: T[];
  /** Current page (1-based) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Total items in the dataset */
  totalItems: number;
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Change page size */
  setPageSize: (size: number) => void;
  /** Available page size options */
  pageSizeOptions: number[];
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
  /** Index of first item on current page (1-based) */
  startIndex: number;
  /** Index of last item on current page (1-based) */
  endIndex: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const {
    defaultPageSize = 15,
    pageSizeOptions = [10, 15, 25, 50],
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 when data changes (e.g. filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  // Clamp page when totalPages shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  return {
    pageItems,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    pageSizeOptions,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex,
    endIndex,
  };
}
