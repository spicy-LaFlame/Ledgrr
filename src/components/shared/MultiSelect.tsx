import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'All',
}) => {
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

  const selectAll = () => onChange(options.map(o => o.value));
  const clearAll = () => onChange([]);

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? options.find(o => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 min-w-[140px] w-full transition-colors duration-200 cursor-pointer"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
          {displayText}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="p-0.5 hover:bg-slate-200 rounded cursor-pointer"
            >
              <X className="w-3 h-3 text-slate-400" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-cyan-600 hover:text-cyan-700 cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                />
                <span className="text-sm text-slate-700 truncate">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
