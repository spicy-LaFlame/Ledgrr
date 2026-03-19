import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Employee, type EmployeeRate, type BenefitsCapType } from '../db/schema';

export function useEmployees() {
  const employees = useLiveQuery(() => db.employees.where('status').equals('active').toArray()) ?? [];
  const allEmployees = useLiveQuery(() => db.employees.toArray()) ?? [];
  const organizations = useLiveQuery(() => db.organizations.toArray()) ?? [];

  const innovationTeam = employees.filter(e => e.isInnovationTeam);

  const getEmployeeWithOrg = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;
    const org = organizations.find(o => o.id === employee.organizationId);
    return { ...employee, organization: org };
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      ...employee,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.employees.add(newEmployee);
    return newEmployee;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    await db.employees.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  return {
    employees,
    allEmployees,
    innovationTeam,
    organizations,
    getEmployeeWithOrg,
    addEmployee,
    updateEmployee,
  };
}

export function useEmployeeRates(employeeId?: string, fiscalYearId?: string) {
  const rates = useLiveQuery(
    async () => {
      let query = db.employeeRates.toCollection();
      if (employeeId) {
        query = db.employeeRates.where('employeeId').equals(employeeId);
      }
      const results = await query.toArray();
      if (fiscalYearId) {
        return results.filter(r => r.fiscalYearId === fiscalYearId);
      }
      return results;
    },
    [employeeId, fiscalYearId]
  ) ?? [];

  const addRate = async (rate: Omit<EmployeeRate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRate: EmployeeRate = {
      ...rate,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.employeeRates.add(newRate);
    return newRate;
  };

  const updateRate = async (id: string, updates: Partial<EmployeeRate>) => {
    await db.employeeRates.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const getRateForQuarter = (employeeId: string, quarterId: string) => {
    return rates.find(r => r.employeeId === employeeId && r.quarterId === quarterId);
  };

  return {
    rates,
    addRate,
    updateRate,
    getRateForQuarter,
  };
}

// Calculate total hourly rate (base + benefits)
export function getTotalRate(rate: EmployeeRate): number {
  return rate.baseHourlyRate + rate.benefitsRate;
}

// Calculate cost for hours worked
export function calculateCost(
  hours: number,
  rate: EmployeeRate,
  benefitsCap: number,
  capType: BenefitsCapType = 'percentage-of-benefits'
): { fundedCost: number; hospitalCovers: number; totalCost: number } {
  const baseComponent = hours * rate.baseHourlyRate;
  const benefitsComponent = hours * rate.benefitsRate;

  let fundedBenefits: number;

  if (capType === 'percentage-of-wages') {
    // Funder pays benefits up to (benefitsCap × base wages), capped at actual benefits
    const maxFundedBenefits = baseComponent * benefitsCap;
    fundedBenefits = Math.min(benefitsComponent, maxFundedBenefits);
  } else {
    // percentage-of-benefits: funder pays (benefitsCap × benefits)
    fundedBenefits = benefitsComponent * benefitsCap;
  }

  const hospitalBenefits = benefitsComponent - fundedBenefits;

  return {
    fundedCost: baseComponent + fundedBenefits,
    hospitalCovers: hospitalBenefits,
    totalCost: baseComponent + benefitsComponent,
  };
}
