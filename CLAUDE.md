# CLAUDE.md - Innovation Budget Tracker PWA

## Project Overview

**App Name:** Innovation Budget Tracker  
**Type:** Progressive Web App (PWA)  
**Primary User:** Moses Muwanga, Finance and Programs Assistant  
**Organization:** Innovation Team at Bruyère Health  
**Purpose:** Track budget allocations, actual spending, and generate funder reports for 5-10 innovation projects per fiscal year

### Key Constraints

- **Single user tool** (for now) — no authentication required initially
- **Work computer access** — must run in browser, no admin install required
- **Data privacy** — employee salary data must stay local, never transmitted to external servers
- **Offline capable** — should work without internet after initial load
- **Export-focused** — primary output is reports for leadership and funders

---

## Technical Stack (Recommended)

```
Frontend:        React 18+ with TypeScript
Styling:         Tailwind CSS
State:           Zustand (lightweight, simple)
Local Storage:   IndexedDB via Dexie.js (for structured data)
PWA:             Vite PWA plugin
Export:          xlsx (SheetJS) for Excel exports, jsPDF for PDF reports
Charts:          Recharts or Chart.js
Build:           Vite
```

### Why This Stack

- **React + TypeScript**: Type safety for financial calculations, good IDE support
- **Dexie.js**: Simple IndexedDB wrapper, handles complex queries, works offline
- **Vite PWA**: Easy service worker setup, works on any static host
- **No backend needed**: All data stored in browser's IndexedDB

### Deployment Options (Work Computer Friendly)

1. **GitHub Pages** (free, simple) — push to repo, auto-deploys
2. **Netlify/Vercel** (free tier) — drag-and-drop deploy
3. **Local only** — run `npm run build` and open `dist/index.html`

---

## Data Model

### Core Entities

```typescript
// Organization (BH-Innovation, BH, BHRI)
interface Organization {
  id: string;
  name: string;
  code: string;
}

// Department
interface Department {
  id: string;
  name: string;
  organizationId: string;
}

// Funder (CABHI, envisAGE, CAN Health, etc.)
interface Funder {
  id: string;
  name: string;
  code: string;
  defaultBenefitsCap: number; // 0-1, e.g., 0.2 for 20%
}

// Fiscal Year
interface FiscalYear {
  id: string;
  name: string;           // e.g., "2025-26"
  startDate: Date;        // April 1
  endDate: Date;          // March 31
  isCurrent: boolean;
}

// Quarter
interface Quarter {
  id: string;
  name: string;           // e.g., "Q1 2025-26"
  quarterNumber: 1 | 2 | 3 | 4;
  fiscalYearId: string;
  startDate: Date;
  endDate: Date;
}

// Expense Category
interface ExpenseCategory {
  id: string;
  name: string;
  sortOrder: number;
}
```

### Employee & Rates

```typescript
// Employee
interface Employee {
  id: string;
  name: string;           // "Last, First" format
  role: string;           // Job title
  organizationId: string;
  departmentId: string;
  isInnovationTeam: boolean;
  annualFTEHours: number; // Default: 1950
  status: 'active' | 'inactive' | 'onLeave';
}

// Employee Rate (tracks pay rates by quarter)
interface EmployeeRate {
  id: string;
  employeeId: string;
  fiscalYearId: string;
  quarterId: string;
  baseHourlyRate: number;
  benefitsRate: number;
  effectiveDate: Date;
  source?: string;        // e.g., "UKG Export Jan 2025"
}

// Computed helper
function getDisplayName(employee: Employee): string {
  return `${employee.role} - ${employee.name}`;
}

function getTotalRate(rate: EmployeeRate): number {
  return rate.baseHourlyRate + rate.benefitsRate;
}
```

### Project

