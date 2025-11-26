import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerSettings } from '@/types';
import { getLocalStorage, setLocalStorage } from '@/lib/storage';

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
};

const SETTINGS_KEY = 'timer-settings';

export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(() => 
    getLocalStorage(SETTINGS_KEY, DEFAULT_SETTINGS)
  );
  
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    mode: 'pomodoro',
    timeRemaining: settings.pomodoroDuration * 60,
    sessionsCompleted: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef<((mode: TimerState['mode']) => void) | null>(null);

  // Save settings whenever they change
  useEffect(() => {
    setLocalStorage(SETTINGS_KEY, settings);
  }, [settings]);

  // Get duration for current mode
  const getDuration = useCallback((mode: TimerState['mode']) => {
    switch (mode) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Timer tick
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            if (onCompleteRef.current) {
              onCompleteRef.current(prev.mode);
            }
            
            // Determine next mode
            let nextMode: TimerState['mode'];
            let newSessionsCompleted = prev.sessionsCompleted;
            
            if (prev.mode === 'pomodoro') {
              newSessionsCompleted++;
              if (newSessionsCompleted % settings.longBreakInterval === 0) {
                nextMode = 'longBreak';
              } else {
                nextMode = 'shortBreak';
              }
            } else {
              nextMode = 'pomodoro';
            }

            const shouldAutoStart = 
              (nextMode === 'pomodoro' && settings.autoStartPomodoros) ||
              (nextMode !== 'pomodoro' && settings.autoStartBreaks);

            return {
              ...prev,
              mode: nextMode,
              timeRemaining: getDuration(nextMode),
              isRunning: shouldAutoStart,
              sessionsCompleted: newSessionsCompleted,
            };
          }
          
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, settings, getDuration]);

  // Start timer
  const start = useCallback((taskId?: string) => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      currentTaskId: taskId || prev.currentTaskId,
    }));
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  // Stop timer
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: getDuration(prev.mode),
    }));
  }, [getDuration]);

  // Reset timer
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      mode: 'pomodoro',
      timeRemaining: getDuration('pomodoro'),
      sessionsCompleted: 0,
      currentTaskId: undefined,
    }));
  }, [getDuration]);

  // Skip to next phase
  const skip = useCallback(() => {
    setState(prev => {
      let nextMode: TimerState['mode'];
      let newSessionsCompleted = prev.sessionsCompleted;
      
      if (prev.mode === 'pomodoro') {
        newSessionsCompleted++;
        if (newSessionsCompleted % settings.longBreakInterval === 0) {
          nextMode = 'longBreak';
        } else {
          nextMode = 'shortBreak';
        }
      } else {
        nextMode = 'pomodoro';
      }

      return {
        ...prev,
        mode: nextMode,
        timeRemaining: getDuration(nextMode),
        isRunning: false,
        isPaused: false,
        sessionsCompleted: newSessionsCompleted,
      };
    });
  }, [settings.longBreakInterval, getDuration]);

  // Set mode manually
  const setMode = useCallback((mode: TimerState['mode']) => {
    setState(prev => ({
      ...prev,
      mode,
      timeRemaining: getDuration(mode),
      isRunning: false,
      isPaused: false,
    }));
  }, [getDuration]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  }, []);

  // Set completion callback
  const onComplete = useCallback((callback: (mode: TimerState['mode']) => void) => {
    onCompleteRef.current = callback;
  }, []);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Progress percentage
  const progress = (1 - state.timeRemaining / getDuration(state.mode)) * 100;

  return {
    state,
    settings,
    progress,
    formattedTime: formatTime(state.timeRemaining),
    start,
    pause,
    resume,
    stop,
    reset,
    skip,
    setMode,
    updateSettings,
    onComplete,
  };
}
