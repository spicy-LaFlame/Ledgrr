# Bruyère Budget Tracker

A local-first financial tracking and budgeting application for the Bruyère Health Innovation Team.

## 🔒 Privacy First

This application is designed with data privacy as a core principle:

- **All data stored locally** on your computer in a SQLite database
- **No personal employee names** - only internal employee codes are used
- **No cloud sync** or external data transmission
- **Git backup support** for versioning (use a private repository)

## Features

### Dashboard
- Real-time budget vs actual spending overview
- Funding expiry traffic light system (RED/YELLOW/GREEN)
- Spending pace alerts for underspend detection
- Project status breakdown by organization group

### Project Management
- Track projects across multiple funders (CABHI, envisAGE, CHEO RI, CAN Health, FedDev)
- Project status tracking (active, pipeline, completed, on-hold)
- Funding type categorization (cash, in-kind, mixed)
- Cost centre mapping for UKG integration

### Budget Allocation
- Quarterly hour allocation planning (487.5 hrs/quarter default)
- Team member allocation across multiple projects
- Visual allocation progress tracking
- Automatic percentage calculations

### Actual Hours Tracking
- Manual entry for time tracking
- UKG data import support (CSV/Excel)
- Monthly breakdown by project
- Variance calculations vs planned

### Pay Rate Management
- Quarterly pay rate updates
- Benefit rate tracking by funder
- Historical rate preservation for accurate calculations

### Reporting
- Quarterly claims generation
- Funder-specific reports
- Cash vs in-kind breakdowns
- Budget variance analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **Charts**: Recharts
- **Database**: SQLite (better-sqlite3)
- **Desktop**: Electron
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository (use your private repo URL)
git clone https://github.com/YOUR_USERNAME/bruyere-budget-tracker.git
cd bruyere-budget-tracker

# Install dependencies and rebuild native modules
npm install

# Seed the database with sample data
npm run db:seed

# Run in development mode (web)
npm run dev

# Run as desktop app
npm run electron:dev
```

### Building for Production

```bash
# Build web version
npm run build

# Build desktop app
npm run electron:build
```

## Project Structure

```
bruyere-budget-tracker/
├── data/
│   ├── budget.db       # Local SQLite database
│   └── schema.sql      # Database schema definition
├── electron/
│   ├── main.js         # Electron main process
│   └── preload.js      # Preload script for IPC
├── public/             # Static assets
├── scripts/
│   └── seed.js         # Database seed script
├── src/
│   ├── components/
│   │   └── dashboard/  # Dashboard-specific components
│   │       ├── Alerts.tsx
│   │       ├── BudgetVsActualChart.tsx
│   │       ├── DashboardHeader.tsx
│   │       ├── FundingExpiryTable.tsx
│   │       ├── MetricCard.tsx
│   │       └── OrgBreakdownChart.tsx
│   ├── db/
│   │   ├── database.js # Database connection setup
│   │   └── queries.js  # Database queries
│   ├── pages/
│   │   └── Dashboard.tsx
│   ├── types/
│   │   ├── electron.d.ts # Electron API type definitions
│   │   └── index.ts      # Main application type definitions
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx        # React application entry point
...
```

## Testing

This project uses [Test Runner] for testing. To run the tests, use the following command:

```bash
npm test
```

## Data Model

### Key Entities

1. **Funders** - Funding organizations with benefit coverage rates
2. **Projects** - Funded initiatives with budgets and timelines
3. **Team Members** - Anonymized references (employee codes only)
4. **Pay Rates** - Quarterly rates by team member
5. **Allocations** - Planned hours by project/member/quarter
6. **Actual Hours** - Recorded time by month

### Fiscal Year

Bruyère uses April-March fiscal year:
- Q1: April - June
- Q2: July - September
- Q3: October - December
- Q4: January - March

## Backup Strategy

### Option 1: Git (Recommended)

```bash
# Initialize git in the data folder
cd ~/Library/Application\ Support/bruyere-budget-tracker
git init
git add .
git commit -m "Database backup"

# Push to private remote
git remote add origin YOUR_PRIVATE_REPO_URL
git push -u origin main
```

### Option 2: JSON Export

Use the Settings page to export the entire database to JSON format.

## Security Considerations

1. **Employee Codes Only**: Never store actual employee names - use internal codes like "EMP001"
2. **Private Repository**: If using Git backup, ensure the repository is private
3. **Local Storage**: Database file stays on your machine
4. **No PII in Notes**: Avoid entering personal information in note fields

## Contributing

This is an internal tool for Bruyère Health. Contact the Innovation Team for contribution guidelines.

## License

Private - Bruyère Health Innovation Team

---

Built with ❤️ for efficient healthcare innovation operations
