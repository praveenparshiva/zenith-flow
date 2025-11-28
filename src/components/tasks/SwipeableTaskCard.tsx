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

const priorityConfig: Record<Task['priority'], { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Low' },
  medium: { bg: 'bg-accent/15', text: 'text-accent', label: 'Medium' },
  high: { bg: 'bg-warning/15', text: 'text-warning', label: 'High' },
  urgent: { bg: 'bg-destructive/15', text: 'text-destructive', label: 'Urgent' },
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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleComplete = async () => {
    await toggleComplete(task.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(async () => {
      await removeTask(task.id);
    }, 300);
  };

  const handleAlarmSchedule = () => {
    onAlarmSchedule?.(task);
  };

  const { offsetX, isSwiping, direction } = useSwipeGesture({
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
  const swipeProgress = Math.min(Math.abs(offsetX) / 150, 1);
  const isLongSwipe = Math.abs(offsetX) >= 150;
  const priority = priorityConfig[task.priority];

  return (
    <div 
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        isDeleting && 'animate-fade-out'
      )}
    >
      {/* Background action indicators */}
      <div className="absolute inset-0 flex">
        <div 
          className={cn(
            'flex items-center justify-start pl-5 w-1/2 transition-colors',
            direction === 'right' && isSwiping
              ? isLongSwipe ? 'bg-primary' : 'bg-success'
              : 'bg-success/20'
          )}
          style={{ opacity: direction === 'right' ? swipeProgress : 0 }}
        >
          {isLongSwipe ? (
            <AlarmClock className="h-6 w-6 text-white" />
          ) : (
            <Check className="h-6 w-6 text-white" />
          )}
        </div>
        
        <div 
          className={cn(
            'flex items-center justify-end pr-5 w-1/2 transition-colors',
            direction === 'left' && isSwiping ? 'bg-destructive' : 'bg-destructive/20'
          )}
          style={{ opacity: direction === 'left' ? swipeProgress : 0 }}
        >
          <Trash2 className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Card content */}
      <Card 
        className={cn(
          'relative p-4 touch-pan-y border-0 shadow-soft',
          task.completed && 'opacity-50',
          !isSwiping && 'transition-transform duration-300'
        )}
        style={{ 
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task.id)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-all',
                'data-[state=checked]:bg-success data-[state=checked]:border-success',
                !task.completed && 'border-muted-foreground/30'
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{categoryIcons[task.category]}</span>
                  <h3 className={cn(
                    'font-semibold text-foreground truncate',
                    task.completed && 'line-through text-muted-foreground'
                  )}>
                    {task.name}
                  </h3>
                </div>
                
                {task.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {task.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge 
                    className={cn(
                      'text-2xs font-semibold rounded-md border-0',
                      priority.bg, priority.text
                    )}
                  >
                    {priority.label}
                  </Badge>
                  
                  {nextAlarm && (
                    <Badge variant="outline" className="text-2xs gap-1 rounded-md border-border/50">
                      <Bell className="h-2.5 w-2.5" />
                      {nextAlarm.time}
                    </Badge>
                  )}
                  
                  {task.timeSpent > 0 && (
                    <Badge variant="outline" className="text-2xs gap-1 rounded-md border-border/50">
                      <Clock className="h-2.5 w-2.5" />
                      {formatTimeSpent(task.timeSpent)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!task.completed && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleStartTimer}
                    className="h-8 w-8 rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit?.(task)} className="rounded-lg">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAlarmSchedule} className="rounded-lg">
                      <AlarmClock className="h-4 w-4 mr-2" />
                      Schedule Alarm
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive rounded-lg"
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
      </Card>
    </div>
  );
}
