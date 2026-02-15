// src/utils/readingProgressStorage.js - Kur'an okuma ilerlemesi yönetimi

const READING_PROGRESS_KEY = 'quran_reading_progress';
const LAST_READ_KEY = 'quran_last_read';
const BOOKMARKS_KEY = 'quran_bookmarks';

/**
 * Okuma ilerlemesini kaydet
 * @param {number} surahNumber - Sure numarası
 * @param {number} ayahNumber - Ayet numarası
 * @param {number} scrollPosition - Scroll pozisyonu (opsiyonel)
 */
export const saveReadingProgress = (surahNumber, ayahNumber, scrollPosition = 0) => {
  try {
    const progress = {
      surahNumber,
      ayahNumber,
      scrollPosition,
      timestamp: new Date().toISOString(),
      percentage: calculateProgress(surahNumber, ayahNumber)
    };
    
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(progress));
    
    // Tüm ilerleme geçmişine ekle
    const allProgress = getAllProgress();
    allProgress[`${surahNumber}-${ayahNumber}`] = progress;
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(allProgress));
    
    return true;
  } catch (error) {
    console.error('İlerleme kaydetme hatası:', error);
    return false;
  }
};

/**
 * Son okunan yeri getir
 * @returns {Object|null} Son okuma pozisyonu
 */
export const getLastReadPosition = () => {
  try {
    const data = localStorage.getItem(LAST_READ_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Son okuma yeri getirme hatası:', error);
    return null;
  }
};

/**
 * Tüm okuma ilerlemelerini getir
 * @returns {Object} Tüm ilerleme kayıtları
 */
export const getAllProgress = () => {
  try {
    const data = localStorage.getItem(READING_PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

/**
 * Belirli bir sure için ilerlemeyi getir
 * @param {number} surahNumber - Sure numarası
 * @returns {Array} Sure içindeki okunan ayetler
 */
export const getSurahProgress = (surahNumber) => {
  const allProgress = getAllProgress();
  return Object.values(allProgress)
    .filter(p => p.surahNumber === surahNumber)
    .sort((a, b) => a.ayahNumber - b.ayahNumber);
};

/**
 * Genel okuma yüzdesini hesapla (Kur'an'ın tamamı için)
 * @param {number} surahNumber - Sure numarası
 * @param {number} ayahNumber - Ayet numarası
 * @returns {number} Yüzde değeri (0-100)
 */
export const calculateProgress = (surahNumber, ayahNumber) => {
  // Kur'an'da toplam 6236 ayet var
  const TOTAL_AYAHS = 6236;
  
  // Her surenin ayet sayıları
  const surahAyahCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99,
    128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35,
    38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11,
    11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40,
    46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8,
    8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
  ];
  
  // Belirtilen ayete kadar olan toplam ayet sayısı
  let totalReadAyahs = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    totalReadAyahs += surahAyahCounts[i];
  }
  totalReadAyahs += ayahNumber;
  
  return Math.round((totalReadAyahs / TOTAL_AYAHS) * 100);
};

/**
 * Yer imi ekle
 * @param {number} surahNumber - Sure numarası
 * @param {number} ayahNumber - Ayet numarası
 * @param {string} note - Not (opsiyonel)
 * @returns {boolean} Başarı durumu
 */
export const addBookmark = (surahNumber, ayahNumber, surahName, note = '') => {
  try {
    const bookmarks = getBookmarks();
    const id = `${surahNumber}-${ayahNumber}`;
    
    bookmarks[id] = {
      surahNumber,
      ayahNumber,
      surahName,
      note,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Yer imi ekleme hatası:', error);
    return false;
  }
};

/**
 * Yer imi sil
 * @param {number} surahNumber - Sure numarası
 * @param {number} ayahNumber - Ayet numarası
 */
export const removeBookmark = (surahNumber, ayahNumber) => {
  try {
    const bookmarks = getBookmarks();
    const id = `${surahNumber}-${ayahNumber}`;
    delete bookmarks[id];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Yer imi silme hatası:', error);
    return false;
  }
};

/**
 * Tüm yer imlerini getir
 * @returns {Object} Yer imleri
 */
export const getBookmarks = () => {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

/**
 * Bir ayetin yer imi olup olmadığını kontrol et
 * @param {number} surahNumber - Sure numarası
 * @param {number} ayahNumber - Ayet numarası
 * @returns {boolean} Yer imi var mı?
 */
export const isBookmarked = (surahNumber, ayahNumber) => {
  const bookmarks = getBookmarks();
  return !!bookmarks[`${surahNumber}-${ayahNumber}`];
};

/**
 * Okuma istatistiklerini getir
 * @returns {Object} İstatistikler
 */
export const getReadingStats = () => {
  const allProgress = getAllProgress();
  const progressArray = Object.values(allProgress);
  
  if (progressArray.length === 0) {
    return {
      totalAyahsRead: 0,
      totalSurahsStarted: 0,
      overallProgress: 0,
      lastReadDate: null,
      readingStreak: 0
    };
  }
  
  // En son okunan
  const lastRead = progressArray.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )[0];
  
  // Kaç farklı sure
  const uniqueSurahs = new Set(progressArray.map(p => p.surahNumber));
  
  // Toplam okunan ayet
  const totalAyahsRead = progressArray.length;
  
  // Genel ilerleme (son okunan ayete göre)
  const overallProgress = lastRead ? lastRead.percentage : 0;
  
  return {
    totalAyahsRead,
    totalSurahsStarted: uniqueSurahs.size,
    overallProgress,
    lastReadDate: lastRead ? new Date(lastRead.timestamp) : null,
    readingStreak: calculateReadingStreak(progressArray)
  };
};

/**
 * Okuma serisini hesapla (kaç gündür arka arkaya okuyor)
 * @param {Array} progressArray - İlerleme kayıtları
 * @returns {number} Gün sayısı
 */
const calculateReadingStreak = (progressArray) => {
  if (progressArray.length === 0) return 0;
  
  const dates = progressArray
    .map(p => new Date(p.timestamp).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date().toDateString();
  
  for (const date of dates) {
    if (date === currentDate) {
      streak++;
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.toDateString();
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * İlerlemeyi sıfırla
 */
export const resetProgress = () => {
  try {
    localStorage.removeItem(READING_PROGRESS_KEY);
    localStorage.removeItem(LAST_READ_KEY);
    return true;
  } catch (error) {
    console.error('İlerleme sıfırlama hatası:', error);
    return false;
  }
};
