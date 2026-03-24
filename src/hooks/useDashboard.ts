import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SpendingAlert } from '../db/schema';
import { calculateCost } from './useEmployees';

interface DashboardMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalFYFunding: number;
  spendingPace: number;
  activeProjects: number;
  pipelineProjects: number;
  alerts: SpendingAlert[];
  salaryBudgeted: number;
  salaryActual: number;
  inKindSalaryBudgeted: number;
  inKindSalaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
}

interface ProjectSpending {
  projectId: string;
  projectName: string;
  projectCode: string;
  budgeted: number;
  actual: number;
  variance: number;
  salaryBudgeted: number;
  salaryActual: number;
  inKindSalaryBudgeted: number;
  inKindSalaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
}

interface OrgBreakdown {
  orgCode: string;
  orgName: string;
  totalHours: number;
  totalCost: number;
  inKindHours: number;
  inKindCost: number;
}

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

export function useDashboard(fiscalYearId: string, quarterId: string) {
  const metrics = useLiveQuery(async () => {
    const isFullYear = quarterId === 'full';
    const projects = await db.projects.filter(p => p.isActive).toArray();

    let allocations = await db.salaryAllocations
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();
    if (!isFullYear) {
      allocations = allocations.filter(a => a.quarterId === quarterId);
    }

    const allRates = await db.employeeRates
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();

    const alerts = await db.spendingAlerts
      .filter(a => !a.isAcknowledged)
      .toArray();

    // Query expenses
    let expenses = await db.expenses
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();
    if (!isFullYear) {
      expenses = expenses.filter(e => e.quarterId === quarterId);
    }

    // Calculate salary totals (cash vs in-kind)
    let salaryBudgeted = 0;
    let salaryActual = 0;
    let inKindSalaryBudgeted = 0;
    let inKindSalaryActual = 0;

    for (const project of projects.filter(p => p.status === 'active')) {
      const projectAllocations = allocations.filter(a => a.projectId === project.id);
      const cap = project.benefitsCapPercent / 100;
      const capType = project.benefitsCapType ?? 'percentage-of-benefits';

      for (const allocation of projectAllocations) {
        const rate = allRates.find(r =>
          r.employeeId === allocation.employeeId && r.quarterId === allocation.quarterId
        ) ?? allRates.find(r => r.employeeId === allocation.employeeId);
        if (rate) {
          const budgetCost = calculateCost(allocation.budgetedHours, rate, cap, capType).fundedCost;
          if (allocation.isInKind) {
            inKindSalaryBudgeted += budgetCost;
          } else {
            salaryBudgeted += budgetCost;
          }
          if (allocation.actualHours !== null) {
            const actualCost = calculateCost(allocation.actualHours, rate, cap, capType).fundedCost;
            if (allocation.isInKind) {
              inKindSalaryActual += actualCost;
            } else {
              salaryActual += actualCost;
            }
          }
        }
      }
    }

    // Calculate expense totals
    let expenseBudgeted = 0;
    let expenseActual = 0;

    for (const expense of expenses) {
      expenseBudgeted += expense.budgetedAmount;
      if (expense.actualAmount !== null) {
        expenseActual += expense.actualAmount;
      }
    }

    const totalBudget = salaryBudgeted + expenseBudgeted;
    const totalSpent = salaryActual + expenseActual;
    const totalRemaining = totalBudget - totalSpent;
    const totalFYFunding = projects
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.fiscalYearBudget, 0);
    const spendingPace = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      totalFYFunding,
      spendingPace,
      activeProjects: projects.filter(p => p.status === 'active' && (
        allocations.some(a => a.projectId === p.id) ||
        expenses.some(e => e.projectId === p.id)
      )).length,
      pipelineProjects: projects.filter(p => p.status === 'pipeline').length,
      alerts,
      salaryBudgeted,
      salaryActual,
      inKindSalaryBudgeted,
      inKindSalaryActual,
      expenseBudgeted,
      expenseActual,
    } as DashboardMetrics;
  }, [fiscalYearId, quarterId]);

  return metrics ?? {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    totalFYFunding: 0,
    spendingPace: 0,
    activeProjects: 0,
    pipelineProjects: 0,
    alerts: [],
    salaryBudgeted: 0,
    salaryActual: 0,
    inKindSalaryBudgeted: 0,
    inKindSalaryActual: 0,
    expenseBudgeted: 0,
    expenseActual: 0,
  };
}

