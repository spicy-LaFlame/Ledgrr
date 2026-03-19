import type {
  GLEntry,
  PayrollEntry,
  Project,
  SalaryAllocation,
  Expense,
  EmployeeRate,
  BenefitsCapType,
} from '../db/schema';
import { calculateCost } from '../hooks/useEmployees';

// =============================================================================
// TYPES
// =============================================================================

export interface ReconciliationRow {
  costCentre: string;
  projectId: string | null;
  projectName: string | null;
  projectCode: string | null;
  funderName: string | null;
  // External data (merged)
  externalSalary: number;
  externalExpense: number;
  externalTotal: number;
  salarySource: 'payroll' | 'gl' | 'none';
  // App data
  appSalaryActual: number;
  appExpenseActual: number;
  appTotal: number;
  // Comparison
  variance: number;
  salaryVariance: number;
  expenseVariance: number;
  status: 'matched' | 'variance' | 'external-only' | 'app-only';
  hasUnclassifiedGL: boolean;
  unclassifiedAmount: number;
  // Counts for drill-down
  glEntryCount: number;
  payrollEntryCount: number;
}

export interface ReconciliationSummary {
  externalTotal: number;
  appTotal: number;
  netVariance: number;
  matchedCount: number;
  varianceCount: number;
  externalOnlyCount: number;
  appOnlyCount: number;
  totalRows: number;
}

