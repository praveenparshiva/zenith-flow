Productivity & Digital Well-Being App

React + Tailwind CSS + Capacitor (iOS & Android)
Featuring: Native Alarms, Habit Tracking, Pomodoro Timer, Screen-Time Monitoring

🚀 Overview

This project is a mobile-first productivity and digital-wellbeing application built using:

React + TypeScript

Tailwind CSS

Capacitor (for iOS & Android native builds)

Custom Native Alarm Plugin

Android AlarmManager

iOS UNUserNotificationCenter

IndexedDB + Capacitor Storage for offline persistence

The app supports reliable native alarms that trigger even when the app is closed, background execution, screen-time tracking, Pomodoro timers, habit streaks, and a rich dashboard.

📁 Project Structure
root/
 ├── src/
 │   ├── components/
 │   ├── hooks/
 │   ├── context/
 │   ├── pages/
 │   ├── utils/
 │   ├── App.tsx
 │   ├── main.tsx
 │   └── index.css
 │
 ├── capacitor/
 │   ├── android/
 │   └── ios/
 │
 ├── plugins/
 │   └── native-alarm/
 │       ├── android/
 │       ├── ios/
 │       ├── src/
 │       ├── index.ts
 │
 ├── public/
 ├── package.json
 ├── capacitor.config.ts
 ├── tailwind.config.js
 ├── tsconfig.json
 └── README.md

⚙️ Features
✅ 1. Task Management

Daily & permanent tasks

Multiple alarms per task

Priority, notes, categories

Slide-up modal for add/edit

Swipeable task rows

Offline-first (IndexedDB + Capacitor Storage)

⏰ 2. Native Alarm System (Most Critical)

Alarms work even when:
✔ App is closed/killed
✔ Screen is off
✔ Device is in Doze mode
✔ After reboot

Technologies:

Capacitor Local Notifications

Capacitor BackgroundTask

Android AlarmManager (custom plugin)

iOS UNUserNotificationCenter

Features:

Snooze support

Custom alarm sound & vibration

Daily repeating alarms

🕒 3. Background Execution

Periodic check for missed alarms

Android BootReceiver for rescheduling

Auto re-register alarms after restart

📊 4. Digital Well-Being

Daily & weekly screen-time tracking

Alerts at 5h, 6h, 7h + pre-warnings

Pomodoro timer

Habit streaks & badges

Upcoming alarms dashboard

🌙 5. UI & UX

Mobile-first layout

Smooth animations

Dark mode

Offline PWA support

🛠️ Installation & Setup
1️⃣ Install Dependencies
npm install

2️⃣ Initialize Capacitor
npx cap init

3️⃣ Build Web App & Copy to Native
npm run build
npx cap copy

4️⃣ Install Required Plugins
npm install @capacitor/local-notifications
npm install @capacitor/storage
npm install @capacitor/background-task
npm install idb


Include custom plugin:
plugins/native-alarm


📱 Running on Android
Open Project
npx cap open android

Add Permissions (AndroidManifest.xml)
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

Build APK

Android Studio → Build > Make Project

🍎 Running on iOS
Open in Xcode
npx cap open ios

Add to Info.plist
<key>NSUserNotificationUsageDescription</key>
<string>This app schedules important alarms and reminders.</string>

Build

Xcode → Product > Run

🔌 Native Alarm Plugin Setup
Android

AlarmManager with setExactAndAllowWhileIdle

BroadcastReceiver for notifications

BootReceiver for rescheduling

Foreground service fallback

iOS

UNUserNotificationCenter exact notifications

Background refresh for rescheduling

Notification actions (e.g., Snooze)

🧪 Testing & QA Instructions
A. Alarm Tests (MANDATORY)
Test 1 — App Killed

Schedule alarm (+2 min)

Force-stop app

Turn off screen

Alarm must fire exactly on time

Test 2 — Device Reboot

Schedule alarm

Reboot device

Alarm must fire after boot

Test 3 — Snooze

Tap Snooze

Alarm must re-trigger after delay

Output required:

Logs (adb logcat, iOS logs)

Screenshots/video

B. Screen-Time Tracking

Simulate usage:

npm run simulate:time


Verify alerts at:

5 hours

6 hours

7 hours

Pre-warnings

C. Background Execution

Alarms reschedule after app restart

BackgroundTask performs periodic checks

D. PWA Offline Tests

Disable internet

Add/edit tasks

Refresh

Ensure IndexedDB persistence

🧰 Development Scripts
npm run dev       # start web app
npm run build     # build web app
npx cap sync      # sync with native

📦 Production Build
Android
npm run build
npx cap copy android
npx cap open android


Build APK/AAB via Android Studio.

iOS
npm run build
npx cap copy ios
npx cap open ios


Archive → Upload to TestFlight.

🔐 Permissions & Privacy

App may request:

Notification permissions

WAKE_LOCK

Exact alarm permission

Background execution

No personal data is transmitted unless backend is added.

🧭 Troubleshooting
❗ Android Alarm Not Firing

Some OEMs block background services:

Xiaomi

Vivo

Samsung

Provide:

Battery optimization instructions

Auto-start permission steps

❗ iOS Notifications Not Showing

Check:

Notifications allowed

Focus modes

Sound settings
