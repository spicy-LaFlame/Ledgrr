import { db, type BenefitsCapType, HOURS_PER_QUARTER, HOURS_PER_YEAR } from '../db/schema';
import { calculateCost } from './useEmployees';

// =============================================================================
// PROJECT SUMMARY REPORT
// =============================================================================

export interface ProjectSummaryRow {
  projectName: string;
  projectCode: string;
  funderName: string;
  status: string;
  costCentre: string;
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
}

export interface ProjectSummaryReport {
  fiscalYear: string;
  generatedAt: string;
  rows: ProjectSummaryRow[];
  totals: {
    totalBudget: number;
    fiscalYearBudget: number;
    salaryBudgeted: number;
    salaryActual: number;
    expenseBudgeted: number;
    expenseActual: number;
    totalBudgeted: number;
    totalActual: number;
    variance: number;
  };
}

export async function getProjectSummaryData(
  fiscalYearId: string,
  statusFilter?: string
): Promise<ProjectSummaryReport> {
  const projects = await db.projects.filter(p => p.isActive).toArray();
  const funders = await db.funders.toArray();
  const fiscalYears = await db.fiscalYears.toArray();
  const allocations = await db.salaryAllocations
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const allRates = await db.employeeRates
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const expenses = await db.expenses
    .where('fiscalYearId').equals(fiscalYearId).toArray();

  const fy = fiscalYears.find(f => f.id === fiscalYearId);
  const rows: ProjectSummaryRow[] = [];

  const filtered = statusFilter && statusFilter !== 'all'
    ? projects.filter(p => p.status === statusFilter)
    : projects.filter(p => p.status === 'active' || p.status === 'pipeline');

  for (const project of filtered) {
    const funder = funders.find(f => f.id === project.funderId);
    const projectAllocations = allocations.filter(a => a.projectId === project.id);
    const projectExpenses = expenses.filter(e => e.projectId === project.id);
    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';

    let salaryBudgeted = 0;
    let salaryActual = 0;
    let inKindActual = 0;

    for (const alloc of projectAllocations) {
      const rate = allRates.find(r =>
        r.employeeId === alloc.employeeId && r.quarterId === alloc.quarterId
      ) ?? allRates.find(r => r.employeeId === alloc.employeeId);
      if (!rate) continue;

      const budgetCost = calculateCost(alloc.budgetedHours, rate, cap, capType);
      if (alloc.isInKind) {
        inKindActual += budgetCost.fundedCost;
      } else {
        salaryBudgeted += budgetCost.fundedCost;
      }

      if (alloc.actualHours !== null) {
        const actualCost = calculateCost(alloc.actualHours, rate, cap, capType);
        if (alloc.isInKind) {
          inKindActual = inKindActual - budgetCost.fundedCost + actualCost.fundedCost;
        } else {
          salaryActual += actualCost.fundedCost;
        }
      }
    }

    let expenseBudgeted = 0;
    let expenseActual = 0;
    for (const exp of projectExpenses) {
      expenseBudgeted += exp.budgetedAmount;
      if (exp.actualAmount !== null) {
        expenseActual += exp.actualAmount;
      }
    }

    const totalBudgeted = salaryBudgeted + expenseBudgeted;
    const totalActual = salaryActual + expenseActual;
    const fyBudget = project.fiscalYearBudget;

    rows.push({
      projectName: project.name,
      projectCode: project.code,
      funderName: funder?.name ?? 'Unknown',
      status: project.status,
      costCentre: project.costCentreNumber ?? '--',
      totalBudget: project.totalBudget,
      fiscalYearBudget: fyBudget,
      salaryBudgeted,
      salaryActual,
      expenseBudgeted,
      expenseActual,
      totalBudgeted,
      totalActual,
      variance: totalBudgeted - totalActual,
      utilizationPct: fyBudget > 0 ? (totalActual / fyBudget) * 100 : 0,
      inKindBudget: project.inKindBudget,
      inKindActual,
      benefitsCapPct: project.benefitsCapPercent,
      endDate: project.endDate ?? '--',
    });
  }

  const totals = rows.reduce(
    (acc, row) => ({
      totalBudget: acc.totalBudget + row.totalBudget,
      fiscalYearBudget: acc.fiscalYearBudget + row.fiscalYearBudget,
      salaryBudgeted: acc.salaryBudgeted + row.salaryBudgeted,
      salaryActual: acc.salaryActual + row.salaryActual,
      expenseBudgeted: acc.expenseBudgeted + row.expenseBudgeted,
      expenseActual: acc.expenseActual + row.expenseActual,
      totalBudgeted: acc.totalBudgeted + row.totalBudgeted,
      totalActual: acc.totalActual + row.totalActual,
      variance: acc.variance + row.variance,
    }),
    {
      totalBudget: 0, fiscalYearBudget: 0,
      salaryBudgeted: 0, salaryActual: 0,
      expenseBudgeted: 0, expenseActual: 0,
      totalBudgeted: 0, totalActual: 0, variance: 0,
    }
  );

  return {
    fiscalYear: fy?.name ?? fiscalYearId,
    generatedAt: new Date().toISOString(),
    rows,
    totals,
  };
}