export function useProjectSpending(fiscalYearId: string, quarterId: string) {
  const spending = useLiveQuery(async () => {
    const isFullYear = quarterId === 'full';
    const projects = await db.projects.filter(p => p.isActive).toArray();

    let allocations = await db.salaryAllocations
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();
    if (!isFullYear) {
      allocations = allocations.filter(a => a.quarterId === quarterId);
    }

    let expenses = await db.expenses
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();
    if (!isFullYear) {
      expenses = expenses.filter(e => e.quarterId === quarterId);
    }

    const allRates = await db.employeeRates
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();

    const result: ProjectSpending[] = [];

    for (const project of projects.filter(p => p.status === 'active')) {
      const projectAllocations = allocations.filter(a => a.projectId === project.id);
      const projectExpenses = expenses.filter(e => e.projectId === project.id);
      const cap = project.benefitsCapPercent / 100;
      const capType = project.benefitsCapType ?? 'percentage-of-benefits';

      let salaryBudgeted = 0;
      let salaryActual = 0;
      let inKindSalaryBudgeted = 0;
      let inKindSalaryActual = 0;

      for (const allocation of projectAllocations) {
        const rate = allRates.find(r =>
          r.employeeId === allocation.employeeId && r.quarterId === allocation.quarterId
        ) ?? allRates.find(r => r.employeeId === allocation.employeeId);
        if (rate) {
          const budgetCost = calculateCost(allocation.budgetedHours, rate, cap, capType).fundedCost;
          if (allocation.isInKind) {
            inKindSalaryBudgeted += budgetCost;
          } else {
            salaryBudgeted += budgetCost;
          }
          if (allocation.actualHours !== null) {
            const actualCost = calculateCost(allocation.actualHours, rate, cap, capType).fundedCost;
            if (allocation.isInKind) {
              inKindSalaryActual += actualCost;
            } else {
              salaryActual += actualCost;
            }
          }
        }
      }

      let expenseBudgeted = 0;
      let expenseActual = 0;

      for (const expense of projectExpenses) {
        expenseBudgeted += expense.budgetedAmount;
        if (expense.actualAmount !== null) {
          expenseActual += expense.actualAmount;
        }
      }

      const budgeted = salaryBudgeted + expenseBudgeted;
      const actual = salaryActual + expenseActual;

      if (budgeted > 0 || actual > 0 || inKindSalaryBudgeted > 0 || inKindSalaryActual > 0) {
        result.push({
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          budgeted,
          actual,
          variance: budgeted - actual,
          salaryBudgeted,
          salaryActual,
          inKindSalaryBudgeted,
          inKindSalaryActual,
          expenseBudgeted,
          expenseActual,
        });
      }
    }

    return result;
  }, [fiscalYearId, quarterId]);

  return spending ?? [];
}

