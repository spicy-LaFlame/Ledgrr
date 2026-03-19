import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import {
  db,
  type ExternalImport,
  type GLEntry,
  type PayrollEntry,
  type GLAccountRule,
  type ImportType,
} from '../db/schema';

// =============================================================================
// EXTERNAL IMPORTS
// =============================================================================

interface ImportFilters {
  type?: ImportType;
  fiscalYearId?: string;
}

export function useExternalImports(options?: ImportFilters) {
  const { type, fiscalYearId } = options ?? {};

  const imports = useLiveQuery(async () => {
    let results = await db.externalImports.toArray();

    if (type) {
      results = results.filter(i => i.type === type);
    }
    if (fiscalYearId) {
      results = results.filter(i => i.fiscalYearId === fiscalYearId);
    }

    return results.sort((a, b) => b.importDate.localeCompare(a.importDate));
  }, [type, fiscalYearId]) ?? [];

  const addImport = async (data: Omit<ExternalImport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newImport: ExternalImport = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.externalImports.add(newImport);
    return newImport;
  };

  const deleteImport = async (importId: string) => {
    await db.transaction('rw', [db.externalImports, db.glEntries, db.payrollEntries], async () => {
      await db.glEntries.where('importId').equals(importId).delete();
      await db.payrollEntries.where('importId').equals(importId).delete();
      await db.externalImports.delete(importId);
    });
  };

  return { imports, addImport, deleteImport };
}

// =============================================================================
// GL ENTRIES
// =============================================================================

export function useGLEntries(fiscalYearId?: string, costCentre?: string) {
  const entries = useLiveQuery(async () => {
    let results = await db.glEntries.toArray();

    if (fiscalYearId) {
      results = results.filter(e => e.fiscalYearId === fiscalYearId);
    }
    if (costCentre) {
      results = results.filter(e => e.costCentre === costCentre);
    }

    return results;
  }, [fiscalYearId, costCentre]) ?? [];

  const addEntries = async (entries: Omit<GLEntry, 'id' | 'createdAt'>[]) => {
    const now = new Date().toISOString();
    const records: GLEntry[] = entries.map(e => ({
      ...e,
      id: uuidv4(),
      createdAt: now,
    }));
    await db.glEntries.bulkAdd(records);
    return records.length;
  };

  return { entries, addEntries };
}

// =============================================================================
// PAYROLL ENTRIES
// =============================================================================

export function usePayrollEntries(fiscalYearId?: string, costCentre?: string) {
  const entries = useLiveQuery(async () => {
    let results = await db.payrollEntries.toArray();

    if (fiscalYearId) {
      results = results.filter(e => e.fiscalYearId === fiscalYearId);
    }
    if (costCentre) {
      results = results.filter(e => e.costCentre === costCentre);
    }

    return results;
  }, [fiscalYearId, costCentre]) ?? [];

  const addEntries = async (entries: Omit<PayrollEntry, 'id' | 'createdAt'>[]) => {
    const now = new Date().toISOString();
    const records: PayrollEntry[] = entries.map(e => ({
      ...e,
      id: uuidv4(),
      createdAt: now,
    }));
    await db.payrollEntries.bulkAdd(records);
    return records.length;
  };

  return { entries, addEntries };
}

// =============================================================================
// GL ACCOUNT RULES
// =============================================================================

export function useGLAccountRules() {
  const rules = useLiveQuery(async () => {
    return db.glAccountRules.toArray();
  }) ?? [];

  const addRule = async (data: Omit<GLAccountRule, 'id' | 'createdAt'>) => {
    const rule: GLAccountRule = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await db.glAccountRules.add(rule);
    return rule;
  };

  const updateRule = async (id: string, updates: Partial<GLAccountRule>) => {
    await db.glAccountRules.update(id, updates);
  };

  const deleteRule = async (id: string) => {
    await db.glAccountRules.delete(id);
  };

  return { rules, addRule, updateRule, deleteRule };
}