// =============================================================================
// TEAM ALLOCATION REPORT
// =============================================================================

export interface TeamAllocationProjectDetail {
  projectName: string;
  projectCode: string;
  cashBudgetedHours: number;
  cashActualHours: number;
  cashBudgetedCost: number;
  cashActualCost: number;
  inKindBudgetedHours: number;
  inKindActualHours: number;
  inKindBudgetedCost: number;
  inKindActualCost: number;
}

export interface TeamAllocationRow {
  employeeName: string;
  role: string;
  organization: string;
  projects: TeamAllocationProjectDetail[];
  totalCashBudgetedHours: number;
  totalCashActualHours: number;
  totalCashBudgetedCost: number;
  totalCashActualCost: number;
  totalInKindBudgetedHours: number;
  totalInKindActualHours: number;
  totalInKindBudgetedCost: number;
  totalInKindActualCost: number;
  fteHoursForPeriod: number;
  allocationPct: number;
}

export interface TeamAllocationReport {
  fiscalYear: string;
  quarter: string;
  generatedAt: string;
  rows: TeamAllocationRow[];
}

export async function getTeamAllocationData(
  fiscalYearId: string,
  quarterId: string
): Promise<TeamAllocationReport> {
  const isFullYear = quarterId === 'full';
  const employees = await db.employees.toArray();
  const organizations = await db.organizations.toArray();
  const projects = await db.projects.filter(p => p.isActive).toArray();
  const fiscalYears = await db.fiscalYears.toArray();
  const quarters = await db.quarters.where('fiscalYearId').equals(fiscalYearId).toArray();

  let allocations = await db.salaryAllocations
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  if (!isFullYear) {
    allocations = allocations.filter(a => a.quarterId === quarterId);
  }

  const allRates = await db.employeeRates
    .where('fiscalYearId').equals(fiscalYearId).toArray();

  const fy = fiscalYears.find(f => f.id === fiscalYearId);
  const qtr = quarters.find(q => q.id === quarterId);
  const fteHours = isFullYear ? HOURS_PER_YEAR : HOURS_PER_QUARTER;

  // Group allocations by employee
  const employeeIds = [...new Set(allocations.map(a => a.employeeId))];
  const rows: TeamAllocationRow[] = [];

  for (const empId of employeeIds) {
    const employee = employees.find(e => e.id === empId);
    if (!employee) continue;

    const org = organizations.find(o => o.id === employee.organizationId);
    const empAllocations = allocations.filter(a => a.employeeId === empId);

    // Group by project
    const projectIds = [...new Set(empAllocations.map(a => a.projectId))];
    const projectDetails: TeamAllocationProjectDetail[] = [];

    let totalCashBudgetedHours = 0;
    let totalCashActualHours = 0;
    let totalCashBudgetedCost = 0;
    let totalCashActualCost = 0;
    let totalInKindBudgetedHours = 0;
    let totalInKindActualHours = 0;
    let totalInKindBudgetedCost = 0;
    let totalInKindActualCost = 0;

    for (const projId of projectIds) {
      const project = projects.find(p => p.id === projId);
      if (!project) continue;

      const cap = project.benefitsCapPercent / 100;
      const capType: BenefitsCapType = project.benefitsCapType ?? 'percentage-of-benefits';
      const projAllocations = empAllocations.filter(a => a.projectId === projId);

      let cashBudgetedHours = 0, cashActualHours = 0, cashBudgetedCost = 0, cashActualCost = 0;
      let inKindBudgetedHours = 0, inKindActualHours = 0, inKindBudgetedCost = 0, inKindActualCost = 0;

      for (const alloc of projAllocations) {
        const rate = allRates.find(r =>
          r.employeeId === empId && r.quarterId === alloc.quarterId
        ) ?? allRates.find(r => r.employeeId === empId);
        if (!rate) continue;

        const budgetCost = calculateCost(alloc.budgetedHours, rate, cap, capType).fundedCost;
        const actualHrs = alloc.actualHours ?? 0;
        const actualCost = alloc.actualHours !== null
          ? calculateCost(alloc.actualHours, rate, cap, capType).fundedCost : 0;

        if (alloc.isInKind) {
          inKindBudgetedHours += alloc.budgetedHours;
          inKindActualHours += actualHrs;
          inKindBudgetedCost += budgetCost;
          inKindActualCost += actualCost;
        } else {
          cashBudgetedHours += alloc.budgetedHours;
          cashActualHours += actualHrs;
          cashBudgetedCost += budgetCost;
          cashActualCost += actualCost;
        }
      }

      projectDetails.push({
        projectName: project.name,
        projectCode: project.code,
        cashBudgetedHours, cashActualHours, cashBudgetedCost, cashActualCost,
        inKindBudgetedHours, inKindActualHours, inKindBudgetedCost, inKindActualCost,
      });

      totalCashBudgetedHours += cashBudgetedHours;
      totalCashActualHours += cashActualHours;
      totalCashBudgetedCost += cashBudgetedCost;
      totalCashActualCost += cashActualCost;
      totalInKindBudgetedHours += inKindBudgetedHours;
      totalInKindActualHours += inKindActualHours;
      totalInKindBudgetedCost += inKindBudgetedCost;
      totalInKindActualCost += inKindActualCost;
    }

    const totalActualHours = totalCashActualHours + totalInKindActualHours;
    const empFte = employee.annualFTEHours
      ? (isFullYear ? employee.annualFTEHours : employee.annualFTEHours / 4)
      : fteHours;

    rows.push({
      employeeName: employee.name,
      role: employee.role,
      organization: org?.name ?? 'Unknown',
      projects: projectDetails,
      totalCashBudgetedHours, totalCashActualHours, totalCashBudgetedCost, totalCashActualCost,
      totalInKindBudgetedHours, totalInKindActualHours, totalInKindBudgetedCost, totalInKindActualCost,
      fteHoursForPeriod: empFte,
      allocationPct: empFte > 0 ? (totalActualHours / empFte) * 100 : 0,
    });
  }

  // Sort by name
  rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  return {
    fiscalYear: fy?.name ?? fiscalYearId,
    quarter: isFullYear ? `Full Year ${fy?.name ?? ''}` : (qtr?.name ?? quarterId),
    generatedAt: new Date().toISOString(),
    rows,
  };
}

