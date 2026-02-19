// src/utils/tafsirStorage.js - spa5k/tafsir_api (RAW GITHUB URL - En Kararlı)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 14; // Versiyonu artırarak eski hatalı verileri siliyoruz
const STORE_NAME = 'tafsirFiles';

// GitHub (spa5k/tafsir_api) üzerindeki Türkçe tefsir yolları
export const tafsirs = [
  {
    id: 'tr-tafsir-elmalili-hamdi-yazir',
    name: 'Elmalılı Hamdi Yazır',
    author: 'Elmalılı'
  },
  {
    id: 'tr-tafsir-diyanet-isleri-baskanligi',
    name: 'Diyanet İşleri',
    author: 'Diyanet'
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

  // 2. RAW GITHUB URL üzerinden çek (Daha Güvenilir)
  try {
    const url = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${tafsirId}/${surahNumber}/${ayahNumber}.json`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Dosya bulunamadı veya ağ hatası');
    
    const data = await res.json();
    const content = data.text;

    if (content) {
      await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, content);
      return content;
    }
  } catch (e) {
    console.error("Tefsir çekme hatası:", e);
  }

  return 'Tefsir yüklenemedi. Lütfen internetinizi kontrol edin.';
};

// İndirme ve diğer yardımcı fonksiyonlar aynı kalabilir
export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  let successCount = 0;
  for (let i = 1; i <= totalAyahs; i++) {
    const text = await fetchTafsir(surahNumber, i, tafsirId);
    if (text && !text.includes('yüklenemedi')) successCount++;
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
