import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCategory, TaskPriority, Alarm } from '@/types';
import { getAll, put, deleteItem, generateId, initDB } from '@/lib/storage';

const STORE_NAME = 'tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from IndexedDB
  const loadTasks = useCallback(async () => {
    try {
      await initDB();
      const storedTasks = await getAll<Task>(STORE_NAME);
      setTasks(storedTasks.sort((a, b) => {
        // Sort by priority, then by creation date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create a new task
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt' | 'timeSpent' | 'pomodoroSessions'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      timeSpent: 0,
      pomodoroSessions: 0,
    };

    try {
      await put(STORE_NAME, newTask);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      throw err;
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await put(STORE_NAME, updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  }, [tasks]);

  // Delete a task
  const removeTask = useCallback(async (id: string) => {
    try {
      await deleteItem(STORE_NAME, id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  }, []);

  // Toggle task completion
  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updates: Partial<Task> = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    };

    return updateTask(id, updates);
  }, [tasks, updateTask]);

  // Add alarm to task
  const addAlarm = useCallback(async (taskId: string, time: string, repeating: boolean = false) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newAlarm: Alarm = {
      id: generateId(),
      time,
      enabled: true,
      repeating,
    };

    return updateTask(taskId, {
      alarms: [...task.alarms, newAlarm],
    });
  }, [tasks, updateTask]);

  // Remove alarm from task
  const removeAlarm = useCallback(async (taskId: string, alarmId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return updateTask(taskId, {
      alarms: task.alarms.filter(a => a.id !== alarmId),
    });
  }, [tasks, updateTask]);

  // Toggle alarm enabled state
  const toggleAlarm = useCallback(async (taskId: string, alarmId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return updateTask(taskId, {
      alarms: task.alarms.map(a => 
        a.id === alarmId ? { ...a, enabled: !a.enabled } : a
      ),
    });
  }, [tasks, updateTask]);

  // Snooze alarm
  const snoozeAlarm = useCallback(async (taskId: string, alarmId: string, minutes: number = 5) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    return updateTask(taskId, {
      alarms: task.alarms.map(a =>
        a.id === alarmId ? { ...a, snoozed: true, snoozeUntil } : a
      ),
    });
  }, [tasks, updateTask]);

  // Add time spent on task
  const addTimeSpent = useCallback(async (taskId: string, seconds: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return updateTask(taskId, {
      timeSpent: task.timeSpent + seconds,
    });
  }, [tasks, updateTask]);

  // Increment pomodoro sessions
  const incrementPomodoroSessions = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return updateTask(taskId, {
      pomodoroSessions: task.pomodoroSessions + 1,
    });
  }, [tasks, updateTask]);

  // Filter helpers
  const dailyTasks = tasks.filter(t => t.isDaily);
  const permanentTasks = tasks.filter(t => !t.isDaily);
  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);

  const getTasksByCategory = (category: TaskCategory) => 
    tasks.filter(t => t.category === category);

  const getTasksByPriority = (priority: TaskPriority) => 
    tasks.filter(t => t.priority === priority);

  return {
    tasks,
    dailyTasks,
    permanentTasks,
    completedTasks,
    pendingTasks,
    loading,
    error,
    createTask,
    updateTask,
    removeTask,
    toggleComplete,
    addAlarm,
    removeAlarm,
    toggleAlarm,
    snoozeAlarm,
    addTimeSpent,
    incrementPomodoroSessions,
    getTasksByCategory,
    getTasksByPriority,
    refresh: loadTasks,
  };
}
