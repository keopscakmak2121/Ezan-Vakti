// src/utils/widgetBridge.js
import { registerPlugin } from '@capacitor/core';

const PrayerWidgetPlugin = registerPlugin('PrayerWidgetPlugin');

export const updatePrayerWidget = async (prayerTimes) => {
  try {
    console.log('📱 Widget güncellemesi başlıyor:', prayerTimes);
    
    await PrayerWidgetPlugin.updateWidget({
      imsak: prayerTimes.Imsak || prayerTimes.Fajr,
      gunes: prayerTimes.Sunrise,
      ogle: prayerTimes.Dhuhr,
      ikindi: prayerTimes.Asr,
      aksam: prayerTimes.Maghrib,
      yatsi: prayerTimes.Isha
    });
    
    console.log('✅ Widget güncellendi');
  } catch (error) {
    console.error('❌ Widget güncelleme hatası:', error);
  }
};