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
    <div className="flex items-center justify-between w-full bg-muted/30 rounded-xl p-2">
      {days.map((day) => (
        <button
          key={day.date}
          onClick={() => handleToggle(day.date, day.isLocked)}
          disabled={disabled || day.isLocked}
          className={cn(
            'flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all duration-300',
            'flex-1 min-w-0 touch-manipulation',
            day.isToday && 'bg-card shadow-soft',
            day.isToday && !disabled && 'hover:scale-105 active:scale-95',
            day.isLocked && !day.isToday && 'cursor-not-allowed'
          )}
        >
          <span className={cn(
            'text-2xs font-medium uppercase',
            day.isToday ? 'text-primary font-bold' : 'text-muted-foreground/60'
          )}>
            {day.dayName.charAt(0)}
          </span>
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300',
              'text-2xs font-semibold',
              day.completed
                ? 'text-white shadow-md'
                : day.isToday
                  ? 'bg-primary/10 text-primary border-2 border-dashed border-primary/30'
                  : 'bg-muted/50 text-muted-foreground/40'
            )}
            style={{ 
              backgroundColor: day.completed ? habitColor : undefined,
              boxShadow: day.completed ? `0 2px 8px ${habitColor}50` : undefined,
            }}
          >
            {day.completed ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span>{day.dayNumber}</span>
            )}
          </div>
          {day.isToday && !day.completed && (
            <span className="text-[8px] text-primary font-semibold">Today</span>
          )}
        </button>
      ))}
    </div>
  );
}
