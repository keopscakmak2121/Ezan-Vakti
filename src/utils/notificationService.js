import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getNotificationSettings, createNotificationMessage, SOUND_OPTIONS } from './notificationStorage';

const PRAYER_IDS = { Fajr: 1001, Sunrise: 1002, Dhuhr: 1003, Asr: 1004, Maghrib: 1005, Isha: 1006 };

const isNative = () => Capacitor.isNativePlatform();

const getChannelId = (key, soundId) => `prayer-${key.toLowerCase()}-${soundId || 'default'}`;

export const scheduleNotifications = async (prayerTimings) => {
  if (!isNative() || !prayerTimings) return;
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    try {
      await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    } catch (e) {}
    return;
  }

  const now = new Date();
  const notifications = [];
  const prayerNames = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };

  for (const [key, time] of Object.entries(prayerTimings)) {
    const prayerConfig = settings.prayerNotifications[key];
    if (!prayerNames[key] || !prayerConfig || !prayerConfig.enabled) continue;

    // ÖNEMLİ: Eğer ayar "Tam Vaktinde" ise (0), JS bildirim atmasın.
    // Çünkü tam vakit bildirimini ve tam ekranı artık SADECE Native Servis yönetecek.
    const offset = prayerConfig.adjustment || prayerConfig.minutesBefore || 0;
    if (offset === 0) continue;

    const [h, m] = time.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + offset);

    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    const soundId = prayerConfig.soundId || 'default';
    notifications.push({
      id: PRAYER_IDS[key],
      title: `🕌 ${prayerNames[key]} Hatırlatıcı`,
      body: createNotificationMessage(key, offset),
      schedule: { at: date, allowWhileIdle: true },
      channelId: getChannelId(key, soundId),
      extra: { type: 'REMINDER' }
    });
  }

  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.error("Hatırlatıcı planlama hatası:", e);
  }
};

export const sendTestNotification = async () => {
  if (!isNative()) return;
  await LocalNotifications.schedule({
    notifications: [{
      id: 999,
      title: "🔔 Test Bildirimi",
      body: "Bildirim sistemi hazır.",
      schedule: { at: new Date(Date.now() + 1000) }
    }]
  });
};

export const initNotificationService = async (prayerTimings) => {
  if (!isNative()) return;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display === 'granted') {
      await scheduleNotifications(prayerTimings);
    }
  } catch (e) {}
};