```typescript
interface Project {
  id: string;
  name: string;
  costCentre: string;     // e.g., "20-939802500" or "TBD"
  funderId: string;
  status: 'active' | 'pipeline' | 'completed' | 'onHold';
  startDate?: Date;
  spendingDeadline?: Date;
  benefitsCapPct: number; // 0-1, funder's benefits coverage
  totalBudget: number;
  notes?: string;
  documents?: string;     // Links to agreements
}
```

### Transactions

```typescript
// Salary Allocation (budget + actuals for employee-project-quarter)
interface SalaryAllocation {
  id: string;
  employeeId: string;
  projectId: string;
  fiscalYearId: string;
  quarterId: string;
  budgetedHours: number;
  actualHours: number | null;  // null = not yet entered
  isInKind: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense (non-salary costs)
interface Expense {
  id: string;
  projectId: string;
  categoryId: string;
  fiscalYearId: string;
  quarterId: string;
  description: string;
  budgetedAmount: number;
  actualAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Calculated Values (compute on read, don't store)

```typescript
// Allocation cost calculations
function calculateAllocationCost(
  allocation: SalaryAllocation,
  rate: EmployeeRate,
  benefitsCap: number,
  hours: number
): { fundedCost: number; hospitalCovers: number; totalCost: number } {
  const baseComponent = hours * rate.baseHourlyRate;
  const benefitsComponent = hours * rate.benefitsRate;
  const fundedBenefits = benefitsComponent * benefitsCap;
  const hospitalBenefits = benefitsComponent * (1 - benefitsCap);
  
  return {
    fundedCost: baseComponent + fundedBenefits,
    hospitalCovers: hospitalBenefits,
    totalCost: baseComponent + benefitsComponent
  };
}

