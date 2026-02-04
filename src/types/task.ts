export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilter {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
}

export type TaskSortField = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: SortDirection;
}
