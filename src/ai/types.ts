export interface SafeProjectData {
  projectName: string;
  projectCode: string;
  funderName: string;
  status: string;
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
  daysRemaining?: number;
  urgency?: string;
  teamSize: number;
}

export interface SafeDashboardContext {
  fiscalYear: string;
  today: string;
  totals: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    spendingPace: number;
    activeProjects: number;
  };
  projects: SafeProjectData[];
  fundingExpiry: Array<{
    projectName: string;
    funderName: string;
    daysRemaining: number;
    urgency: string;
    budgetUtilization: number;
  }>;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: ClaudeMessage[];
}

export interface ClaudeResponse {
  content: Array<{ type: 'text'; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
  stop_reason: string;
}

export type AIErrorType = 'auth' | 'rate_limit' | 'server' | 'network' | 'unknown';

export class AIError extends Error {
  type: AIErrorType;

  constructor(message: string, type: AIErrorType) {
    super(message);
    this.type = type;
    this.name = 'AIError';
  }
}
