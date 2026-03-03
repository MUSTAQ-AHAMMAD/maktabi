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
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, className, iconColor = 'text-primary', iconBg }: KpiCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-2 font-medium flex items-center gap-1', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl shrink-0 ml-4', iconBg || 'bg-muted')}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
