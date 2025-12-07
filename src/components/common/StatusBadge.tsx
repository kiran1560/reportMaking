import { OrderStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/lims';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', STATUS_COLORS[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
