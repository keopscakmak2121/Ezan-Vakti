// src/utils/constants.js

// API Endpoints
export const API_ENDPOINTS = {
  QURAN_BASE: 'https://api.alquran.cloud/v1',
  AUDIO_BASE: 'https://everyayah.com/data',
  PRAYER_TIMES: 'https://api.aladhan.com/v1'
};

// Kari Kodları
export const RECITER_CODES = {
  alafasy: 'Alafasy_128kbps',
  saad: 'Ghamadi_40kbps',
  abdulbasit: 'Abdul_Basit_Murattal_192kbps',
  hudhaify: 'Hudhaify_128kbps',
  muaiqly: 'Muaiqly_128kbps'
};

// Meal Kodları
export const TRANSLATION_CODES = {
  diyanet: 'tr.diyanet',
  vakfi: 'tr.vakfi',
  ates: 'tr.ates',
  ozturk: 'tr.ozturk',
  yuksel: 'tr.yuksel'
};

// LocalStorage Anahtarları
export const STORAGE_KEYS = {
  SETTINGS: 'quran_settings',
  BOOKMARKS: 'quran_bookmarks',
  NOTES: 'quran_notes',
  STATS: 'quran_stats',
  READING_HISTORY: 'quran_reading_history',
  TAFSIR_CACHE: 'quran_tafsir_cache'
};

// IndexedDB Anahtarları
export const DB_CONFIG = {
  NAME: 'QuranAudioDB',
  VERSION: 1,
  STORE_NAME: 'audioFiles'
};

// Renkler
export const COLORS = {
  primary: '#059669',
  primaryDark: '#047857',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  darkBg: '#1f2937',
  darkCard: '#374151',
  lightBg: '#f0fdf4',
  lightCard: '#ffffff'
};

// Namaz Vakitleri
export const PRAYER_NAMES = {
  en: ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  tr: ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı']
};

// Kabe Koordinatları
export const KAABA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262
};

// Ayarlar Varsayılan Değerleri
export const DEFAULT_SETTINGS = {
  reciter: 'alafasy',
  translation: 'tr.diyanet',
  fontSize: 20,
  darkMode: false,
  audioSpeed: 1.0,
  autoRepeat: false,
  autoPlay: false,
  showArabic: true,
  showTranslation: true,
  notificationsEnabled: true
};

// Yer İmi Kategorileri
export const BOOKMARK_CATEGORIES = [
  { id: 'genel', name: 'Genel', icon: '📌' },
  { id: 'dua', name: 'Dua', icon: '🤲' },
  { id: 'ibret', name: 'İbret', icon: '💡' },
  { id: 'hatırlatma', name: 'Hatırlatma', icon: '⏰' },
  { id: 'sabır', name: 'Sabır', icon: '💪' },
  { id: 'şükür', name: 'Şükür', icon: '🙏' },
  { id: 'rahmet', name: 'Rahmet', icon: '❤️' },
  { id: 'mağfiret', name: 'Mağfiret', icon: '✨' }
];

// Maksimum Değerler
export const LIMITS = {
  MAX_BOOKMARKS: 500,
  MAX_NOTES: 500,
  MAX_CACHE_SIZE: 100,
  MAX_READING_HISTORY: 100
};

export default {
  API_ENDPOINTS,
  RECITER_CODES,
  TRANSLATION_CODES,
  STORAGE_KEYS,
  DB_CONFIG,
  COLORS,
  PRAYER_NAMES,
  KAABA_COORDS,
  DEFAULT_SETTINGS,
  BOOKMARK_CATEGORIES,
  LIMITS
};