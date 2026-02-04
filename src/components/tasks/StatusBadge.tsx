import { TaskStatus, TaskPriority } from '@/types/task';
import { Circle, Timer, CheckCircle2, AlertTriangle, Minus, ArrowDown } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; className: string }> = {
  pending: {
    label: 'Pending',
    icon: Circle,
    className: 'status-pending',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Timer,
    className: 'status-progress',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'status-completed',
  },
};

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className} ${className}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

interface PriorityIndicatorProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

const priorityConfig: Record<TaskPriority, { label: string; icon: typeof AlertTriangle; className: string }> = {
  high: {
    label: 'High',
    icon: AlertTriangle,
    className: 'priority-high',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    className: 'priority-medium',
  },
  low: {
    label: 'Low',
    icon: ArrowDown,
    className: 'priority-low',
  },
};

export function PriorityIndicator({ priority, showLabel = false, className = '' }: PriorityIndicatorProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.className} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
