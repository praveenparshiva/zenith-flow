# FocusFlow Native Implementation Guide

This document provides the complete native implementation for Android and iOS alarm functionality.

## Table of Contents
1. [Android Implementation](#android-implementation)
2. [iOS Implementation](#ios-implementation)
3. [Build Instructions](#build-instructions)
4. [Testing Guide](#testing-guide)
5. [Known Limitations](#known-limitations)

---

## Android Implementation

### Prerequisites
- Android Studio Arctic Fox or later
- Kotlin 1.6+
- Gradle 7.0+
- Min SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)

### Step 1: AndroidManifest.xml Additions

Add these permissions and receivers to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Inside <manifest> tag -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

<!-- Inside <application> tag -->
<receiver 
    android:name=".AlarmReceiver"
    android:enabled="true"
    android:exported="false">
    <intent-filter>
        <action android:name="app.focusflow.ALARM_TRIGGERED" />
    </intent-filter>
</receiver>

<receiver 
    android:name=".BootReceiver"
    android:enabled="true"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.QUICKBOOT_POWERON" />
    </intent-filter>
</receiver>

<service
    android:name=".AlarmService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="specialUse">
</service>
```

### Step 2: Create AlarmReceiver.kt

Create `android/app/src/main/java/app/focusflow/AlarmReceiver.kt`:

```kotlin
package app.focusflow

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {
    
    companion object {
        const val CHANNEL_ID = "focusflow_alarms"
        const val CHANNEL_NAME = "Task Alarms"
        const val EXTRA_ALARM_ID = "alarm_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY = "body"
        const val EXTRA_TASK_ID = "task_id"
        const val ACTION_SNOOZE = "app.focusflow.ACTION_SNOOZE"
        const val ACTION_DISMISS = "app.focusflow.ACTION_DISMISS"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra(EXTRA_ALARM_ID) ?: return
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Reminder"
        val body = intent.getStringExtra(EXTRA_BODY) ?: ""
        val taskId = intent.getStringExtra(EXTRA_TASK_ID)

        createNotificationChannel(context)
        showNotification(context, alarmId, title, body, taskId)
        vibrate(context)
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = "Task alarm notifications"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
                setSound(
                    RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            }
            
            val notificationManager = context.getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun showNotification(
        context: Context, 
        alarmId: String, 
        title: String, 
        body: String,
        taskId: String?
    ) {
        // Main tap intent - opens app
        val mainIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra(EXTRA_ALARM_ID, alarmId)
            putExtra(EXTRA_TASK_ID, taskId)
        }
        val mainPendingIntent = PendingIntent.getActivity(
            context, 
            alarmId.hashCode(), 
            mainIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Snooze intent
        val snoozeIntent = Intent(context, AlarmActionReceiver::class.java).apply {
            action = ACTION_SNOOZE
            putExtra(EXTRA_ALARM_ID, alarmId)
            putExtra(EXTRA_TITLE, title)
            putExtra(EXTRA_BODY, body)
            putExtra(EXTRA_TASK_ID, taskId)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode() + 1,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Dismiss intent
        val dismissIntent = Intent(context, AlarmActionReceiver::class.java).apply {
            action = ACTION_DISMISS
            putExtra(EXTRA_ALARM_ID, alarmId)
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode() + 2,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(mainPendingIntent)
            .addAction(R.drawable.ic_snooze, "Snooze", snoozePendingIntent)
            .addAction(R.drawable.ic_dismiss, "Dismiss", dismissPendingIntent)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM))
            .setVibrate(longArrayOf(0, 250, 250, 250))
            .setFullScreenIntent(mainPendingIntent, true)
            .build()

        val notificationManager = context.getSystemService(NotificationManager::class.java)
        notificationManager.notify(alarmId.hashCode(), notification)
    }

    private fun vibrate(context: Context) {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(VibratorManager::class.java)
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(
                VibrationEffect.createWaveform(
                    longArrayOf(0, 500, 200, 500, 200, 500),
                    -1
                )
            )
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(longArrayOf(0, 500, 200, 500, 200, 500), -1)
        }
    }
}
```

### Step 3: Create AlarmScheduler.kt

Create `android/app/src/main/java/app/focusflow/AlarmScheduler.kt`:

```kotlin
package app.focusflow

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.content.getSystemService

class AlarmScheduler(private val context: Context) {

    private val alarmManager: AlarmManager? = context.getSystemService()
    private val prefs = context.getSharedPreferences("alarms", Context.MODE_PRIVATE)

    fun schedule(
        alarmId: String,
        title: String,
        body: String,
        triggerAtMillis: Long,
        taskId: String? = null
    ): Boolean {
        if (alarmManager == null) return false

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "app.focusflow.ALARM_TRIGGERED"
            putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
            putExtra(AlarmReceiver.EXTRA_TITLE, title)
            putExtra(AlarmReceiver.EXTRA_BODY, body)
            taskId?.let { putExtra(AlarmReceiver.EXTRA_TASK_ID, it) }
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(triggerAtMillis, pendingIntent),
                        pendingIntent
                    )
                } else {
                    // Fallback to inexact alarm
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }

            // Store alarm info for persistence
            saveAlarm(alarmId, title, body, triggerAtMillis, taskId)
            return true
        } catch (e: SecurityException) {
            e.printStackTrace()
            return false
        }
    }

    fun cancel(alarmId: String) {
        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager?.cancel(pendingIntent)
        removeAlarm(alarmId)
    }

    fun cancelAll() {
        getAllAlarms().forEach { (id, _) ->
            cancel(id)
        }
    }

    fun canScheduleExactAlarms(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager?.canScheduleExactAlarms() == true
        } else {
            true
        }
    }

    fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }
    }

    private fun saveAlarm(
        alarmId: String, 
        title: String, 
        body: String, 
        triggerAt: Long,
        taskId: String?
    ) {
        prefs.edit()
            .putString("alarm_${alarmId}_title", title)
            .putString("alarm_${alarmId}_body", body)
            .putLong("alarm_${alarmId}_trigger", triggerAt)
            .putString("alarm_${alarmId}_task", taskId)
            .apply()
        
        val alarmIds = prefs.getStringSet("alarm_ids", mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        alarmIds.add(alarmId)
        prefs.edit().putStringSet("alarm_ids", alarmIds).apply()
    }

    private fun removeAlarm(alarmId: String) {
        prefs.edit()
            .remove("alarm_${alarmId}_title")
            .remove("alarm_${alarmId}_body")
            .remove("alarm_${alarmId}_trigger")
            .remove("alarm_${alarmId}_task")
            .apply()
        
        val alarmIds = prefs.getStringSet("alarm_ids", mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        alarmIds.remove(alarmId)
        prefs.edit().putStringSet("alarm_ids", alarmIds).apply()
    }

    fun getAllAlarms(): Map<String, AlarmInfo> {
        val alarmIds = prefs.getStringSet("alarm_ids", emptySet()) ?: emptySet()
        return alarmIds.associateWith { id ->
            AlarmInfo(
                id = id,
                title = prefs.getString("alarm_${id}_title", "") ?: "",
                body = prefs.getString("alarm_${id}_body", "") ?: "",
                triggerAt = prefs.getLong("alarm_${id}_trigger", 0),
                taskId = prefs.getString("alarm_${id}_task", null)
            )
        }
    }

    fun rescheduleAllAlarms() {
        getAllAlarms().forEach { (_, alarm) ->
            if (alarm.triggerAt > System.currentTimeMillis()) {
                schedule(alarm.id, alarm.title, alarm.body, alarm.triggerAt, alarm.taskId)
            }
        }
    }

    data class AlarmInfo(
        val id: String,
        val title: String,
        val body: String,
        val triggerAt: Long,
        val taskId: String?
    )
}
```

### Step 4: Create BootReceiver.kt

Create `android/app/src/main/java/app/focusflow/BootReceiver.kt`:

```kotlin
package app.focusflow

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            // Reschedule all alarms after device reboot
            val scheduler = AlarmScheduler(context)
            scheduler.rescheduleAllAlarms()
        }
    }
}
```

---

## iOS Implementation

### Prerequisites
- Xcode 14+
- Swift 5.7+
- iOS 14.0+

### Step 1: Info.plist Additions

Add to `ios/App/App/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>processing</string>
    <string>remote-notification</string>
