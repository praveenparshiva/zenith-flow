import { useState } from 'react';
import { Habit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'currentStreak' | 'longestStreak'>) => void;
  onCancel: () => void;
}

const icons = ['💪', '📚', '🧘', '💧', '🏃', '😴', '🥗', '💊', '✍️', '🎯', '🧠', '💰'];
const colors = [
  '#4F46E5', // Indigo
  '#0D9488', // Teal
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#2563EB', // Blue
];

const daysOfWeek = [
  { value: 0, label: 'S' },
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
];

export function HabitForm({ habit, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [icon, setIcon] = useState(habit?.icon || '💪');
  const [color, setColor] = useState(habit?.color || colors[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [targetDays, setTargetDays] = useState<number[]>(habit?.targetDays || [0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      icon,
      color,
      frequency,
      targetDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : targetDays,
    });
  };

  const toggleDay = (day: number) => {
    setTargetDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Exercise for 30 minutes"
          autoFocus
        />
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {icons.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                icon === i
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'w-8 h-8 rounded-full transition-all',
                color === c && 'ring-2 ring-offset-2 ring-ring scale-110'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-3">
        <Label>Frequency</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={frequency === 'daily' ? 'default' : 'outline'}
            onClick={() => setFrequency('daily')}
            className="flex-1"
          >
            Daily
          </Button>
          <Button
            type="button"
            variant={frequency === 'weekly' ? 'default' : 'outline'}
            onClick={() => setFrequency('weekly')}
            className="flex-1"
          >
            Specific Days
          </Button>
        </div>

        {/* Day selection for weekly */}
        {frequency === 'weekly' && (
          <div className="flex justify-between gap-1 mt-3">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={cn(
                  'w-10 h-10 rounded-lg font-medium transition-all',
                  targetDays.includes(day.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="gradient" className="flex-1">
          {habit ? 'Update Habit' : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
}
