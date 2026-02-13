// src/utils/audioStorage.js

const DB_NAME = 'QuranAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

// IndexedDB başlatma
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ IndexedDB HATA:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('✅ IndexedDB açıldı');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('🔧 IndexedDB oluşturuluyor...');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('surahNumber', 'surahNumber', { unique: false });
        console.log('✅ Object store oluşturuldu');
      }
    };
  });
};

// Ses dosyasını indir ve kaydet
export const downloadAudio = async (surahNumber, ayahNumber, onProgress) => {
  try {
    const url = `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
    
    console.log(`📥 İndiriliyor: Sure ${surahNumber}, Ayet ${ayahNumber}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ Fetch başarısız:', response.status);
      throw new Error('İndirme başarısız');
    }

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

      if (onProgress && total) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    console.log(`📦 Blob oluşturuldu: ${blob.size} bytes`);
    
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const audioData = {
      id: `${surahNumber}-${ayahNumber}`,
      surahNumber,
      ayahNumber,
      blob,
      downloadDate: new Date().toISOString()
    };

    await new Promise((resolve, reject) => {
      const request = store.put(audioData);
      request.onsuccess = () => {
        console.log(`✅ KAYDEDILDI: ${audioData.id}`);
        resolve();
      };
      request.onerror = () => {
        console.error(`❌ KAYDETME HATASI: ${audioData.id}`, request.error);
        reject(request.error);
      };
    });

    return audioData;
  } catch (error) {
    console.error('❌ SES İNDİRME HATASI:', error);
    console.error('URL:', `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`);
    throw error;
  }
};

// Tüm sure seslerini indir
export const downloadSurah = async (surahNumber, totalAyahs, onProgress) => {
  console.log(`🎵 Sure indirme başladı: Sure ${surahNumber}, ${totalAyahs} ayet`);
  const results = [];
  
  for (let i = 1; i <= totalAyahs; i++) {
    try {
      await downloadAudio(surahNumber, i, (progress) => {
        const overallProgress = Math.round(((i - 1) / totalAyahs * 100) + (progress / totalAyahs));
        if (onProgress) onProgress(overallProgress, i, totalAyahs);
      });
      results.push({ ayah: i, success: true });
    } catch (error) {
      console.error(`❌ Ayet ${i} indirilemedi:`, error);
      results.push({ ayah: i, success: false, error });
    }
  }

  console.log('✅ Sure indirme tamamlandı:', results);
  return results;
};

// Ses dosyasını getir
export const getAudio = async (surahNumber, ayahNumber) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(`${surahNumber}-${ayahNumber}`);
      request.onsuccess = () => {
        if (request.result) {
          const url = URL.createObjectURL(request.result.blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Ses getirme hatası:', error);
    return null;
  }
};

// Sure indirilmiş mi kontrol et
export const isSurahDownloaded = async (surahNumber, totalAyahs) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('surahNumber');

    return new Promise((resolve) => {
      const request = index.getAll(surahNumber);
      request.onsuccess = () => {
        resolve(request.result.length === totalAyahs);
      };
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    return false;
  }
};

// Sure seslerini sil
export const deleteSurah = async (surahNumber, totalAyahs) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    for (let i = 1; i <= totalAyahs; i++) {
      store.delete(`${surahNumber}-${i}`);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Silme hatası:', error);
    throw error;
  }
};

// İndirilen sureleri listele
export const getDownloadedSurahs = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const downloads = request.result;
        console.log('📋 İndirilen dosyalar:', downloads.length);
        const surahMap = {};

        downloads.forEach(audio => {
          if (!surahMap[audio.surahNumber]) {
            surahMap[audio.surahNumber] = [];
          }
          surahMap[audio.surahNumber].push(audio.ayahNumber);
        });

        resolve(surahMap);
      };
      request.onerror = () => resolve({});
    });
  } catch (error) {
    return {};
  }
};

// Toplam kullanılan disk alanını hesapla
export const getTotalSize = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const totalSize = request.result.reduce((sum, audio) => {
          return sum + (audio.blob?.size || 0);
        }, 0);
        resolve(totalSize);
      };
      request.onerror = () => resolve(0);
    });
  } catch (error) {
    return 0;
  }
};

// Boyutu okunabilir formata çevir
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};