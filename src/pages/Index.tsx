import { PageHeader } from '@/components/layout/PageHeader';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { UpcomingAlarms } from '@/components/dashboard/UpcomingAlarms';
import { SwipeableTaskCard } from '@/components/tasks/SwipeableTaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppTasks, useAppHabits } from '@/contexts/AppContext';
import { EnhancedHabitCard } from '@/components/habits/EnhancedHabitCard';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { dailyTasks, loading: tasksLoading } = useAppTasks();
  const { getTodayStatus, loading: habitsLoading } = useAppHabits();

  const today = new Date();
  const greeting = today.getHours() < 12 
    ? 'Good morning' 
    : today.getHours() < 18 
      ? 'Good afternoon' 
      : 'Good evening';

  const dateString = today.toLocaleDateString('en', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const todayHabits = getTodayStatus().filter(h => h.isDueToday).slice(0, 2);
  const pendingDailyTasks = dailyTasks.filter(t => !t.completed).slice(0, 3);
  const completedTodayCount = dailyTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={
          <span className="flex items-center gap-2">
            {greeting}
            <Sparkles className="h-5 w-5 text-warning animate-pulse" />
          </span>
        }
        subtitle={dateString}
      />
      
      <div className="px-4 pb-24 space-y-4">
        {/* Quick Stats */}
        <QuickStats />

        {/* Upcoming Alarms */}
        <UpcomingAlarms />

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
                {completedTodayCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                    {completedTodayCount} done
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 text-muted-foreground hover:text-foreground">
                <Link to="/tasks" className="flex items-center gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : pendingDailyTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingDailyTasks.map((task) => (
                  <SwipeableTaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={dailyTasks.length > 0 ? '🎉' : '📝'}
                title={dailyTasks.length > 0 ? 'All done!' : 'No tasks'}
                description={dailyTasks.length > 0 
                  ? "You've completed all your daily tasks" 
                  : 'Add your first daily task'}
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tasks">
                      <Plus className="h-4 w-4 mr-1" />
                      {dailyTasks.length > 0 ? 'Add More' : 'Add Task'}
                    </Link>
                  </Button>
                }
                className="py-6"
              />
            )}
          </CardContent>
        </Card>

        {/* Today's Habits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Today's Habits</CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-8 text-muted-foreground hover:text-foreground">
                <Link to="/habits" className="flex items-center gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {habitsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : todayHabits.length > 0 ? (
              <div className="space-y-3">
                {todayHabits.map(habit => (
                  <EnhancedHabitCard
                    key={habit.id}
                    habit={habit}
                    isCompletedToday={habit.isCompletedToday}
                    isDueToday={habit.isDueToday}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🎯"
                title="No habits today"
                description="Create habits to build consistency"
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/habits">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Habit
                    </Link>
                  </Button>
                }
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
