// src/utils/tafsirStorage.js - Quran.com API v4 (En Kararlı ve Test Edilmiş Versiyon)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 11; // Versiyon artırıldı - hatalı verileri temizler
const STORE_NAME = 'tafsirFiles';

// Quran.com API v4 Türkiye İçin En Sağlam Kaynak ID'leri
export const tafsirs = [
  { id: '156', name: 'Diyanet İşleri (Yeni)', author: 'Diyanet' },
  { id: '167', name: 'Elmalılı (Sadeleştirilmiş)', author: 'Elmalılı' },
  { id: '169', name: 'Fizilal-il-Kur\'an', author: 'Seyyid Kutub' },
  { id: '165', name: 'İbni Kesir', author: 'İbni Kesir' }
];

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
  });
};

const makeKey = (tafsirId, surahNumber, ayahNumber) => `${tafsirId}:${surahNumber}-${ayahNumber}`;

export const getOfflineTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surahNumber, ayahNumber);
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.text || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) { return null; }
};

export const saveTafsirOffline = async (surahNumber, ayahNumber, tafsirId, text) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surahNumber, ayahNumber);
    await store.put({
      id: key,
      tafsirId,
      surahNumber: parseInt(surahNumber),
      ayahNumber: parseInt(ayahNumber),
      text,
      savedAt: new Date().toISOString()
    });
    return true;
  } catch (error) { return false; }
};

/**
 * Tefsiri getirir. En sağlam Quran.com endpoint'ini kullanır.
 */
export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  // 1. Önce çevrimdışı kontrol
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  // 2. API'den çek (En kararlı v4 endpoint'i)
  try {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    // RESMİ ENDPOINT: /quran/tafsirs/{id}?verse_key={key}
    const url = `https://api.quran.com/api/v4/quran/tafsirs/${tafsirId}?verse_key=${verseKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Yanıt Vermedi');
    
    const data = await res.json();

    // API yanıtında tefsir metni ya "tafsirs" dizisinde ya da "tafsir" objesinde gelir
    let content = null;
    if (data.tafsirs && data.tafsirs.length > 0) {
      content = data.tafsirs[0].text;
    } else if (data.tafsir) {
      content = data.tafsir.text;
    }

    if (content) {
      await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, content);
      return content;
    }
  } catch (e) {
    console.error("Tefsir Hatası:", e);
  }

  return 'Tefsir şu an yüklenemedi. Lütfen internetinizi kontrol edin veya listeden başka bir tefsir kaynağı seçin.';
};

export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  let successCount = 0;
  for (let i = 1; i <= totalAyahs; i++) {
    const text = await fetchTafsir(surahNumber, i, tafsirId);
    if (text && !text.includes('yüklenemedi')) {
      successCount++;
    }
    if (onProgress) onProgress(Math.round((i / totalAyahs) * 100));
  }
  return successCount > 0;
};

export const getDownloadedTafsirs = async (tafsirId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const surahMap = {};
        request.result.forEach(item => {
          if (!tafsirId || item.tafsirId === tafsirId) {
            if (!surahMap[item.surahNumber]) surahMap[item.surahNumber] = [];
            surahMap[item.surahNumber].push(item.ayahNumber);
          }
        });
        resolve(surahMap);
      };
      request.onerror = () => resolve({});
    });
  } catch (error) { return {}; }
};

export const deleteSurahTafsir = async (surahNumber, tafsirId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const allRequest = store.getAll();
    await new Promise((resolve) => {
      allRequest.onsuccess = () => {
        allRequest.result
          .filter(item => item.surahNumber === parseInt(surahNumber) && (!tafsirId || item.tafsirId === tafsirId))
          .forEach(item => store.delete(item.id));
        resolve();
      };
      allRequest.onerror = () => resolve();
    });
    return true;
  } catch (error) { return false; }
};
