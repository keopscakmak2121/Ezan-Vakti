// src/components/Statistics.js
import React, { useState, useEffect } from 'react';
import { 
  getStats, 
  getMostReadSurahs, 
  getWeeklyStats,
  getMonthlyStats,
  getReadingHistory,
  resetStats
} from '../utils/statsStorage';
import { getTotalNotesCount } from '../utils/noteStorage';
import { getBookmarks } from '../utils/bookmarkStorage';
import { getDownloadedSurahs } from '../utils/audioStorage';
import { allSurahs } from '../data/surahs';

const Statistics = ({ darkMode }) => {
  const [stats, setStats] = useState(null);
  const [mostReadSurahs, setMostReadSurahs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [notesCount, setNotesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    // Okuma istatistikleri
    const generalStats = getStats();
    setStats(generalStats);

    // En çok okunan sureler
    const topSurahs = getMostReadSurahs(5);
    setMostReadSurahs(topSurahs);

    // Haftalık
    const weekly = getWeeklyStats();
    setWeeklyStats(weekly);

    // Aylık
    const monthly = getMonthlyStats();
    setMonthlyStats(monthly);

    // Notlar
    const notes = getTotalNotesCount();
    setNotesCount(notes);

    // Yer imleri
    // Yer imleri
const bookmarks = getBookmarks();
setBookmarksCount(bookmarks.length);

    // İndirilenler
    const downloads = await getDownloadedSurahs();
    setDownloadsCount(Object.keys(downloads).length);
  };

  const getSurahName = (surahNumber) => {
    const surah = allSurahs.find(s => s.number === surahNumber);
    return surah ? surah.name : 'Bilinmeyen';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} dakika`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} saat ${mins} dakika`;
  };

  const handleReset = () => {
    if (window.confirm('Tüm istatistikleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      resetStats();
      loadAllStats();
      alert('İstatistikler sıfırlandı.');
    }
  };

  if (!stats) {
    return (
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: text
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          margin: '0 0 10px 0', 
          color: text,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📊 İstatistikler
        </h2>
        <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
          Okuma alışkanlıklarınızı ve ilerlemenizi görüntüleyin
        </p>
      </div>

      {/* Genel Özet Kartları */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <StatCard
          icon="📖"
          title="Okuma Sayısı"
          value={stats.totalReadingSessions}
          subtitle="oturum"
          darkMode={darkMode}
        />
        <StatCard
          icon="⏱️"
          title="Toplam Süre"
          value={formatDuration(stats.totalReadingTime)}
          subtitle=""
          darkMode={darkMode}
        />
        <StatCard
          icon="🔥"
          title="Günlük Seri"
          value={stats.streakDays}
          subtitle="gün"
          darkMode={darkMode}
        />
        <StatCard
          icon="📝"
          title="Notlar"
          value={notesCount}
          subtitle="not"
          darkMode={darkMode}
        />
        <StatCard
          icon="⭐"
          title="Yer İmleri"
          value={bookmarksCount}
          subtitle="ayet"
          darkMode={darkMode}
        />
        <StatCard
          icon="💾"
          title="İndirilenler"
          value={downloadsCount}
          subtitle="sure"
          darkMode={darkMode}
        />
      </div>

      {/* En Çok Okunan Sureler */}
      {mostReadSurahs.length > 0 && (
        <div style={{
          backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', color: text, marginBottom: '15px' }}>
            📚 En Çok Okunan Sureler
          </h3>
          {mostReadSurahs.map((surah, index) => (
            <div
              key={surah.number}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '10px',
                backgroundColor: darkMode ? '#374151' : 'white',
                borderRadius: '8px',
                borderLeft: '4px solid #059669'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: text }}>
                    {getSurahName(surah.number)}
                  </div>
                  <div style={{ fontSize: '12px', color: textSec }}>
                    Sure #{surah.number}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#059669'
              }}>
                {surah.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Haftalık Aktivite */}
      <div style={{
        backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', color: text, marginBottom: '15px' }}>
          📅 Son 7 Gün
        </h3>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {weeklyStats.map((day, index) => {
            const maxDuration = Math.max(...weeklyStats.map(d => d.duration), 1);
            const heightPercent = (day.duration / maxDuration) * 100;
            const dayName = new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' });
            
            return (
              <div
                key={index}
                style={{
                  flex: '1',
                  minWidth: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    backgroundColor: day.duration > 0 ? '#059669' : 'transparent',
                    transition: 'height 0.3s',
                    borderRadius: '8px 8px 0 0'
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: text }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: '11px', color: textSec }}>
                    {day.duration > 0 ? `${day.duration}dk` : '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aylık Özet */}
      {monthlyStats && (
        <div style={{
          backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', color: text, marginBottom: '15px' }}>
            📈 Son 30 Gün Özeti
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                {monthlyStats.totalSessions}
              </div>
              <div style={{ fontSize: '14px', color: textSec }}>
                Toplam Oturum
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                {formatDuration(monthlyStats.totalDuration)}
              </div>
              <div style={{ fontSize: '14px', color: textSec }}>
                Toplam Süre
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                {monthlyStats.uniqueSurahs}
              </div>
              <div style={{ fontSize: '14px', color: textSec }}>
                Farklı Sure
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sıfırlama Butonu */}
      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        🗑️ İstatistikleri Sıfırla
      </button>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, darkMode }) => (
  <div style={{
    backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>
      {icon}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '5px'
    }}>
      {title}
    </div>
    <div style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: darkMode ? '#f3f4f6' : '#1f2937',
      marginBottom: '5px'
    }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ 
        fontSize: '12px', 
        color: darkMode ? '#9ca3af' : '#6b7280'
      }}>
        {subtitle}
      </div>
    )}
  </div>
);

export default Statistics; 
