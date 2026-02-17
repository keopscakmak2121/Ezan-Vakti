
import { registerPlugin } from '@capacitor/core';
import { getStoredPrayerTimes } from './storage.js';

const PrayerPlugin = registerPlugin('PrayerPlugin');

export const showOngoingNotification = async (prayerTimes) => {
  try {
    if (!prayerTimes) return;
    
    const stored = getStoredPrayerTimes();
    const locationName = stored?.locationName || 'Konum';

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
      locationName: locationName
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
