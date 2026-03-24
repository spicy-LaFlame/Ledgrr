import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type SalaryAllocation, type Expense } from '../db/schema';

interface AllocationFilters {
  projectId?: string;
  fiscalYearId?: string;
  quarterId?: string;
  employeeId?: string;
}

export function useAllocations(options?: AllocationFilters) {
  const { projectId, fiscalYearId, quarterId, employeeId } = options ?? {};

  const allocations = useLiveQuery(async () => {
    let results = await db.salaryAllocations.toArray();

    if (projectId) {
      results = results.filter(a => a.projectId === projectId);
    }
    if (fiscalYearId) {
      results = results.filter(a => a.fiscalYearId === fiscalYearId);
    }
    if (quarterId) {
      results = results.filter(a => a.quarterId === quarterId);
    }
    if (employeeId) {
      results = results.filter(a => a.employeeId === employeeId);
    }

    return results;
  }, [projectId, fiscalYearId, quarterId, employeeId]) ?? [];

  const addAllocation = async (allocation: Omit<SalaryAllocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAllocation: SalaryAllocation = {
      ...allocation,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.salaryAllocations.add(newAllocation);
    return newAllocation;
  };

  const updateAllocation = async (id: string, updates: Partial<SalaryAllocation>) => {
    await db.salaryAllocations.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteAllocation = async (id: string) => {
    await db.salaryAllocations.delete(id);
  };

  const updateActualHours = async (id: string, actualHours: number | null) => {
    await db.salaryAllocations.update(id, {
      actualHours,
      updatedAt: new Date().toISOString(),
    });
  };

  const checkDuplicate = async (
    empId: string,
    projId: string,
    fyId: string,
    qId: string,
    excludeId?: string
  ): Promise<boolean> => {
    const existing = await db.salaryAllocations
      .where('[employeeId+projectId+fiscalYearId+quarterId]')
      .equals([empId, projId, fyId, qId])
      .toArray();
    if (excludeId) {
      return existing.some(a => a.id !== excludeId);
    }
    return existing.length > 0;
  };

  const bulkAddAllocations = async (
    items: Omit<SalaryAllocation, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const now = new Date().toISOString();
    const records: SalaryAllocation[] = items.map(item => ({
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }));
    await db.transaction('rw', db.salaryAllocations, async () => {
      await db.salaryAllocations.bulkAdd(records);
    });
    return records;
  };

  const bulkUpdateActuals = async (
    updates: { id: string; actualHours: number | null }[]
  ) => {
    const now = new Date().toISOString();
    await db.transaction('rw', db.salaryAllocations, async () => {
      for (const { id, actualHours } of updates) {
        await db.salaryAllocations.update(id, { actualHours, updatedAt: now });
      }
    });
  };

  const checkBulkDuplicates = async (
    items: { employeeId: string; projectId: string; fiscalYearId: string; quarterId: string }[]
  ): Promise<Set<number>> => {
    const duplicateIndices = new Set<number>();
    for (let i = 0; i < items.length; i++) {
      const { employeeId, projectId, fiscalYearId, quarterId } = items[i];
      const existing = await db.salaryAllocations
        .where('[employeeId+projectId+fiscalYearId+quarterId]')
        .equals([employeeId, projectId, fiscalYearId, quarterId])
        .count();
      if (existing > 0) duplicateIndices.add(i);
    }
    return duplicateIndices;
  };

  return {
    allocations,
    addAllocation,
    updateAllocation,
    deleteAllocation,
    updateActualHours,
    checkDuplicate,
    bulkAddAllocations,
    bulkUpdateActuals,
    checkBulkDuplicates,
  };
}

interface ExpenseFilters {
  projectId?: string;
  fiscalYearId?: string;
  quarterId?: string;
  categoryId?: string;
}

export function useExpenses(options?: ExpenseFilters) {
  const { projectId, fiscalYearId, quarterId, categoryId } = options ?? {};

  const expenses = useLiveQuery(async () => {
    let results = await db.expenses.toArray();

    if (projectId) {
      results = results.filter(e => e.projectId === projectId);
    }
    if (fiscalYearId) {
      results = results.filter(e => e.fiscalYearId === fiscalYearId);
    }
    if (quarterId) {
      results = results.filter(e => e.quarterId === quarterId);
    }
    if (categoryId) {
      results = results.filter(e => e.categoryId === categoryId);
    }

    return results;
  }, [projectId, fiscalYearId, quarterId, categoryId]) ?? [];

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.expenses.add(newExpense);
    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    await db.expenses.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteExpense = async (id: string) => {
    await db.expenses.delete(id);
  };

  const bulkAddExpenses = async (
    items: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const now = new Date().toISOString();
    const records: Expense[] = items.map(item => ({
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }));
    await db.transaction('rw', db.expenses, async () => {
      await db.expenses.bulkAdd(records);
    });
    return records;
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkAddExpenses,
  };
}

export function useExpenseCategories() {
  const categories = useLiveQuery(async () => {
    return db.expenseCategories.orderBy('sortOrder').toArray();
  }) ?? [];

  return categories;
}

export function useFiscalPeriods() {
  const fiscalYears = useLiveQuery(() => db.fiscalYears.toArray()) ?? [];
  const quarters = useLiveQuery(() => db.quarters.toArray()) ?? [];

  const currentFiscalYear = fiscalYears.find(fy => fy.isCurrent);

  const getQuartersForYear = (fiscalYearId: string) => {
    return quarters
      .filter(q => q.fiscalYearId === fiscalYearId)
      .sort((a, b) => a.quarterNumber - b.quarterNumber);
  };

  const getCurrentQuarter = () => {
    const today = new Date();
    return quarters.find(q => {
      const start = new Date(q.startDate);
      const end = new Date(q.endDate);
      return today >= start && today <= end;
    });
  };

  return {
    fiscalYears,
    quarters,
    currentFiscalYear,
    getQuartersForYear,
    getCurrentQuarter,
  };
}
