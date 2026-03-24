import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface SortColumnDef<T> {
  key: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

interface UseSortOptions<T> {
  data: T[];
  columns: SortColumnDef<T>[];
}

export function useSort<T>({ data, columns }: UseSortOptions<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const requestSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null; // 3rd click clears sort
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const col = columns.find(c => c.key === sortConfig.key);
    if (!col) return data;

    const { accessor, type = 'string' } = col;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;

    return [...data].sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);

      // Nulls always last regardless of direction
      const aNull = aVal === null || aVal === undefined || aVal === '';
      const bNull = bVal === null || bVal === undefined || bVal === '';
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      if (type === 'number') {
        return (Number(aVal) - Number(bVal)) * dir;
      }

      if (type === 'date') {
        return (new Date(aVal as string).getTime() - new Date(bVal as string).getTime()) * dir;
      }

      if (type === 'boolean') {
        return ((aVal ? 1 : 0) - (bVal ? 1 : 0)) * dir;
      }

      // string
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }, [data, sortConfig, columns]);

  return { sortedData, sortConfig, requestSort };
}
