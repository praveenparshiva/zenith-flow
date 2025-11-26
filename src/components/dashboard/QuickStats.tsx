import { useAppTasks, useAppHabits, useAppScreenTime, useAppTimer } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target, Clock, Flame } from 'lucide-react';

export function QuickStats() {
  const { pendingTasks, completedTasks, dailyTasks } = useAppTasks();
  const { getTodayStatus } = useAppHabits();
  const { todayMinutes, formatMinutes } = useAppScreenTime();
  const { state: timerState } = useAppTimer();

  const todayHabits = getTodayStatus();
  const dueHabits = todayHabits.filter(h => h.isDueToday);
  const completedHabits = dueHabits.filter(h => h.isCompletedToday);

  const todayTasks = dailyTasks.filter(t => !t.completed);
  const taskProgress = dailyTasks.length > 0 
    ? ((dailyTasks.length - todayTasks.length) / dailyTasks.length) * 100 
    : 0;

  const habitProgress = dueHabits.length > 0 
    ? (completedHabits.length / dueHabits.length) * 100 
    : 0;

  const stats = [
    {
      label: 'Tasks Today',
      value: `${dailyTasks.length - todayTasks.length}/${dailyTasks.length}`,
      progress: taskProgress,
      icon: CheckCircle2,
      color: 'text-primary',
    },
    {
      label: 'Habits Done',
      value: `${completedHabits.length}/${dueHabits.length}`,
      progress: habitProgress,
      icon: Target,
      color: 'text-accent',
    },
    {
      label: 'Screen Time',
      value: formatMinutes(todayMinutes),
      progress: Math.min((todayMinutes / 480) * 100, 100), // 8 hours max
      icon: Clock,
      color: todayMinutes > 420 ? 'text-destructive' : 'text-warning',
    },
    {
      label: 'Pomodoros',
      value: timerState.sessionsCompleted.toString(),
      progress: (timerState.sessionsCompleted / 8) * 100, // 8 sessions goal
      icon: Flame,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold mb-2">{stat.value}</p>
            <Progress value={stat.progress} className="h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
