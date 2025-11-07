// src/utils/settingsStorage.js

const SETTINGS_KEY = 'quran_settings';

// Varsayılan ayarlar
const getDefaultSettings = () => ({
  reciter: 'Alafasy_128kbps',  // ✅ EVERYAYAH API formatı
  translation: 'tr.diyanet',
  fontSize: 20,
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

// Mevcut meal seçenekleri
export const translations = [
  { id: 'tr.diyanet', name: 'Diyanet İşleri', author: 'Diyanet İşleri Başkanlığı' },
  { id: 'tr.vakfi', name: 'Diyanet Vakfı', author: 'Diyanet Vakfı' },
  { id: 'tr.ates', name: 'Süleymaniye Vakfı', author: 'Süleyman Ateş' },
  { id: 'tr.golpinarli', name: 'Gölpınarlı Meali', author: 'Abdülbaki Gölpınarlı' },
  { id: 'tr.yuksel', name: 'Mesaj Meali', author: 'Edip Yüksel' },
  { id: 'tr.transliteration', name: 'Transliterasyon', author: 'Okunuş' }
];

// ✅ EVERYAYAH API - CORS friendly kariler
export const reciters = [
  { 
    id: 'Alafasy_128kbps', 
    name: 'Mishary Rashid Alafasy',
    country: 'Kuveyt'
  },
  { 
    id: 'Abdul_Basit_Murattal_192kbps', 
    name: 'Abdul Basit Abd us-Samad',
    country: 'Mısır'
  },
  { 
    id: 'Abdurrahmaan_As-Sudais_192kbps',
    name: 'Abdurrahman As-Sudais',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Abu_Bakr_Ash-Shaatree_128kbps',
    name: 'Abu Bakr Al-Shatri',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
    name: 'Ahmed Al-Ajamy',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Ghamadi_40kbps',
    name: 'Saad Al-Ghamadi',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Husary_128kbps',
    name: 'Mahmoud Khalil Al-Husary',
    country: 'Mısır'
  },
  { 
    id: 'Maher_AlMuaiqly_128kbps',
    name: 'Maher Al-Muaiqly',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Muhammad_Ayyoub_128kbps',
    name: 'Muhammad Ayyub',
    country: 'Suudi Arabistan'
  },
  { 
    id: 'Parhizgar_48kbps',
    name: 'Shahriar Parhizgar',
    country: 'İran'
  }
];

// Arapça font seçenekleri
export const arabicFonts = [
  { 
    id: 'amiri', 
    name: 'Amiri',
    description: 'Klasik ve Zarif',
    family: "'Amiri', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'scheherazade', 
    name: 'Scheherazade New',
    description: 'Geleneksel Naskh',
    family: "'Scheherazade New', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'lateef', 
    name: 'Lateef',
    description: 'Modern ve Net',
    family: "'Lateef', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'harmattan', 
    name: 'Harmattan',
    description: 'Temiz ve Okunaklı',
    family: "'Harmattan', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  },
  { 
    id: 'aref', 
    name: 'Aref Ruqaa',
    description: 'Ruqaa Stili',
    family: "'Aref Ruqaa', 'Traditional Arabic', serif",
    preview: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  }
];

// Ayarları al
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? { ...getDefaultSettings(), ...JSON.parse(settings) } : getDefaultSettings();
  } catch (error) {
    console.error('Ayarlar yüklenirken hata:', error);
    return getDefaultSettings();
  }
};

// Ayarları kaydet
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ayarlar kaydedilirken hata:', error);
    return false;
  }
};

// Tek bir ayarı güncelle
export const updateSetting = (key, value) => {
  const settings = getSettings();
  settings[key] = value;
  return saveSettings(settings);
};

// Belirli bir ayarı al
export const getSetting = (key) => {
  const settings = getSettings();
  return settings[key];
};

// Ayarları sıfırla
export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
  return getDefaultSettings();
};

// Kari bilgisini al
export const getReciterInfo = (reciterId) => {
  return reciters.find(r => r.id === reciterId) || reciters[0];
};

// Meal bilgisini al
export const getTranslationInfo = (translationId) => {
  return translations.find(t => t.id === translationId) || translations[0];
};

// Arapça font bilgisini al
export const getArabicFontInfo = (fontId) => {
  return arabicFonts.find(f => f.id === fontId) || arabicFonts[0];
};

// Arapça font family'yi al
export const getArabicFontFamily = (fontId) => {
  const font = getArabicFontInfo(fontId);
  return font.family;
};