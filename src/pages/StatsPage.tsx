import { PageHeader } from '@/components/layout/PageHeader';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppTasks, useAppHabits, useAppScreenTime, useAppTimer } from '@/contexts/AppContext';
import { CheckCircle2, Target, Clock, Flame, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const { tasks, completedTasks } = useAppTasks();
  const { habits } = useAppHabits();
  const { todayMinutes, formatMinutes } = useAppScreenTime();
  const { state: timerState } = useAppTimer();

  // Calculate overall stats
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks.length / totalTasks) * 100) 
    : 0;

  const totalHabitCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const averageStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length)
    : 0;

  const stats = [
    {
      label: 'Tasks Completed',
      value: completedTasks.length,
      subLabel: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'bg-primary/20 text-primary',
    },
    {
      label: 'Habit Completions',
      value: totalHabitCompletions,
      subLabel: `${averageStreak} avg streak`,
      icon: Target,
      color: 'bg-accent/20 text-accent',
    },
    {
      label: 'Screen Time Today',
      value: formatMinutes(todayMinutes),
      subLabel: 'Active time tracked',
      icon: Clock,
      color: 'bg-warning/20 text-warning',
    },
    {
      label: 'Pomodoro Sessions',
      value: timerState.sessionsCompleted,
      subLabel: 'Focus sessions',
      icon: Flame,
      color: 'bg-success/20 text-success',
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Statistics"
        subtitle="Track your progress"
      />

      <div className="p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xs text-muted-foreground mt-1">{stat.subLabel}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Charts */}
        <Tabs defaultValue="screenTime">
          <TabsList className="w-full">
            <TabsTrigger value="screenTime" className="flex-1">Screen Time</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
            <TabsTrigger value="habits" className="flex-1">Habits</TabsTrigger>
          </TabsList>

          <TabsContent value="screenTime" className="mt-4">
            <WeeklyChart type="screenTime" />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <WeeklyChart type="tasks" />
          </TabsContent>

          <TabsContent value="habits" className="mt-4">
            <WeeklyChart type="habits" />
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completionRate >= 80 && (
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="text-sm font-medium text-success">🎉 Great job!</p>
                <p className="text-xs text-muted-foreground">
                  You're completing {completionRate}% of your tasks
                </p>
              </div>
            )}

            {averageStreak >= 7 && (
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-sm font-medium text-warning">🔥 On fire!</p>
                <p className="text-xs text-muted-foreground">
                  Average habit streak: {averageStreak} days
                </p>
              </div>
            )}

            {todayMinutes > 0 && todayMinutes < 300 && (
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium text-accent">⚡ Balanced</p>
                <p className="text-xs text-muted-foreground">
                  Healthy screen time today
                </p>
              </div>
            )}

            {stats.every(s => typeof s.value === 'number' && s.value === 0) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">📊 Start tracking</p>
                <p className="text-xs text-muted-foreground">
                  Add tasks and habits to see your insights here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
