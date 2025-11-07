import { Geolocation } from '@capacitor/geolocation';

// Aladhan API kullanarak namaz vakitlerini getir
// Dökümantasyon: https://aladhan.com/prayer-times-api

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
    } else {
      throw new Error('API yanıtı başarısız');
    }
  } catch (error) {
    console.error('Namaz vakitleri alınamadı:', error);
    return { success: false, error: error.message };
  }
};

// Şehir adına göre namaz vakitlerini getir
export const getPrayerTimesByCity = async (city, country, method = 13) => {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    
    const url = `https://api.aladhan.com/v1/timingsByCity/${timestamp}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        timings: data.data.timings,
        date: data.data.date,
        meta: data.data.meta
      };
    } else {
      throw new Error('API yanıtı başarısız');
    }
  } catch (error) {
    console.error('Namaz vakitleri alınamadı:', error);
    return { success: false, error: error.message };
  }
};

// Haftalık namaz vakitlerini getir
export const getWeeklyPrayerTimes = async (latitude, longitude, method = 13) => {
  try {
    const today = new Date();
    const weekly = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
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
          dayName: getDayName(date)
        });
      }
    }
    
    return { success: true, weekly };
  } catch (error) {
    console.error('Haftalık vakitler alınamadı:', error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının konumunu al (hem web hem mobil)
export const getUserLocation = async () => {
  try {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.geolocation) {
      // Web
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            reject(new Error('Web: Konum alınamadı'));
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } else {
      // Mobil (Capacitor)
      const { Geolocation } = await import('@capacitor/geolocation');
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } else {
        throw new Error('Mobil: Konum izni verilmedi');
      }
    }
  } catch (error) {
    console.error('Konum alınamadı:', error);
    throw error;
  }
};


// Şehir verisi (Türkiye şehirleri)
export const turkishCities = [
  { name: 'Adana', latitude: 37.0, longitude: 35.3213 },
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
  { name: 'Bartın', latitude: 41.5811, longitude: 32.4610 },
  { name: 'Batman', latitude: 37.8812, longitude: 41.1351 },
  { name: 'Bayburt', latitude: 40.2552, longitude: 40.2249 },
  { name: 'Bilecik', latitude: 40.0567, longitude: 30.0665 },
  { name: 'Bingöl', latitude: 39.0626, longitude: 40.7696 },
  { name: 'Bitlis', latitude: 38.3938, longitude: 42.1232 },
  { name: 'Bolu', latitude: 40.5760, longitude: 31.5788 },
  { name: 'Burdur', latitude: 37.4613, longitude: 30.0665 },
  { name: 'Bursa', latitude: 40.2669, longitude: 29.0634 },
  { name: 'Çanakkale', latitude: 40.1553, longitude: 26.4142 },
  { name: 'Çankırı', latitude: 40.6013, longitude: 33.6134 },
  { name: 'Çorum', latitude: 40.5506, longitude: 34.9556 },
  { name: 'Denizli', latitude: 37.7765, longitude: 29.0864 },
  { name: 'Diyarbakır', latitude: 37.9144, longitude: 40.2306 },
  { name: 'Düzce', latitude: 40.8438, longitude: 31.1565 },
  { name: 'Edirne', latitude: 41.6818, longitude: 26.5623 },
  { name: 'Elazığ', latitude: 38.6810, longitude: 39.2264 },
  { name: 'Erzincan', latitude: 39.7500, longitude: 39.5000 },
  { name: 'Erzurum', latitude: 39.9000, longitude: 41.2700 },
  { name: 'Eskişehir', latitude: 39.7767, longitude: 30.5206 },
  { name: 'Gaziantep', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Giresun', latitude: 40.9128, longitude: 38.3895 },
  { name: 'Gümüşhane', latitude: 40.4386, longitude: 39.5086 },
  { name: 'Hakkari', latitude: 37.5833, longitude: 43.7333 },
  { name: 'Hatay', latitude: 36.4018, longitude: 36.3498 },
  { name: 'Iğdır', latitude: 39.8880, longitude: 44.0048 },
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
  { name: 'Mersin', latitude: 36.8121, longitude: 34.6415 },
  { name: 'Muğla', latitude: 37.2153, longitude: 28.3636 },
  { name: 'Muş', latitude: 38.9462, longitude: 41.7539 },
  { name: 'Nevşehir', latitude: 38.6939, longitude: 34.6857 },
  { name: 'Niğde', latitude: 37.9667, longitude: 34.6833 },
  { name: 'Ordu', latitude: 40.9839, longitude: 37.8764 },
  { name: 'Osmaniye', latitude: 37.2130, longitude: 36.1763 },
  { name: 'Rize', latitude: 41.0201, longitude: 40.5234 },
{ name: 'Sakarya', latitude: 40.6940, longitude: 30.4358 },
{ name: 'Samsun', latitude: 41.2928, longitude: 36.3313 },
{ name: 'Şanlıurfa', latitude: 37.1591, longitude: 38.7969 },
{ name: 'Siirt', latitude: 37.9333, longitude: 41.9500 },
{ name: 'Sinop', latitude: 42.0231, longitude: 35.1531 },
{ name: 'Şırnak', latitude: 37.4187, longitude: 42.4918 },
{ name: 'Sivas', latitude: 39.7477, longitude: 37.0179 },
{ name: 'Tekirdağ', latitude: 40.9833, longitude: 27.5167 },
{ name: 'Tokat', latitude: 40.3167, longitude: 36.5500 },
{ name: 'Trabzon', latitude: 41.0015, longitude: 39.7178 },
{ name: 'Tunceli', latitude: 39.3074, longitude: 39.4388 },
{ name: 'Uşak', latitude: 38.6823, longitude: 29.4082 },
{ name: 'Van', latitude: 38.4891, longitude: 43.4089 },
{ name: 'Yalova', latitude: 40.6500, longitude: 29.2667 },
{ name: 'Yozgat', latitude: 39.8181, longitude: 34.8147 },
{ name: 'Zonguldak', latitude: 41.4564, longitude: 31.7987 }
];

// Gün adını getir
const getDayName = (date) => {
const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
return days[date.getDay()];
};

// Vaktin geçip geçmediğini kontrol et
export const isPrayerTimePassed = (prayerTime) => {
const now = new Date();
const [hours, minutes] = prayerTime.split(':');
const prayer = new Date();
prayer.setHours(parseInt(hours), parseInt(minutes), 0);
return now > prayer;
};

// Bir sonraki vakti bul
export const getNextPrayer = (timings) => {
const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const prayerNames = {
'Fajr': 'İmsak',
'Dhuhr': 'Öğle',
'Asr': 'İkindi',
'Maghrib': 'Akşam',
'Isha': 'Yatsı'
};

for (const prayer of prayerOrder) {
if (!isPrayerTimePassed(timings[prayer])) {
return {
name: prayerNames[prayer],
time: timings[prayer]
};
}
}

// Tüm vakitler geçtiyse yarının ilk vakti
return {
name: prayerNames['Fajr'],
time: timings['Fajr'],
tomorrow: true
};
};
