import { Habit } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Flame, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppHabits } from '@/contexts/AppContext';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  isDueToday: boolean;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({ habit, isCompletedToday, isDueToday, onEdit }: HabitCardProps) {
  const { toggleCompletion, removeHabit, getCompletionRate } = useAppHabits();
  
  const completionRate = getCompletionRate(habit.id, 7);

  const handleToggle = async () => {
    await toggleCompletion(habit.id);
  };

  const handleDelete = async () => {
    await removeHabit(habit.id);
  };

  // Get last 7 days for mini calendar
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
        completed: habit.completions.includes(dateStr),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <Card variant="interactive" className="p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Completion Button */}
        <button
          onClick={handleToggle}
          disabled={!isDueToday}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200',
            isCompletedToday
              ? 'bg-success text-success-foreground'
              : isDueToday
                ? 'bg-muted hover:bg-muted/80'
                : 'bg-muted/50 opacity-50 cursor-not-allowed'
          )}
          style={{ backgroundColor: isCompletedToday ? habit.color : undefined }}
        >
          {isCompletedToday ? (
            <Check className="h-6 w-6" />
          ) : (
            habit.icon
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{habit.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {habit.currentStreak > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Flame className="h-3 w-3 text-warning" />
                    {habit.currentStreak} day streak
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {Math.round(completionRate)}% this week
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
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

          {/* Mini Calendar */}
          <div className="flex gap-1.5 mt-3">
            {last7Days.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-2xs text-muted-foreground">{day.dayName}</span>
                <div
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center transition-all',
                    day.completed
                      ? 'text-primary-foreground'
                      : 'bg-muted'
                  )}
                  style={{ backgroundColor: day.completed ? habit.color : undefined }}
                >
                  {day.completed && <Check className="h-3 w-3" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
