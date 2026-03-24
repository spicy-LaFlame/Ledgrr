import { useState, useEffect, useRef, useDeferredValue } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal, Filter } from 'lucide-react';

// --- Types ---

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
}

export interface FilterValues {
  [key: string]: string[];
}

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterDefinition[];
  filterValues: FilterValues;
  onFilterChange: (key: string, values: string[]) => void;
  resultCount?: number;
  resultLabel?: string;
  totalCount?: number;
}

// --- Subcomponents ---

function FilterDropdown({
  definition,
  selected,
  onChange,
}: {
  definition: FilterDefinition;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
          hasSelection
            ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
        } focus:outline-none focus:ring-2 focus:ring-cyan-500/30`}
      >
        <span className="truncate max-w-[120px]">
          {hasSelection
            ? selected.length === 1
              ? definition.options.find(o => o.value === selected[0])?.label ?? selected[0]
              : definition.label
            : definition.placeholder}
        </span>
        {hasSelection && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold shrink-0">
            {selected.length}
          </span>
        )}
        {hasSelection ? (
          <span
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="p-0.5 hover:bg-cyan-200 rounded shrink-0 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{definition.label}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange(definition.options.map(o => o.value))}
                className="text-[10px] font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer uppercase tracking-wide"
              >
                All
              </button>
              {hasSelection && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer uppercase tracking-wide"
                >
                  None
                </button>
              )}
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {definition.options.map(option => {
              const isChecked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors duration-100 ${
                    isChecked ? 'bg-cyan-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(option.value)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                  />
                  <span className={`text-sm truncate ${isChecked ? 'text-cyan-700 font-medium' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveFilterChips({
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterDefinition[];
  filterValues: FilterValues;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
}) {
  const chips: { key: string; filterLabel: string; value: string; optionLabel: string }[] = [];

  for (const f of filters) {
    const selected = filterValues[f.key] ?? [];
    for (const val of selected) {
      const opt = f.options.find(o => o.value === val);
      if (opt) {
        chips.push({ key: f.key, filterLabel: f.label, value: val, optionLabel: opt.label });
      }
    }
  }

  if (chips.length === 0) return null;

  const removeChip = (key: string, value: string) => {
    const current = filterValues[key] ?? [];
    onFilterChange(key, current.filter(v => v !== value));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap animate-fade-in">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide shrink-0">Active:</span>
      {chips.map(chip => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-cyan-50 border border-cyan-200 rounded-md text-xs font-medium text-cyan-700 transition-all duration-150"
        >
          <span className="text-[10px] text-cyan-500 font-normal">{chip.filterLabel}:</span>
          <span className="max-w-[100px] truncate">{chip.optionLabel}</span>
          <button
            onClick={() => removeChip(chip.key, chip.value)}
            className="p-0.5 hover:bg-cyan-200 rounded cursor-pointer transition-colors duration-150"
            aria-label={`Remove ${chip.optionLabel} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer transition-colors duration-150 shrink-0"
      >
        Clear all
      </button>
    </div>
  );
}

// --- Main Component ---

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterValues,
  onFilterChange,
  resultCount,
  resultLabel = 'results',
  totalCount,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const deferredSearch = useDeferredValue(localSearch);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync deferred search to parent
  useEffect(() => {
    onSearchChange(deferredSearch);
  }, [deferredSearch, onSearchChange]);

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const totalActiveFilters = Object.values(filterValues).reduce(
    (sum, arr) => sum + arr.length, 0
  );

  const clearAllFilters = () => {
    for (const f of filters) {
      onFilterChange(f.key, []);
    }
    setLocalSearch('');
    onSearchChange('');
  };

  const hasAnyFilter = totalActiveFilters > 0 || localSearch.length > 0;

  return (
    <div className="mb-6 space-y-3">
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(''); onSearchChange(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Desktop filters */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <FilterDropdown
              key={f.key}
              definition={f}
              selected={filterValues[f.key] ?? []}
              onChange={(values) => onFilterChange(f.key, values)}
            />
          ))}
        </div>

        {/* Mobile filter toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`sm:hidden inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              totalActiveFilters > 0
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {totalActiveFilters > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold">
                {totalActiveFilters}
              </span>
            )}
          </button>
        )}

        {/* Result count + filter summary (desktop) */}
        {(resultCount !== undefined || hasAnyFilter) && (
          <div className="hidden sm:flex items-center gap-3 ml-auto shrink-0">
            {resultCount !== undefined && (
              <span className="text-xs text-slate-400">
                <span className="font-semibold text-slate-600">{resultCount}</span>
                {totalCount !== undefined && totalCount !== resultCount && (
                  <span> of {totalCount}</span>
                )}
                {' '}{resultLabel}
              </span>
            )}
            {hasAnyFilter && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer transition-colors duration-150 flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile filters (collapsible) */}
      {showMobileFilters && (
        <div className="sm:hidden flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filters</span>
            {totalActiveFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-red-500 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
          {filters.map(f => (
            <FilterDropdown
              key={f.key}
              definition={f}
              selected={filterValues[f.key] ?? []}
              onChange={(values) => onFilterChange(f.key, values)}
            />
          ))}
        </div>
      )}

      {/* Active filter chips */}
      <ActiveFilterChips
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClearAll={clearAllFilters}
      />

      {/* Mobile result count */}
      {resultCount !== undefined && (
        <div className="sm:hidden flex items-center justify-between">
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{resultCount}</span>
            {totalCount !== undefined && totalCount !== resultCount && (
              <span> of {totalCount}</span>
            )}
            {' '}{resultLabel}
          </span>
          {hasAnyFilter && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer transition-colors duration-150"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