</array>
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>app.focusflow.alarm-check</string>
</array>
<key>NSUserNotificationsUsageDescription</key>
<string>FocusFlow needs notifications to remind you about your tasks and habits.</string>
```

### Step 2: Create AlarmManager.swift

Create `ios/App/App/AlarmManager.swift`:

```swift
import Foundation
import UserNotifications
import BackgroundTasks

@objc class AlarmManager: NSObject {
    static let shared = AlarmManager()
    
    private let notificationCenter = UNUserNotificationCenter.current()
    private let defaults = UserDefaults.standard
    private let alarmsKey = "scheduled_alarms"
    
    override init() {
        super.init()
        setupNotificationCategories()
    }
    
    // MARK: - Permission Handling
    
    func checkPermissions(completion: @escaping (Bool) -> Void) {
        notificationCenter.getNotificationSettings { settings in
            DispatchQueue.main.async {
                completion(settings.authorizationStatus == .authorized)
            }
        }
    }
    
    func requestPermissions(completion: @escaping (Bool) -> Void) {
        notificationCenter.requestAuthorization(options: [.alert, .sound, .badge, .criticalAlert]) { granted, error in
            DispatchQueue.main.async {
                completion(granted)
            }
        }
    }
    
    // MARK: - Alarm Scheduling
    
