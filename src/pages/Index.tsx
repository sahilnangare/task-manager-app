import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { TaskColumn, TaskFilters, TaskForm } from '@/components/tasks';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, LayoutGrid, List, CheckSquare, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

type ViewMode = 'board' | 'list';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const {
    tasks,
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
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(taskData);
    toast.success('Task created successfully');
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    toast.success('Task deleted');
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTaskStatus(id, status);
    toast.success(`Task moved to ${status.replace('-', ' ')}`);
  };

  const openNewTaskForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.email} · {taskCounts.total} tasks · {taskCounts.completed} completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8"
                  onClick={() => setViewMode('board')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={openNewTaskForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>

              <ThemeToggle />

              <button
                onClick={() => navigate('/profile')}
                className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                title="Profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {(profile?.display_name || user?.email || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        {/* Task Board / List View */}
        {viewMode === 'board' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskColumn
              status="pending"
              tasks={tasksByStatus.pending}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
            <TaskColumn
              status="in-progress"
              tasks={tasksByStatus['in-progress']}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
            <TaskColumn
              status="completed"
              tasks={tasksByStatus.completed}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No tasks found</p>
                <Button variant="link" onClick={openNewTaskForm}>
                  Create your first task
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border divide-y divide-border">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </Button>
                        {task.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(
                                task.id,
                                task.status === 'pending' ? 'in-progress' : 'completed'
                              )
                            }
                          >
                            {task.status === 'pending' ? 'Start' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Form Dialog */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  );
};

export default Index;
