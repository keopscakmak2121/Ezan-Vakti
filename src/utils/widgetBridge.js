
import { registerPlugin } from '@capacitor/core';
const PrayerPlugin = registerPlugin('PrayerPlugin');

export const updatePrayerWidget = async (timings, locationName = 'Konum') => {
  try {
    if (!timings) return;

    // Gerekli vakitleri filtrele
    const prayerTimes = {
      Fajr: timings.Fajr,
      Sunrise: timings.Sunrise,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha
    };

    await PrayerPlugin.updateWidgetData({
      prayerTimes: prayerTimes,
      locationName: locationName
    });

    return true;
  } catch (error) {
    console.error('Widget verisi güncellenemedi:', error);
    return false;
  }
};