// =============================================================================
// ONE-PAGE PROJECT STATUS (for PDF)
// =============================================================================

export interface ProjectStatusData {
  projectName: string;
  projectCode: string;
  funderName: string;
  status: string;
  principalInvestigator: string;
  costCentre: string;
  timeline: { start: string; end?: string };
  benefitsCapPct: number;
  benefitsCapType: string;

  totalBudget: number;
  fiscalYearBudget: number;
  inKindBudget: number;

  salaryBudgeted: number;
  salaryActual: number;
  inKindSalaryBudgeted: number;
  inKindSalaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
  totalBudgeted: number;
  totalActual: number;
  utilizationPct: number;

  quarterlyData: Array<{
    quarterName: string;
    salaryBudgeted: number;
    salaryActual: number;
    expenseBudgeted: number;
    expenseActual: number;
  }>;

  teamMembers: Array<{
    name: string;
    role: string;
    budgetedHours: number;
    actualHours: number;
    isInKind: boolean;
  }>;

  daysRemaining?: number;
  urgency: 'RED' | 'YELLOW' | 'GREEN';

  generatedAt: string;
  fiscalYear: string;
}

export async function getProjectStatusData(
  projectId: string,
  fiscalYearId: string
): Promise<ProjectStatusData | null> {
  const project = await db.projects.get(projectId);
  if (!project) return null;

  const funders = await db.funders.toArray();
  const funder = funders.find(f => f.id === project.funderId);
  const employees = await db.employees.toArray();
  const fiscalYears = await db.fiscalYears.toArray();
  const fy = fiscalYears.find(f => f.id === fiscalYearId);
  const quarters = await db.quarters
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  quarters.sort((a, b) => a.quarterNumber - b.quarterNumber);

  const allocations = await db.salaryAllocations
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const projectAllocations = allocations.filter(a => a.projectId === projectId);

  const allRates = await db.employeeRates
    .where('fiscalYearId').equals(fiscalYearId).toArray();

  const expenses = await db.expenses
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const projectExpenses = expenses.filter(e => e.projectId === projectId);

  const cap = project.benefitsCapPercent / 100;
  const capType: BenefitsCapType = project.benefitsCapType ?? 'percentage-of-benefits';

  // Overall totals (cash vs in-kind)
  let salaryBudgeted = 0, salaryActual = 0;
  let inKindSalaryBudgeted = 0, inKindSalaryActual = 0;
  for (const alloc of projectAllocations) {
    const rate = allRates.find(r =>
      r.employeeId === alloc.employeeId && r.quarterId === alloc.quarterId
    ) ?? allRates.find(r => r.employeeId === alloc.employeeId);
    if (!rate) continue;
    const budgetCost = calculateCost(alloc.budgetedHours, rate, cap, capType).fundedCost;
    if (alloc.isInKind) {
      inKindSalaryBudgeted += budgetCost;
    } else {
      salaryBudgeted += budgetCost;
    }
    if (alloc.actualHours !== null) {
      const actualCost = calculateCost(alloc.actualHours, rate, cap, capType).fundedCost;
      if (alloc.isInKind) {
        inKindSalaryActual += actualCost;
      } else {
        salaryActual += actualCost;
      }
    }
  }

  let expenseBudgeted = 0, expenseActual = 0;
  for (const exp of projectExpenses) {
    expenseBudgeted += exp.budgetedAmount;
    if (exp.actualAmount !== null) expenseActual += exp.actualAmount;
  }

  const totalBudgeted = salaryBudgeted + expenseBudgeted;
  const totalActual = salaryActual + expenseActual;

  // Quarterly breakdown
  const quarterlyData = quarters.map(q => {
    const qAllocations = projectAllocations.filter(a => a.quarterId === q.id);
    const qExpenses = projectExpenses.filter(e => e.quarterId === q.id);

    let qSalaryBudgeted = 0, qSalaryActual = 0;
    for (const alloc of qAllocations) {
      const rate = allRates.find(r =>
        r.employeeId === alloc.employeeId && r.quarterId === alloc.quarterId
      ) ?? allRates.find(r => r.employeeId === alloc.employeeId);
      if (!rate) continue;
      qSalaryBudgeted += calculateCost(alloc.budgetedHours, rate, cap, capType).fundedCost;
      if (alloc.actualHours !== null) {
        qSalaryActual += calculateCost(alloc.actualHours, rate, cap, capType).fundedCost;
      }
    }

    let qExpBudgeted = 0, qExpActual = 0;
    for (const exp of qExpenses) {
      qExpBudgeted += exp.budgetedAmount;
      if (exp.actualAmount !== null) qExpActual += exp.actualAmount;
    }

    return {
      quarterName: q.name,
      salaryBudgeted: qSalaryBudgeted,
      salaryActual: qSalaryActual,
      expenseBudgeted: qExpBudgeted,
      expenseActual: qExpActual,
    };
  });

  // Team members
  const empIds = [...new Set(projectAllocations.map(a => a.employeeId))];
  const teamMembers = empIds.map(empId => {
    const emp = employees.find(e => e.id === empId);
    const empAllocs = projectAllocations.filter(a => a.employeeId === empId);
    const budgetedHours = empAllocs.reduce((s, a) => s + a.budgetedHours, 0);
    const actualHours = empAllocs.reduce((s, a) => s + (a.actualHours ?? 0), 0);
    const hasInKind = empAllocs.some(a => a.isInKind);
    return {
      name: emp?.name ?? 'Unknown',
      role: emp?.role ?? '',
      budgetedHours,
      actualHours,
      isInKind: hasInKind,
    };
  });

  // Funding urgency
  const today = new Date();
  let daysRemaining: number | undefined;
  let urgency: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
  if (project.endDate) {
    const end = new Date(project.endDate);
    daysRemaining = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 90) urgency = 'RED';
    else if (daysRemaining < 180) urgency = 'YELLOW';
  }

  return {
    projectName: project.name,
    projectCode: project.code,
    funderName: funder?.name ?? 'Unknown',
    status: project.status,
    principalInvestigator: project.principalInvestigator ?? '--',
    costCentre: project.costCentreNumber ?? '--',
    timeline: { start: project.startDate, end: project.endDate },
    benefitsCapPct: project.benefitsCapPercent,
    benefitsCapType: project.benefitsCapType,
    totalBudget: project.totalBudget,
    fiscalYearBudget: project.fiscalYearBudget,
    inKindBudget: project.inKindBudget,
    salaryBudgeted, salaryActual,
    inKindSalaryBudgeted, inKindSalaryActual,
    expenseBudgeted, expenseActual,
    totalBudgeted, totalActual,
    utilizationPct: project.fiscalYearBudget > 0
      ? (totalActual / project.fiscalYearBudget) * 100 : 0,
    quarterlyData,
    teamMembers,
    daysRemaining,
    urgency,
    generatedAt: new Date().toISOString(),
    fiscalYear: fy?.name ?? fiscalYearId,
  };
}

