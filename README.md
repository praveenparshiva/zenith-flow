📱 Productivity & Digital Well-Being App

React + Tailwind CSS + Capacitor (iOS & Android)
Featuring: Native Alarms, Habit Tracking, Pomodoro Timer, Screen-Time Monitoring

🚀 Overview

This project is a mobile-first productivity and digital-wellbeing app built with:

React + TypeScript

Tailwind CSS

Capacitor (Android & iOS native builds)

Custom Native Alarm Plugin (Android AlarmManager + iOS UNUserNotificationCenter)

IndexedDB + Capacitor Storage for offline persistence

The app supports reliable native alarms that fire even when the app is closed, background execution, screen-time tracking, Pomodoro timers, and a habit-tracking dashboard.

This README provides setup instructions, build steps, testing flows, and verification procedures.

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

Swipeable task rows

Slide-up modal for add/edit

Offline-first (IndexedDB + Capacitor Storage)

⏰ 2. Native Alarm System (Most Critical)

Alarms work even when:
✔ App is closed/killed
✔ Phone screen is off
✔ Device is in Doze mode
✔ After reboot

Technologies used:

Capacitor Local Notifications

Capacitor BackgroundTask

Android AlarmManager (custom plugin)

iOS UNUserNotificationCenter

Snooze support

Custom sound + vibration

Daily repeating alarms

🕒 3. Background Execution

Periodic check for missed/rescheduled alarms

BootReceiver for Android

Re-register alarms after app or OS restart

📊 4. Digital Well-Being

Screen-time tracking (daily & weekly)

Alerts at 5h, 6h, 7h, and pre-warnings

Pomodoro timer

Habit streaks, badges

Dashboard with upcoming alarms & progress

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

3️⃣ Copy Web Build to Native
npm run build
npx cap copy

4️⃣ Install Required Capacitor Plugins
npm install @capacitor/local-notifications
npm install @capacitor/storage
npm install @capacitor/background-task
npm install idb


Include the native alarm plugin:

plugins/native-alarm

📱 Running on Android
Open in Android Studio
npx cap open android

Required Manifest Permissions

Add to AndroidManifest.xml:

<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

Build APK

Inside Android Studio → Build > Make Project

🍎 Running on iOS
Open Xcode
npx cap open ios

Add to Info.plist
<key>NSUserNotificationUsageDescription</key>
<string>This app schedules important alarms and reminders.</string>

Build & Run

Use Xcode > Product > Run
(Requires Apple Developer account for device testing)

🔌 Native Alarm Plugin Setup
Android

AlarmManager with setExactAndAllowWhileIdle

BroadcastReceiver for notifications

BootReceiver for rescheduling alarms

Foreground service fallback

iOS

UNUserNotificationCenter exact scheduling

Background refresh for rescheduling

Handling for notification categories (snooze/action buttons)

🧪 Testing & QA Instructions

All critical features must be verified.

A. Alarm Tests (MANDATORY)
Test 1 — App Killed

Schedule alarm for +2 minutes

Force-stop the app

Screen off

Alarm MUST fire at exact time

Test 2 — Device Reboot

Schedule alarm

Reboot phone

Alarm MUST fire

Test 3 — Snooze

Click Snooze

Alarm must re-trigger after configured delay

Output required:

Logs (adb logcat, iOS device logs)

Screenshots/video

B. Screen-Time Tracking

Simulate usage:

npm run simulate:time


Verify notifications at:

5 hours

6 hours

7 hours

Pre-warnings

C. Background Execution

Alarm reschedules after app restart

BackgroundTask runs periodic checks

D. PWA Offline Tests

Disable internet

Add/edit tasks

Refresh page

Check local persistence (IndexedDB)

🧰 Development Scripts
Start Web App
npm run dev

Build Web
npm run build

Sync to Capacitor
npx cap sync

📦 Build Instructions (Production)
Android
npm run build
npx cap copy android
npx cap open android


Generate release APK/AAB through Android Studio.

iOS
npm run build
npx cap copy ios
npx cap open ios


Archive in Xcode → Upload to TestFlight.

🔐 Permissions & Privacy

App requests:

Notification permissions

WAKE_LOCK

Exact alarm permissions

Background execution

No personal data is transmitted unless backend (optional) is configured.

🧭 Troubleshooting
❗ Alarm not firing on some Android phones

Certain OEMs (Xiaomi, Vivo, Samsung) disable background execution.
Provide the user:

Battery optimization instructions

Auto-start instructions

❗ iOS notifications not appearing

Ensure:

Notifications allowed

Focus modes not blocking alerts

🏁 Final Delivery Requirements

This project must ship with:

Full source code (React + native plugins)

Full test suite (unit + integration + device tests)

Final Verification Report

Screenshots/video of alarms firing
