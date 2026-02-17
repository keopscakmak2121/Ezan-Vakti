// src/utils/audioStorage.js - Kari bazlı ses depolama

const DB_NAME = 'QuranAudioDB';
const DB_VERSION = 2;
const STORE_NAME = 'audioFiles';

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
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('surahNumber', 'surahNumber', { unique: false });
      store.createIndex('reciter', 'reciter', { unique: false });
    };
  });
};

const makeKey = (reciter, surahNumber, ayahNumber) => `${reciter}:${surahNumber}-${ayahNumber}`;

export const downloadAudio = async (surahNumber, ayahNumber, onProgress, reciter = 'Alafasy_128kbps') => {
  try {
    const url = `https://everyayah.com/data/${reciter}/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('İndirme başarısız');

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (onProgress && total) onProgress(Math.round((loaded / total) * 100));
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const audioData = {
      id: makeKey(reciter, surahNumber, ayahNumber),
      surahNumber,
      ayahNumber,
      reciter,
      blob,
      downloadDate: new Date().toISOString()
    };

    await new Promise((resolve, reject) => {
      const req = store.put(audioData);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return audioData;
  } catch (error) {
    console.error('❌ SES İNDİRME HATASI:', error);
    throw error;
  }
};

export const downloadSurah = async (surahNumber, totalAyahs, onProgress, reciter = 'Alafasy_128kbps') => {
  const results = [];
  for (let i = 1; i <= totalAyahs; i++) {
    try {
      await downloadAudio(surahNumber, i, (progress) => {
        const overallProgress = Math.round(((i - 1) / totalAyahs * 100) + (progress / totalAyahs));
        if (onProgress) onProgress(overallProgress, i, totalAyahs);
      }, reciter);
      results.push({ ayah: i, success: true });
    } catch (error) {
      results.push({ ayah: i, success: false, error });
    }
  }
  return results;
};

export const getAudio = async (surahNumber, ayahNumber, reciter) => {
  if (!reciter) return null;
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.get(makeKey(reciter, surahNumber, ayahNumber));
      request.onsuccess = () => {
        if (request.result) {
          resolve(URL.createObjectURL(request.result.blob));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    return null;
  }
};

// Belirli bir hafız için indirilenleri getir
export const getDownloadedSurahs = async (currentReciter) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const surahMap = {};
        request.result.forEach(audio => {
          // Sadece seçili hafızın dosyalarını say
          if (!currentReciter || audio.reciter === currentReciter) {
            if (!surahMap[audio.surahNumber]) surahMap[audio.surahNumber] = [];
            surahMap[audio.surahNumber].push(audio.ayahNumber);
          }
        });
        resolve(surahMap);
      };
      request.onerror = () => resolve({});
    });
  } catch (error) {
    return {};
  }
};

export const deleteSurah = async (surahNumber, reciter) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const allRequest = store.getAll();
    await new Promise((resolve) => {
      allRequest.onsuccess = () => {
        allRequest.result
          .filter(a => a.surahNumber === surahNumber && (!reciter || a.reciter === reciter))
          .forEach(a => store.delete(a.id));
        resolve();
      };
      allRequest.onerror = () => resolve();
    });

    return new Promise((resolve) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  } catch (error) {
    console.error('Silme hatası:', error);
  }
};

export const getTotalSize = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const totalSize = request.result.reduce((sum, a) => sum + (a.blob?.size || 0), 0);
        resolve(totalSize);
      };
      request.onerror = () => resolve(0);
    });
  } catch (error) {
    return 0;
  }
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
