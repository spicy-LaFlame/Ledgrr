import type { SafeProjectData, SafeDashboardContext } from './types';

/**
 * Sanitize project summary report rows into AI-safe data.
 * Strips any employee-level detail; keeps only aggregated project totals.
 */
export function sanitizeProjectSummaryRows(rows: Array<{
  projectName: string;
  projectCode: string;
  funderName: string;
  status: string;
  totalBudget: number;
  fiscalYearBudget: number;
  salaryBudgeted: number;
  salaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
  totalBudgeted: number;
  totalActual: number;
  variance: number;
  utilizationPct: number;
  inKindBudget: number;
  inKindActual: number;
  benefitsCapPct: number;
  endDate: string;
}>): SafeProjectData[] {
  return rows.map(row => ({
    projectName: row.projectName,
    projectCode: row.projectCode,
    funderName: row.funderName,
    status: row.status,
    totalBudget: row.totalBudget,
    fiscalYearBudget: row.fiscalYearBudget,
    salaryBudgeted: row.salaryBudgeted,
    salaryActual: row.salaryActual,
    expenseBudgeted: row.expenseBudgeted,
    expenseActual: row.expenseActual,
    totalBudgeted: row.totalBudgeted,
    totalActual: row.totalActual,
    variance: row.variance,
    utilizationPct: row.utilizationPct,
    inKindBudget: row.inKindBudget,
    inKindActual: row.inKindActual,
    benefitsCapPct: row.benefitsCapPct,
    endDate: row.endDate,
    teamSize: 0, // Not available at summary level
  }));
}

/**
 * Sanitize a single project status into AI-safe data.
 * Replaces teamMembers array with just a count.
 */
export function sanitizeProjectStatus(data: {
  projectName: string;
  projectCode: string;
  funderName: string;
  status: string;
  totalBudget: number;
  fiscalYearBudget: number;
  salaryBudgeted: number;
  salaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
  totalBudgeted: number;
  totalActual: number;
  variance: number;
  utilizationPct: number;
  inKindBudget: number;
  inKindActual: number;
  benefitsCapPct: number;
  endDate: string;
  daysRemaining: number;
  urgency: string;
  teamMembers: unknown[];
}): SafeProjectData {
  return {
    projectName: data.projectName,
    projectCode: data.projectCode,
    funderName: data.funderName,
    status: data.status,
    totalBudget: data.totalBudget,
    fiscalYearBudget: data.fiscalYearBudget,
    salaryBudgeted: data.salaryBudgeted,
    salaryActual: data.salaryActual,
    expenseBudgeted: data.expenseBudgeted,
    expenseActual: data.expenseActual,
    totalBudgeted: data.totalBudgeted,
    totalActual: data.totalActual,
    variance: data.variance,
    utilizationPct: data.utilizationPct,
    inKindBudget: data.inKindBudget,
    inKindActual: data.inKindActual,
    benefitsCapPct: data.benefitsCapPct,
    endDate: data.endDate,
    daysRemaining: data.daysRemaining,
    urgency: data.urgency,
    teamSize: data.teamMembers.length,
  };
}

/**
 * Build a safe dashboard context for natural language queries.
 */
export function buildSafeDashboardContext(
  fiscalYear: string,
  projects: SafeProjectData[],
  fundingExpiry: Array<{
    projectName: string;
    funderName: string;
    daysRemaining: number;
    urgency: string;
    budgetUtilization: number;
  }>,
  totals: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    spendingPace: number;
    activeProjects: number;
  }
): SafeDashboardContext {
  return {
    fiscalYear,
    today: new Date().toISOString().split('T')[0],
    totals,
    projects,
    fundingExpiry,
  };
}