export function useOrgBreakdown(fiscalYearId: string, quarterId: string): OrgBreakdown[] {
  const breakdown = useLiveQuery(async () => {
    const isFullYear = quarterId === 'full';

    let allocations = await db.salaryAllocations
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();
    if (!isFullYear) {
      allocations = allocations.filter(a => a.quarterId === quarterId);
    }

    const employees = await db.employees.toArray();
    const organizations = await db.organizations.toArray();
    const allRates = await db.employeeRates
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();

    const orgTotals: Record<string, { hours: number; cost: number; inKindHours: number; inKindCost: number }> = {};

    for (const allocation of allocations) {
      const employee = employees.find(e => e.id === allocation.employeeId);
      if (!employee) continue;

      const rate = allRates.find(r =>
        r.employeeId === allocation.employeeId && r.quarterId === allocation.quarterId
      ) ?? allRates.find(r => r.employeeId === allocation.employeeId);
      const hours = allocation.actualHours ?? allocation.budgetedHours;
      const cost = rate ? hours * (rate.baseHourlyRate + rate.benefitsRate) : 0;

      if (!orgTotals[employee.organizationId]) {
        orgTotals[employee.organizationId] = { hours: 0, cost: 0, inKindHours: 0, inKindCost: 0 };
      }
      if (allocation.isInKind) {
        orgTotals[employee.organizationId].inKindHours += hours;
        orgTotals[employee.organizationId].inKindCost += cost;
      } else {
        orgTotals[employee.organizationId].hours += hours;
        orgTotals[employee.organizationId].cost += cost;
      }
    }

    return organizations.map(org => ({
      orgCode: org.code,
      orgName: org.name,
      totalHours: orgTotals[org.id]?.hours ?? 0,
      totalCost: orgTotals[org.id]?.cost ?? 0,
      inKindHours: orgTotals[org.id]?.inKindHours ?? 0,
      inKindCost: orgTotals[org.id]?.inKindCost ?? 0,
    })).filter(o => o.totalHours > 0 || o.inKindHours > 0);
  }, [fiscalYearId, quarterId]);

  return breakdown ?? [];
}

export function useFundingExpiryStatus() {
  const status = useLiveQuery(async () => {
    const projects = await db.projects.filter(p => p.isActive).toArray();
    const funders = await db.funders.toArray();
    const allAllocations = await db.salaryAllocations.toArray();
    const allExpenses = await db.expenses.toArray();
    const allRates = await db.employeeRates.toArray();
    const today = new Date();

    const result: FundingExpiryStatus[] = [];

    for (const project of projects.filter(p => p.status === 'active')) {
      const funder = funders.find(f => f.id === project.funderId);
      if (!funder) continue;

      let daysRemaining: number | undefined;
      let expiryStatus: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';

      // Use project end date or funder expiry date
      const expiryDate = project.endDate || funder.expiryDate;

      if (expiryDate) {
        const expiry = new Date(expiryDate);
        daysRemaining = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining < 90) {
          expiryStatus = 'RED';
        } else if (daysRemaining < 180) {
          expiryStatus = 'YELLOW';
        }
      }

      // Calculate total spent (cash salary actuals + expense actuals; exclude in-kind)
      const projAllocations = allAllocations.filter(a => a.projectId === project.id && !a.isInKind);
      const cap = project.benefitsCapPercent / 100;
      const capType = project.benefitsCapType ?? 'percentage-of-benefits';
      let salarySpent = 0;
      for (const alloc of projAllocations) {
        if (alloc.actualHours !== null) {
          const rate = allRates.find(r =>
            r.employeeId === alloc.employeeId && r.quarterId === alloc.quarterId
          ) ?? allRates.find(r => r.employeeId === alloc.employeeId);
          if (rate) {
            salarySpent += calculateCost(alloc.actualHours, rate, cap, capType).fundedCost;
          }
        }
      }

      const projExpenses = allExpenses.filter(e => e.projectId === project.id);
      let expenseSpent = 0;
      for (const exp of projExpenses) {
        if (exp.actualAmount !== null) {
          expenseSpent += exp.actualAmount;
        }
      }

      const totalSpent = salarySpent + expenseSpent;
      const totalBudget = project.fiscalYearBudget;
      const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      result.push({
        projectId: project.id,
        projectName: project.name,
        funderName: funder.name,
        expiryDate,
        daysRemaining,
        status: expiryStatus,
        totalBudget,
        totalSpent,
        budgetUtilization,
      });
    }

    // Sort by days remaining (most urgent first)
    return result.sort((a, b) => {
      if (a.daysRemaining === undefined) return 1;
      if (b.daysRemaining === undefined) return -1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, []);

  return status ?? [];
}
