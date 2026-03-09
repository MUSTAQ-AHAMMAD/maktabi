import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconColor?: string;
  iconBg?: string;
  gradient?: string;
}

export function KpiCard({
  title, value, subtitle, icon: Icon, trend, className,
  iconColor = 'text-primary', iconBg, gradient,
}: KpiCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded text-xs font-semibold',
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            )}>
              <span className="text-[10px]">{isPositive ? '▲' : '▼'}</span>
              {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl shrink-0 ml-4 group-hover:scale-110 transition-transform duration-200',
            gradient
              ? `bg-gradient-to-br ${gradient}`
              : (iconBg || 'bg-muted'),
          )}
        >
          <Icon className={cn('w-5 h-5', gradient ? 'text-white' : iconColor)} />
        </div>
      </div>
    </div>
  );
}