// Rate selection logic for actuals
function getRateForActuals(
  employeeId: string,
  quarterId: string,
  rates: EmployeeRate[]
): EmployeeRate {
  // Q1 actuals use budget rates (Q1 or earliest)
  // Q2 actuals use Q1 rates
  // Q3 actuals use Q2 rates
  // Q4 actuals use Q3 rates
  const quarterNum = getQuarterNumber(quarterId);
  const prevQuarterNum = quarterNum === 1 ? 1 : quarterNum - 1;
  
  return rates.find(r => 
    r.employeeId === employeeId && 
    getQuarterNumber(r.quarterId) === prevQuarterNum
  ) || rates[0]; // Fallback to first available
}
```

---

## Application Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Main layout with nav
│   │   ├── Sidebar.tsx          # Desktop sidebar nav
│   │   └── BottomNav.tsx        # Mobile bottom nav
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── MetricsCard.tsx
│   │   ├── SpendingAlert.tsx
│   │   └── ProjectStatusList.tsx
│   ├── projects/
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectDetail.tsx
│   ├── allocations/
│   │   ├── AllocationPage.tsx
│   │   ├── AllocationForm.tsx
│   │   └── ActualsEntryForm.tsx
│   ├── employees/
│   │   ├── EmployeesPage.tsx
│   │   ├── EmployeeList.tsx
│   │   └── RateManagement.tsx
│   ├── reports/
│   │   ├── ReportsPage.tsx
│   │   ├── FunderReport.tsx
│   │   └── TeamAllocationReport.tsx
│   └── shared/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Table.tsx
│       ├── ProgressBar.tsx
│       └── Badge.tsx
├── db/
│   ├── schema.ts               # Dexie database schema
│   ├── seed.ts                 # Initial lookup data
│   └── migrations.ts           # Schema migrations
├── hooks/
│   ├── useProjects.ts
│   ├── useEmployees.ts
│   ├── useAllocations.ts
│   └── useCalculations.ts
├── stores/
│   └── appStore.ts             # Zustand store for UI state
├── utils/
│   ├── calculations.ts         # Cost calculation functions
│   ├── formatters.ts           # Currency, date formatting
│   ├── exportExcel.ts          # Excel export functions
│   └── exportPdf.ts            # PDF report generation
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

---

## Key Features to Implement

### Phase 1: Core Data Entry (MVP)

1. **Dashboard**
   - Total budget vs actual spent
   - Spending pace indicator (actual % vs time-elapsed %)
   - Alert banner when underspending (<50% of expected)
   - List of projects needing attention (by deadline urgency)

2. **Project Management**
   - CRUD for projects
   - Status filtering (Active, Pipeline, Completed)
   - Project detail view with allocations summary

3. **Salary Allocation Entry**
   - Form: Select employee → project → quarter → hours
   - Auto-calculate costs based on rates and benefits cap
   - Validation: prevent duplicate allocations

4. **Actuals Entry**
   - Bulk entry view by project and quarter
   - Show budgeted hours as reference
   - Use previous quarter's rates for cost calculation

5. **Employee Rate Management**
   - View rates by quarter
   - Manual entry/edit of rates
   - Copy rates from previous quarter

### Phase 2: Reporting

6. **Excel Export**
   - Project summary report
   - Funder reconciliation report (matches current Excel format)
   - Team allocation report

7. **PDF Reports**
   - One-page project status summary
   - Quarterly claims backup documentation

### Phase 3: Enhancements

8. **Data Import**
   - Import from Excel (for initial migration)
   - UKG export parsing (specific format)

9. **Charts & Visualizations**
   - Budget vs actual by project (bar chart)
   - Team allocation pie chart
   - Spending trend over quarters

10. **Data Backup/Restore**
    - Export all data as JSON
    - Import JSON backup
    - Clear all data option

---

## UI/UX Guidelines

### Design Principles

- **Clean, professional** — this is a finance tool, not a consumer app
- **Information density** — show relevant data without excessive clicking
- **Mobile-friendly** — should work on phone for quick lookups
- **Keyboard accessible** — tab navigation, Enter to submit

### Color Palette (Bruyère-inspired)

```css
:root {
  --primary: #0066a1;        /* Bruyère blue */
  --primary-dark: #004d7a;
  --primary-light: #e6f2f9;
  --success: #107c10;
  --warning: #ffb900;
  --danger: #d13438;
  --neutral-10: #faf9f8;
  --neutral-20: #f3f2f1;
  --neutral-60: #8a8886;
  --neutral-90: #323130;
}
```

### Status Colors

- **Active** → Green badge (#107c10)
- **Pipeline** → Yellow badge (#ffb900)
- **Completed** → Gray badge (#8a8886)
- **On Hold** → Orange badge (#f7630c)

### Spending Indicators

- **On track** (>80% of expected pace) → Green
- **Caution** (50-80% of expected pace) → Yellow
- **Alert** (<50% of expected pace) → Red
- **Overspent** (>100% of budget) → Red with warning icon

---

## Important Business Logic

### Fiscal Year

- Runs **April 1 to March 31**
- Current year: 2025-26 (April 2025 - March 2026)
- Quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)

### FTE Hours

- Full-time = **1,950 hours/year** (487.5 per quarter)
- Innovation team members should be 100% allocated across projects
- Dashboard should show allocation % per team member

### Benefits Cap by Funder

| Funder | Benefits Cap | Notes |
|--------|--------------|-------|
| CABHI | 100% | Full benefits covered |
| envisAGE | 0% | No benefits covered |
| CAN Health | 100% | Full benefits covered |
| CHEO RI | 20% | Partial benefits |
| FedDev | 100% | Full benefits covered |

### Rate Logic for Actuals

- **Budget calculations** → Use BudgetRates (start of year)
- **Q1 Actuals** → Use BudgetRates
- **Q2 Actuals** → Use Q1 Rates
- **Q3 Actuals** → Use Q2 Rates
- **Q4 Actuals** → Use Q3 Rates

This allows for mid-year pay rate changes to be accurately reflected.

### Spending Priority

When allocating limited funds across projects:
1. **Burn expiring money first** — projects with nearest spending deadlines
2. **Defer flexible money** — projects with distant deadlines or carryover options

---

## Sample Data for Testing

### Organizations

```typescript
const organizations = [
  { id: '1', name: 'BH-Innovation', code: 'INNO' },
  { id: '2', name: 'BH', code: 'BH' },
  { id: '3', name: 'BHRI', code: 'BHRI' },
];
```

### Sample Projects

```typescript
const projects = [
  {
    id: '1',
    name: '8-80 Initiative',
    costCentre: '20-939602301',
    funderId: 'cheo',
    status: 'active',
    benefitsCapPct: 0.2,
    totalBudget: 420773,
    spendingDeadline: new Date('2026-03-31'),
  },
  {
    id: '2',
    name: 'AI Scribe (Evaluation)',
    costCentre: '20-939802500',
    funderId: 'cabhi',
    status: 'active',
    benefitsCapPct: 1.0,
    totalBudget: 50000,
    spendingDeadline: new Date('2026-09-30'),
  },
  // ... more projects
];
```

### Sample Innovation Team

```typescript
const innovationTeam = [
  { name: 'Daly, Blake', role: 'Director', baseRate: 75.51, benefitsRate: 19.23 },
  { name: 'Mohammadi, Maryam', role: 'Project Manager', baseRate: 45.41, benefitsRate: 7.38 },
  { name: 'Muwanga, Moses', role: 'Finance and Programs Assistant', baseRate: 27.00, benefitsRate: 4.81 },
  { name: 'Robinson, Emma', role: 'Long-Term Care Coordinator', baseRate: 41.38, benefitsRate: 7.01 },
  { name: 'Rozon, Cassandra', role: 'Program Navigator', baseRate: 40.17, benefitsRate: 7.35 },
  { name: 'Shafiee, Erfan', role: 'Coordinator - Innovation', baseRate: 37.50, benefitsRate: 3.64 },
];
```

---

## Commands Reference

```bash
# Development
npm run dev              # Start dev server (usually http://localhost:5173)

