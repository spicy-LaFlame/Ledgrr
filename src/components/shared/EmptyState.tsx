import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mb-4 text-center max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
