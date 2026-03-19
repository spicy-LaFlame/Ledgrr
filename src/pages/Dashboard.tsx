import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Clock,
  FolderKanban,
} from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import DashboardHeader, { type QuarterSelection } from '../components/dashboard/DashboardHeader';
import Alerts from '../components/dashboard/Alerts';
import BudgetVsActualChart from '../components/dashboard/BudgetVsActualChart';
import OrgBreakdownChart from '../components/dashboard/OrgBreakdownChart';
import FundingExpiryTable from '../components/dashboard/FundingExpiryTable';
import {
  useDashboard,
  useProjectSpending,
  useOrgBreakdown,
  useFundingExpiryStatus,
} from '../hooks';
import QueryBox from '../components/ai/QueryBox';
import { useFiscalPeriods } from '../hooks/useAllocations';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { fiscalYears, getQuartersForYear, getCurrentQuarter } = useFiscalPeriods();
  const currentQuarter = getCurrentQuarter();

  const [fiscalYear, setFiscalYear] = useState('2025-26');
  const [quarter, setQuarter] = useState<QuarterSelection>(currentQuarter?.quarterNumber ?? 3);

  const fiscalYearId = fiscalYears.find(fy => fy.name === fiscalYear)?.id ?? 'fy-2025-26';
  const quarters = getQuartersForYear(fiscalYearId);
  const quarterId = quarter === 'full'
    ? 'full'
    : quarters.find(q => q.quarterNumber === quarter)?.id ?? `q${quarter}-${fiscalYear}`;

  const metrics = useDashboard(fiscalYearId, quarterId);
  const projectSpending = useProjectSpending(fiscalYearId, quarterId);
  const orgBreakdown = useOrgBreakdown(fiscalYearId, quarterId);
  const fundingExpiry = useFundingExpiryStatus();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = metrics.totalBudget === 0 && metrics.activeProjects === 0 && fiscalYears.length === 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Spending breakdown percentages
  const totalSpentCombined = metrics.salaryActual + metrics.expenseActual;
  const salaryPct = totalSpentCombined > 0 ? (metrics.salaryActual / totalSpentCombined) * 100 : 0;
  const expensePct = totalSpentCombined > 0 ? (metrics.expenseActual / totalSpentCombined) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        quarter={quarter}
        setQuarter={setQuarter}
        onRefresh={() => {}}
        isLoading={false}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <MetricCard
          title="Total Budget"
          value={formatCurrency(metrics.totalBudget)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={null}
          subValue={`Salary: ${formatCurrency(metrics.salaryBudgeted)} | Expenses: ${formatCurrency(metrics.expenseBudgeted)}`}
        />
        <MetricCard
          title="Total Spent"
          value={formatCurrency(metrics.totalSpent)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: metrics.spendingPace, label: 'of budget' }}
          trendPositive={metrics.spendingPace > 0}
          subValue={`Salary: ${formatCurrency(metrics.salaryActual)} | Expenses: ${formatCurrency(metrics.expenseActual)}`}
          onArrowClick={() => navigate('/allocations')}
        />
        <MetricCard
          title="Remaining"
          value={formatCurrency(metrics.totalRemaining)}
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 100 - metrics.spendingPace, label: 'remaining' }}
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects.toString()}
          icon={<FolderKanban className="w-5 h-5" />}
          subValue={`+${metrics.pipelineProjects} in pipeline`}
          onArrowClick={() => navigate('/projects')}
        />
      </div>

      {/* Spending Breakdown Bar */}
      {totalSpentCombined > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Spending Breakdown</h3>
            <span className="text-xs text-slate-500">Total: {formatCurrency(totalSpentCombined)}</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
            <div
              className="bg-blue-600 transition-all"
              style={{ width: `${salaryPct}%` }}
              title={`Salary: ${formatCurrency(metrics.salaryActual)}`}
            />
            <div
              className="bg-blue-300 transition-all"
              style={{ width: `${expensePct}%` }}
              title={`Expenses: ${formatCurrency(metrics.expenseActual)}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-2">
            <span className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Salary: {formatCurrency(metrics.salaryActual)} ({salaryPct.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
              Expenses: {formatCurrency(metrics.expenseActual)} ({expensePct.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="mb-8">
          <Alerts alerts={metrics.alerts} />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BudgetVsActualChart data={projectSpending} formatCurrency={formatCurrency} />
        </div>
        <div>
          <OrgBreakdownChart data={orgBreakdown} formatCurrency={formatCurrency} />
        </div>
      </div>

      {/* Funding Expiry Table */}
      <FundingExpiryTable statuses={fundingExpiry} formatCurrency={formatCurrency} />

      {/* AI Query Box */}
      <div className="mt-8">
        <QueryBox />
      </div>
    </div>
  );
};

export default Dashboard;