# Build
npm run build            # Build for production
npm run preview          # Preview production build locally

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix auto-fixable issues
```

---

## Development Workflow

### Initial Setup

1. Initialize Vite React TypeScript project
2. Install dependencies (Tailwind, Dexie, Zustand, etc.)
3. Set up PWA plugin
4. Create database schema with Dexie
5. Seed lookup data (orgs, funders, categories, fiscal years, quarters)
6. Build shared components (Button, Card, Input, etc.)

### Feature Development Order

1. **Database + Seed Data** — get data layer working
2. **App Shell + Navigation** — layout structure
3. **Projects CRUD** — most standalone feature
4. **Employees + Rates** — needed for allocations
5. **Allocations Entry** — core functionality
6. **Dashboard** — aggregates other data
7. **Reports/Export** — output layer
8. **Import** — data migration last

---

## Notes for Claude Code

### When I Ask to "Build X Feature"

1. Check if required data types exist in `types/index.ts`
2. Check if database schema includes the entity in `db/schema.ts`
3. Create/update hooks for data access
4. Build UI components following existing patterns
5. Add to navigation/routing

### Code Style Preferences

- Functional components with hooks
- Named exports (not default)
- Descriptive variable names
- Comments for complex business logic
- TypeScript strict mode

### Things to Avoid

- No external API calls (data stays local)
- No authentication complexity (single user)
- No overly complex state management
- No inline styles (use Tailwind classes)

### When Generating Reports

- Match format of existing Excel tracker where possible
- Include clear headers and totals
- Use professional formatting (currency with $ symbol, dates formatted)
- Include generation timestamp

---

## Questions to Ask Me

If you need clarification, ask about:

1. **Specific calculation logic** — how should X be computed?
2. **Data format from UKG** — what does the export look like?
3. **Report requirements** — what fields do funders need?
4. **UI preferences** — how should X flow work?
5. **Priority** — which feature should we build first?

---

## Current Status

**Phase:** Not started  
**Next Step:** Initialize project and set up development environment

---

*Last Updated: January 2025*
