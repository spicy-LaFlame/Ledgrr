import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FundingExpiryStatus {
  projectId: string;
  projectName: string;
  funderName: string;
  expiryDate?: string;
  daysRemaining?: number;
  status: 'RED' | 'YELLOW' | 'GREEN';
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
}

interface FundingExpiryTableProps {
  statuses: FundingExpiryStatus[];
  formatCurrency: (amount: number) => string;
}

const getStatusIndicator = (status: 'RED' | 'YELLOW' | 'GREEN') => {
  switch (status) {
    case 'RED':
      return { color: 'bg-red-500', icon: AlertTriangle, iconColor: 'text-red-500' };
    case 'YELLOW':
      return { color: 'bg-amber-500', icon: Clock, iconColor: 'text-amber-500' };
    case 'GREEN':
      return { color: 'bg-emerald-500', icon: CheckCircle2, iconColor: 'text-emerald-500' };
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No expiry';
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getUtilizationStyle = (pct: number) => {
  if (pct > 100) return 'text-red-600 bg-red-50';
  if (pct >= 80) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
};

const FundingExpiryTable: React.FC<FundingExpiryTableProps> = ({ statuses, formatCurrency }) => {
  if (statuses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Funding Expiry Status</h3>
        <p className="text-sm text-slate-500 text-center py-8">No active projects</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Funding Expiry Status</h3>
        <p className="text-xs text-slate-500 mt-1">Monitor project deadlines, spending, and priorities</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Project
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Funder
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Spent
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Utilization
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Expiry Date
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Days Left
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statuses.map((status) => {
              const indicator = getStatusIndicator(status.status);
              const utilStyle = getUtilizationStyle(status.budgetUtilization);
              return (
                <tr key={status.projectId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`inline-block w-3 h-3 rounded-full ${indicator.color}`} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/projects/${status.projectId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {status.projectName}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{status.funderName}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(status.totalSpent)}
                    </span>
                    <div className="text-xs text-slate-400">
                      of {formatCurrency(status.totalBudget)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${utilStyle}`}>
                      {status.budgetUtilization.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{formatDate(status.expiryDate)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {status.daysRemaining !== undefined ? (
                      <span
                        className={`text-sm font-semibold ${
                          status.daysRemaining < 90 ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {status.daysRemaining}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {status.status === 'RED' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Prioritize
                      </span>
                    )}
                    {status.status === 'YELLOW' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Monitor
                      </span>
                    )}
                    {status.status === 'GREEN' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            RED: &lt;90 days
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            YELLOW: 90-180 days
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            GREEN: &gt;180 days
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundingExpiryTable;
