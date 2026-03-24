import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FolderKanban,
  Wallet,
} from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import DashboardHeader, { type QuarterSelection } from '../components/dashboard/DashboardHeader';
import Alerts from '../components/dashboard/Alerts';
import BudgetVsActualChart from '../components/dashboard/BudgetVsActualChart';
import OrgBreakdownChart from '../components/dashboard/OrgBreakdownChart';
import FundingAllocationBar from '../components/dashboard/FundingAllocationBar';
import ClaimsStatusPanel from '../components/dashboard/ClaimsStatusPanel';
import ProjectSummaryTable from '../components/dashboard/ProjectSummaryTable';
import {
  useDashboard,
  useProjectSpending,
  useOrgBreakdown,
  useFundingExpiryStatus,
} from '../hooks';
import { useClaimsSummary } from '../hooks/useClaims';
import QueryBox from '../components/ai/QueryBox';
import { useFiscalPeriods } from '../hooks/useAllocations';
import { formatCurrency } from '../utils/formatters';
import { SkeletonDashboard } from '../components/shared/Skeleton';

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
  const claimsSummary = useClaimsSummary(fiscalYearId);

  const isLoading = metrics.totalBudget === 0 && metrics.activeProjects === 0 && fiscalYears.length === 0;

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  const allocPct = metrics.totalFYFunding > 0
    ? Math.round((metrics.totalBudget / metrics.totalFYFunding) * 100)
    : 0;
  const receivedPct = claimsSummary.totalClaimed > 0
    ? Math.round((claimsSummary.totalReceived / claimsSummary.totalClaimed) * 100)
    : 0;

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

      {/* Metric Cards - 5 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <MetricCard
          title="Total FY Funding"
          value={formatCurrency(metrics.totalFYFunding)}
          icon={<DollarSign className="w-5 h-5" />}
          subValue={`${metrics.activeProjects + metrics.pipelineProjects} projects`}
          onArrowClick={() => navigate('/app/projects')}
        />
        <MetricCard
          title="Planned"
          value={formatCurrency(metrics.totalBudget)}
          icon={<Wallet className="w-5 h-5" />}
          trend={{ value: allocPct, label: 'of funding' }}
          trendPositive={allocPct >= 50}
          subValue={`Salary: ${formatCurrency(metrics.salaryBudgeted)} | Exp: ${formatCurrency(metrics.expenseBudgeted)}`}
        />
        <MetricCard
          title="Actual Spent"
          value={formatCurrency(metrics.totalSpent)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: metrics.spendingPace, label: 'of planned' }}
          trendPositive={metrics.spendingPace > 0}
          subValue={`Salary: ${formatCurrency(metrics.salaryActual)} | Exp: ${formatCurrency(metrics.expenseActual)}`}
          onArrowClick={() => navigate('/app/allocations')}
        />
        <MetricCard
          title="Claims"
          value={formatCurrency(claimsSummary.totalReceived)}
          icon={<Receipt className="w-5 h-5" />}
          trend={claimsSummary.totalClaimed > 0 ? { value: receivedPct, label: 'of claimed' } : null}
          trendPositive={receivedPct >= 50}
          subValue={claimsSummary.outstanding > 0 ? `Outstanding: ${formatCurrency(claimsSummary.outstanding)}` : undefined}
          onArrowClick={() => navigate('/app/claims')}
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects.toString()}
          icon={<FolderKanban className="w-5 h-5" />}
          subValue={`+${metrics.pipelineProjects} in pipeline`}
          onArrowClick={() => navigate('/app/projects')}
        />
      </div>

      {/* Funding Allocation Bar */}
      <FundingAllocationBar
        totalFYFunding={metrics.totalFYFunding}
        totalBudgeted={metrics.totalBudget}
        totalSpent={metrics.totalSpent}
      />

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="mb-8">
          <Alerts alerts={metrics.alerts} />
        </div>
      )}

      {/* Claims Status Panel */}
      <ClaimsStatusPanel summary={claimsSummary} fiscalYearName={fiscalYear} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BudgetVsActualChart data={projectSpending} formatCurrency={formatCurrency} />
        </div>
        <div>
          <OrgBreakdownChart data={orgBreakdown} formatCurrency={formatCurrency} />
        </div>
      </div>

      {/* Project Financial Summary Table */}
      <ProjectSummaryTable
        fundingExpiry={fundingExpiry}
        projectSpending={projectSpending}
        claimsSummary={claimsSummary}
      />

      {/* AI Query Box */}
      <div className="mt-8">
        <QueryBox />
      </div>
    </div>
  );
};

export default Dashboard;
