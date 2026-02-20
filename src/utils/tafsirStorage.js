// src/utils/tafsirStorage.js - Quran.com API v4 (Türkçe tefsir destekli)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 15;
const STORE_NAME = 'tafsirFiles';

// Quran.com API v4 üzerindeki tefsirler
export const tafsirs = [
  {
    id: 'qurancom-ibn-kathir',
    name: 'İbn Kesir Tefsiri (İngilizce)',
    author: 'Hafız İbn Kesir',
    apiId: 169,
    language: 'en'
  },
  {
    id: 'qurancom-muyassar',
    name: 'Tefsir Müyesser (Arapça)',
    author: 'Kral Fahd Kompleksi',
    apiId: 16,
    language: 'ar'
  },
  {
    id: 'qurancom-jalalayn',
    name: 'Celaleyn Tefsiri (İngilizce)',
    author: 'Celaleyn',
    apiId: 74,
    language: 'en'
  },
  {
    id: 'qurancom-saddi',
    name: 'Saddi Tefsiri (Arapça)',
    author: 'Saddi',
    apiId: 91,
    language: 'ar'
  }
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

const makeKey = (tafsirId, surah, ayah) => `${tafsirId}:${surah}-${ayah}`;

export const getOfflineTafsir = async (surah, ayah, tafsirId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surah, ayah);
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.text || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
};

export const saveTafsirOffline = async (surah, ayah, tafsirId, text) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surah, ayah);
    await store.put({ id: key, tafsirId, surahNumber: surah, ayahNumber: ayah, text, savedAt: new Date().toISOString() });
    return true;
  } catch (e) { return false; }
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  // 1. Önce çevrimdışı bak
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  const tafsirInfo = tafsirs.find(t => t.id === tafsirId);
  if (!tafsirInfo) return 'Tefsir bulunamadı.';

  // 2. Quran.com API v4
  try {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const url = `https://api.quran.com/api/v4/tafsirs/${tafsirInfo.apiId}/by_ayah/${verseKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('API hatası: ' + res.status);
    
    const data = await res.json();
    const tafsirData = data.tafsir;

    if (tafsirData && tafsirData.text) {
      const content = tafsirData.text;
      await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, content);
      return content;
    }
  } catch (e) {
    console.error("Quran.com API tefsir hatası:", e);
  }

  // 3. Fallback: cdn.jsdelivr.net spa5k API
  try {
    const fallbackSlug = tafsirInfo.language === 'ar' ? 'ar-tafsir-muyassar' : 'en-tafisr-ibn-kathir';
    const fallbackUrl = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${fallbackSlug}/${surahNumber}/${ayahNumber}.json`;
    
    const res2 = await fetch(fallbackUrl);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.text) {
        await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, data2.text);
        return data2.text;
      }
    }
  } catch (e2) {
    console.error("Fallback tefsir hatası:", e2);
  }

  return 'Tefsir yüklenemedi. Lütfen internet bağlantınızı kontrol edin.';
};

export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  let successCount = 0;
  for (let i = 1; i <= totalAyahs; i++) {
    const text = await fetchTafsir(surahNumber, i, tafsirId);
    if (text && !text.includes('yüklenemedi')) successCount++;
    if (onProgress) onProgress(Math.round((i / totalAyahs) * 100));
    await new Promise(r => setTimeout(r, 200));
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
          if (item.tafsirId === tafsirId) {
            if (!surahMap[item.surahNumber]) surahMap[item.surahNumber] = [];
            surahMap[item.surahNumber].push(item.ayahNumber);
          }
        });
        resolve(surahMap);
      };
      request.onerror = () => resolve({});
    });
  } catch (e) { return {}; }
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
          .filter(item => item.tafsirId === tafsirId && item.surahNumber === parseInt(surahNumber))
          .forEach(item => store.delete(item.id));
        resolve();
      };
      allRequest.onerror = () => resolve();
    });
    return true;
  } catch (e) { return false; }
};
