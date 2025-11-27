import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitStatsBarProps {
  currentStreak: number;
  longestStreak: number;
  weeklyCompletion: number;
}

export function HabitStatsBar({ currentStreak, longestStreak, weeklyCompletion }: HabitStatsBarProps) {
  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: `${currentStreak}d`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Trophy,
      label: 'Best',
      value: `${longestStreak}d`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: TrendingUp,
      label: 'Week',
      value: `${Math.round(weeklyCompletion)}%`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="flex gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg',
            stat.bgColor
          )}
        >
          <stat.icon className={cn('h-3 w-3', stat.color)} />
          <span className="text-xs font-semibold text-foreground">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
