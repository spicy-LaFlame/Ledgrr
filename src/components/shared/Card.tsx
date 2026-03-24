type CardVariant = 'default' | 'elevated' | 'interactive';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white rounded-2xl border border-slate-200',
  elevated: 'bg-white rounded-2xl border border-slate-200 shadow-md',
  interactive: 'bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
};

export function Card({ variant = 'default', className = '', children, onClick }: CardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
