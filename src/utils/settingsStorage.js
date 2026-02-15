// src/utils/settingsStorage.js

const SETTINGS_KEY = 'quran_settings';

// Tema seçenekleri (Arka plan ve yazı renkleri)
export const readerThemes = [
  { id: 'white', name: 'Beyaz', bg: '#ffffff', text: '#1f2937', sub: '#6b7280' },
  { id: 'sepia', name: 'Kitap (Sarı)', bg: '#f4ecd8', text: '#5b4636', sub: '#8c786a' },
  { id: 'green', name: 'Hafif Yeşil', bg: '#e8f5e9', text: '#1b5e20', sub: '#4caf50' },
  { id: 'dark', name: 'Karanlık', bg: '#111827', text: '#f3f4f6', sub: '#9ca3af' },
  { id: 'black', name: 'Tam Siyah', bg: '#000000', text: '#e5e7eb', sub: '#9ca3af' }
];

// Varsayılan ayarlar
const getDefaultSettings = () => ({
  reciter: 'Alafasy_128kbps',
  translation: 'tr.diyanet',
  fontSize: 20,
  readerTheme: 'white', // Yeni: Okuma teması
  darkMode: false,
  audioSpeed: 1.0,
  autoRepeat: false,
  autoPlay: false,
  showArabic: true,
  showTranslation: true,
  notificationsEnabled: true,
  arabicFont: 'amiri',
  showTajweed: true
});

export const translations = [
  { id: 'tr.diyanet', name: 'Diyanet İşleri', author: 'Diyanet İşleri Başkanlığı' },
  { id: 'tr.vakfi', name: 'Diyanet Vakfı', author: 'Diyanet Vakfı' },
  { id: 'tr.ates', name: 'Süleymaniye Vakfı', author: 'Süleyman Ateş' },
  { id: 'tr.golpinarli', name: 'Gölpınarlı Meali', author: 'Abdülbaki Gölpınarlı' },
  { id: 'tr.yuksel', name: 'Mesaj Meali', author: 'Edip Yüksel' },
  { id: 'tr.transliteration', name: 'Transliterasyon', author: 'Okunuş' }
];

export const reciters = [
  { id: 'Alafasy_128kbps', name: 'Mishary Rashid Alafasy', country: 'Kuveyt' },
  { id: 'Abdul_Basit_Murattal_192kbps', name: 'Abdul Basit Abd us-Samad', country: 'Mısır' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'Abdurrahman As-Sudais', country: 'Suudi Arabistan' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'Abu Bakr Al-Shatri', country: 'Suudi Arabistan' },
  { id: 'Ahmed_ibn_Ali_al-Ajamy_128kbps', name: 'Ahmed Al-Ajamy', country: 'Suudi Arabistan' },
  { id: 'Ghamadi_40kbps', name: 'Saad Al-Ghamadi', country: 'Suudi Arabistan' },
  { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary', country: 'Mısır' },
  { id: 'Maher_AlMuaiqly_128kbps', name: 'Maher Al-Muaiqly', country: 'Suudi Arabistan' },
  { id: 'Muhammad_Ayyoub_128kbps', name: 'Muhammad Ayyub', country: 'Suudi Arabistan' },
  { id: 'Parhizgar_48kbps', name: 'Shahriar Parhizgar', country: 'İran' }
];

export const arabicFonts = [
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade New', family: "'Scheherazade New', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
  { id: 'harmattan', name: 'Harmattan', family: "'Harmattan', serif" },
  { id: 'aref', name: 'Aref Ruqaa', family: "'Aref Ruqaa', serif" }
];

export const getSettings = () => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? { ...getDefaultSettings(), ...JSON.parse(settings) } : getDefaultSettings();
  } catch (error) {
    return getDefaultSettings();
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    return false;
  }
};

export const updateSetting = (key, value) => {
  const settings = getSettings();
  settings[key] = value;
  return saveSettings(settings);
};

export const getSetting = (key) => {
  const settings = getSettings();
  return settings[key];
};

export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
  return getDefaultSettings();
};

export const getReciterInfo = (reciterId) => reciters.find(r => r.id === reciterId) || reciters[0];
export const getTranslationInfo = (translationId) => translations.find(t => t.id === translationId) || translations[0];
export const getArabicFontInfo = (fontId) => arabicFonts.find(f => f.id === fontId) || arabicFonts[0];
export const getArabicFontFamily = (fontId) => getArabicFontInfo(fontId).family;
export const getReaderTheme = (themeId) => readerThemes.find(t => t.id === themeId) || readerThemes[0];
