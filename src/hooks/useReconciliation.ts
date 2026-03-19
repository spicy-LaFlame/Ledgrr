import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import {
  buildReconciliation,
  computeSummary,
  type ReconciliationRow,
  type ReconciliationSummary,
} from '../utils/reconciliation';

interface UseReconciliationResult {
  rows: ReconciliationRow[];
  summary: ReconciliationSummary;
  isLoading: boolean;
}

export function useReconciliation(fiscalYearId: string): UseReconciliationResult {
  const result = useLiveQuery(async () => {
    if (!fiscalYearId) return null;

    const [glEntries, payrollEntries, projects, funders, allocations, expenses, rates] =
      await Promise.all([
        db.glEntries.where('fiscalYearId').equals(fiscalYearId).toArray(),
        db.payrollEntries.where('fiscalYearId').equals(fiscalYearId).toArray(),
        db.projects.toArray(),
        db.funders.toArray(),
        db.salaryAllocations.where('fiscalYearId').equals(fiscalYearId).toArray(),
        db.expenses.where('fiscalYearId').equals(fiscalYearId).toArray(),
        db.employeeRates.where('fiscalYearId').equals(fiscalYearId).toArray(),
      ]);

    const funderNames = new Map(funders.map(f => [f.id, f.name]));

    const rows = buildReconciliation({
      glEntries,
      payrollEntries,
      projects,
      funderNames,
      allocations,
      expenses,
      rates,
    });

    const summary = computeSummary(rows);

    return { rows, summary };
  }, [fiscalYearId]);

  if (!result) {
    return {
      rows: [],
      summary: {
        externalTotal: 0,
        appTotal: 0,
        netVariance: 0,
        matchedCount: 0,
        varianceCount: 0,
        externalOnlyCount: 0,
        appOnlyCount: 0,
        totalRows: 0,
      },
      isLoading: result === undefined,
    };
  }

  return { ...result, isLoading: false };
}
