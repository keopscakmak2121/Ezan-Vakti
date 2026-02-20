// src/utils/tafsirStorage.js - Diyanet Kur'an Yolu Tefsiri (TÜRKÇE)
// CapacitorHttp ile CORS sorunu aşılıyor

import { CapacitorHttp } from '@capacitor/core';

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 17;
const STORE_NAME = 'tafsirFiles';

// Sure ayet sayıları
const SURAH_AYAH_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,
  89,59,37,35,38,88,52,45,30,49,49,46,29,31,34,53,46,25,34,54,73,19,11,
  110,46,73,69,44,55,13,37,43,49,39,57,34,34,28,30,31,43,39,29,45,33,34,
  30,30,42,26,29,37,18,10,28,18,20,15,21,11,8,5,8,8,19,5,8,5,6,3
];

export const tafsirs = [
  {
    id: 'diyanet-kuran-yolu',
    name: "Kur'an Yolu Tefsiri (Diyanet)",
    author: 'Diyanet İşleri Başkanlığı',
    language: 'tr'
  }
];

// Global ayet ID hesapla
const getGlobalAyahId = (surahNumber, ayahNumber) => {
  let id = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    id += SURAH_AYAH_COUNTS[i];
  }
  return id + ayahNumber;
};

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
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surah, ayah);
    return new Promise((resolve) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.text || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
};

export const saveTafsirOffline = async (surah, ayah, tafsirId, text) => {
  try {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = makeKey(tafsirId, surah, ayah);
    store.put({ id: key, tafsirId, surahNumber: surah, ayahNumber: ayah, text, savedAt: new Date().toISOString() });
    return true;
  } catch (e) { return false; }
};

// HTML'den tefsir metnini çıkar
const extractTafsirFromHTML = (html) => {
  // Tefsir bölümünü bul (birden fazla pattern dene)
  const patterns = [
    /## Tefsir\s*\n([\s\S]*?)(?:\*\*\*Kaynak|### Ayetler|$)/,
    /<h2[^>]*>\s*Tefsir\s*<\/h2>([\s\S]*?)(?:<div class="ayetler"|Kaynak:|<footer|<h3|$)/i,
    /Tefsir<\/h2>([\s\S]*?)(?:Kaynak|class="ayetler"|<footer)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let text = match[1];
      
      // HTML/Markdown temizle
      text = text.replace(/<\/p>/gi, '\n\n');
      text = text.replace(/<br\s*\/?>/gi, '\n');
      text = text.replace(/<[^>]+>/g, '');
      text = text.replace(/\*{1,3}/g, '');
      text = text.replace(/#{1,6}\s*/g, '');
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&#39;/g, "'");
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/\\N/g, '');
      text = text.replace(/\n{3,}/g, '\n\n');
      text = text.trim();
      
      if (text.length > 30) return text;
    }
  }
  
  return null;
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  // 1. Önce çevrimdışı bak
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  // 2. Diyanet URL oluştur
  // Not: Sure ismi kısmı önemsiz, Diyanet global ayet ID'ye göre yönlendiriyor
  const globalId = getGlobalAyahId(surahNumber, ayahNumber);
  const url = `https://kuran.diyanet.gov.tr/tefsir/sure-suresi/${globalId}/${ayahNumber}-ayet-tefsiri`;

  console.log('Tefsir URL:', url, '(sure:', surahNumber, 'ayet:', ayahNumber, ')');

  // 3. CapacitorHttp (native, CORS yok)
  try {
    const response = await CapacitorHttp.get({
      url: url,
      headers: { 'Accept': 'text/html,application/xhtml+xml' }
    });
    
    if (response.status === 200 && response.data) {
      const tafsirText = extractTafsirFromHTML(response.data);
      if (tafsirText) {
        await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, tafsirText);
        return tafsirText;
      }
    }
  } catch (e) {
    console.error('CapacitorHttp tefsir hatası:', e);
  }

  // 4. Fallback: Normal fetch (tarayıcıda test için)
  try {
    const res = await fetch(url);
    if (res.ok) {
      const html = await res.text();
      const tafsirText = extractTafsirFromHTML(html);
      if (tafsirText) {
        await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, tafsirText);
        return tafsirText;
      }
    }
  } catch (e) {
    console.error('Fetch tefsir hatası:', e);
  }

  return 'Tefsir yüklenemedi. Lütfen internet bağlantınızı kontrol edin.';
};

export const downloadSurahTafsir = async (surahNumber, totalAyahs, tafsirId, onProgress) => {
  let successCount = 0;
  for (let i = 1; i <= totalAyahs; i++) {
    const text = await fetchTafsir(surahNumber, i, tafsirId);
    if (text && !text.includes('yüklenemedi')) successCount++;
    if (onProgress) onProgress(Math.round((i / totalAyahs) * 100));
    await new Promise(r => setTimeout(r, 300));
  }
  return successCount > 0;
};

export const getDownloadedTafsirs = async (tafsirId) => {
  try {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const surahMap = {};
        req.result.forEach(item => {
          if (item.tafsirId === tafsirId) {
            if (!surahMap[item.surahNumber]) surahMap[item.surahNumber] = [];
            surahMap[item.surahNumber].push(item.ayahNumber);
          }
        });
        resolve(surahMap);
      };
      req.onerror = () => resolve({});
    });
  } catch (e) { return {}; }
};

export const deleteSurahTafsir = async (surahNumber, tafsirId) => {
  try {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const allReq = store.getAll();
    await new Promise((resolve) => {
      allReq.onsuccess = () => {
        allReq.result
          .filter(item => item.tafsirId === tafsirId && item.surahNumber === parseInt(surahNumber))
          .forEach(item => store.delete(item.id));
        resolve();
      };
      allReq.onerror = () => resolve();
    });
    return true;
  } catch (e) { return false; }
};
