/**
 * FocusFlow Alarm Plugin Interface
 * 
 * This file defines the TypeScript interface for the native alarm plugin.
 * The actual native implementation requires:
 * - Android: Kotlin/Java code using AlarmManager
 * - iOS: Swift code using UNUserNotificationCenter
 * 
 * See NATIVE_IMPLEMENTATION.md for full native code.
 */

export interface AlarmOptions {
  id: string;
  title: string;
  body: string;
  time: Date;
  repeating?: boolean;
  repeatInterval?: 'daily' | 'weekly';
  sound?: string;
  vibrate?: boolean;
  wakeDevice?: boolean;
  taskId?: string;
}

export interface ScheduledAlarm {
  id: string;
  title: string;
  body: string;
  scheduledTime: string;
  repeating: boolean;
  taskId?: string;
}

export interface AlarmPluginInterface {
  /**
   * Check if notification permissions are granted
   */
  checkPermissions(): Promise<{ granted: boolean }>;

  /**
   * Request notification permissions
   */
  requestPermissions(): Promise<{ granted: boolean }>;

  /**
   * Schedule a new alarm
   */
  schedule(options: AlarmOptions): Promise<{ id: string }>;

  /**
   * Cancel a scheduled alarm
   */
  cancel(options: { id: string }): Promise<void>;

  /**
   * Cancel all scheduled alarms
   */
  cancelAll(): Promise<void>;

  /**
   * Get all pending alarms
   */
  getPending(): Promise<{ alarms: ScheduledAlarm[] }>;

  /**
   * Snooze an alarm
   */
  snooze(options: { id: string; minutes: number }): Promise<{ newId: string }>;

  /**
   * Check if exact alarms are available (Android 12+)
   */
  canScheduleExactAlarms(): Promise<{ canSchedule: boolean }>;

  /**
   * Open exact alarm settings (Android 12+)
   */
  openExactAlarmSettings(): Promise<void>;

  /**
   * Add listener for alarm fired events
   */
  addListener(
    eventName: 'alarmFired',
    callback: (data: { id: string; taskId?: string }) => void
  ): Promise<{ remove: () => void }>;

  /**
   * Add listener for alarm action events (snooze, dismiss)
   */
  addListener(
    eventName: 'alarmAction',
    callback: (data: { id: string; action: 'snooze' | 'dismiss' }) => void
  ): Promise<{ remove: () => void }>;
}

/**
 * Mock implementation for web/development
 * Replace with actual Capacitor plugin registration in native builds
 */
class WebAlarmPlugin implements AlarmPluginInterface {
  private scheduledAlarms: Map<string, ScheduledAlarm> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  async checkPermissions(): Promise<{ granted: boolean }> {
    if ('Notification' in window) {
      return { granted: Notification.permission === 'granted' };
    }
    return { granted: false };
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    }
    return { granted: false };
  }

  async schedule(options: AlarmOptions): Promise<{ id: string }> {
    const alarm: ScheduledAlarm = {
      id: options.id,
      title: options.title,
      body: options.body,
      scheduledTime: options.time.toISOString(),
      repeating: options.repeating || false,
      taskId: options.taskId,
    };

    this.scheduledAlarms.set(options.id, alarm);

    // Calculate delay
    const delay = options.time.getTime() - Date.now();
    
    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.fireAlarm(options);
      }, delay);
      
      this.timeouts.set(options.id, timeout);
    }

    console.log('[WebAlarmPlugin] Scheduled alarm:', alarm);
    return { id: options.id };
  }

  private async fireAlarm(options: AlarmOptions) {
    // Show web notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: '/favicon.ico',
        tag: options.id,
        requireInteraction: true,
      });
    }

    // Vibrate if supported
    if (options.vibrate && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Play sound if supported
    if (options.sound) {
      try {
        const audio = new Audio(`/sounds/${options.sound}`);
        audio.play();
      } catch (e) {
        console.warn('[WebAlarmPlugin] Could not play sound:', e);
      }
    }

    // Handle repeating alarms
    if (options.repeating && options.repeatInterval === 'daily') {
      const nextTime = new Date(options.time);
      nextTime.setDate(nextTime.getDate() + 1);
      
      this.schedule({
        ...options,
        time: nextTime,
      });
    } else {
      this.scheduledAlarms.delete(options.id);
      this.timeouts.delete(options.id);
    }
  }

  async cancel(options: { id: string }): Promise<void> {
    const timeout = this.timeouts.get(options.id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(options.id);
    }
    this.scheduledAlarms.delete(options.id);
    console.log('[WebAlarmPlugin] Cancelled alarm:', options.id);
  }

  async cancelAll(): Promise<void> {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.scheduledAlarms.clear();
    console.log('[WebAlarmPlugin] Cancelled all alarms');
  }

  async getPending(): Promise<{ alarms: ScheduledAlarm[] }> {
    return { alarms: Array.from(this.scheduledAlarms.values()) };
  }

  async snooze(options: { id: string; minutes: number }): Promise<{ newId: string }> {
    const alarm = this.scheduledAlarms.get(options.id);
    if (!alarm) {
      throw new Error('Alarm not found');
    }

    await this.cancel({ id: options.id });

    const snoozeTime = new Date(Date.now() + options.minutes * 60 * 1000);
    const newId = `${options.id}-snoozed-${Date.now()}`;

    await this.schedule({
      id: newId,
      title: alarm.title,
      body: `Snoozed: ${alarm.body}`,
      time: snoozeTime,
      taskId: alarm.taskId,
    });

    return { newId };
  }

  async canScheduleExactAlarms(): Promise<{ canSchedule: boolean }> {
    // Web always returns true (no exact alarm restrictions)
    return { canSchedule: true };
  }

  async openExactAlarmSettings(): Promise<void> {
    console.log('[WebAlarmPlugin] Cannot open native settings from web');
  }

  async addListener(
    eventName: string,
    callback: (data: any) => void
  ): Promise<{ remove: () => void }> {
    console.log('[WebAlarmPlugin] Listener added:', eventName);
    return { remove: () => {} };
  }
}

// Export singleton instance
export const AlarmPlugin: AlarmPluginInterface = new WebAlarmPlugin();

/**
 * Helper function to schedule task alarm
 */
export async function scheduleTaskAlarm(
  taskId: string,
  taskName: string,
  alarmId: string,
  time: string,
  repeating: boolean = false
): Promise<string> {
  const [hours, minutes] = time.split(':').map(Number);
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (alarmTime.getTime() <= Date.now()) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  const result = await AlarmPlugin.schedule({
    id: alarmId,
    title: 'Task Reminder',
    body: taskName,
    time: alarmTime,
    repeating,
    repeatInterval: 'daily',
    sound: 'notification.wav',
    vibrate: true,
    wakeDevice: true,
    taskId,
  });

  return result.id;
}

/**
 * Helper to cancel all alarms for a task
 */
export async function cancelTaskAlarms(taskId: string): Promise<void> {
  const { alarms } = await AlarmPlugin.getPending();
  
  for (const alarm of alarms) {
    if (alarm.taskId === taskId) {
      await AlarmPlugin.cancel({ id: alarm.id });
    }
  }
}
