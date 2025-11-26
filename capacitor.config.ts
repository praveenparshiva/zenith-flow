import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e64b97996810408a89364955f921c6a5',
  appName: 'FocusFlow',
  webDir: 'dist',
  server: {
    // For development - enable hot reload from sandbox
    // Comment out for production builds
    url: 'https://e64b9799-6810-408a-8936-4955f921c6a5.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#4F46E5',
      sound: 'notification.wav',
    },
    BackgroundTask: {
      backgroundTaskEnabled: true,
    },
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
