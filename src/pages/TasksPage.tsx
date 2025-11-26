import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useAppTasks } from '@/contexts/AppContext';
import { Task } from '@/types';

export default function TasksPage() {
  const { dailyTasks, permanentTasks, loading, createTask, updateTask } = useAppTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTab, setActiveTab] = useState('daily');

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

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  return (
    <div className="min-h-screen">
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

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="daily" className="flex-1">
              Daily ({dailyTasks.length})
            </TabsTrigger>
            <TabsTrigger value="permanent" className="flex-1">
              Permanent ({permanentTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-0">
            <TaskList 
              tasks={dailyTasks} 
              loading={loading}
              emptyMessage="No daily tasks. Add one to get started!"
              onEditTask={handleEdit}
            />
          </TabsContent>

          <TabsContent value="permanent" className="mt-0">
            <TaskList 
              tasks={permanentTasks} 
              loading={loading}
              emptyMessage="No permanent tasks yet."
              onEditTask={handleEdit}
            />
          </TabsContent>
        </Tabs>
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
