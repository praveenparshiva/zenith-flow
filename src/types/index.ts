// Task Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';

export interface Alarm {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
  repeating: boolean;
  snoozed?: boolean;
  snoozeUntil?: string;
}

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  notes: string;
  priority: TaskPriority;
  isDaily: boolean; // true = daily, false = permanent
  alarms: Alarm[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  timeSpent: number; // in seconds
  pomodoroSessions: number;
}

// Habit Types
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  targetDays: number[]; // 0 = Sunday, 6 = Saturday
  completions: string[]; // ISO date strings
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

// Screen Time Types
export interface ScreenTimeEntry {
  date: string; // ISO date
  totalMinutes: number;
  taskBreakdown: Record<string, number>; // taskId -> minutes
  sessions: ScreenTimeSession[];
}

export interface ScreenTimeSession {
  startTime: string;
  endTime?: string;
  taskId?: string;
}

// Timer Types
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  timeRemaining: number; // in seconds
  currentTaskId?: string;
  sessionsCompleted: number;
}

export interface TimerSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // sessions before long break
}

// Statistics Types
export interface DailyStats {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  pomodoroSessions: number;
  screenTimeMinutes: number;
  habitCompletions: number;
  totalHabits: number;
}

// Notification Types
export interface AppNotification {
  id: string;
  type: 'alarm' | 'screenTime' | 'habit' | 'pomodoro';
  title: string;
  body: string;
  scheduledTime: string;
  read: boolean;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    alarms: boolean;
    screenTimeWarnings: boolean;
    habitReminders: boolean;
    pomodoroAlerts: boolean;
  };
  screenTimeLimit: number; // in minutes
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
