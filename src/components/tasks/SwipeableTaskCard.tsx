import { useState, useRef } from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Bell, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Play,
  Check,
  X,
  AlarmClock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppTasks, useAppTimer } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface SwipeableTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onAlarmSchedule?: (task: Task) => void;
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-warning/20 text-warning',
  urgent: 'bg-destructive/20 text-destructive',
};

const categoryIcons: Record<Task['category'], string> = {
  work: '💼',
  personal: '👤',
  health: '💪',
  learning: '📚',
  other: '📌',
};

export function SwipeableTaskCard({ task, onEdit, onAlarmSchedule }: SwipeableTaskCardProps) {
  const { toggleComplete, removeTask } = useAppTasks();
  const { start } = useAppTimer();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleComplete = async () => {
    await toggleComplete(task.id);
    setShowActions(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(async () => {
      await removeTask(task.id);
    }, 300);
  };

  const handleAlarmSchedule = () => {
    onAlarmSchedule?.(task);
    setShowActions(null);
  };

  const { offsetX, isSwiping, direction, handlers, triggerHaptic } = useSwipeGesture({
    threshold: 80,
    longSwipeThreshold: 150,
    onSwipeRight: handleComplete,
    onSwipeLeft: handleDelete,
    onLongSwipeRight: handleAlarmSchedule,
  });

  const handleStartTimer = () => {
    start(task.id);
    navigate('/timer');
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const nextAlarm = task.alarms.find(a => a.enabled);

  // Calculate swipe progress for visual feedback
  const swipeProgress = Math.min(Math.abs(offsetX) / 150, 1);
  const isLongSwipe = Math.abs(offsetX) >= 150;

  return (
    <div 
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl',
        isDeleting && 'animate-fade-out'
      )}
    >
      {/* Background action indicators */}
      <div className="absolute inset-0 flex">
        {/* Right swipe - Complete */}
        <div 
          className={cn(
            'flex items-center justify-start pl-4 w-1/2 transition-colors',
            direction === 'right' && isSwiping
              ? isLongSwipe 
                ? 'bg-primary' 
                : 'bg-success'
              : 'bg-success/20'
          )}
          style={{ opacity: direction === 'right' ? swipeProgress : 0 }}
        >
          {isLongSwipe ? (
            <AlarmClock className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Check className="h-6 w-6 text-success-foreground" />
          )}
        </div>
        
        {/* Left swipe - Delete */}
        <div 
          className={cn(
            'flex items-center justify-end pr-4 w-1/2 transition-colors',
            direction === 'left' && isSwiping
              ? 'bg-destructive'
              : 'bg-destructive/20'
          )}
          style={{ opacity: direction === 'left' ? swipeProgress : 0 }}
        >
          <Trash2 className="h-6 w-6 text-destructive-foreground" />
        </div>
      </div>

      {/* Card content */}
      <Card 
        variant="interactive"
        className={cn(
          'relative p-4 transition-transform duration-200 touch-pan-y',
          task.completed && 'opacity-60',
          !isSwiping && 'transition-all duration-300'
        )}
        style={{ 
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
        {...handlers}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task.id)}
              className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{categoryIcons[task.category]}</span>
                  <h3 className={cn(
                    'font-semibold truncate text-foreground',
                    task.completed && 'line-through text-muted-foreground'
                  )}>
                    {task.name}
                  </h3>
                </div>
                
                {task.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {task.notes}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={cn('text-xs font-medium', priorityColors[task.priority])}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.isDaily ? 'Daily' : 'Permanent'}
                  </Badge>
                  
                  {nextAlarm && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Bell className="h-3 w-3" />
                      {nextAlarm.time}
                    </Badge>
                  )}
                  
                  {task.timeSpent > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeSpent(task.timeSpent)}
                    </Badge>
                  )}
                  
                  {task.pomodoroSessions > 0 && (
                    <Badge variant="outline" className="text-xs">
                      🍅 {task.pomodoroSessions}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!task.completed && (
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={handleStartTimer}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(task)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAlarmSchedule}>
                      <AlarmClock className="h-4 w-4 mr-2" />
                      Schedule Alarm
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
            </div>
          </div>
        </div>

        {/* Swipe hint on first render */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xs text-muted-foreground opacity-50">
          ← swipe →
        </div>
      </Card>
    </div>
  );
}
