import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Koordinatlara göre namaz vakitlerini getir
export const getPrayerTimesByCoordinates = async (latitude, longitude, method = 13) => {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        timings: data.data.timings,
        date: data.data.date,
        meta: data.data.meta
      };
    }
    throw new Error('API Hatası');
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Şehir adı al
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
    const data = await response.json();
    if (data && data.address) {
      return data.address.province || data.address.city || data.address.town || 'Konum Bilinmiyor';
    }
    return 'Konum Bilinmiyor';
  } catch (error) {
    return 'Konum Belirsiz';
  }
};

let isRequesting = false;

export const getUserLocation = async () => {
  if (isRequesting) {
    console.log("Zaten bir konum isteği var, bekleniyor...");
    return null;
  }

  isRequesting = true;
  try {
    if (Capacitor.isNativePlatform()) {
      let permStatus = await Geolocation.checkPermissions();

      if (permStatus.location !== 'granted' && permStatus.location !== 'coarse') {
        permStatus = await Geolocation.requestPermissions();
      }

      if (permStatus.location === 'granted' || permStatus.location === 'coarse') {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        });
        return { latitude: position.coords.latitude, longitude: position.coords.longitude };
      }
      throw new Error('PERMISSION_DENIED');
    } else {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  } finally {
    isRequesting = false;
  }
};

export const getNextPrayer = (timings) => {
  if (!timings) return null;
  const now = new Date();
  const currentTotal = now.getHours() * 60 + now.getMinutes();
  const prayers = [
    { key: 'Fajr', name: 'İmsak' },
    { key: 'Sunrise', name: 'Güneş' },
    { key: 'Dhuhr', name: 'Öğle' },
    { key: 'Asr', name: 'İkindi' },
    { key: 'Maghrib', name: 'Akşam' },
    { key: 'Isha', name: 'Yatsı' }
  ];
  for (let p of prayers) {
    const [h, m] = timings[p.key].split(':').map(Number);
    if ((h * 60 + m) > currentTotal) return { name: p.name, time: timings[p.key], tomorrow: false };
  }
  return { name: 'İmsak', time: timings.Fajr, tomorrow: true };
};

export const isPrayerTimePassed = (time) => {
  if (!time) return false;
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  return (now.getHours() * 60 + now.getMinutes()) > (h * 60 + m);
};

export const turkishCities = [
  { name: 'Adana', latitude: 37.0, longitude: 35.3213 },
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'İstanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'İzmir', latitude: 38.4192, longitude: 27.1287 }
];
