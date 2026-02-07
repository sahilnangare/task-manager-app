import { useState, useMemo, useCallback, useEffect } from 'react';
import { Task, TaskStatus, TaskFilter, TaskSort, TaskPriority } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>({ status: 'all', priority: 'all', search: '' });
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });

  // Fetch tasks from DB
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } else {
      setTasks(
        (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || undefined,
          status: row.status as TaskStatus,
          priority: row.priority as TaskPriority,
          dueDate: row.due_date ? new Date(row.due_date) : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // CRUD operations
  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create task');
      console.error(error);
    } else if (data) {
      setTasks(prev => [{
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }, ...prev]);
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString() || null;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update task');
      console.error(error);
    } else {
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      console.error(error);
    } else {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  }, [updateTask]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter.status && filter.status !== 'all') {
      result = result.filter(task => task.status === filter.status);
    }

    if (filter.priority && filter.priority !== 'all') {
      result = result.filter(task => task.priority === filter.priority);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

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
  const tasksByStatus = useMemo(() => ({
    pending: tasks.filter(t => t.status === 'pending'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  }), [tasks]);

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
    loading,
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
