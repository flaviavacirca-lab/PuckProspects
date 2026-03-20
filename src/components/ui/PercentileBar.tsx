import { getPercentileColor, getPercentileTextColor } from '@/lib/utils';

interface PercentileBarProps {
  value: number | null;
  label?: string;
  showValue?: boolean;
}

export default function PercentileBar({ value, label, showValue = true }: PercentileBarProps) {
  const pct = value ?? 0;
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 w-8">{label}</span>}
      <div className="percentile-bar flex-1 min-w-[60px]">
        <div
          className={`percentile-fill ${getPercentileColor(value)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className={`text-xs font-mono w-8 text-right ${getPercentileTextColor(value)}`}>
          {value !== null ? value : '-'}
        </span>
      )}
    </div>
  );
}
