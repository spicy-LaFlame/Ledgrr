import Dexie, { type EntityTable } from 'dexie';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Funder {
  id: string;
  name: string;
  code: string;
  benefitCoverageRate: number; // 0-1 (e.g., 0.2 for 20%)
  expiryDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BenefitsCapType = 'percentage-of-benefits' | 'percentage-of-wages';

export interface Project {
  id: string;
  name: string;
  code: string;
  funderId: string;
  status: 'active' | 'pipeline' | 'completed' | 'on-hold';
  fundingType: 'cash' | 'in-kind' | 'mixed';
  startDate: string;
  endDate?: string;
  totalBudget: number;
  fiscalYearBudget: number;
  inKindBudget: number; // In-kind contribution budget
  inKindFiscalYearBudget: number; // In-kind budget for current fiscal year
  benefitsCapPercent: number; // 0-100 (e.g., 20 for 20% cap)
  benefitsCapType: BenefitsCapType; // How the cap is applied
  costCentreNumber?: string;
  fundingAgreementUrl?: string;
  principalInvestigator?: string;
  description?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: 'BH-Innovation' | 'BH' | 'BHRI';
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  organizationId: string;
  departmentId?: string;
  isInnovationTeam: boolean;
  annualFTEHours: number;
  status: 'active' | 'inactive' | 'onLeave';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRate {
  id: string;
  employeeId: string;
  fiscalYearId: string;
  quarterId: string;
  baseHourlyRate: number;
  benefitsRate: number;
  effectiveDate: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Quarter {
  id: string;
  name: string;
  quarterNumber: 1 | 2 | 3 | 4;
  fiscalYearId: string;
  startDate: string;
  endDate: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SalaryAllocation {
  id: string;
  employeeId: string;
  projectId: string;
  fiscalYearId: string;
  quarterId: string;
  budgetedHours: number;
  actualHours: number | null;
  isInKind: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'corporate-card' | 'direct-billing' | 'invoice' | 'employee';

export interface Expense {
  id: string;
  projectId: string;
  categoryId: string;
  fiscalYearId: string;
  quarterId: string;
  description: string;
  budgetedAmount: number;
  actualAmount: number | null;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 'draft' | 'submitted' | 'received' | 'partial';

export interface Claim {
  id: string;
  projectId: string;
  fiscalYearId: string;
  quarterId: string;
  claimAmount: number;         // Amount claimed from funder
  submittedDate: string | null; // When claim was sent to funder
  receivedDate: string | null;  // When funding was received
  receivedAmount: number | null; // Amount actually received (may differ from claimed)
  status: ClaimStatus;
  referenceNumber?: string;     // Funder's reference/invoice number
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingAlert {
  id: string;
  projectId: string;
  type: 'underspend' | 'overspend' | 'expiring-funds' | 'allocation-gap' | 'rate-update-needed';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  daysToExpiry?: number;
  currentPace?: number;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

// =============================================================================
// DATABASE CLASS
// =============================================================================

export class BudgetTrackerDB extends Dexie {
  funders!: EntityTable<Funder, 'id'>;
  projects!: EntityTable<Project, 'id'>;
  organizations!: EntityTable<Organization, 'id'>;
  employees!: EntityTable<Employee, 'id'>;
  employeeRates!: EntityTable<EmployeeRate, 'id'>;
  fiscalYears!: EntityTable<FiscalYear, 'id'>;
  quarters!: EntityTable<Quarter, 'id'>;
  expenseCategories!: EntityTable<ExpenseCategory, 'id'>;
  salaryAllocations!: EntityTable<SalaryAllocation, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  spendingAlerts!: EntityTable<SpendingAlert, 'id'>;
  claims!: EntityTable<Claim, 'id'>;

  constructor() {
    super('BudgetTrackerDB');

    this.version(1).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
    });

    // Version 2: Added new project fields (fiscalYearBudget, benefitsCapPercent, costCentreNumber, etc.)
    this.version(2).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive, costCentreNumber',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
    }).upgrade(tx => {
      // Migrate existing projects to have the new required fields
      return tx.table('projects').toCollection().modify(project => {
        if (project.fiscalYearBudget === undefined) {
          project.fiscalYearBudget = project.totalBudget;
        }
        if (project.benefitsCapPercent === undefined) {
          project.benefitsCapPercent = 20; // Default 20% benefits cap
        }
        if (project.costCentreNumber === undefined && project.costCentre) {
          project.costCentreNumber = project.costCentre;
          delete project.costCentre;
        }
      });
    });

    // Version 3: Added in-kind budget fields
    this.version(3).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive, costCentreNumber',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
    }).upgrade(tx => {
      return tx.table('projects').toCollection().modify(project => {
        if (project.inKindBudget === undefined) {
          // Default in-kind budget based on funding type
          project.inKindBudget = project.fundingType === 'in-kind' ? project.totalBudget : 0;
        }
        if (project.inKindFiscalYearBudget === undefined) {
          project.inKindFiscalYearBudget = project.fundingType === 'in-kind' ? project.fiscalYearBudget : 0;
        }
      });
    });

    // Version 4: Added benefitsCapType field to projects
    this.version(4).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive, costCentreNumber',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
    }).upgrade(tx => {
      return tx.table('projects').toCollection().modify(project => {
        if (project.benefitsCapType === undefined) {
          project.benefitsCapType = 'percentage-of-benefits';
        }
      });
    });

    // Version 5: Added paymentMethod field to expenses
    this.version(5).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive, costCentreNumber',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
    });

    // Version 6: Added claims table for tracking funder claims and payments received
    this.version(6).stores({
      funders: 'id, code, name, isActive',
      projects: 'id, code, name, funderId, status, isActive, costCentreNumber',
      organizations: 'id, code',
      employees: 'id, name, organizationId, status, isInnovationTeam',
      employeeRates: 'id, employeeId, fiscalYearId, quarterId, [employeeId+fiscalYearId+quarterId]',
      fiscalYears: 'id, name, isCurrent',
      quarters: 'id, name, fiscalYearId, quarterNumber',
      expenseCategories: 'id, sortOrder',
      salaryAllocations: 'id, employeeId, projectId, fiscalYearId, quarterId, [employeeId+projectId+fiscalYearId+quarterId]',
      expenses: 'id, projectId, categoryId, fiscalYearId, quarterId',
      spendingAlerts: 'id, projectId, type, severity, isAcknowledged',
      claims: 'id, projectId, fiscalYearId, quarterId, status, submittedDate, receivedDate',
    });
  }
}

// Singleton database instance
export const db = new BudgetTrackerDB();

// =============================================================================
// HELPER CONSTANTS
// =============================================================================

export const HOURS_PER_YEAR = 1950;
export const HOURS_PER_QUARTER = 487.5;
export const FISCAL_YEAR_START_MONTH = 4; // April
