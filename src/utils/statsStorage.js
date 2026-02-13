// src/utils/statsStorage.js

const STATS_KEY = 'quran_stats';
const READING_HISTORY_KEY = 'quran_reading_history';

// Varsayılan istatistikler
const getDefaultStats = () => ({
  totalReadingSessions: 0,
  totalReadingTime: 0, // dakika cinsinden
  surahsRead: {}, // { surahNumber: readCount }
  lastReadDate: null,
  streakDays: 0,
  lastStreakDate: null,
  totalAyahsRead: 0,
  favoriteReciter: 'alafasy'
});

// Tüm istatistikleri al
export const getStats = () => {
  try {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : getDefaultStats();
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    return getDefaultStats();
  }
};

// İstatistikleri kaydet
const saveStats = (stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return true;
  } catch (error) {
    console.error('İstatistikler kaydedilirken hata:', error);
    return false;
  }
};

// Okuma oturumu başlat
export const startReadingSession = (surahNumber, surahName) => {
  const session = {
    surahNumber,
    surahName,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0
  };
  
  sessionStorage.setItem('current_reading_session', JSON.stringify(session));
  return session;
};

// Okuma oturumu bitir
export const endReadingSession = () => {
  try {
    const sessionData = sessionStorage.getItem('current_reading_session');
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    session.endTime = new Date().toISOString();
    
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    session.duration = Math.round((endTime - startTime) / 1000 / 60); // dakika

    // İstatistikleri güncelle
    const stats = getStats();
    stats.totalReadingSessions++;
    stats.totalReadingTime += session.duration;
    
    // Sure okuma sayısını artır
    if (!stats.surahsRead[session.surahNumber]) {
      stats.surahsRead[session.surahNumber] = 0;
    }
    stats.surahsRead[session.surahNumber]++;
    
    // Son okuma tarihini güncelle
    stats.lastReadDate = session.endTime;
    
    // Streak hesapla
    updateStreak(stats);
    
    saveStats(stats);
    
    // Okuma geçmişine ekle
    addToReadingHistory(session);
    
    sessionStorage.removeItem('current_reading_session');
    return session;
  } catch (error) {
    console.error('Okuma oturumu kaydedilirken hata:', error);
    return null;
  }
};

// Streak güncelle
const updateStreak = (stats) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!stats.lastStreakDate) {
    stats.streakDays = 1;
    stats.lastStreakDate = today.toISOString();
    return;
  }
  
  const lastStreakDate = new Date(stats.lastStreakDate);
  lastStreakDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Bugün zaten okumuş
    return;
  } else if (diffDays === 1) {
    // Dün okumuş, streak devam
    stats.streakDays++;
    stats.lastStreakDate = today.toISOString();
  } else {
    // Streak kırıldı
    stats.streakDays = 1;
    stats.lastStreakDate = today.toISOString();
  }
};

// Okuma geçmişi
export const getReadingHistory = () => {
  try {
    const history = localStorage.getItem(READING_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Okuma geçmişi yüklenirken hata:', error);
    return [];
  }
};

const addToReadingHistory = (session) => {
  try {
    const history = getReadingHistory();
    history.unshift(session); // En yenisi başta
    
    // Son 100 oturumu sakla
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Okuma geçmişi kaydedilirken hata:', error);
  }
};

// En çok okunan sureler
export const getMostReadSurahs = (limit = 5) => {
  const stats = getStats();
  const surahsArray = Object.entries(stats.surahsRead).map(([number, count]) => ({
    number: parseInt(number),
    count
  }));
  
  return surahsArray
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Haftalık okuma istatistikleri
export const getWeeklyStats = () => {
  const history = getReadingHistory();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekHistory = history.filter(session => 
    new Date(session.startTime) >= weekAgo
  );
  
  const dailyStats = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyStats[dateStr] = {
      sessions: 0,
      duration: 0,
      date: dateStr
    };
  }
  
  weekHistory.forEach(session => {
    const dateStr = session.startTime.split('T')[0];
    if (dailyStats[dateStr]) {
      dailyStats[dateStr].sessions++;
      dailyStats[dateStr].duration += session.duration;
    }
  });
  
  return Object.values(dailyStats).reverse();
};

// Aylık okuma istatistikleri
export const getMonthlyStats = () => {
  const history = getReadingHistory();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  const monthHistory = history.filter(session => 
    new Date(session.startTime) >= monthAgo
  );
  
  return {
    totalSessions: monthHistory.length,
    totalDuration: monthHistory.reduce((sum, s) => sum + s.duration, 0),
    uniqueSurahs: new Set(monthHistory.map(s => s.surahNumber)).size
  };
};

// Ayet okuma sayısını artır
export const incrementAyahRead = () => {
  const stats = getStats();
  stats.totalAyahsRead++;
  saveStats(stats);
};

// Tüm istatistikleri sıfırla
export const resetStats = () => {
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(READING_HISTORY_KEY);
  return getDefaultStats();
};