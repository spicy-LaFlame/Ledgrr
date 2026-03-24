import { Calendar } from 'lucide-react';

export type QuarterSelection = 1 | 2 | 3 | 4 | 'full';

interface DashboardHeaderProps {
  fiscalYear: string;
  setFiscalYear: (year: string) => void;
  quarter: QuarterSelection;
  setQuarter: (quarter: QuarterSelection) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  fiscalYear,
  setFiscalYear,
  quarter,
  setQuarter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">FY {fiscalYear} Budget Tracking</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Fiscal Year Select */}
        <div className="relative">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="appearance-none pl-3.5 pr-10 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 cursor-pointer"
          >
            <option value="2024-25">FY 2024-25</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2026-27">FY 2026-27</option>
          </select>
        </div>

        {/* Quarter Tabs */}
        <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setQuarter('full')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              quarter === 'full'
                ? 'text-slate-900 bg-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Full Year
          </button>
          {([1, 2, 3, 4] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                quarter === q
                  ? 'text-slate-900 bg-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Q{q}
            </button>
          ))}
        </div>

        {/* Date indicator - hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            {quarter === 'full' && 'Apr - Mar'}
            {quarter === 1 && 'Apr - Jun'}
            {quarter === 2 && 'Jul - Sep'}
            {quarter === 3 && 'Oct - Dec'}
            {quarter === 4 && 'Jan - Mar'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
