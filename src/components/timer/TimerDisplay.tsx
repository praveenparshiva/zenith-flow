import { useAppTimer, useAppTasks } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TimerDisplay() {
  const { state, formattedTime, progress, start, pause, resume, stop, reset, skip, setMode } = useAppTimer();
  const { tasks } = useAppTasks();

  const currentTask = state.currentTaskId 
    ? tasks.find(t => t.id === state.currentTaskId) 
    : null;

  const modeConfig = {
    pomodoro: {
      label: 'Focus',
      icon: Brain,
      color: 'text-primary',
      bgColor: 'bg-primary',
      description: 'Time to focus!',
    },
    shortBreak: {
      label: 'Short Break',
      icon: Coffee,
      color: 'text-accent',
      bgColor: 'bg-accent',
      description: 'Take a quick breather',
    },
    longBreak: {
      label: 'Long Break',
      icon: Coffee,
      color: 'text-success',
      bgColor: 'bg-success',
      description: 'You earned it!',
    },
  };

  const config = modeConfig[state.mode];
  const ModeIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex justify-center gap-2">
        {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((mode) => (
          <Button
            key={mode}
            variant={state.mode === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode(mode)}
            disabled={state.isRunning}
            className={state.mode === mode ? modeConfig[mode].bgColor : ''}
          >
            {modeConfig[mode].label}
          </Button>
        ))}
      </div>

      {/* Timer Card */}
      <Card variant="elevated" className="p-8 text-center">
        {/* Current Task */}
        {currentTask && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm">
              Working on: {currentTask.name}
            </Badge>
          </div>
        )}

        {/* Mode Label */}
        <div className={cn('flex items-center justify-center gap-2 mb-2', config.color)}>
          <ModeIcon className="h-5 w-5" />
          <span className="font-medium">{config.label}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{config.description}</p>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className={cn(config.color, 'transition-all duration-1000')}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums tracking-tight">
              {formattedTime}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              Session {state.sessionsCompleted + 1}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={reset}
            disabled={!state.isRunning && state.timeRemaining === 0}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          {!state.isRunning ? (
            <Button
              variant="gradient"
              size="fab"
              onClick={() => start()}
              className="animate-pulse-glow"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          ) : state.isPaused ? (
            <Button
              variant="gradient"
              size="fab"
              onClick={resume}
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="fab"
              onClick={pause}
            >
              <Pause className="h-6 w-6" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon-lg"
            onClick={skip}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Session Progress */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((session) => (
          <div
            key={session}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              session <= state.sessionsCompleted
                ? 'bg-success'
                : session === state.sessionsCompleted + 1
                  ? config.bgColor
                  : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
