import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getNotificationSettings, createNotificationMessage, SOUND_OPTIONS } from './notificationStorage';

const PRAYER_IDS = { Fajr: 1001, Sunrise: 1002, Dhuhr: 1003, Asr: 1004, Maghrib: 1005, Isha: 1006 };

const isNative = () => Capacitor.isNativePlatform();

// Kanal ID'sini ses ayarına göre oluştur — ses değiştiğinde yeni kanal lazım
const getChannelId = (key, soundId) => `prayer-${key.toLowerCase()}-${soundId || 'default'}`;

// Ses dosyasının res/raw'da olup olmadığını kontrol et
const isLocalSound = (soundId) => {
  const allSounds = [...SOUND_OPTIONS.adhan, ...SOUND_OPTIONS.notification];
  const sound = allSounds.find(s => s.id === soundId);
  return sound ? sound.local === true : false;
};

// Her vakit için özel bildirim kanalı oluştur
export const createChannelsForPrayers = async () => {
  if (!isNative()) return;
  const settings = getNotificationSettings();

  for (const [key, config] of Object.entries(settings.prayerNotifications)) {
    const soundId = config.soundId || 'default';
    const channelId = getChannelId(key, soundId);
    const soundList = config.soundType === 'adhan' ? SOUND_OPTIONS.adhan : SOUND_OPTIONS.notification;
    const sound = soundList.find(s => s.id === soundId);

    // Sadece lokal (res/raw/) sesler kanal'da kullanılabilir
    // İndirilebilir sesler için fallback: ezan → adhan1, bildirim → notification1
    let soundName = undefined;
    if (settings.sound && config.enabled && sound && sound.file !== 'default') {
      if (sound.local) {
        soundName = sound.file.replace('.mp3', '');
      } else {
        // İndirilebilir ses — res/raw'da yok, fallback kullan
        soundName = config.soundType === 'adhan' ? 'adhan1' : 'notification1';
      }
    }

    try {
      await LocalNotifications.createChannel({
        id: channelId,
        name: `Namaz - ${key} (${sound?.name || 'Varsayılan'})`,
        importance: 5,
        sound: soundName,
        vibration: config.vibration !== false && settings.vibration,
        visibility: 1
      });
    } catch (e) {
      console.error(`Kanal hatası (${key}):`, e);
    }
  }
};

// Bildirimleri planla
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
      schedule: { at: date, allowWhileIdle: true },
      channelId: channelId,
      sound: soundId !== 'default' ? `${soundId}.mp3` : undefined,
      smallIcon: 'ic_stat_mosque',
      extra: { prayerName: key, prayerTime: time }
    });
  }

  try {
    await LocalNotifications.cancel({ notifications: Object.values(PRAYER_IDS).map(id => ({ id })) });
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`✅ ${notifications.length} bildirim planlandı`);
    }
  } catch (e) {
    console.error("Bildirim planlama hatası:", e);
  }
};

// Bildirim servisini başlat
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

// Test bildirimi
export const sendTestNotification = async () => {
  if (!isNative()) {
    alert('Test bildirimi sadece telefonda çalışır.');
    return;
  }
  try {
    const settings = getNotificationSettings();
    // İlk aktif vaktin ses ayarını kullan
    const firstActive = Object.entries(settings.prayerNotifications).find(([, c]) => c.enabled);
    const soundId = firstActive ? firstActive[1].soundId : 'default';
    const channelId = firstActive ? getChannelId(firstActive[0], soundId) : 'prayer-test-default';

    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: '🕌 Test Bildirimi',
        body: 'Bildirimler düzgün çalışıyor! Ses ve titreşim test ediliyor.',
        schedule: { at: new Date(Date.now() + 1000) },
        channelId: channelId,
        sound: soundId !== 'default' ? `${soundId}.mp3` : undefined,
        smallIcon: 'ic_stat_mosque'
      }]
    });
  } catch (e) {
    console.error('Test bildirimi hatası:', e);
  }
};
