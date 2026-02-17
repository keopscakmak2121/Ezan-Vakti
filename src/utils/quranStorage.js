const DB_NAME = 'quranTextDB';
const DB_VERSION = 2; // Versiyonu yükselttik (Tecvidli metin ekledik)
const STORE_NAME = 'textFiles';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'surahNumber' });
      }
    };
  });
};

// Sure metnini (Normal + Tecvidli) ve mealini indirip kaydeder
export const downloadSurahText = async (surahNumber, translationId = 'tr.diyanet') => {
  try {
    // 1. Normal metin ve Meal
    const resSimple = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,${translationId}`);
    const dataSimple = await resSimple.json();

    // 2. Tecvidli metin (Quran.com API)
    const resTajweed = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surahNumber}`);
    const dataTajweed = await resTajweed.json();

    if (dataSimple.code === 200 && dataTajweed.verses) {
      const surahData = {
        surahNumber: parseInt(surahNumber),
        arabic: dataSimple.data[0].ayahs,
        translation: dataSimple.data[1].ayahs,
        tajweed: dataTajweed.verses, // Tecvidli metinler
        downloadedAt: new Date().toISOString()
      };

      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise((resolve, reject) => {
        const req = store.put(surahData);
        req.onsuccess = resolve;
        req.onerror = () => reject(req.error);
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error(`Sure ${surahNumber} indirilirken hata:`, error);
    return false;
  }
};

// İndirilmiş sureyi getirir
export const getSurahText = async (surahNumber) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.get(parseInt(surahNumber));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    return null;
  }
};

export const isSurahDownloaded = async (surahNumber) => {
  const surah = await getSurahText(surahNumber);
  return !!surah;
};

export const getDownloadedSurahsList = async () => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        return new Promise((resolve) => {
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch (e) {
        return [];
    }
};

export const deleteSurahText = async (surahNumber) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
        const req = store.delete(parseInt(surahNumber));
        req.onsuccess = resolve;
        req.onerror = reject;
    });
    return true;
  } catch (error) {
      return false;
  }
};

export const deleteAllSurahTexts = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    return true;
  } catch (error) {
    return false;
  }
};
