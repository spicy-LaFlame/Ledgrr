import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors duration-200 ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-slate-300 text-slate-900'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
