import { useState, useRef, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SwipeableTaskCard } from '@/components/tasks/SwipeableTaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilterTabs, TaskFilter } from '@/components/tasks/TaskFilterTabs';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useAppTasks } from '@/contexts/AppContext';
import { Task } from '@/types';

export default function TasksPage() {
  const { dailyTasks, permanentTasks, loading, createTask, updateTask } = useAppTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyFilter, setDailyFilter] = useState<TaskFilter>('all');
  const [permanentFilter, setPermanentFilter] = useState<TaskFilter>('all');
  
  const dailyListRef = useRef<HTMLDivElement>(null);
  const permanentListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when filter changes
  useEffect(() => {
    if (activeTab === 'daily') {
      dailyListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      permanentListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dailyFilter, permanentFilter, activeTab]);

  // Filter tasks based on current filter
  const filterTasks = (tasks: Task[], filter: TaskFilter) => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'done':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  const filteredDailyTasks = useMemo(() => filterTasks(dailyTasks, dailyFilter), [dailyTasks, dailyFilter]);
  const filteredPermanentTasks = useMemo(() => filterTasks(permanentTasks, permanentFilter), [permanentTasks, permanentFilter]);

  const dailyCounts = useMemo(() => ({
    all: dailyTasks.length,
    active: dailyTasks.filter(t => !t.completed).length,
    done: dailyTasks.filter(t => t.completed).length,
  }), [dailyTasks]);

  const permanentCounts = useMemo(() => ({
    all: permanentTasks.length,
    active: permanentTasks.filter(t => !t.completed).length,
    done: permanentTasks.filter(t => t.completed).length,
  }), [permanentTasks]);

  const handleSubmit = async (data: Parameters<typeof createTask>[0]) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAlarmSchedule = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset filters when switching tabs
    if (value === 'daily') {
      setDailyFilter('all');
    } else {
      setPermanentFilter('all');
    }
  };

  const renderTaskList = (
    tasks: Task[], 
    filter: TaskFilter, 
    emptyMessage: string
  ) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          icon="📝"
          title={filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          description={filter === 'all' ? emptyMessage : `You don't have any ${filter} tasks right now`}
          action={
            filter === 'all' && (
              <Button variant="gradient" size="sm" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <SwipeableTaskCard 
            key={task.id} 
            task={task} 
            onEdit={handleEdit}
            onAlarmSchedule={handleAlarmSchedule}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        title="Tasks"
        subtitle={`${dailyTasks.length + permanentTasks.length} total tasks`}
        action={
          <Button variant="gradient" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        }
      />

      <div className="flex-1 p-4 pb-24 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <TabsList className="w-full mb-4 grid grid-cols-2 h-12 p-1 bg-muted/50">
            <TabsTrigger 
              value="daily" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Daily ({dailyTasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="permanent" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Permanent ({permanentTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-0 flex-1 flex flex-col space-y-4">
            <TaskFilterTabs 
              filter={dailyFilter} 
              onChange={setDailyFilter}
              counts={dailyCounts}
            />
            <div ref={dailyListRef} className="flex-1 overflow-y-auto -mx-1 px-1">
              {renderTaskList(filteredDailyTasks, dailyFilter, 'Add your first daily task!')}
            </div>
          </TabsContent>

          <TabsContent value="permanent" className="mt-0 flex-1 flex flex-col space-y-4">
            <TaskFilterTabs 
              filter={permanentFilter} 
              onChange={setPermanentFilter}
              counts={permanentCounts}
            />
            <div ref={permanentListRef} className="flex-1 overflow-y-auto -mx-1 px-1">
              {renderTaskList(filteredPermanentTasks, permanentFilter, 'Add your first permanent task!')}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Swipe hint tooltip */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-xs px-3 py-1.5 rounded-full opacity-0 animate-fade-in pointer-events-none" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
        Swipe tasks → complete · ← delete
      </div>

      {/* Add/Edit Task Modal */}
      <SlideUpModal
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        description={editingTask ? 'Update your task details' : 'Create a new task with optional alarms'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </SlideUpModal>
    </div>
  );
}
