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
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;
      
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate(),
        completed: completions.includes(dateStr),
        isToday,
      });
    }
    return days;
  };

  const days = getLast7Days();

  const handleToggle = (date: string) => {
    if (disabled) return;
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
          onClick={() => handleToggle(day.date)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-200',
            'min-w-[40px] touch-manipulation',
            day.isToday && 'ring-2 ring-primary/30',
            !disabled && 'hover:bg-muted/50 active:scale-95',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <span className={cn(
            'text-2xs font-medium uppercase',
            day.isToday ? 'text-primary' : 'text-muted-foreground'
          )}>
            {day.dayName.charAt(0)}
          </span>
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              'text-xs font-medium',
              day.completed
                ? 'text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground'
            )}
            style={{ 
              backgroundColor: day.completed ? habitColor : undefined,
              boxShadow: day.completed ? `0 2px 8px ${habitColor}40` : undefined
            }}
          >
            {day.completed ? (
              <Check className="h-4 w-4" />
            ) : (
              day.dayNumber
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
