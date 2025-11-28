import { useAppTasks, useAppHabits, useAppTimer } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target, Flame } from 'lucide-react';

export function QuickStats() {
  const { dailyTasks } = useAppTasks();
  const { getTodayStatus } = useAppHabits();
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
      label: 'Tasks',
      value: `${dailyTasks.length - todayTasks.length}/${dailyTasks.length}`,
      progress: taskProgress,
      icon: CheckCircle2,
      color: 'text-primary',
    },
    {
      label: 'Habits',
      value: `${completedHabits.length}/${dueHabits.length}`,
      progress: habitProgress,
      icon: Target,
      color: 'text-accent',
    },
    {
      label: 'Pomodoros',
      value: timerState.sessionsCompleted.toString(),
      progress: (timerState.sessionsCompleted / 8) * 100,
      icon: Flame,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <span className="text-2xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-lg font-bold mb-1.5">{stat.value}</p>
            <Progress value={stat.progress} className="h-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