// =============================================================================
// QUARTERLY CLAIMS BACKUP
// =============================================================================

export interface ClaimsSalaryItem {
  employeeName: string;
  role: string;
  hours: number;
  baseRate: number;
  benefitsRate: number;
  baseCost: number;
  benefitsCost: number;
  fundedCost: number;
  hospitalCovers: number;
  isInKind: boolean;
}

export interface ClaimsExpenseItem {
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
}

export interface ClaimsQuarterSection {
  quarterName: string;
  salaryItems: ClaimsSalaryItem[];
  expenseItems: ClaimsExpenseItem[];
  salarySub: number;
  cashSalarySub: number;
  inKindSalarySub: number;
  expenseSub: number;
  quarterTotal: number;
}

export interface QuarterlyClaimsReport {
  projectName: string;
  projectCode: string;
  funderName: string;
  costCentre: string;
  benefitsCapPct: number;
  benefitsCapType: string;
  fiscalYear: string;
  generatedAt: string;
  quarters: ClaimsQuarterSection[];
  grandTotal: number;
}

export async function getQuarterlyClaimsData(
  projectId: string,
  fiscalYearId: string,
  quarterIds?: string[]
): Promise<QuarterlyClaimsReport | null> {
  const project = await db.projects.get(projectId);
  if (!project) return null;

  const funders = await db.funders.toArray();
  const funder = funders.find(f => f.id === project.funderId);
  const employees = await db.employees.toArray();
  const fiscalYears = await db.fiscalYears.toArray();
  const fy = fiscalYears.find(f => f.id === fiscalYearId);
  const expenseCategories = await db.expenseCategories.orderBy('sortOrder').toArray();

  let quarters = await db.quarters
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  quarters.sort((a, b) => a.quarterNumber - b.quarterNumber);
  if (quarterIds && quarterIds.length > 0) {
    quarters = quarters.filter(q => quarterIds.includes(q.id));
  }

  const allocations = await db.salaryAllocations
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const projectAllocations = allocations.filter(a => a.projectId === projectId);

  const allRates = await db.employeeRates
    .where('fiscalYearId').equals(fiscalYearId).toArray();

  const expenses = await db.expenses
    .where('fiscalYearId').equals(fiscalYearId).toArray();
  const projectExpenses = expenses.filter(e => e.projectId === projectId);

  const cap = project.benefitsCapPercent / 100;
  const capType: BenefitsCapType = project.benefitsCapType ?? 'percentage-of-benefits';

  let grandTotal = 0;

  const quarterSections: ClaimsQuarterSection[] = quarters.map(q => {
    const qAllocations = projectAllocations.filter(a => a.quarterId === q.id);
    const qExpenses = projectExpenses.filter(e => e.quarterId === q.id);

    // Salary line items (only actuals for claims)
    const salaryItems: ClaimsSalaryItem[] = [];
    let salarySub = 0;
    let cashSalarySub = 0;
    let inKindSalarySub = 0;

    for (const alloc of qAllocations) {
      const emp = employees.find(e => e.id === alloc.employeeId);
      const rate = allRates.find(r =>
        r.employeeId === alloc.employeeId && r.quarterId === alloc.quarterId
      ) ?? allRates.find(r => r.employeeId === alloc.employeeId);
      if (!rate) continue;

      const hours = alloc.actualHours ?? alloc.budgetedHours;
      const cost = calculateCost(hours, rate, cap, capType);

      salaryItems.push({
        employeeName: emp?.name ?? 'Unknown',
        role: emp?.role ?? '',
        hours,
        baseRate: rate.baseHourlyRate,
        benefitsRate: rate.benefitsRate,
        baseCost: hours * rate.baseHourlyRate,
        benefitsCost: hours * rate.benefitsRate,
        fundedCost: cost.fundedCost,
        hospitalCovers: cost.hospitalCovers,
        isInKind: alloc.isInKind,
      });
      salarySub += cost.fundedCost;
      if (alloc.isInKind) {
        inKindSalarySub += cost.fundedCost;
      } else {
        cashSalarySub += cost.fundedCost;
      }
    }

    // Expense line items
    const expenseItems: ClaimsExpenseItem[] = [];
    let expenseSub = 0;

    for (const exp of qExpenses) {
      const cat = expenseCategories.find(c => c.id === exp.categoryId);
      const amount = exp.actualAmount ?? exp.budgetedAmount;
      expenseItems.push({
        category: cat?.name ?? 'Other',
        description: exp.description,
        amount,
        paymentMethod: exp.paymentMethod ?? '--',
      });
      expenseSub += amount;
    }

    // quarterTotal only counts cash salary (in-kind is not claimed)
    const quarterTotal = cashSalarySub + expenseSub;
    grandTotal += quarterTotal;

    return {
      quarterName: q.name,
      salaryItems,
      expenseItems,
      salarySub,
      cashSalarySub,
      inKindSalarySub,
      expenseSub,
      quarterTotal,
    };
  });

  return {
    projectName: project.name,
    projectCode: project.code,
    funderName: funder?.name ?? 'Unknown',
    costCentre: project.costCentreNumber ?? '--',
    benefitsCapPct: project.benefitsCapPercent,
    benefitsCapType: project.benefitsCapType,
    fiscalYear: fy?.name ?? fiscalYearId,
    generatedAt: new Date().toISOString(),
    quarters: quarterSections,
    grandTotal,
  };
}
