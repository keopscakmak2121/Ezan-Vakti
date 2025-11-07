// src/components/Downloads.js
import React, { useState, useEffect } from 'react';
import { 
  getDownloadedSurahs, 
  getTotalSize, 
  formatBytes,
  deleteSurah 
} from '../utils/audioStorage';
import { allSurahs } from '../data/surahs';

const Downloads = ({ darkMode, onSurahClick }) => {
  const [downloadedSurahs, setDownloadedSurahs] = useState({});
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setLoading(true);
    const downloaded = await getDownloadedSurahs();
    const size = await getTotalSize();
    setDownloadedSurahs(downloaded);
    setTotalSize(size);
    setLoading(false);
  };

  const handleDelete = async (surah) => {
    if (window.confirm(`${surah.name} suresini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteSurah(surah.number, surah.ayahCount);
        await loadDownloads();
        alert(`${surah.name} suresi silindi.`);
      } catch (error) {
        console.error('Silme hatası:', error);
        alert('Silme sırasında bir hata oluştu.');
      }
    }
  };

  const downloadedList = allSurahs.filter(surah => downloadedSurahs[surah.number]);

  if (loading) {
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
      <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: text }}>
        💾 İndirilen Sureler
      </h2>

      {/* İstatistikler */}
      <div style={{
        padding: '15px',
        backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '16px', color: text, marginBottom: '5px' }}>
          <strong>Toplam:</strong> {downloadedList.length} Sure
        </div>
        <div style={{ fontSize: '16px', color: text }}>
          <strong>Disk Kullanımı:</strong> {formatBytes(totalSize)}
        </div>
      </div>

      {/* Sure Listesi */}
      {downloadedList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: textSec
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📥</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Henüz indirilmiş sure yok
          </div>
          <div style={{ fontSize: '14px' }}>
            Kuran Oku sayfasından sure indirin
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {downloadedList.map(surah => (
            <div
              key={surah.number}
              style={{
                padding: '16px',
                backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '2px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: text,
                  marginBottom: '5px'
                }}>
                  {surah.number}. {surah.name} ({surah.nameArabic})
                </div>
                <div style={{ fontSize: '14px', color: textSec }}>
                  {surah.ayahCount} Ayet • {downloadedSurahs[surah.number]?.length || 0} ses dosyası
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onSurahClick && onSurahClick(surah)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📖 Oku
                </button>
                <button
                  onClick={() => handleDelete(surah)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads; 