interface ProjectLookup {
  project: Project;
  funderName: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

// =============================================================================
// MAIN RECONCILIATION
// =============================================================================

interface ReconciliationInput {
  glEntries: GLEntry[];
  payrollEntries: PayrollEntry[];
  projects: Project[];
  funderNames: Map<string, string>; // funderId -> name
  allocations: SalaryAllocation[];
  expenses: Expense[];
  rates: EmployeeRate[];
}

export function buildReconciliation(input: ReconciliationInput): ReconciliationRow[] {
  const {
    glEntries,
    payrollEntries,
    projects,
    funderNames,
    allocations,
    expenses,
    rates,
  } = input;

  // Build project lookup by cost centre
  const projectByCostCentre = new Map<string, ProjectLookup>();
  for (const project of projects) {
    if (project.costCentreNumber) {
      projectByCostCentre.set(project.costCentreNumber, {
        project,
        funderName: funderNames.get(project.funderId) ?? 'Unknown',
      });
    }
  }

  // Group external data by cost centre
  const glByCostCentre = groupBy(glEntries, e => e.costCentre);
  const payrollByCostCentre = groupBy(payrollEntries, e => e.costCentre);

  // Group app data by project
  const allocationsByProject = groupBy(allocations, a => a.projectId);
  const expensesByProject = groupBy(expenses, e => e.projectId);

  // Build rate lookup: employeeId+quarterId -> EmployeeRate
  const rateMap = new Map<string, EmployeeRate>();
  for (const rate of rates) {
    rateMap.set(`${rate.employeeId}|${rate.quarterId}`, rate);
  }

  // Collect all cost centres from both sides
  const allCostCentres = new Set<string>();
  for (const cc of glByCostCentre.keys()) allCostCentres.add(cc);
  for (const cc of payrollByCostCentre.keys()) allCostCentres.add(cc);
  for (const cc of projectByCostCentre.keys()) allCostCentres.add(cc);

  const rows: ReconciliationRow[] = [];

  for (const costCentre of allCostCentres) {
    const glLines = glByCostCentre.get(costCentre) ?? [];
    const payrollLines = payrollByCostCentre.get(costCentre) ?? [];
    const lookup = projectByCostCentre.get(costCentre);

    // External: salary
    const hasPayroll = payrollLines.length > 0;
    const glSalaryLines = glLines.filter(e => e.category === 'salary');
    const glExpenseLines = glLines.filter(e => e.category === 'expense');
    const glUnclassified = glLines.filter(e => e.category === 'unclassified');

    let externalSalary: number;
    let salarySource: 'payroll' | 'gl' | 'none';

    if (hasPayroll) {
      // Payroll replaces GL salary lines
      externalSalary = payrollLines.reduce((sum, e) => sum + e.earnings + (e.benefits ?? 0), 0);
      salarySource = 'payroll';
    } else if (glSalaryLines.length > 0) {
      externalSalary = glSalaryLines.reduce((sum, e) => sum + e.amount, 0);
      salarySource = 'gl';
    } else {
      externalSalary = 0;
      salarySource = 'none';
    }

    const externalExpense = glExpenseLines.reduce((sum, e) => sum + e.amount, 0);
    const unclassifiedAmount = glUnclassified.reduce((sum, e) => sum + e.amount, 0);
    const externalTotal = externalSalary + externalExpense + unclassifiedAmount;

    // App side
    let appSalaryActual = 0;
    let appExpenseActual = 0;

    if (lookup) {
      const projAllocations = allocationsByProject.get(lookup.project.id) ?? [];
      const projExpenses = expensesByProject.get(lookup.project.id) ?? [];
      const cap = lookup.project.benefitsCapPercent / 100;
      const capType: BenefitsCapType = lookup.project.benefitsCapType ?? 'percentage-of-benefits';

      for (const alloc of projAllocations) {
        const hours = alloc.actualHours ?? 0;
        if (hours === 0) continue;
        const rate = rateMap.get(`${alloc.employeeId}|${alloc.quarterId}`);
        if (!rate) continue;
        const cost = calculateCost(hours, rate, cap, capType);
        appSalaryActual += cost.fundedCost;
      }

      for (const exp of projExpenses) {
        if (exp.actualAmount !== null) {
          appExpenseActual += exp.actualAmount;
        }
      }
    }

    const appTotal = appSalaryActual + appExpenseActual;

    // Variance
    const variance = externalTotal - appTotal;
    const salaryVariance = externalSalary - appSalaryActual;
    const expenseVariance = externalExpense - appExpenseActual;

    const hasExternal = glLines.length > 0 || payrollLines.length > 0;
    const hasApp = lookup !== undefined;

    let status: ReconciliationRow['status'];
    if (hasExternal && hasApp) {
      status = Math.abs(variance) < 1 ? 'matched' : 'variance';
    } else if (hasExternal) {
      status = 'external-only';
    } else {
      status = 'app-only';
    }

    rows.push({
      costCentre,
      projectId: lookup?.project.id ?? null,
      projectName: lookup?.project.name ?? null,
      projectCode: lookup?.project.code ?? null,
      funderName: lookup?.funderName ?? null,
      externalSalary,
      externalExpense,
      externalTotal,
      salarySource,
      appSalaryActual,
      appExpenseActual,
      appTotal,
      variance,
      salaryVariance,
      expenseVariance,
      status,
      hasUnclassifiedGL: glUnclassified.length > 0,
      unclassifiedAmount,
      glEntryCount: glLines.length,
      payrollEntryCount: payrollLines.length,
    });
  }

  // Sort: variance first, then external-only, then app-only, then matched
  const statusOrder = { 'variance': 0, 'external-only': 1, 'app-only': 2, 'matched': 3 };
  rows.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return rows;
}

export function computeSummary(rows: ReconciliationRow[]): ReconciliationSummary {
  let externalTotal = 0;
  let appTotal = 0;
  let matchedCount = 0;
  let varianceCount = 0;
  let externalOnlyCount = 0;
  let appOnlyCount = 0;

  for (const row of rows) {
    externalTotal += row.externalTotal;
    appTotal += row.appTotal;
    switch (row.status) {
      case 'matched': matchedCount++; break;
      case 'variance': varianceCount++; break;
      case 'external-only': externalOnlyCount++; break;
      case 'app-only': appOnlyCount++; break;
    }
  }

  return {
    externalTotal,
    appTotal,
    netVariance: externalTotal - appTotal,
    matchedCount,
    varianceCount,
    externalOnlyCount,
    appOnlyCount,
    totalRows: rows.length,
  };
}