    func scheduleAlarm(
        id: String,
        title: String,
        body: String,
        triggerDate: Date,
        repeating: Bool = false,
        taskId: String? = nil,
        completion: @escaping (Bool) -> Void
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.defaultCritical
        content.categoryIdentifier = "ALARM_CATEGORY"
        
        var userInfo: [String: Any] = ["alarmId": id]
        if let taskId = taskId {
            userInfo["taskId"] = taskId
        }
        content.userInfo = userInfo
        
        var dateComponents = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: triggerDate
        )
        
        let trigger: UNNotificationTrigger
        if repeating {
            // Daily repeating - only use hour and minute
            dateComponents = Calendar.current.dateComponents([.hour, .minute], from: triggerDate)
            trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        } else {
            trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
        }
        
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        
        notificationCenter.add(request) { error in
            DispatchQueue.main.async {
                if error == nil {
                    self.saveAlarm(id: id, title: title, body: body, triggerDate: triggerDate, repeating: repeating, taskId: taskId)
                }
                completion(error == nil)
            }
        }
    }
    
    func cancelAlarm(id: String) {
        notificationCenter.removePendingNotificationRequests(withIdentifiers: [id])
        notificationCenter.removeDeliveredNotifications(withIdentifiers: [id])
        removeAlarm(id: id)
    }
    
    func cancelAllAlarms() {
        notificationCenter.removeAllPendingNotificationRequests()
        notificationCenter.removeAllDeliveredNotifications()
        defaults.removeObject(forKey: alarmsKey)
    }
    
    func getPendingAlarms(completion: @escaping ([[String: Any]]) -> Void) {
        notificationCenter.getPendingNotificationRequests { requests in
            let alarms = requests.compactMap { request -> [String: Any]? in
                guard let trigger = request.trigger as? UNCalendarNotificationTrigger else { return nil }
                
                var alarm: [String: Any] = [
                    "id": request.identifier,
                    "title": request.content.title,
                    "body": request.content.body,
                    "repeating": trigger.repeats
                ]
                
                if let nextDate = trigger.nextTriggerDate() {
                    alarm["scheduledTime"] = ISO8601DateFormatter().string(from: nextDate)
                }
                
                if let taskId = request.content.userInfo["taskId"] as? String {
                    alarm["taskId"] = taskId
                }
                
                return alarm
            }
            
            DispatchQueue.main.async {
                completion(alarms)
            }
        }
    }
    
    func snoozeAlarm(id: String, minutes: Int, completion: @escaping (String?) -> Void) {
        // Get original alarm info
        guard let alarms = defaults.dictionary(forKey: alarmsKey),
              let alarmData = alarms[id] as? [String: Any],
              let title = alarmData["title"] as? String,
              let body = alarmData["body"] as? String else {
            completion(nil)
            return
        }
        
        let taskId = alarmData["taskId"] as? String
        
        // Cancel original
        cancelAlarm(id: id)
        
        // Schedule snoozed alarm
        let snoozeDate = Date().addingTimeInterval(TimeInterval(minutes * 60))
        let newId = "\(id)-snoozed-\(Int(Date().timeIntervalSince1970))"
        
        scheduleAlarm(
            id: newId,
            title: title,
            body: "Snoozed: \(body)",
            triggerDate: snoozeDate,
            taskId: taskId
        ) { success in
            completion(success ? newId : nil)
        }
    }
    
    // MARK: - Notification Categories
    
    private func setupNotificationCategories() {
        let snoozeAction = UNNotificationAction(
            identifier: "SNOOZE_ACTION",
            title: "Snooze (5 min)",
            options: []
        )
        
        let dismissAction = UNNotificationAction(
            identifier: "DISMISS_ACTION",
            title: "Dismiss",
            options: [.destructive]
        )
        
        let category = UNNotificationCategory(
            identifier: "ALARM_CATEGORY",
            actions: [snoozeAction, dismissAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        
        notificationCenter.setNotificationCategories([category])
    }
    
    // MARK: - Persistence
    
    private func saveAlarm(id: String, title: String, body: String, triggerDate: Date, repeating: Bool, taskId: String?) {
        var alarms = defaults.dictionary(forKey: alarmsKey) ?? [:]
        
        var alarmData: [String: Any] = [
            "title": title,
            "body": body,
            "triggerDate": triggerDate.timeIntervalSince1970,
            "repeating": repeating
        ]
        
        if let taskId = taskId {
            alarmData["taskId"] = taskId
        }
        
        alarms[id] = alarmData
        defaults.set(alarms, forKey: alarmsKey)
    }
    
    private func removeAlarm(id: String) {
        var alarms = defaults.dictionary(forKey: alarmsKey) ?? [:]
        alarms.removeValue(forKey: id)
        defaults.set(alarms, forKey: alarmsKey)
    }
    
    // MARK: - Background Task Registration
    
    func registerBackgroundTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "app.focusflow.alarm-check",
            using: nil
        ) { task in
            self.handleBackgroundTask(task: task as! BGProcessingTask)
        }
    }
    
    func scheduleBackgroundTask() {
        let request = BGProcessingTaskRequest(identifier: "app.focusflow.alarm-check")
        request.requiresNetworkConnectivity = false
        request.requiresExternalPower = false
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule background task: \(error)")
        }
    }
    
    private func handleBackgroundTask(task: BGProcessingTask) {
        scheduleBackgroundTask() // Schedule next occurrence
        
        // Check and reschedule any alarms if needed
        task.setTaskCompleted(success: true)
    }
}
```

---

## Build Instructions

### Android Build

```bash
# 1. Clone and setup
git clone <repo-url>
cd focusflow
npm install

