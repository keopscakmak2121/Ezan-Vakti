// src/utils/tafsirStorage.js

const TAFSIR_CACHE_KEY = 'quran_tafsir_cache';

// MEAL VE TEFSİR KAYNAKLARI (GENİŞLETİLMİŞ)
export const tafsirs = [
  // TÜRKÇE TEFSİRLER
  { 
    id: 'tr.muyassar', 
    name: 'Muyassar Tefsiri',
    author: 'Türkiye Diyanet Vakfı',
    language: 'tr',
    type: 'tafsir'
  },
  { 
    id: 'tr.tafheem', 
    name: 'Tafhim-ul-Quran',
    author: 'Ebu\'l A\'la Mevdudi (Türkçe)',
    language: 'tr',
    type: 'tafsir'
  },
  
  // İNGİLİZCE TEFSİRLER
  { 
    id: 'en.maududi', 
    name: 'Tafhim-ul-Quran',
    author: 'Abul Ala Maududi',
    language: 'en',
    type: 'tafsir'
  },
  { 
    id: 'en.jalalayn', 
    name: 'Tafsir al-Jalalayn',
    author: 'Jalal ad-Din al-Mahalli',
    language: 'en',
    type: 'tafsir'
  },
  
  // ARAPÇA TEFSİRLER
  { 
    id: 'ar.muyassar', 
    name: 'Tafsir Al-Muyassar',
    author: 'King Fahad Quran Complex',
    language: 'ar',
    type: 'tafsir'
  },
  { 
    id: 'ar.jalalayn', 
    name: 'Tafsir Al-Jalalayn',
    author: 'Jalal ad-Din as-Suyuti',
    language: 'ar',
    type: 'tafsir'
  }
];

// MEAL LİSTESİ (AYRI)
export const meals = [
  // TÜRKÇE MEALLER
  { 
    id: 'tr.diyanet', 
    name: 'Diyanet Meali',
    author: 'Diyanet İşleri Başkanlığı',
    language: 'tr',
    type: 'meal'
  },
  { 
    id: 'tr.ates', 
    name: 'Süleyman Ateş Meali',
    author: 'Süleyman Ateş',
    language: 'tr',
    type: 'meal'
  },
  { 
    id: 'tr.golpinarli', 
    name: 'Abdülbaki Gölpınarlı Meali',
    author: 'Abdülbaki Gölpınarlı',
    language: 'tr',
    type: 'meal'
  },
  { 
    id: 'tr.yuksel', 
    name: 'Edip Yüksel Meali',
    author: 'Edip Yüksel',
    language: 'tr',
    type: 'meal'
  },
  { 
    id: 'tr.bulac', 
    name: 'Mehmet Türkçe Meal',
    author: 'Mehmet Türkçe',
    language: 'tr',
    type: 'meal'
  },
  { 
    id: 'tr.vakfi', 
    name: 'Diyanet Vakfı Meali',
    author: 'Diyanet Vakfı',
    language: 'tr',
    type: 'meal'
  },
  
  // İNGİLİZCE MEALLER
  { 
    id: 'en.sahih', 
    name: 'Sahih International',
    author: 'Sahih International',
    language: 'en',
    type: 'meal'
  },
  { 
    id: 'en.yusufali', 
    name: 'Yusuf Ali Translation',
    author: 'Abdullah Yusuf Ali',
    language: 'en',
    type: 'meal'
  },
  { 
    id: 'en.pickthall', 
    name: 'Pickthall Translation',
    author: 'Mohammed Pickthall',
    language: 'en',
    type: 'meal'
  },
  { 
    id: 'en.hilali', 
    name: 'Hilali & Khan',
    author: 'Muhammad Muhsin Khan',
    language: 'en',
    type: 'meal'
  }
];

// Dil ve tipe göre filtrele
export const getTafsirsByLanguage = (language) => {
  return tafsirs.filter(t => t.language === language);
};

export const getTafsirsByType = (type) => {
  return tafsirs.filter(t => t.type === type);
};

