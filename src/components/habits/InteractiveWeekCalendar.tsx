import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveWeekCalendarProps {
  completions: string[];
  habitColor: string;
  onToggleDay: (date: string) => void;
  disabled?: boolean;
}

export function InteractiveWeekCalendar({ 
  completions, 
  habitColor, 
  onToggleDay,
  disabled = false 
}: InteractiveWeekCalendarProps) {
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isPast = date.getTime() < today.getTime();
      
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate(),
        completed: completions.includes(dateStr),
        isToday,
        isPast,
        isLocked: !isToday, // Only today is unlocked
      });
    }
    return days;
  };

  const days = getLast7Days();

  const handleToggle = (date: string, isLocked: boolean) => {
    if (disabled || isLocked) return;
    onToggleDay(date);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex gap-1 justify-between">
      {days.map((day) => (
        <button
          key={day.date}
          onClick={() => handleToggle(day.date, day.isLocked)}
          disabled={disabled || day.isLocked}
          className={cn(
            'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-200',
            'min-w-[40px] touch-manipulation',
            day.isToday && 'ring-2 ring-primary/50 bg-primary/5',
            day.isToday && !disabled && 'hover:bg-primary/10 active:scale-95',
            day.isLocked && 'cursor-not-allowed'
          )}
        >
          <span className={cn(
            'text-2xs font-medium uppercase',
            day.isToday ? 'text-primary font-semibold' : 'text-muted-foreground/60'
          )}>
            {day.dayName.charAt(0)}
          </span>
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              'text-xs font-medium relative',
              day.completed
                ? 'text-primary-foreground shadow-sm'
                : day.isToday
                  ? 'bg-muted text-foreground border-2 border-dashed border-primary/40'
                  : 'bg-muted/50 text-muted-foreground/50'
            )}
            style={{ 
              backgroundColor: day.completed ? habitColor : undefined,
              boxShadow: day.completed ? `0 2px 8px ${habitColor}40` : undefined,
              opacity: day.isLocked && !day.completed ? 0.6 : 1
            }}
          >
            {day.completed ? (
              <Check className="h-4 w-4" />
            ) : day.isLocked ? (
              <span className="text-muted-foreground/40">{day.dayNumber}</span>
            ) : (
              day.dayNumber
            )}
          </div>
          {day.isToday && !day.completed && (
            <span className="text-[9px] text-primary font-medium">Today</span>
          )}
        </button>
      ))}
    </div>
  );
}
