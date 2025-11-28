import { useState } from 'react';
import { Plus, X, CheckSquare, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  onAddTask?: () => void;
  onAddHabit?: () => void;
}

export function FloatingActionButton({ onAddTask, onAddHabit }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on home, tasks, habits pages
  const showFAB = ['/', '/tasks', '/habits'].includes(location.pathname);

  if (!showFAB) return null;

  const handleAddTask = () => {
    setIsOpen(false);
    if (location.pathname === '/tasks') {
      onAddTask?.();
    } else {
      navigate('/tasks');
    }
  };

  const handleAddHabit = () => {
    setIsOpen(false);
    if (location.pathname === '/habits') {
      onAddHabit?.();
    } else {
      navigate('/habits');
    }
  };

  return (
    <div className="fixed right-4 bottom-24 z-50">
      {/* Action buttons */}
      <div className={cn(
        'flex flex-col gap-3 mb-3 transition-all duration-300',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <button
          onClick={handleAddHabit}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl',
            'bg-accent text-accent-foreground shadow-soft-md',
            'transition-all duration-200 hover:scale-105 active:scale-95',
            'animate-slide-up'
          )}
          style={{ animationDelay: '0.05s' }}
        >
          <Target className="h-5 w-5" />
          <span className="font-medium text-sm">Add Habit</span>
        </button>
        
        <button
          onClick={handleAddTask}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl',
            'bg-success text-success-foreground shadow-soft-md',
            'transition-all duration-200 hover:scale-105 active:scale-95',
            'animate-slide-up'
          )}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="font-medium text-sm">Add Task</span>
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center',
          'gradient-primary text-primary-foreground',
          'shadow-glow-md transition-all duration-300',
          'hover:scale-110 active:scale-95',
          isOpen ? 'rotate-45' : 'rotate-0',
          !isOpen && 'animate-fab-pulse'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
