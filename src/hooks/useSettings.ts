import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { getLocalStorage, setLocalStorage } from '@/lib/storage';

const SETTINGS_KEY = 'app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    alarms: true,
    screenTimeWarnings: true,
    habitReminders: true,
    pomodoroAlerts: true,
  },
  screenTimeLimit: 480, // 8 hours
  soundEnabled: true,
  vibrationEnabled: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => 
    getLocalStorage(SETTINGS_KEY, DEFAULT_SETTINGS)
  );

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.toggle('dark', mediaQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Save settings
  useEffect(() => {
    setLocalStorage(SETTINGS_KEY, settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNotificationSettings = useCallback((updates: Partial<AppSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  }, []);

  const setTheme = useCallback((theme: AppSettings['theme']) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    updateNotificationSettings,
    setTheme,
    resetSettings,
  };
}
