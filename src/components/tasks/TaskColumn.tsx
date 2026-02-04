import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Circle, Timer, CheckCircle2 } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const columnConfig: Record<TaskStatus, { title: string; icon: typeof Circle; countClass: string }> = {
  pending: {
    title: 'Pending',
    icon: Circle,
    countClass: 'bg-status-pending-bg text-status-pending-foreground',
  },
  'in-progress': {
    title: 'In Progress',
    icon: Timer,
    countClass: 'bg-status-progress-bg text-status-progress-foreground',
  },
  completed: {
    title: 'Completed',
    icon: CheckCircle2,
    countClass: 'bg-status-completed-bg text-status-completed-foreground',
  },
};

export function TaskColumn({ status, tasks, onEdit, onDelete, onStatusChange }: TaskColumnProps) {
  const config = columnConfig[status];
  const Icon = config.icon;

  return (
    <div className="task-column">
      <div className="task-column-header">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">{config.title}</h2>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.countClass}`}>
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
