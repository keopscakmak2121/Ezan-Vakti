// src/components/SurahList.js
import React, { useState } from 'react';

const SurahList = ({ 
  surahs, 
  searchTerm, 
  setSearchTerm, 
  darkMode,
  downloadedSurahs,
  onSurahClick,
  onDownload,
  onDelete
}) => {
  const [downloadingStates, setDownloadingStates] = useState({});

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  const handleDownload = async (surah, e) => {
    e.stopPropagation();
    setDownloadingStates(prev => ({ ...prev, [surah.number]: { downloading: true, progress: 0 } }));
    
    await onDownload(surah, (progress, current, total) => {
      setDownloadingStates(prev => ({
        ...prev,
        [surah.number]: {
          downloading: true,
          progress,
          current,
          total
        }
      }));
    });

    setDownloadingStates(prev => ({ ...prev, [surah.number]: { downloading: false, progress: 100 } }));
  };

  const handleDelete = async (surah, e) => {
    e.stopPropagation();
    if (window.confirm(`${surah.name} suresini silmek istediğinize emin misiniz?`)) {
      await onDelete(surah);
    }
  };

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        margin: '0 0 20px 0', 
        color: text 
      }}>
        Sureler
      </h2>

      {/* Arama */}
      <input
        type="text"
        placeholder="Sure ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: darkMode ? '#4b5563' : 'white',
          color: text,
          boxSizing: 'border-box'
        }}
      />

      {/* Sure Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {surahs.map((surah) => {
          const isDownloaded = downloadedSurahs[surah.number];
          const downloadState = downloadingStates[surah.number];
          const isDownloading = downloadState?.downloading;

          return (
            <div
              key={surah.number}
              onClick={() => !isDownloading && onSurahClick(surah)}
              style={{
                padding: '16px',
                backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                borderRadius: '10px',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent',
                opacity: isDownloading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDownloading) {
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#059669',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {surah.number}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: text,
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {surah.name}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span>{surah.revelationType === 'Meccan' ? '🕋 Mekke' : '🕌 Medine'}</span>
                      <span>•</span>
                      <span>{surah.numberOfAyahs} Ayet</span>
                      {isDownloaded && <span>• 📥 İndirildi</span>}
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '24px', 
                    color: '#059669',
                    flexShrink: 0
                  }}>
                    {surah.nameArabic}
                  </div>
                </div>

                {/* İndirme/Silme Butonu */}
                <div style={{ flexShrink: 0 }}>
                  {isDownloading ? (
                    <div style={{ 
                      minWidth: '100px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '5px'
                      }}>
                        <div style={{
                          width: `${downloadState.progress}%`,
                          height: '100%',
                          backgroundColor: '#059669',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: text 
                      }}>
                        {downloadState.current}/{downloadState.total} ({downloadState.progress}%)
                      </div>
                    </div>
                  ) : isDownloaded ? (
                    <button
                      onClick={(e) => handleDelete(surah, e)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🗑️ Sil
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleDownload(surah, e)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      📥 İndir
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {surahs.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: darkMode ? '#9ca3af' : '#6b7280' 
        }}>
          Aradığınız sure bulunamadı
        </div>
      )}
    </div>
  );
};

export default SurahList;