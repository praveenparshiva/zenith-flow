import { useState, useEffect, useCallback } from 'react';
import { Habit } from '@/types';
import { getAll, put, deleteItem, generateId, initDB } from '@/lib/storage';

const STORE_NAME = 'habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      await initDB();
      const storedHabits = await getAll<Habit>(STORE_NAME);
      setHabits(storedHabits);
      setError(null);
    } catch (err) {
      setError('Failed to load habits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const createHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'currentStreak' | 'longestStreak'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      completions: [],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await put(STORE_NAME, newHabit);
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    } catch (err) {
      setError('Failed to create habit');
      throw err;
    }
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habitIndex === -1) return;

    const updatedHabit: Habit = {
      ...habits[habitIndex],
      ...updates,
    };

    try {
      await put(STORE_NAME, updatedHabit);
      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      setError('Failed to update habit');
      throw err;
    }
  }, [habits]);

  const removeHabit = useCallback(async (id: string) => {
    try {
      await deleteItem(STORE_NAME, id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      setError('Failed to delete habit');
      throw err;
    }
  }, []);

  // Calculate streak
  const calculateStreak = useCallback((completions: string[]): number => {
    if (completions.length === 0) return 0;
    
    const sortedDates = [...completions].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastCompletion = new Date(sortedDates[0]);
    lastCompletion.setHours(0, 0, 0, 0);
    
    // If last completion wasn't today or yesterday, streak is broken
    if (lastCompletion.getTime() < yesterday.getTime()) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = lastCompletion;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const expectedPrev = new Date(currentDate);
      expectedPrev.setDate(expectedPrev.getDate() - 1);
      
      if (prevDate.getTime() === expectedPrev.getTime()) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  // Toggle completion for today
  const toggleCompletion = useCallback(async (id: string, date?: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const targetDate = date || new Date().toISOString().split('T')[0];
    const isCompleted = habit.completions.includes(targetDate);
    
    let newCompletions: string[];
    if (isCompleted) {
      newCompletions = habit.completions.filter(d => d !== targetDate);
    } else {
      newCompletions = [...habit.completions, targetDate];
    }

    const newStreak = calculateStreak(newCompletions);
    const newLongestStreak = Math.max(habit.longestStreak, newStreak);

    return updateHabit(id, {
      completions: newCompletions,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
    });
  }, [habits, updateHabit, calculateStreak]);

  // Check if habit is completed for a specific date
  const isCompletedForDate = useCallback((habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.completions.includes(date) || false;
  }, [habits]);

  // Get completion rate for the last N days
  const getCompletionRate = useCallback((habitId: string, days: number = 7): number => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const today = new Date();
    let completed = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (habit.completions.includes(dateStr)) {
        completed++;
      }
    }

    return (completed / days) * 100;
  }, [habits]);

  // Get today's habits status
  const getTodayStatus = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayDayOfWeek = new Date().getDay();

    return habits.map(habit => ({
      ...habit,
      isCompletedToday: habit.completions.includes(today),
      isDueToday: habit.frequency === 'daily' || habit.targetDays.includes(todayDayOfWeek),
    }));
  }, [habits]);

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
    isCompletedForDate,
    getCompletionRate,
    getTodayStatus,
    refresh: loadHabits,
  };
}
