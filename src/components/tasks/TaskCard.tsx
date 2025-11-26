import { useState } from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Clock, 
  Bell, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Play,
  ChevronRight
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

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
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

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleComplete, removeTask } = useAppTasks();
  const { start, state } = useAppTimer();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    await toggleComplete(task.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await removeTask(task.id);
  };

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

  return (
    <Card 
      variant="interactive"
      className={cn(
        'p-4 animate-fade-in',
        task.completed && 'opacity-60',
        isDeleting && 'opacity-0 scale-95 transition-all duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
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
                  'font-medium truncate',
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
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
                  className="text-primary"
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
    </Card>
  );
}
