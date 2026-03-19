import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import type { SpendingAlert } from '../../db/schema';

interface AlertsProps {
  alerts: SpendingAlert[];
}

const getSeverityStyle = (severity: 'critical' | 'warning' | 'info') => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-600',
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      };
  }
};

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-slate-900">
            Active Alerts
          </h3>
          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            {alerts.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          return (
            <div
              key={alert.id}
              className={`px-5 py-4 ${style.bg} border-l-4 ${style.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-medium ${style.text}`}>
                      {alert.message}
                    </p>
                    {alert.daysToExpiry !== undefined && (
                      <p className={`text-xs ${style.text} opacity-75 mt-1`}>
                        {alert.daysToExpiry} days remaining
                      </p>
                    )}
                    {alert.currentPace !== undefined && (
                      <p className={`text-xs ${style.text} opacity-75 mt-1`}>
                        Current pace: {alert.currentPace.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
                <button className={`p-1 hover:bg-white/50 rounded transition-colors ${style.text}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;
