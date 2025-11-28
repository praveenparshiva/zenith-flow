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
      gradient: 'gradient-warm',
    },
    {
      icon: Trophy,
      value: `${longestStreak}d`,
      gradient: 'gradient-success',
    },
    {
      icon: TrendingUp,
      value: `${Math.round(weeklyCompletion)}%`,
      gradient: 'gradient-primary',
    },
  ];

  return (
    <div className="flex gap-1.5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg',
            stat.gradient
          )}
        >
          <stat.icon className="h-3 w-3 text-white" />
          <span className="text-2xs font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
