import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { SortConfig } from '../../hooks/useSort';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortConfig | null;
  onSort: (key: string) => void;
  align?: 'left' | 'right' | 'center';
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  onSort,
  align = 'left',
}) => {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-semibold text-slate-500 uppercase tracking-wide`}
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 ${alignClass} hover:text-slate-700 transition-colors cursor-pointer group`}
      >
        {label}
        {isActive ? (
          direction === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 text-cyan-600" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-cyan-600" />
          )
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </th>
  );
};
