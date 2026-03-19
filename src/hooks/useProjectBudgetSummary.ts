import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { calculateCost } from './useEmployees';

export interface ProjectBudgetSummary {
  fyBudget: number;
  inKindFyBudget: number;
  salaryBudgeted: number;
  salaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
  inKindSalaryBudgeted: number;
  totalAllocated: number;       // cash salary budgeted + expense budgeted
  totalSpent: number;           // cash salary actual + expense actual
  inKindAllocated: number;      // in-kind salary budgeted
  budgetRemaining: number;      // fyBudget - totalAllocated
  actualRemaining: number;      // fyBudget - totalSpent
  inKindRemaining: number;      // inKindFyBudget - inKindAllocated
}

export function useProjectBudgetSummary(
  projectId: string | undefined,
  fiscalYearId: string,
  excludeAllocationId?: string,
  excludeExpenseId?: string,
): ProjectBudgetSummary | undefined {
  return useLiveQuery(async () => {
    if (!projectId) return undefined;

    const project = await db.projects.get(projectId);
    if (!project) return undefined;

    // Get all allocations for this project+FY
    const allocations = await db.salaryAllocations
      .where('fiscalYearId').equals(fiscalYearId)
      .filter(a => a.projectId === projectId && a.id !== excludeAllocationId)
      .toArray();

    // Get all expenses for this project+FY
    const expenses = await db.expenses
      .where('fiscalYearId').equals(fiscalYearId)
      .filter(e => e.projectId === projectId && e.id !== excludeExpenseId)
      .toArray();

    // Get rates for cost computation
    const allRates = await db.employeeRates
      .where('fiscalYearId').equals(fiscalYearId)
      .toArray();

    const cap = project.benefitsCapPercent / 100;
    const capType = project.benefitsCapType ?? 'percentage-of-benefits';

    let salaryBudgeted = 0;
    let salaryActual = 0;
    let inKindSalaryBudgeted = 0;

    for (const allocation of allocations) {
      const rate = allRates.find(r =>
        r.employeeId === allocation.employeeId && r.quarterId === allocation.quarterId
      ) ?? allRates.find(r => r.employeeId === allocation.employeeId);

      if (!rate) continue;

      const budgetCost = calculateCost(allocation.budgetedHours, rate, cap, capType);

      if (allocation.isInKind) {
        inKindSalaryBudgeted += budgetCost.fundedCost;
      } else {
        salaryBudgeted += budgetCost.fundedCost;
        if (allocation.actualHours !== null) {
          salaryActual += calculateCost(allocation.actualHours, rate, cap, capType).fundedCost;
        }
      }
    }

    let expenseBudgeted = 0;
    let expenseActual = 0;

    for (const expense of expenses) {
      expenseBudgeted += expense.budgetedAmount;
      if (expense.actualAmount !== null) {
        expenseActual += expense.actualAmount;
      }
    }

    const totalAllocated = salaryBudgeted + expenseBudgeted;
    const totalSpent = salaryActual + expenseActual;
    const fyBudget = project.fiscalYearBudget ?? 0;
    const inKindFyBudget = project.inKindFiscalYearBudget ?? 0;

    return {
      fyBudget,
      inKindFyBudget,
      salaryBudgeted,
      salaryActual,
      expenseBudgeted,
      expenseActual,
      inKindSalaryBudgeted,
      totalAllocated,
      totalSpent,
      inKindAllocated: inKindSalaryBudgeted,
      budgetRemaining: fyBudget - totalAllocated,
      actualRemaining: fyBudget - totalSpent,
      inKindRemaining: inKindFyBudget - inKindSalaryBudgeted,
    };
  }, [projectId, fiscalYearId, excludeAllocationId, excludeExpenseId]);
}
