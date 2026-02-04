import { Task, TaskStatus } from '@/types/task';
import { StatusBadge, PriorityIndicator } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: null,
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Start Progress',
  'in-progress': 'Mark Complete',
  completed: 'Completed',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const next = nextStatus[task.status];

  return (
    <div className="task-card group animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PriorityIndicator priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          
          <h3 className={`font-medium text-foreground line-clamp-2 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due {format(task.dueDate, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            {next && (
              <DropdownMenuItem onClick={() => onStatusChange(task.id, next)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                {statusLabels[task.status]}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {next && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onStatusChange(task.id, next)}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {statusLabels[task.status]}
        </Button>
      )}
    </div>
  );
}
