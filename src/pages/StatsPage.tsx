import { PageHeader } from '@/components/layout/PageHeader';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppTasks, useAppHabits, useAppTimer } from '@/contexts/AppContext';
import { CheckCircle2, Target, Flame, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const { tasks, completedTasks } = useAppTasks();
  const { habits } = useAppHabits();
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

      <div className="px-4 pb-24 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-2xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Charts */}
        <Tabs defaultValue="tasks">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>

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

            {completionRate < 80 && averageStreak < 7 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">📊 Keep going!</p>
                <p className="text-xs text-muted-foreground">
                  Build consistency by completing tasks and habits daily
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
