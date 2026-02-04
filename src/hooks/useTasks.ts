import { useState, useMemo, useCallback } from 'react';
import { Task, TaskStatus, TaskFilter, TaskSort, TaskPriority } from '@/types/task';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial mock data
const initialTasks: Task[] = [
  {
    id: generateId(),
    title: 'Design system review',
    description: 'Review and finalize the design tokens for the new dashboard',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Implement authentication flow',
    description: 'Set up JWT-based authentication with login and signup pages',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Update dependencies',
    description: 'Upgrade all npm packages to latest stable versions',
    status: 'pending',
    priority: 'low',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Performance optimization',
    description: 'Analyze and optimize bundle size and load times',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>({ status: 'all', priority: 'all', search: '' });
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });

  // CRUD operations
  const createTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status });
  }, [updateTask]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply status filter
    if (filter.status && filter.status !== 'all') {
      result = result.filter(task => task.status === filter.status);
    }

    // Apply priority filter
    if (filter.priority && filter.priority !== 'all') {
      result = result.filter(task => task.priority === filter.priority);
    }

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          const aDate = a.dueDate?.getTime() ?? Infinity;
          const bDate = b.dueDate?.getTime() ?? Infinity;
          comparison = aDate - bDate;
          break;
        case 'createdAt':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filter, sort]);

  // Tasks grouped by status
  const tasksByStatus = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      completed: tasks.filter(t => t.status === 'completed'),
    };
  }, [tasks]);

  // Task counts
  const taskCounts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks]);

  return {
    tasks: filteredTasks,
    tasksByStatus,
    taskCounts,
    filter,
    setFilter,
    sort,
    setSort,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
}
