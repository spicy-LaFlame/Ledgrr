interface SkeletonProps {
  className?: string;
}

function SkeletonBase({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-200 rounded animate-skeleton ${className}`} />
  );
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return <SkeletonBase className={`h-4 ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
      <SkeletonBase className="h-3 w-1/3 mb-3" />
      <SkeletonBase className="h-7 w-2/3 mb-2" />
      <SkeletonBase className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonMetricCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBase className="w-9 h-9 rounded-xl" />
        <SkeletonBase className="h-3 w-20" />
      </div>
      <SkeletonBase className="h-7 w-32 mb-2" />
      <SkeletonBase className="h-3 w-24" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 5, className = '' }: SkeletonProps & { columns?: number }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBase className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <SkeletonBase className="h-7 w-48 mb-2" />
          <SkeletonBase className="h-4 w-32" />
        </div>
        <SkeletonBase className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <SkeletonBase className="h-5 w-40 mb-4" />
          <SkeletonBase className="h-48 w-full rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <SkeletonBase className="h-5 w-32 mb-4" />
          <SkeletonBase className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
