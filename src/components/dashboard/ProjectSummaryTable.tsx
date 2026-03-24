import { Link } from 'react-router-dom';
import { useSort, type SortColumnDef } from '../../hooks/useSort';
import { SortableHeader } from '../shared/SortableHeader';
import { formatCurrency } from '../../utils/formatters';
import type { ClaimsSummary } from '../../hooks/useClaims';

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

interface ProjectSpending {
  projectId: string;
  budgeted: number;
  actual: number;
}

interface ProjectSummaryRow {
  projectId: string;
  projectName: string;
  funderName: string;
  fyBudget: number;
  budgeted: number;
  allocPct: number;
  spent: number;
  spendPct: number;
  claimed: number;
  received: number;
  expiryDate?: string;
  daysRemaining?: number;
  status: 'RED' | 'YELLOW' | 'GREEN';
}

interface ProjectSummaryTableProps {
  fundingExpiry: FundingExpiryStatus[];
  projectSpending: ProjectSpending[];
  claimsSummary: ClaimsSummary;
}

const sortColumns: SortColumnDef<ProjectSummaryRow>[] = [
  { key: 'projectName', accessor: r => r.projectName, type: 'string' },
  { key: 'funderName', accessor: r => r.funderName, type: 'string' },
  { key: 'fyBudget', accessor: r => r.fyBudget, type: 'number' },
  { key: 'budgeted', accessor: r => r.budgeted, type: 'number' },
  { key: 'allocPct', accessor: r => r.allocPct, type: 'number' },
  { key: 'spent', accessor: r => r.spent, type: 'number' },
  { key: 'spendPct', accessor: r => r.spendPct, type: 'number' },
  { key: 'claimed', accessor: r => r.claimed, type: 'number' },
  { key: 'received', accessor: r => r.received, type: 'number' },
  { key: 'daysRemaining', accessor: r => r.daysRemaining ?? 9999, type: 'number' },
];

const pctColor = (pct: number) => {
  if (pct >= 80) return 'text-emerald-700 bg-emerald-50';
  if (pct >= 50) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
};

const statusDot = (status: 'RED' | 'YELLOW' | 'GREEN') => {
  const color = status === 'RED' ? 'bg-red-500' : status === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProjectSummaryTable: React.FC<ProjectSummaryTableProps> = ({
  fundingExpiry,
  projectSpending,
  claimsSummary,
}) => {
  // Build rows by merging data sources
  const rows: ProjectSummaryRow[] = fundingExpiry.map(fe => {
    const spending = projectSpending.find(ps => ps.projectId === fe.projectId);
    const claims = claimsSummary.byProject[fe.projectId];
    const budgeted = spending?.budgeted ?? 0;
    const spent = spending?.actual ?? 0;

    return {
      projectId: fe.projectId,
      projectName: fe.projectName,
      funderName: fe.funderName,
      fyBudget: fe.totalBudget,
      budgeted,
      allocPct: fe.totalBudget > 0 ? Math.round((budgeted / fe.totalBudget) * 100) : 0,
      spent,
      spendPct: budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0,
      claimed: claims?.claimed ?? 0,
      received: claims?.received ?? 0,
      expiryDate: fe.expiryDate,
      daysRemaining: fe.daysRemaining,
      status: fe.status,
    };
  });

  const { sortedData, sortConfig, requestSort } = useSort({ data: rows, columns: sortColumns });

  // Footer totals
  const totals = rows.reduce(
    (acc, r) => ({
      fyBudget: acc.fyBudget + r.fyBudget,
      budgeted: acc.budgeted + r.budgeted,
      spent: acc.spent + r.spent,
      claimed: acc.claimed + r.claimed,
      received: acc.received + r.received,
    }),
    { fyBudget: 0, budgeted: 0, spent: 0, claimed: 0, received: 0 }
  );
  const totalAllocPct = totals.fyBudget > 0 ? Math.round((totals.budgeted / totals.fyBudget) * 100) : 0;
  const totalSpendPct = totals.budgeted > 0 ? Math.round((totals.spent / totals.budgeted) * 100) : 0;

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base font-semibold text-cyan-900 mb-4">Project Financial Summary</h3>
        <p className="text-sm text-slate-500 text-center py-8">No active projects</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-cyan-900">Project Financial Summary</h3>
        <p className="text-xs text-slate-500 mt-1">All active projects — budget, spending, claims, and deadlines</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <SortableHeader label="Project" sortKey="projectName" currentSort={sortConfig} onSort={requestSort} />
              <SortableHeader label="Funder" sortKey="funderName" currentSort={sortConfig} onSort={requestSort} />
              <SortableHeader label="FY Budget" sortKey="fyBudget" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Budgeted" sortKey="budgeted" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Alloc %" sortKey="allocPct" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Spent" sortKey="spent" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Spend %" sortKey="spendPct" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Claimed" sortKey="claimed" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Received" sortKey="received" currentSort={sortConfig} onSort={requestSort} align="right" />
              <SortableHeader label="Deadline" sortKey="daysRemaining" currentSort={sortConfig} onSort={requestSort} />
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map(row => (
              <tr key={row.projectId} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <Link
                    to={`/app/projects/${row.projectId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {row.projectName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{row.funderName}</td>
                <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">{formatCurrency(row.fyBudget)}</td>
                <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">{formatCurrency(row.budgeted)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pctColor(row.allocPct)}`}>
                    {row.allocPct}%
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">{formatCurrency(row.spent)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pctColor(row.spendPct)}`}>
                    {row.spendPct}%
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">{formatCurrency(row.claimed)}</td>
                <td className="px-5 py-3 text-sm text-right font-medium text-slate-900">{formatCurrency(row.received)}</td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  <div>{formatDate(row.expiryDate)}</div>
                  {row.daysRemaining !== undefined && (
                    <div className={`text-xs ${row.daysRemaining < 90 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                      {row.daysRemaining}d left
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-center">{statusDot(row.status)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
              <td className="px-5 py-3 text-sm text-slate-700">Totals</td>
              <td className="px-5 py-3" />
              <td className="px-5 py-3 text-sm text-right text-slate-900">{formatCurrency(totals.fyBudget)}</td>
              <td className="px-5 py-3 text-sm text-right text-slate-900">{formatCurrency(totals.budgeted)}</td>
              <td className="px-5 py-3 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pctColor(totalAllocPct)}`}>
                  {totalAllocPct}%
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-right text-slate-900">{formatCurrency(totals.spent)}</td>
              <td className="px-5 py-3 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${pctColor(totalSpendPct)}`}>
                  {totalSpendPct}%
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-right text-slate-900">{formatCurrency(totals.claimed)}</td>
              <td className="px-5 py-3 text-sm text-right text-slate-900">{formatCurrency(totals.received)}</td>
              <td className="px-5 py-3" />
              <td className="px-5 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProjectSummaryTable;
