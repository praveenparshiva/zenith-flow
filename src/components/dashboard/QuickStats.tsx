import { useAppTasks, useAppHabits, useAppTimer } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      gradient: 'gradient-success',
      bgColor: 'bg-success/10',
      progressColor: '[&>div]:bg-success',
    },
    {
      label: 'Habits',
      value: `${completedHabits.length}/${dueHabits.length}`,
      progress: habitProgress,
      icon: Target,
      gradient: 'gradient-accent',
      bgColor: 'bg-accent/10',
      progressColor: '[&>div]:bg-accent',
    },
    {
      label: 'Focus',
      value: timerState.sessionsCompleted.toString(),
      progress: (timerState.sessionsCompleted / 8) * 100,
      icon: Flame,
      gradient: 'gradient-warm',
      bgColor: 'bg-warning/10',
      progressColor: '[&>div]:bg-warning',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="overflow-hidden border-0 shadow-soft"
        >
          <CardContent className="p-3">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
              stat.gradient
            )}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-2xs text-muted-foreground mb-2">{stat.label}</p>
            <Progress 
              value={stat.progress} 
              className={cn('h-1.5 bg-muted/50', stat.progressColor)} 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
