import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useTimer } from '@/hooks/useTimer';
import { useSettings } from '@/hooks/useSettings';

type TasksContextType = ReturnType<typeof useTasks>;
type HabitsContextType = ReturnType<typeof useHabits>;
type TimerContextType = ReturnType<typeof useTimer>;
type SettingsContextType = ReturnType<typeof useSettings>;

interface AppContextType {
  tasks: TasksContextType;
  habits: HabitsContextType;
  timer: TimerContextType;
  settings: SettingsContextType;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const tasks = useTasks();
  const habits = useHabits();
  const timer = useTimer();
  const settings = useSettings();

  return (
    <AppContext.Provider value={{ tasks, habits, timer, settings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Individual hooks for specific contexts
export function useAppTasks() {
  return useApp().tasks;
}

export function useAppHabits() {
  return useApp().habits;
}

export function useAppTimer() {
  return useApp().timer;
}

export function useAppSettings() {
  return useApp().settings;
}
