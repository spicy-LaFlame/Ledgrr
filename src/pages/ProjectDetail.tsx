import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, ExternalLink, DollarSign, Calendar, Building2, Users, Receipt } from 'lucide-react';
import { useProject, useProjects } from '../hooks/useProjects';
import { useAllocations, useExpenses, useExpenseCategories, useFiscalPeriods } from '../hooks/useAllocations';
import { useEmployees, useEmployeeRates, calculateCost } from '../hooks/useEmployees';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import type { ProjectFormData } from '../hooks/useProjects';
import type { PaymentMethod } from '../db/schema';

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pipeline: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-600' },
  'on-hold': { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const fundingTypeStyles: Record<string, { bg: string; text: string }> = {
  cash: { bg: 'bg-blue-100', text: 'text-blue-700' },
  'in-kind': { bg: 'bg-purple-100', text: 'text-purple-700' },
  mixed: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

const paymentMethodLabels: Record<PaymentMethod, { label: string; bg: string; text: string }> = {
  'corporate-card': { label: 'Corporate Card', bg: 'bg-blue-100', text: 'text-blue-700' },
  'direct-billing': { label: 'Direct Billing', bg: 'bg-green-100', text: 'text-green-700' },
  'invoice': { label: 'Invoice', bg: 'bg-amber-100', text: 'text-amber-700' },
  'employee': { label: 'Employee', bg: 'bg-purple-100', text: 'text-purple-700' },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { project, funder } = useProject(id);
  const { allocations } = useAllocations({ projectId: id });
  const { expenses } = useExpenses({ projectId: id });
  const { funders, updateProject } = useProjects();
  const { allEmployees } = useEmployees();
  const { currentFiscalYear } = useFiscalPeriods();
  const { rates } = useEmployeeRates(undefined, currentFiscalYear?.id);
  const categories = useExpenseCategories();
  const { quarters } = useFiscalPeriods();
  const [showEditModal, setShowEditModal] = useState(false);

  const getEmployeeName = (empId: string) => allEmployees.find(e => e.id === empId)?.name ?? 'Unknown';
  const getQuarterName = (qId: string) => quarters.find(q => q.id === qId)?.name ?? '—';
  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name ?? 'Unknown';

  // Allocation cost calculations
  const allocationData = useMemo(() => {
    if (!project) return { rows: [], totals: { budgetedHours: 0, actualHours: 0, budgetedCost: 0, actualCost: 0 } };

    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';
    let totalBudgetedHours = 0;
    let totalActualHours = 0;
    let totalBudgetedCost = 0;
    let totalActualCost = 0;

    const rows = allocations.map(a => {
      const rate = rates.find(r =>
        r.employeeId === a.employeeId && r.quarterId === a.quarterId
      ) ?? rates.find(r => r.employeeId === a.employeeId);

      let budgetedCost = 0;
      let actualCost = 0;

      if (rate) {
        budgetedCost = calculateCost(a.budgetedHours, rate, cap, capType).fundedCost;
        if (a.actualHours !== null) {
          actualCost = calculateCost(a.actualHours, rate, cap, capType).fundedCost;
        }
      }

      totalBudgetedHours += a.budgetedHours;
      if (a.actualHours !== null) totalActualHours += a.actualHours;
      totalBudgetedCost += budgetedCost;
      totalActualCost += actualCost;

      return { ...a, budgetedCost, actualCost };
    });

    return {
      rows,
      totals: { budgetedHours: totalBudgetedHours, actualHours: totalActualHours, budgetedCost: totalBudgetedCost, actualCost: totalActualCost },
    };
  }, [allocations, rates, project]);

  // Expense totals
  const expenseData = useMemo(() => {
    let totalBudgeted = 0;
    let totalActual = 0;

    for (const e of expenses) {
      totalBudgeted += e.budgetedAmount;
      if (e.actualAmount !== null) totalActual += e.actualAmount;
    }

    return { totalBudgeted, totalActual, variance: totalBudgeted - totalActual };
  }, [expenses]);

  const handleEditProject = async (data: ProjectFormData) => {
    if (project) {
      await updateProject(project.id, data);
    }
  };

  // Loading state
  if (project === undefined) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!project) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Project Not Found</h2>
            <p className="text-sm text-slate-500 mb-4">This project may have been deleted or doesn't exist.</p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const style = statusStyles[project.status] ?? statusStyles.active;
  const fundingStyle = fundingTypeStyles[project.fundingType] ?? fundingTypeStyles.cash;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb + Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${fundingStyle.bg} ${fundingStyle.text}`}>
                {project.fundingType.charAt(0).toUpperCase() + project.fundingType.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors w-fit"
          >
            <Pencil className="w-4 h-4" />
            Edit Project
          </button>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Project Code</p>
            <p className="text-sm text-slate-900">{project.code}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Cost Centre</p>
            <p className="text-sm text-slate-900">{project.costCentreNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Funder</p>
            <p className="text-sm text-slate-900">{funder?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Principal Investigator</p>
            <p className="text-sm text-slate-900">{project.principalInvestigator || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Benefits Cap</p>
            <p className="text-sm text-slate-900">
              {project.benefitsCapPercent}%{' '}
              <span className="text-xs text-slate-500">
                ({project.benefitsCapType === 'percentage-of-wages' ? 'of wages' : 'of benefits'})
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Timeline</p>
            <p className="text-sm text-slate-900">
              {formatDate(project.startDate)}
              {project.endDate && ` — ${formatDate(project.endDate)}`}
            </p>
          </div>
          {project.fundingAgreementUrl && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Funding Agreement</p>
              <a
                href={project.fundingAgreementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                View Document
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
          {project.description && (
            <div className="col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700">{project.description}</p>
            </div>
          )}
          {project.notes && (
            <div className="col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Internal Notes</p>
              <p className="text-sm text-slate-700">{project.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">Total Cash Budget</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(project.totalBudget)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">FY Cash Budget</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(project.fiscalYearBudget)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">Total In-Kind</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(project.inKindBudget)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">FY In-Kind</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(project.inKindFiscalYearBudget)}</p>
          </div>
        </div>
      </div>

      {/* Salary Allocations */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Salary Allocations</h3>
          </div>
          <p className="text-xs text-slate-500">
            {allocations.length} record{allocations.length !== 1 ? 's' : ''} across all quarters
          </p>
        </div>

        {allocations.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Budgeted Hours</p>
              <p className="text-lg font-bold text-slate-900">{allocationData.totals.budgetedHours.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Actual Hours</p>
              <p className="text-lg font-bold text-slate-900">{allocationData.totals.actualHours.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Budgeted Cost</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(allocationData.totals.budgetedCost)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Actual Cost</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(allocationData.totals.actualCost)}</p>
            </div>
          </div>
        )}

        {allocations.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No salary allocations recorded for this project yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Hrs</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual Hrs</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Cost</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual Cost</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">In-Kind</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocationData.rows.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-slate-900">{getEmployeeName(a.employeeId)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-600">{getQuarterName(a.quarterId)}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm text-slate-700">{a.budgetedHours}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm text-slate-700">
                        {a.actualHours !== null ? a.actualHours : <span className="text-slate-300">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(a.budgetedCost)}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-medium text-slate-900">
                        {a.actualHours !== null ? formatCurrency(a.actualCost) : <span className="text-slate-300">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {a.isInKind && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          In-Kind
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-5 py-3" colSpan={2}>
                    <span className="text-sm font-semibold text-slate-900">Totals</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{allocationData.totals.budgetedHours.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{allocationData.totals.actualHours.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(allocationData.totals.budgetedCost)}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(allocationData.totals.actualCost)}</span>
                  </td>
                  <td className="px-5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Expenses</h3>
          </div>
          <p className="text-xs text-slate-500">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {expenses.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Budgeted</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(expenseData.totalBudgeted)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Actual</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(expenseData.totalActual)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Variance</p>
              <p className={`text-lg font-bold ${expenseData.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(expenseData.variance)}
              </p>
            </div>
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No expenses recorded for this project yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Budgeted</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actual</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Variance</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => {
                  const variance = e.actualAmount !== null ? e.budgetedAmount - e.actualAmount : null;
                  const pmStyle = e.paymentMethod ? paymentMethodLabels[e.paymentMethod] : null;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600">{getCategoryName(e.categoryId)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600">{getQuarterName(e.quarterId)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-700 max-w-[200px] truncate block">{e.description}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(e.budgetedAmount)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-medium text-slate-900">
                          {e.actualAmount !== null ? formatCurrency(e.actualAmount) : <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {variance !== null ? (
                          <span className={`text-sm font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(variance)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {pmStyle ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pmStyle.bg} ${pmStyle.text}`}>
                            {pmStyle.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-5 py-3" colSpan={3}>
                    <span className="text-sm font-semibold text-slate-900">Totals</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(expenseData.totalBudgeted)}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(expenseData.totalActual)}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-sm font-semibold ${expenseData.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(expenseData.variance)}
                    </span>
                  </td>
                  <td className="px-5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ProjectFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProject}
        project={project}
        funders={funders}
        mode="edit"
      />
    </div>
  );
};

export default ProjectDetail;
