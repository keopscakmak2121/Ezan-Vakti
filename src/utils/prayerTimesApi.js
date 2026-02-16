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

// Şehir/ilçe/mahalle adı al - detaylı konum
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
    const data = await response.json();
    if (data && data.address) {
      const a = data.address;
      const parts = [];
      // Mahalle veya semt
      const neighborhood = a.neighbourhood || a.suburb || a.quarter || '';
      if (neighborhood) parts.push(neighborhood);
      // İlçe
      const district = a.town || a.county || a.district || '';
      if (district) parts.push(district);
      // Şehir/il
      const city = a.province || a.city || a.state || '';
      if (city && city !== district) parts.push(city);

      if (parts.length > 0) return parts.join(', ');
      return a.display_name?.split(',').slice(0, 2).join(',') || 'Konum Bilinmiyor';
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
  { name: 'Adana', latitude: 37.0000, longitude: 35.3213 },
  { name: 'Adıyaman', latitude: 37.7648, longitude: 38.2786 },
  { name: 'Afyonkarahisar', latitude: 38.7507, longitude: 30.5567 },
  { name: 'Ağrı', latitude: 39.7191, longitude: 43.0503 },
  { name: 'Aksaray', latitude: 38.3687, longitude: 34.0370 },
  { name: 'Amasya', latitude: 40.6499, longitude: 35.8353 },
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'Antalya', latitude: 36.8969, longitude: 30.7133 },
  { name: 'Ardahan', latitude: 41.1105, longitude: 42.7022 },
  { name: 'Artvin', latitude: 41.1828, longitude: 41.8183 },
  { name: 'Aydın', latitude: 37.8560, longitude: 27.8416 },
  { name: 'Balıkesir', latitude: 39.6484, longitude: 27.8826 },
  { name: 'Bartın', latitude: 41.6344, longitude: 32.3375 },
  { name: 'Batman', latitude: 37.8812, longitude: 41.1351 },
  { name: 'Bayburt', latitude: 40.2552, longitude: 40.2249 },
  { name: 'Bilecik', latitude: 40.0567, longitude: 30.0665 },
  { name: 'Bingöl', latitude: 38.8854, longitude: 40.4966 },
  { name: 'Bitlis', latitude: 38.4010, longitude: 42.1095 },
  { name: 'Bolu', latitude: 40.7260, longitude: 31.6113 },
  { name: 'Burdur', latitude: 37.7203, longitude: 30.2908 },
  { name: 'Bursa', latitude: 40.1885, longitude: 29.0610 },
  { name: 'Çanakkale', latitude: 40.1553, longitude: 26.4142 },
  { name: 'Çankırı', latitude: 40.6013, longitude: 33.6134 },
  { name: 'Çorum', latitude: 40.5506, longitude: 34.9556 },
  { name: 'Denizli', latitude: 37.7765, longitude: 29.0864 },
  { name: 'Diyarbakır', latitude: 37.9144, longitude: 40.2306 },
  { name: 'Düzce', latitude: 40.8438, longitude: 31.1565 },
  { name: 'Edirne', latitude: 41.6818, longitude: 26.5623 },
  { name: 'Elazığ', latitude: 38.6810, longitude: 39.2264 },
  { name: 'Erzincan', latitude: 39.7500, longitude: 39.5000 },
  { name: 'Erzurum', latitude: 39.9055, longitude: 41.2658 },
  { name: 'Eskişehir', latitude: 39.7767, longitude: 30.5206 },
  { name: 'Gaziantep', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Giresun', latitude: 40.9128, longitude: 38.3895 },
  { name: 'Gümüşhane', latitude: 40.4386, longitude: 39.5086 },
  { name: 'Hakkari', latitude: 37.5833, longitude: 43.7333 },
  { name: 'Hatay', latitude: 36.4018, longitude: 36.3498 },
  { name: 'Iğdır', latitude: 39.9167, longitude: 44.0500 },
  { name: 'Isparta', latitude: 37.7648, longitude: 30.5566 },
  { name: 'İstanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'İzmir', latitude: 38.4192, longitude: 27.1287 },
  { name: 'Kahramanmaraş', latitude: 37.5858, longitude: 36.9371 },
  { name: 'Karabük', latitude: 41.2061, longitude: 32.6204 },
  { name: 'Karaman', latitude: 37.1759, longitude: 33.2287 },
  { name: 'Kars', latitude: 40.6167, longitude: 43.1000 },
  { name: 'Kastamonu', latitude: 41.3887, longitude: 33.7827 },
  { name: 'Kayseri', latitude: 38.7312, longitude: 35.4787 },
  { name: 'Kilis', latitude: 36.7184, longitude: 37.1212 },
  { name: 'Kırıkkale', latitude: 39.8468, longitude: 33.5153 },
  { name: 'Kırklareli', latitude: 41.7333, longitude: 27.2167 },
  { name: 'Kırşehir', latitude: 39.1425, longitude: 34.1709 },
  { name: 'Kocaeli', latitude: 40.8533, longitude: 29.8815 },
  { name: 'Konya', latitude: 37.8667, longitude: 32.4833 },
  { name: 'Kütahya', latitude: 39.4167, longitude: 29.9833 },
  { name: 'Malatya', latitude: 38.3552, longitude: 38.3095 },
  { name: 'Manisa', latitude: 38.6191, longitude: 27.4289 },
  { name: 'Mardin', latitude: 37.3212, longitude: 40.7245 },
  { name: 'Mersin', latitude: 36.8000, longitude: 34.6333 },
  { name: 'Muğla', latitude: 37.2153, longitude: 28.3636 },
  { name: 'Muş', latitude: 38.9462, longitude: 41.7539 },
  { name: 'Nevşehir', latitude: 38.6939, longitude: 34.6857 },
  { name: 'Niğde', latitude: 37.9667, longitude: 34.6833 },
  { name: 'Ordu', latitude: 40.9839, longitude: 37.8764 },
  { name: 'Osmaniye', latitude: 37.0742, longitude: 36.2478 },
  { name: 'Rize', latitude: 41.0201, longitude: 40.5234 },
  { name: 'Sakarya', latitude: 40.6940, longitude: 30.4358 },
  { name: 'Samsun', latitude: 41.2928, longitude: 36.3313 },
  { name: 'Şanlıurfa', latitude: 37.1674, longitude: 38.7955 },
  { name: 'Siirt', latitude: 37.9333, longitude: 41.9500 },
  { name: 'Sinop', latitude: 42.0231, longitude: 35.1531 },
  { name: 'Sivas', latitude: 39.7477, longitude: 37.0179 },
  { name: 'Şırnak', latitude: 37.5164, longitude: 42.4611 },
  { name: 'Tekirdağ', latitude: 41.0000, longitude: 27.5167 },
  { name: 'Tokat', latitude: 40.3167, longitude: 36.5500 },
  { name: 'Trabzon', latitude: 41.0027, longitude: 39.7168 },
  { name: 'Tunceli', latitude: 39.1079, longitude: 39.5401 },
  { name: 'Uşak', latitude: 38.6823, longitude: 29.4082 },
  { name: 'Van', latitude: 38.4891, longitude: 43.4089 },
  { name: 'Yalova', latitude: 40.6500, longitude: 29.2667 },
  { name: 'Yozgat', latitude: 39.8181, longitude: 34.8147 },
  { name: 'Zonguldak', latitude: 41.4564, longitude: 31.7987 }
];
