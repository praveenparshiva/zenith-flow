import { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenTimeEntry, ScreenTimeSession } from '@/types';
import { getAll, put, getById, initDB } from '@/lib/storage';

const STORE_NAME = 'screenTime';

export function useScreenTime() {
  const [entries, setEntries] = useState<ScreenTimeEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<ScreenTimeSession | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  // Load entries
  const loadEntries = useCallback(async () => {
    try {
      await initDB();
      const storedEntries = await getAll<ScreenTimeEntry>(STORE_NAME);
      setEntries(storedEntries);
      
      const today = getToday();
      const todayEntry = storedEntries.find(e => e.date === today);
      setTodayMinutes(todayEntry?.totalMinutes || 0);
    } catch (err) {
      console.error('Failed to load screen time:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Update today's entry
  const updateTodayEntry = useCallback(async (updates: Partial<ScreenTimeEntry>) => {
    const today = getToday();
    const existingEntry = await getById<ScreenTimeEntry>(STORE_NAME, today);
    
    const newEntry: ScreenTimeEntry = existingEntry 
      ? { ...existingEntry, ...updates }
      : {
          date: today,
          totalMinutes: 0,
          taskBreakdown: {},
          sessions: [],
          ...updates,
        };

    await put(STORE_NAME, newEntry);
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, newEntry];
    });
    setTodayMinutes(newEntry.totalMinutes);
    
    return newEntry;
  }, []);

  // Start tracking session
  const startSession = useCallback((taskId?: string) => {
    const session: ScreenTimeSession = {
      startTime: new Date().toISOString(),
      taskId,
    };
    setCurrentSession(session);

    // Start minute counter
    tickIntervalRef.current = setInterval(async () => {
      const today = getToday();
      const existingEntry = await getById<ScreenTimeEntry>(STORE_NAME, today);
      
      const newMinutes = (existingEntry?.totalMinutes || 0) + 1;
      const newTaskBreakdown = { ...(existingEntry?.taskBreakdown || {}) };
      
      if (taskId) {
        newTaskBreakdown[taskId] = (newTaskBreakdown[taskId] || 0) + 1;
      }

      await updateTodayEntry({
        totalMinutes: newMinutes,
        taskBreakdown: newTaskBreakdown,
      });
    }, 60000); // Every minute
  }, [updateTodayEntry]);

  // End tracking session
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

    const endedSession: ScreenTimeSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
    };

    const today = getToday();
    const existingEntry = await getById<ScreenTimeEntry>(STORE_NAME, today);
    
    await updateTodayEntry({
      sessions: [...(existingEntry?.sessions || []), endedSession],
    });

    setCurrentSession(null);
  }, [currentSession, updateTodayEntry]);

  // Get weekly data
  const getWeeklyData = useCallback(() => {
    const weekData: { date: string; minutes: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = entries.find(e => e.date === dateStr);
      weekData.push({
        date: dateStr,
        minutes: entry?.totalMinutes || 0,
      });
    }

    return weekData;
  }, [entries]);

  // Get daily breakdown by task
  const getDailyBreakdown = useCallback((date?: string) => {
    const targetDate = date || getToday();
    const entry = entries.find(e => e.date === targetDate);
    return entry?.taskBreakdown || {};
  }, [entries]);

  // Check screen time limits
  const checkLimits = useCallback((limitMinutes: number) => {
    const remaining = limitMinutes - todayMinutes;
    return {
      exceeded: todayMinutes >= limitMinutes,
      remaining: Math.max(0, remaining),
      percentage: Math.min(100, (todayMinutes / limitMinutes) * 100),
      warnings: {
        fiveHours: todayMinutes >= 300,
        sixHours: todayMinutes >= 360,
        sevenHours: todayMinutes >= 420,
        nearLimit: remaining <= 60 && remaining > 0,
        nearLimitTwo: remaining <= 120 && remaining > 60,
      },
    };
  }, [todayMinutes]);

  // Format minutes for display
  const formatMinutes = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  return {
    entries,
    currentSession,
    todayMinutes,
    loading,
    startSession,
    endSession,
    getWeeklyData,
    getDailyBreakdown,
    checkLimits,
    formatMinutes,
    refresh: loadEntries,
  };
}
