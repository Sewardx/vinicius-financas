import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'danger' | 'info';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-primary/5 border-primary/20',
  danger: 'bg-destructive/5 border-destructive/20',
  info: 'bg-info/5 border-info/20',
};

const iconStyles = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-primary/15 text-primary',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-info/15 text-info',
};

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) => (
  <div className={cn(
    'rounded-xl border p-4 md:p-5 transition-all hover:shadow-md animate-slide-up',
    variantStyles[variant]
  )}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconStyles[variant])}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-bold font-display">{value}</p>
    {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
  </div>
);

export default StatCard;