// Tefsir cache'inden al
export const getCachedTafsir = (surahNumber, ayahNumber, tafsirId) => {
  try {
    const cache = localStorage.getItem(TAFSIR_CACHE_KEY);
    if (!cache) return null;
    
    const cacheData = JSON.parse(cache);
    const key = `${surahNumber}-${ayahNumber}-${tafsirId}`;
    
    return cacheData[key] || null;
  } catch (error) {
    console.error('Tefsir cache okuma hatası:', error);
    return null;
  }
};

// Tefsir'i cache'e kaydet
export const cacheTafsir = (surahNumber, ayahNumber, tafsirId, tafsirText) => {
  try {
    let cache = {};
    const existingCache = localStorage.getItem(TAFSIR_CACHE_KEY);
    
    if (existingCache) {
      cache = JSON.parse(existingCache);
    }
    
    const key = `${surahNumber}-${ayahNumber}-${tafsirId}`;
    cache[key] = {
      text: tafsirText,
      cachedAt: new Date().toISOString()
    };
    
    // Cache boyutunu kontrol et (max 100 tefsir)
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      // En eski 20 tanesini sil
      const sortedKeys = keys
        .map(k => ({ key: k, date: cache[k].cachedAt }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 20)
        .map(item => item.key);
      
      sortedKeys.forEach(k => delete cache[k]);
    }
    
    localStorage.setItem(TAFSIR_CACHE_KEY, JSON.stringify(cache));
    return true;
  } catch (error) {
    console.error('Tefsir cache kaydetme hatası:', error);
    return false;
  }
};

// API'den tefsir al
export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId = 'tr.ozturk') => {
  try {
    // Önce cache'e bak
    const cached = getCachedTafsir(surahNumber, ayahNumber, tafsirId);
    if (cached) {
      return cached.text;
    }
    
    // Quran.com API kullan (daha fazla tefsir var)
    // Resource ID'leri: 161 (Muyassar-TR), 169 (Tafheem-TR), vs.
    
    const resourceMap = {
      'tr.muyassar': 161,  // Muyassar Tefsiri (Türkçe)
      'tr.tafheem': 169,   // Tafheem-ul-Quran (Türkçe)
      'en.maududi': 95,    // Tafhim-ul-Quran (English)
      'en.jalalayn': 93,   // Tafsir al-Jalalayn
      'ar.muyassar': 168,  // Tafsir Al-Muyassar (Arabic)
      'ar.jalalayn': 74    // Tafsir al-Jalalayn (Arabic)
    };
    
    const resourceId = resourceMap[tafsirId] || 161;
    
    const response = await fetch(
      `https://api.quran.com/api/v4/quran/tafsirs/${resourceId}?verse_key=${surahNumber}:${ayahNumber}`
    );
    
    if (!response.ok) {
      throw new Error('Tefsir yüklenemedi');
    }
    
    const data = await response.json();
    
    if (data && data.tafsirs && data.tafsirs[0]) {
      const tafsirText = data.tafsirs[0].text;
      
      // Cache'e kaydet
      cacheTafsir(surahNumber, ayahNumber, tafsirId, tafsirText);
      
      return tafsirText;
    }
    
    return 'Tefsir bulunamadı.';
  } catch (error) {
    console.error('Tefsir yükleme hatası:', error);
    throw error;
  }
};

// Cache'i temizle
export const clearTafsirCache = () => {
  try {
    localStorage.removeItem(TAFSIR_CACHE_KEY);
    return true;
  } catch (error) {
    console.error('Tefsir cache temizleme hatası:', error);
    return false;
  }
};

// Cache boyutunu al
export const getTafsirCacheSize = () => {
  try {
    const cache = localStorage.getItem(TAFSIR_CACHE_KEY);
    if (!cache) return 0;
    
    const cacheData = JSON.parse(cache);
    return Object.keys(cacheData).length;
  } catch (error) {
    return 0;
  }
};

// Tefsir bilgisini al
export const getTafsirInfo = (tafsirId) => {
  return tafsirs.find(t => t.id === tafsirId) || tafsirs[0];
};