import { ArrowUpRight } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OrgBreakdown {
  orgCode: string;
  orgName: string;
  totalHours: number;
  totalCost: number;
}

interface OrgBreakdownChartProps {
  data: OrgBreakdown[];
  formatCurrency: (amount: number) => string;
}

const COLORS = ['#2563EB', '#1E293B', '#94A3B8'];

const OrgBreakdownChart: React.FC<OrgBreakdownChartProps> = ({ data, formatCurrency }) => {
  const chartData = data.map((item, index) => ({
    name: item.orgCode,
    value: item.totalCost,
    color: COLORS[index % COLORS.length],
  }));

  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-cyan-900">By Organization</h3>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Team allocation breakdown</p>
      </div>
      <div className="p-5">
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
            No organization data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : '$0'}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrgBreakdownChart;
