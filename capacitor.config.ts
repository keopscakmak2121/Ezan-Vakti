import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.kerim',
  appName: 'Kuran-ı Kerim',
  webDir: 'build',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_mosque',
      iconColor: '#059669',
      sound: 'adhan1.mp3'
    },
    PrayerWidgetPlugin: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;