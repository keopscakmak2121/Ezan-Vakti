
import { registerPlugin } from '@capacitor/core';
import { getStoredPrayerTimes } from './storage.js';
import { getNotificationSettings } from './notificationStorage.js';

const PrayerPlugin = registerPlugin('PrayerPlugin');

export const showOngoingNotification = async (prayerTimes) => {
  try {
    if (!prayerTimes) return;
    
    const stored = getStoredPrayerTimes();
    const locationName = stored?.locationName || 'Konum';
    const settings = getNotificationSettings();

    // Sadece gerekli vakitleri gönderelim
    const timings = {
      Fajr: prayerTimes.Fajr,
      Sunrise: prayerTimes.Sunrise,
      Dhuhr: prayerTimes.Dhuhr,
      Asr: prayerTimes.Asr,
      Maghrib: prayerTimes.Maghrib,
      Isha: prayerTimes.Isha
    };

    await PrayerPlugin.start({
      prayerTimes: timings,
      locationName: locationName,
      settings: settings // Tüm bildirim ayarlarını gönderiyoruz (Ses seçimi vb.)
    });
  } catch (error) {
    console.error('Kalıcı bildirim başlatılamadı:', error);
  }
};

export const hideOngoingNotification = async () => {
  try {
    await PrayerPlugin.stop();
  } catch (error) {
    console.error('Kalıcı bildirim durdurulamadı:', error);
  }
};

export const updateOngoingNotification = async (prayerTimes) => {
  await showOngoingNotification(prayerTimes);
};