# 2. Add Android platform
npx cap add android

# 3. Build web assets
npm run build

# 4. Sync to native
npx cap sync android

# 5. Open in Android Studio
npx cap open android

# 6. In Android Studio:
#    - Add the native Kotlin files to app/src/main/java/app/focusflow/
#    - Update AndroidManifest.xml with permissions
#    - Add notification icons to res/drawable/
#    - Build and run
```

### iOS Build

```bash
# 1. Add iOS platform
npx cap add ios

# 2. Build and sync
npm run build
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
#    - Add AlarmManager.swift to the project
#    - Update Info.plist with background modes
#    - Configure signing
#    - Build and run
```

---

## Testing Guide

### Alarm Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Alarm fires (foreground) | Schedule alarm for +2 min, keep app open | Notification appears at exact time |
| Alarm fires (background) | Schedule alarm, minimize app | Notification appears at exact time |
| Alarm fires (killed) | Schedule alarm, force close app | Notification appears at exact time |
| Snooze | Tap snooze on notification | New alarm scheduled +5 min |
| Daily repeat | Set repeating alarm | Fires same time next day |
| Boot persistence | Set alarm, reboot device | Alarm fires after reboot |

### Test Commands

```bash
# Run Android instrumentation tests
./gradlew connectedAndroidTest

# Run iOS XCTests
xcodebuild test -scheme FocusFlow -destination 'platform=iOS Simulator,name=iPhone 14'

# Capture Android logs
adb logcat -s AlarmReceiver:* AlarmScheduler:*
```

---

## Known Limitations

### Android
1. **Doze Mode**: Alarms may be delayed up to 9 minutes in Doze mode on some devices
2. **OEM Restrictions**: Xiaomi, Huawei, Samsung may require manual battery optimization exceptions
3. **Android 12+**: Requires `SCHEDULE_EXACT_ALARM` permission with user consent

### iOS
1. **Background Execution**: Limited to ~30 seconds of background time
2. **Time Accuracy**: ±1 minute variance possible for non-critical notifications
3. **User Permission**: Critical alerts require special entitlement from Apple

### Workarounds

For maximum reliability on problematic devices:

1. **Add to battery optimization whitelist**
2. **Enable autostart permission** (Xiaomi, Huawei)
3. **Use Foreground Service** for time-critical alarms
4. **Fallback to server-side push** for mission-critical reminders
