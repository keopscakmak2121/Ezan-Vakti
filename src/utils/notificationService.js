import { LocalNotifications } from '@capacitor/local-notifications';
import { getNotificationSettings, createNotificationMessage } from './notificationStorage';

export const createNotificationChannel = async (soundFile) => {
  const channelId = soundFile ? `prayer-times-${soundFile.replace('.mp3', '')}` : 'prayer-times-silent';
  try {
    await LocalNotifications.createChannel({
      id: channelId,
      name: 'Namaz Vakitleri',
      importance: 5,
      sound: soundFile || undefined,
      vibration: true
    });
    return channelId;
  } catch (e) { return 'default'; }
};

export const scheduleNotifications = async (prayerTimings) => {
  if (!prayerTimings) return;
  const settings = getNotificationSettings();
  const now = new Date();
  const notifications = [];

  const prayerNames = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };

  for (const [key, time] of Object.entries(prayerTimings)) {
    if (!prayerNames[key]) continue;
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    if (date < now) date.setDate(date.getDate() + 1);

    notifications.push({
      id: Math.floor(Math.random() * 1000000),
      title: `🕌 ${prayerNames[key]} Vakti`,
      body: createNotificationMessage(key, 0),
      schedule: { at: date, allowWhileIdle: true },
      channelId: 'prayer-times-default',
      smallIcon: 'ic_stat_mosque',
      extra: { prayerName: key, prayerTime: time, action: 'SHOW_FULLSCREEN' }
    });
  }
  await LocalNotifications.schedule({ notifications });
};

export const checkAndRefreshNotifications = async (prayerTimings) => {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length < 2) await scheduleNotifications(prayerTimings);
};

export const initNotificationService = async (prayerTimings) => {
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display === 'granted') await scheduleNotifications(prayerTimings);
};
