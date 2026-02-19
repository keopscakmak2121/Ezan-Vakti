import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getNotificationSettings, createNotificationMessage, SOUND_OPTIONS } from './notificationStorage';

const PRAYER_IDS = { Fajr: 1001, Sunrise: 1002, Dhuhr: 1003, Asr: 1004, Maghrib: 1005, Isha: 1006 };

const isNative = () => Capacitor.isNativePlatform();

// Kanal ID oluşturma mantığı
const getChannelId = (key, soundId) => `prayer-${key.toLowerCase()}-${soundId || 'default'}`;

export const scheduleNotifications = async (prayerTimings) => {
  if (!isNative() || !prayerTimings) return;
  const settings = getNotificationSettings();

  // 1) Eski bildirimleri ve kanalları temizleme ihtiyacı (opsiyonel ama temizlik iyidir)
  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
  } catch (e) {}

  if (!settings.enabled) return;

  const now = new Date();
  const notifications = [];
  const prayerNames = { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' };

  // 2) Gerekli tüm kanalları oluştur (KRİTİK ADIM)
  // Android'de bildirimlerin görünmesi için kanalın önceden oluşturulmuş olması şarttır.
  const channelsToCreate = [];

  for (const [key, time] of Object.entries(prayerTimings)) {
    const prayerConfig = settings.prayerNotifications[key];
    if (!prayerNames[key] || !prayerConfig || !prayerConfig.enabled) continue;

    const offset = prayerConfig.minutesBefore || 0;
    if (offset === 0) continue; // Tam vakitleri Native Servis yönetiyor

    const soundId = prayerConfig.soundId || 'default';
    const soundType = prayerConfig.soundType || 'adhan';
    const channelId = getChannelId(key, soundId);

    // Ses dosyasını belirle
    const soundList = SOUND_OPTIONS[soundType] || [];
    const sound = soundList.find(s => s.id === soundId);
    const soundFile = sound ? (sound.local ? sound.file : sound.file) : 'default';

    channelsToCreate.push({
      id: channelId,
      name: `${prayerNames[key]} Hatırlatıcı`,
      description: `${prayerNames[key]} vakti öncesi uyarı kanalı`,
      sound: soundId === 'default' ? null : soundFile.replace('.mp3', ''), // Android uzantısız ister
      importance: 4, // High importance
      visibility: 1,
      vibration: prayerConfig.vibration !== false
    });

    // Bildirim zamanını hesapla
    const [h, m] = time.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() - offset);

    // Eğer vakit geçtiyse yarına kur
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    notifications.push({
      id: PRAYER_IDS[key],
      title: `🕌 ${prayerNames[key]} Hatırlatıcı`,
      body: createNotificationMessage(key, -offset),
      schedule: { at: date, allowWhileIdle: true },
      channelId: channelId,
      smallIcon: 'ic_stat_mosque',
      extra: { type: 'REMINDER' }
    });
  }

  try {
    // Kanalları sisteme kaydet
    if (channelsToCreate.length > 0) {
      for (const channel of channelsToCreate) {
        await LocalNotifications.createChannel(channel);
      }
    }

    // Bildirimleri planla
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`${notifications.length} adet hatırlatıcı planlandı.`);
    }
  } catch (e) {
    console.error("Hatırlatıcı planlama hatası:", e);
  }
};

export const sendTestNotification = async () => {
  if (!isNative()) return;

  const testChannel = {
    id: 'test-channel',
    name: 'Test Bildirimleri',
    importance: 4,
    sound: 'notification1'
  };

  await LocalNotifications.createChannel(testChannel);

  await LocalNotifications.schedule({
    notifications: [{
      id: 999,
      title: "🔔 Test Bildirimi",
      body: "Bildirim sistemi ve kanallar hazır.",
      channelId: 'test-channel',
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
