import { LocalNotifications } from '@capacitor/local-notifications';
import { getNotificationSettings, createNotificationMessage, SOUND_OPTIONS } from './notificationStorage';

const PRAYER_IDS = { Fajr: 1001, Sunrise: 1002, Dhuhr: 1003, Asr: 1004, Maghrib: 1005, Isha: 1006 };

// Her vakit için özel kanal oluştur (Farklı sesler için)
export const createChannelsForPrayers = async () => {
  const settings = getNotificationSettings();

  for (const [key, config] of Object.entries(settings.prayerNotifications)) {
    const channelId = `channel-${key.toLowerCase()}`;
    const soundList = config.soundType === 'adhan' ? SOUND_OPTIONS.adhan : SOUND_OPTIONS.notification;
    const sound = soundList.find(s => s.id === config.soundId);

    try {
      await LocalNotifications.createChannel({
        id: channelId,
        name: `Namaz Vakti - ${key}`,
        importance: 5,
        sound: settings.sound && config.enabled ? (sound?.file?.replace('.mp3', '')) : undefined,
        vibration: settings.vibration,
        visibility: 1
      });
    } catch (e) { console.error(`Kanal hatası (${key}):`, e); }
  }
};

export const scheduleNotifications = async (prayerTimings) => {
  if (!prayerTimings) return;
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
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

    if (prayerConfig.minutesBefore > 0) date.setMinutes(date.getMinutes() - prayerConfig.minutesBefore);
    if (date < now) date.setDate(date.getDate() + 1);

    notifications.push({
      id: PRAYER_IDS[key],
      title: `🕌 ${prayerNames[key]} Vakti`,
      body: createNotificationMessage(key, -prayerConfig.minutesBefore),
      schedule: { at: date, allowWhileIdle: true },
      channelId: `channel-${key.toLowerCase()}`, // Her vakte özel kanal
      smallIcon: 'ic_stat_mosque',
      extra: { prayerName: key, prayerTime: time }
    });
  }

  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
  } catch (e) { console.error("Bildirim planlama hatası:", e); }
};

export const initNotificationService = async (prayerTimings) => {
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display === 'granted') await scheduleNotifications(prayerTimings);
};
