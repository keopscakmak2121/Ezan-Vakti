import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getNotificationSettings, createNotificationMessage, SOUND_OPTIONS } from './notificationStorage';

const PRAYER_IDS = { Fajr: 1001, Sunrise: 1002, Dhuhr: 1003, Asr: 1004, Maghrib: 1005, Isha: 1006 };

const isNative = () => Capacitor.isNativePlatform();

const getChannelId = (key, soundId) => `prayer-${key.toLowerCase()}-${soundId || 'default'}`;

export const createChannelsForPrayers = async () => {
  if (!isNative()) return;
  const settings = getNotificationSettings();

  for (const [key, config] of Object.entries(settings.prayerNotifications)) {
    const soundId = config.soundId || 'default';
    const channelId = getChannelId(key, soundId);
    const soundList = config.soundType === 'adhan' ? SOUND_OPTIONS.adhan : SOUND_OPTIONS.notification;
    const sound = soundList.find(s => s.id === soundId);

    let soundName = undefined;
    if (settings.sound && config.enabled && sound && sound.file !== 'default') {
      // Eğer dosya local ise (res/raw içindeyse) uzantısız ismini ver
      if (sound.local) {
        soundName = sound.file.replace('.mp3', '');
      } else {
        // İndirilen dosya ise, Capacitor'ın bildirim sistemi için dosya adını hazırla
        // NOT: Native tarafta özel sesler için klasör yapısı önemlidir.
        soundName = sound.file;
      }
    }

    try {
      await LocalNotifications.createChannel({
        id: channelId,
        name: `Namaz - ${key} (${sound?.name || 'Varsayılan'})`,
        importance: 5,
        sound: soundName,
        vibration: config.vibration !== false && settings.vibration,
        visibility: 1,
        lights: true,
        lightColor: '#059669'
      });
    } catch (e) {
      console.error(`Kanal hatası (${key}):`, e);
    }
  }
};

export const scheduleNotifications = async (prayerTimings) => {
  if (!isNative() || !prayerTimings) return;
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    try {
      await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    } catch (e) {}
    return;
  }

  await createChannelsForPrayers();
  const now = new Date();
  const notifications = [];
  const prayerNames = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };

  for (const [key, time] of Object.entries(prayerTimings)) {
    const prayerConfig = settings.prayerNotifications[key];
    if (!prayerNames[key] || !prayerConfig || !prayerConfig.enabled) continue;

    const [h, m] = time.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0, 0);

    // adjustment veya minutesBefore kontrolü (Negatif değerler "Önce" demektir)
    const offset = prayerConfig.adjustment || prayerConfig.minutesBefore || 0;
    if (offset !== 0) {
      date.setMinutes(date.getMinutes() + offset);
    }

    // Eğer vakit geçtiyse yarına planla
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    const soundId = prayerConfig.soundId || 'default';
    const channelId = getChannelId(key, soundId);

    notifications.push({
      id: PRAYER_IDS[key],
      title: `🕌 ${prayerNames[key]} Vakti`,
      body: createNotificationMessage(key, offset),
      schedule: {
        at: date,
        allowWhileIdle: true,
        repeats: false
      },
      channelId: channelId,
      fullScreenIntent: settings.fullScreenEnabled !== false,
      ongoing: true,
      autoCancel: false,
      extra: {
        prayerName: key,
        prayerTime: time,
        type: 'PRAYER_ALARM'
      }
    });
  }

  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.error("Bildirim planlama hatası:", e);
  }
};

export const sendTestNotification = async () => {
  if (!isNative()) return;
  const settings = getNotificationSettings();

  await LocalNotifications.schedule({
    notifications: [{
      id: 999,
      title: "🔔 Test Bildirimi",
      body: "Bildirim sistemi düzgün çalışıyor.",
      schedule: { at: new Date(Date.now() + 1000) },
      channelId: 'prayer-fajr-default',
      extra: { type: 'TEST' }
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
  } catch (e) {
    console.error('Bildirim izni hatası:', e);
  }
};
