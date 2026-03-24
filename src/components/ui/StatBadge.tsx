interface StatBadgeProps {
  label: string;
  value: string | number;
  className?: string;
}

export default function StatBadge({ label, value, className = '' }: StatBadgeProps) {
  return (
    <div className={`card px-4 py-3 ${className}`}>
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
