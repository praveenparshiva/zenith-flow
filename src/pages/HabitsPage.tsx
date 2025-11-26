import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trophy, Flame } from 'lucide-react';
import { useAppHabits } from '@/contexts/AppContext';
import { Habit } from '@/types';

export default function HabitsPage() {
  const { habits, loading, createHabit, updateHabit, getTodayStatus } = useAppHabits();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const todayHabits = getTodayStatus();
  const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  const handleSubmit = async (data: Parameters<typeof createHabit>[0]) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
    } else {
      await createHabit(data);
    }
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Habits"
        subtitle={`${habits.length} habits tracked`}
        action={
          <Button variant="gradient" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Streak Stats */}
        {habits.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStreaks}</p>
                  <p className="text-xs text-muted-foreground">Total Streak Days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Habit List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-medium mb-1">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building positive habits today!
            </p>
            <Button variant="gradient" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompletedToday={habit.isCompletedToday}
                isDueToday={habit.isDueToday}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Habit Modal */}
      <SlideUpModal
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
        description={editingHabit ? 'Update your habit' : 'Create a new habit to track'}
      >
        <HabitForm
          habit={editingHabit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </SlideUpModal>
    </div>
  );
}
