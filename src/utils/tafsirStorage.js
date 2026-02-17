// src/utils/tafsirStorage.js - Kesin Çözüm (JSON Path Fix)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 1;
const STORE_NAME = 'tafsirFiles';

// Quran.com API v4 - Doğrulanmış Türkçe Kaynaklar
export const tafsirs = [
  { id: 'tr.tafheem', resourceId: 169, name: 'Mevdudi (Tefhimu\'l Kur\'an)', author: 'Mevdudi' },
  { id: 'tr.ibnkesir', resourceId: 170, name: 'İbn Kesir Tefsiri', author: 'İbn Kesir' },
  { id: 'tr.diyanet', resourceId: 160, name: 'Diyanet Tefsiri', author: 'Diyanet İşleri Bşk.' },
  { id: 'tr.elmalili', resourceId: 162, name: 'Elmalılı Hamdi Yazır', author: 'Elmalılı' }
];

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
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

// En Kararlı API Çekme Fonksiyonu
const fetchTafsirFromAPI = async (surahNumber, ayahNumber, resourceId) => {
  try {
    // verse_key formatı: 1:1, 2:255 vb.
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const url = `https://api.quran.com/api/v4/verses/by_key/${verseKey}?tafsirs=${resourceId}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    // API v4 by_key cevabı içindeki metni bul (Çok katmanlı kontrol)
    return data.verse?.tafsirs?.[0]?.text ||
           data.tafsirs?.[0]?.text ||
           data.tafsir?.text || null;

  } catch (e) {
    console.error("Tefsir API Hatası:", e);
    return null;
  }
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  const tafsirInfo = tafsirs.find(t => t.id === tafsirId) || tafsirs[0];
  const text = await fetchTafsirFromAPI(surahNumber, ayahNumber, tafsirInfo.resourceId);

  if (text) {
    await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, text);
    return text;
  }

  return 'Tefsir metni yüklenemedi. Lütfen Mevdudi veya İbn Kesir seçeneklerini de deneyin.';
};

export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  const tafsirInfo = tafsirs.find(t => t.id === tafsirId);
  if (!tafsirInfo) return false;
  for (let i = 1; i <= totalAyahs; i++) {
    const text = await fetchTafsirFromAPI(surahNumber, i, tafsirInfo.resourceId);
    if (text) await saveTafsirOffline(surahNumber, i, tafsirId, text);
    if (onProgress) onProgress(Math.round((i / totalAyahs) * 100));
  }
  return true;
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
