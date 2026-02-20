// src/utils/tafsirStorage.js - Diyanet Kur'an Yolu Tefsiri (TÜRKÇE)

const DB_NAME = 'quranTafsirDB';
const DB_VERSION = 16;
const STORE_NAME = 'tafsirFiles';

// Sure ayet sayıları (Fatiha=7, Bakara=286, ...)
const SURAH_AYAH_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,
  89,59,37,35,38,88,52,45,30,49,49,46,29,31,34,53,46,25,34,54,73,19,11,
  110,46,73,69,44,55,13,37,43,49,39,57,34,34,28,30,31,43,39,29,45,33,34,
  30,30,42,26,29,37,18,10,28,18,20,15,21,11,8,5,8,8,19,5,8,5,6,3
];

// Sure isimleri (Diyanet URL formatında)
const SURAH_NAMES_URL = [
  "Fatiha","Bakara","Al-i-Imran","Nisa","Maide","Enam","Araf","Enfal","Tevbe","Yunus",
  "Hud","Yusuf","Rad","Ibrahim","Hicr","Nahl","Isra","Kehf","Meryem","Taha",
  "Enbiya","Hac","Muminun","Nur","Furkan","Suara","Neml","Kasas","Ankebut","Rum",
  "Lokman","Secde","Ahzab","Sebe","Fatir","Yasin","Saffat","Sad","Zumer","Mumin",
  "Fussilet","Sura","Zuhruf","Duhan","Casiye","Ahkaf","Muhammed","Fetih","Hucurat","Kaf",
  "Zariyat","Tur","Necm","Kamer","Rahman","Vakia","Hadid","Mucadele","Hasr","Mumtehine",
  "Saf","Cuma","Munafikun","Tegabun","Talak","Tahrim","Mulk","Kalem","Hakka","Mearic",
  "Nuh","Cin","Muzzemmil","Muddessir","Kiyame","Insan","Murselat","Nebe","Naziat","Abese",
  "Tekvir","Infitar","Mutaffifin","Insikak","Buruc","Tarik","Ala","Gasiye","Fecr","Beled",
  "Sems","Leyl","Duha","Insirah","Tin","Alak","Kadr","Beyyine","Zilzal","Adiyat",
  "Karia","Tekasur","Asr","Humeze","Fil","Kureys","Maun","Kevser","Kafirun","Nasr",
  "Tebbet","Ihlas","Felak","Nas"
];

export const tafsirs = [
  {
    id: 'diyanet-kuran-yolu',
    name: "Kur'an Yolu Tefsiri (Diyanet)",
    author: 'Diyanet İşleri Başkanlığı',
    language: 'tr'
  }
];

// Global ayet ID hesapla (Diyanet URL'lerinde kullanılır)
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
  // <h2>Tefsir</h2> bölümünden sonrasını al
  const tefsirMatch = html.match(/<h2[^>]*>\s*Tefsir\s*<\/h2>([\s\S]*?)(?=<h3|<div class|<footer|Kaynak:|$)/i);
  if (tefsirMatch) {
    let text = tefsirMatch[1];
    // HTML tag'lerini temizle ama paragrafları koru
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }
  
  // Alternatif: Meal ve Tefsir arasını dene
  const altMatch = html.match(/Tefsir[\s\S]*?<\/h2>([\s\S]*?)(?:Kaynak|<footer|<div class="ayetler")/i);
  if (altMatch) {
    let text = altMatch[1];
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&[a-z]+;/gi, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }
  
  return null;
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirId) => {
  // 1. Önce çevrimdışı bak
  const offlineText = await getOfflineTafsir(surahNumber, ayahNumber, tafsirId);
  if (offlineText) return offlineText;

  // 2. Diyanet sitesinden çek
  try {
    const globalId = getGlobalAyahId(surahNumber, ayahNumber);
    const surahName = SURAH_NAMES_URL[surahNumber - 1] || 'Fatiha';
    const url = `https://kuran.diyanet.gov.tr/tefsir/${surahName}-suresi/${globalId}/${ayahNumber}-ayet-tefsiri`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Diyanet API hatası: ' + res.status);
    
    const html = await res.text();
    const tafsirText = extractTafsirFromHTML(html);
    
    if (tafsirText && tafsirText.length > 20) {
      await saveTafsirOffline(surahNumber, ayahNumber, tafsirId, tafsirText);
      return tafsirText;
    }
  } catch (e) {
    console.error("Diyanet tefsir hatası:", e);
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
