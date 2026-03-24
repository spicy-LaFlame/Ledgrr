import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProjectSpending {
  projectId: string;
  projectName: string;
  projectCode: string;
  budgeted: number;
  actual: number;
  variance: number;
  salaryBudgeted: number;
  salaryActual: number;
  expenseBudgeted: number;
  expenseActual: number;
}

interface BudgetVsActualChartProps {
  data: ProjectSpending[];
  formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
  formatCurrency: (amount: number) => string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  // Group by budgeted vs actual
  const salaryBudgeted = payload.find(p => p.name === 'Salary (Budget)')?.value ?? 0;
  const expenseBudgeted = payload.find(p => p.name === 'Expenses (Budget)')?.value ?? 0;
  const salaryActual = payload.find(p => p.name === 'Salary (Actual)')?.value ?? 0;
  const expenseActual = payload.find(p => p.name === 'Expenses (Actual)')?.value ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-900 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-0.5">Budgeted: {formatCurrency(salaryBudgeted + expenseBudgeted)}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            Salary: {formatCurrency(salaryBudgeted)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
            Expenses: {formatCurrency(expenseBudgeted)}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-0.5">Actual: {formatCurrency(salaryActual + expenseActual)}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            Salary: {formatCurrency(salaryActual)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />
            Expenses: {formatCurrency(expenseActual)}
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ data, formatCurrency }) => {
  const chartData = data.map(item => ({
    name: item.projectCode,
    salaryBudgeted: item.salaryBudgeted,
    expenseBudgeted: item.expenseBudgeted,
    salaryActual: item.salaryActual,
    expenseActual: item.expenseActual,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-cyan-900">Budget vs Actual</h3>
        <p className="text-xs text-slate-500 mt-1">Salary and expense spending by project</p>
      </div>
      <div className="p-5">
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
            No spending data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="0" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
              {/* Budgeted stack */}
              <Bar dataKey="salaryBudgeted" name="Salary (Budget)" stackId="budget" fill="#CBD5E1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expenseBudgeted" name="Expenses (Budget)" stackId="budget" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              {/* Actual stack */}
              <Bar dataKey="salaryActual" name="Salary (Actual)" stackId="actual" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expenseActual" name="Expenses (Actual)" stackId="actual" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default BudgetVsActualChart;
