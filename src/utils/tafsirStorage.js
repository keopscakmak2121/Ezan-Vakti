// src/utils/tafsirStorage.js - Kuran Gen Tr & Global Quran Entegrasyonu (Kesin Çözüm)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 5; // Versiyon yükseltildi: Tüm hatalı/Arapça kayıtları temizlemek için
const STORE_NAME = 'tafsirFiles';

/**
 * GÜVENİLİR TÜRKÇE KAYNAKLAR (Kuran Gen Tr & Global Quran Standartları)
 */
export const tafsirs = [
  { id: 'tr.kuran_gen_tr', name: 'Kuran Gen Tr Tefsiri', author: 'Kuran Gen Tr', slug: 'tr.kuran_gen_tr' },
  { id: 'tr.elmalili', name: 'Elmalılı Hamdi Yazır', author: 'Elmalılı', slug: 'tr.elmalili' },
  { id: 'tr.diyanet', name: 'Diyanet Tefsiri', author: 'Diyanet', slug: 'tr.diyanet' },
  { id: 'tr.bilmen', name: 'Ömer Nasuhi Bilmen', author: 'Ö.N. Bilmen', slug: 'tr.bilmen' }
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
 * Global Quran ve Kuran Gen Tr GitHub verilerinden tefsiri çeker.
 */
const fetchAndCacheTafsir = async (surahNumber, tafsirId) => {
  const tafsirInfo = tafsirs.find(t => t.id === tafsirId);
  if (!tafsirInfo) return null;

  // Global Quran GitHub veri yapısı: https://raw.githubusercontent.com/GlobalQuran/quran-data/master/{source_id}/{surah_number}.json
  const url = `https://raw.githubusercontent.com/GlobalQuran/quran-data/master/${tafsirInfo.slug}/${surahNumber}.json`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      // Global Quran JSON formatında veriler genelde { "1": { "ayah": 1, "text": "..." }, ... } şeklindedir
      const ayahs = data.ayahs || data;

      const savedData = [];
      Object.entries(ayahs).forEach(([key, val]) => {
        const ayahNum = val.ayah || key;
        const text = val.text || val;
        if (text && typeof text === 'string') {
          saveTafsirOffline(surahNumber, ayahNum, tafsirId, text);
          savedData.push({ ayah: parseInt(ayahNum), text });
        }
      });
      return savedData;
    }
  } catch (e) {
    console.error("GitHub Veri Çekme Hatası:", e);
  }

  // YEDEK: Eğer GitHub'da o slug yoksa Quran.com API'den çekmeyi dene (Sadece Türkçe Garantili ID'ler ile)
  try {
    const resourceMap = { 'tr.elmalili': 162, 'tr.diyanet': 160, 'tr.bilmen': 163, 'tr.kuran_gen_tr': 162 };
    const resourceId = resourceMap[tafsirId] || 162;
    const res = await fetch(`https://api.quran.com/api/v4/quran/tafsirs/${resourceId}?verse_key=${surahNumber}:1`);
    const data = await res.json();
    const text = data.tafsirs?.[0]?.text;
    if (text) {
      await saveTafsirOffline(surahNumber, 1, tafsirId, text);
      return [{ ayah: 1, text }];
    }
  } catch(e) {}

  return null;
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  // 1. Önce çevrimdışı bak
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  // 2. Yoksa tüm sureyi indir ve kaydet
  const data = await fetchAndCacheTafsir(surahNumber, tafsirId);
  if (data) {
    const target = data.find(a => a.ayah === parseInt(ayahNumber));
    if (target) return target.text;
  }

  return 'Tefsir metni şu an bu kaynakta bulunamadı. <br/><br/><b>Not:</b> Lütfen "Kuran Gen Tr" veya "Elmalılı" tefsirlerini deneyin. İnternet bağlantınızı kontrol edin.';
};

export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  const data = await fetchAndCacheTafsir(surahNumber, tafsirId);
  if (onProgress) onProgress(100);
  return !!data;
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
