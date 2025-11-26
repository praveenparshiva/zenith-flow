import { PageHeader } from '@/components/layout/PageHeader';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ScreenTimeWidget } from '@/components/dashboard/ScreenTimeWidget';
import { UpcomingAlarms } from '@/components/dashboard/UpcomingAlarms';
import { TaskList } from '@/components/tasks/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppTasks, useAppHabits } from '@/contexts/AppContext';
import { HabitCard } from '@/components/habits/HabitCard';
import { ChevronRight, Plus } from 'lucide-react';
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

  const todayHabits = getTodayStatus().filter(h => h.isDueToday).slice(0, 3);
  const pendingDailyTasks = dailyTasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={greeting}
        subtitle={dateString}
      />
      
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <QuickStats />

        {/* Screen Time Widget */}
        <ScreenTimeWidget />

        {/* Upcoming Alarms */}
        <UpcomingAlarms />

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Today's Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks" className="flex items-center gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingDailyTasks.length > 0 ? (
              <TaskList tasks={pendingDailyTasks} loading={tasksLoading} />
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  {dailyTasks.length > 0 
                    ? 'All daily tasks completed!' 
                    : 'No daily tasks yet'}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/tasks">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Habits */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Today's Habits</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/habits" className="flex items-center gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayHabits.length > 0 ? (
              todayHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompletedToday={habit.isCompletedToday}
                  isDueToday={habit.isDueToday}
                />
              ))
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">No habits for today</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/habits">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Habit
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
