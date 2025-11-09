// src/utils/prayerTimesApi.js

import { Geolocation } from '@capacitor/geolocation';

// Aladhan API
export const getPrayerTimesByCoordinates = async (latitude, longitude, method = 13) => {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 200 && data.data.timings) {
      return { success: true, timings: data.data.timings };
    } else {
      throw new Error(data.status || 'API response failed');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reverse Geocoding using a free public API (Nominatim)
export const getCityFromCoordinates = async (latitude, longitude) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.address) {
            return data.address.city || data.address.town || data.address.village || 'Konum Bilinmiyor';
        }
        return 'Konum Bilinmiyor';
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return 'Konum Belirsiz';
    }
}

// Get user location (Capacitor first)
export const getUserLocation = async () => {
  try {
    const permissions = await Geolocation.requestPermissions();
    if (permissions.location !== 'granted') {
      throw new Error('Konum izni verilmedi.');
    }
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch (error) {
    // Fallback to web API for non-Capacitor environments
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (err) => reject(new Error(`Web: Konum alınamadı - ${err.message}`)),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
};

// Get weekly prayer times (RE-EXPORTED)
export const getWeeklyPrayerTimes = async (latitude, longitude, method = 13) => {
  try {
    const weekly = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 200) {
        weekly.push({
          date: data.data.date,
          timings: data.data.timings,
          dayName: new Date(date).toLocaleDateString('tr-TR', { weekday: 'long' })
        });
      }
    }
    return { success: true, weekly };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if a prayer time has passed
export const isPrayerTimePassed = (prayerTime) => {
  if (!prayerTime || typeof prayerTime !== 'string') return false;
  const now = new Date();
  const [hours, minutes] = prayerTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;
  const prayer = new Date();
  prayer.setHours(hours, minutes, 0);
  return now > prayer;
};

// Find the next prayer
export const getNextPrayer = (timings) => {
  if (!timings) return null;
  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerNames = { 'Fajr': 'İmsak', 'Dhuhr': 'Öğle', 'Asr': 'İkindi', 'Maghrib': 'Akşam', 'Isha': 'Yatsı' };

  for (const prayerKey of prayerOrder) {
    const prayerTime = timings[prayerKey];
    if (prayerTime && !isPrayerTimePassed(prayerTime)) {
      return { name: prayerNames[prayerKey], time: prayerTime, tomorrow: false };
    }
  }
  
  const fajrTime = timings['Fajr'];
  if (fajrTime) {
    return { name: prayerNames['Fajr'], time: fajrTime, tomorrow: true };
  }
  
  return null;
};

// Turkish cities data (RE-EXPORTED)
export const turkishCities = [
  { name: 'Adana', latitude: 37.0, longitude: 35.3213 },
  { name: 'Adıyaman', latitude: 37.7648, longitude: 38.2786 },
  // ... (rest of the cities)
];
