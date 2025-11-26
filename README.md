Productivity & Digital Well-Being App 📱
========================================

[Technologies](technologies) • [Getting Started](started) • [Features](features) • [Testing](testing) • [Troubleshooting](troubleshooting) • [Collaborators](colab) • [Contribute](contribute)

A mobile-first productivity and digital well-being application built with React, Tailwind CSS, and Capacitor. It features native alarms that work even when the app is closed, screen-time tracking, habit building, and Pomodoro timers.


💻 Technologies
---------------

   React + TypeScript
   Tailwind CSS
   Capacitor (iOS & Android)
   Custom Native Alarm Plugin
   Android AlarmManager
   iOS UNUserNotificationCenter
   IndexedDB
   Capacitor Storage
   Local Notifications
   BackgroundTask API

⚙️ Features
-----------

 ✅ 1. Task Management

   Daily & permanent tasks
   Multiple alarms per task
   Priority, notes, categories
   Slide-up modal for add/edit
   Swipeable task rows
   Offline-first (IndexedDB + Capacitor Storage)

 ⏰ 2. Native Alarm System

Alarms work even when:

   ✔ App is closed/killed
   ✔ Screen is off
   ✔ Device is in Doze mode
   ✔ After reboot

Technologies Used:

   Capacitor Local Notifications
   Capacitor BackgroundTask
   Android AlarmManager (custom plugin)
   iOS UNUserNotificationCenter

Extra Features:

   Snooze support
   Custom alarm sound & vibration
   Daily repeating alarms

 🕒 3. Background Execution

   Periodic check for missed alarms
   Android BootReceiver for rescheduling
   Auto re-register alarms after restart

 📊 4. Digital Well-Being

   Screen-time tracking (daily & weekly)
   Alerts at 5h, 6h, 7h + pre-warnings
   Pomodoro timer
   Habit streaks & badges
   Upcoming alarms dashboard

 🌙 5. UI & UX

   Mobile-first layout
   Smooth animations
   Dark mode
   Offline PWA support

🚀 Getting Started
------------------

 Prerequisites

   [NodeJS](https://nodejs.org)
   [Git](https://git-scm.com/)
   Android Studio (for Android builds)
   Xcode (for iOS builds)

 📥 Cloning

    git clone https://github.com/your-username/your-repo.git

📦 Installation

npm install

 ⚙️ Initialize Capacitor

npx cap init

 🔧 Build & Sync

npm run build npx cap copy

 📱 Running on Android

npx cap open android

Add this to AndroidManifest.xml:

 🍎 Running on iOS

npx cap open ios

Add to Info.plist:

NSUserNotificationUsageDescription This app schedules important alarms and reminders.

🧪 Testing & QA
---------------

 A. Alarm Tests

   App killed → alarm must fire
   Device reboot → alarm must fire
   Snooze should re-trigger

Output required:

   ADB logs / iOS device logs
   Screenshots or videos

 B. Screen-Time Tracking

npm run simulate:time

Verify alerts at:

   5 hours
   6 hours
   7 hours
   Pre-warnings

 C. Background Execution

   Auto rescheduling
   BackgroundTask checks

 D. PWA Offline Tests

   Disable internet
   Add/edit tasks
   Verify IndexedDB persistence

🧭 Troubleshooting
------------------

 ❗ Android Alarm Not Firing

Some OEMs aggressively kill background apps:

   Xiaomi
   Vivo
   Samsung

Provide users with:

   Battery optimization instructions
   Auto-start permission steps

 ❗ iOS Notifications Missing

Check:

   Notification permission allowed
   Focus modes not blocking
   Sound enabled
