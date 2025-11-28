import { useState } from 'react';
import { Habit } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppHabits } from '@/contexts/AppContext';
import { InteractiveWeekCalendar } from './InteractiveWeekCalendar';
import { HabitStatsBar } from './HabitStatsBar';

interface EnhancedHabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  isDueToday: boolean;
  onEdit?: (habit: Habit) => void;
}

export function EnhancedHabitCard({ habit, isCompletedToday, isDueToday, onEdit }: EnhancedHabitCardProps) {
  const { toggleCompletion, removeHabit, getCompletionRate } = useAppHabits();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const weeklyCompletion = getCompletionRate(habit.id, 7);

  const handleToggle = async () => {
    await toggleCompletion(habit.id);
  };

  const handleToggleDay = async (date: string) => {
    await toggleCompletion(habit.id, date);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(async () => {
      await removeHabit(habit.id);
    }, 300);
  };

  return (
    <Card 
      variant="interactive" 
      className={cn(
        'p-3 animate-scale-in',
        isDeleting && 'animate-fade-out opacity-0'
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Completion Button */}
          <button
            onClick={handleToggle}
            disabled={!isDueToday}
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg',
              'transition-all duration-300 transform',
              isCompletedToday
                ? 'text-primary-foreground scale-100 shadow-lg'
                : isDueToday
                  ? 'bg-muted hover:bg-muted/80 hover:scale-105 active:scale-95'
                  : 'bg-muted/50 opacity-50 cursor-not-allowed'
            )}
            style={{ 
              backgroundColor: isCompletedToday ? habit.color : undefined,
              boxShadow: isCompletedToday ? `0 4px 16px ${habit.color}50` : undefined
            }}
          >
            {isCompletedToday ? (
              <Check className="h-5 w-5 animate-scale-in" />
            ) : (
              habit.icon
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{habit.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {habit.frequency === 'daily' ? 'Every day' : `${habit.targetDays.length} days/week`}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="hover:bg-muted flex-shrink-0 h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(habit)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats */}
            <div className="mt-1.5">
              <HabitStatsBar 
                currentStreak={habit.currentStreak}
                longestStreak={habit.longestStreak}
                weeklyCompletion={weeklyCompletion}
              />
            </div>
          </div>
        </div>

        {/* Interactive Week Calendar */}
        <InteractiveWeekCalendar
          completions={habit.completions}
          habitColor={habit.color}
          onToggleDay={handleToggleDay}
        />
      </div>
    </Card>
  );
}
