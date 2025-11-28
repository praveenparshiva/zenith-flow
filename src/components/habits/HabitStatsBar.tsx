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
      value: `${currentStreak}d`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Trophy,
      value: `${longestStreak}d`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: TrendingUp,
      value: `${Math.round(weeklyCompletion)}%`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="flex gap-1.5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded-md',
            stat.bgColor
          )}
        >
          <stat.icon className={cn('h-2.5 w-2.5', stat.color)} />
          <span className="text-2xs font-semibold text-foreground">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
