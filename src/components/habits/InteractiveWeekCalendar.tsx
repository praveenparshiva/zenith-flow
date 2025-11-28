import { Check } from 'lucide-react';
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
      
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate(),
        completed: completions.includes(dateStr),
        isToday,
        isLocked: !isToday,
      });
    }
    return days;
  };

  const days = getLast7Days();

  const handleToggle = (date: string, isLocked: boolean) => {
    if (disabled || isLocked) return;
    onToggleDay(date);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {days.map((day) => (
        <button
          key={day.date}
          onClick={() => handleToggle(day.date, day.isLocked)}
          disabled={disabled || day.isLocked}
          className={cn(
            'flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all duration-200',
            'flex-1 min-w-0 touch-manipulation',
            day.isToday && 'ring-1 ring-primary/50 bg-primary/5',
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
              'w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200',
              'text-2xs font-medium',
              day.completed
                ? 'text-primary-foreground shadow-sm'
                : day.isToday
                  ? 'bg-muted text-foreground border border-dashed border-primary/40'
                  : 'bg-muted/50 text-muted-foreground/50'
            )}
            style={{ 
              backgroundColor: day.completed ? habitColor : undefined,
              boxShadow: day.completed ? `0 2px 6px ${habitColor}40` : undefined,
              opacity: day.isLocked && !day.completed ? 0.6 : 1
            }}
          >
            {day.completed ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className={day.isLocked ? 'text-muted-foreground/40' : ''}>
                {day.dayNumber}
              </span>
            )}
          </div>
          {day.isToday && !day.completed && (
            <span className="text-[7px] text-primary font-medium leading-none">Today</span>
          )}
        </button>
      ))}
    </div>
  );
}
