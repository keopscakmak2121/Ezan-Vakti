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
      if (sound.local) {
        soundName = sound.file.replace('.mp3', '');
      } else {
        soundName = config.soundType === 'adhan' ? 'adhan1' : 'notification1';
      }
    }

    try {
      // KRİTİK: Tam ekran için IMPORTANCE_HIGH (5) ve VISIBILITY_PUBLIC (1) şart
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

    if (prayerConfig.minutesBefore > 0) {
      date.setMinutes(date.getMinutes() - prayerConfig.minutesBefore);
    }
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    const soundId = prayerConfig.soundId || 'default';
    const channelId = getChannelId(key, soundId);

    notifications.push({
      id: PRAYER_IDS[key],
      title: `🕌 ${prayerNames[key]} Vakti`,
      body: createNotificationMessage(key, -(prayerConfig.minutesBefore || 0)),
      schedule: {
        at: date,
        allowWhileIdle: true,
        repeats: false // Her gün tekrar yerine manuel planlama daha güvenli
      },
      channelId: channelId,
      // KRİTİK: Tam ekran tetikleyici
      fullScreenIntent: true,
      ongoing: true, // Kilit ekranında kalması için
      autoCancel: false,
      extra: {
        prayerName: key,
        prayerTime: time,
        type: 'PRAYER_ALARM' // JS tarafında yakalamak için
      }
    });
  }

  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✅ ${notifications.length} tam ekran bildirim planlandı`);
    }
  } catch (e) {
    console.error("Bildirim planlama hatası:", e);
  }
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
