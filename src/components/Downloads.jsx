// src/components/Downloads.jsx
import React, { useState, useEffect } from 'react';
import { 
  getDownloadedSurahs as getDownloadedAudioSurahs,
  getTotalSize, 
  formatBytes,
  deleteSurah as deleteAudioSurah,
  downloadSurah as downloadAudioSurah
} from '../utils/audioStorage.js';
import {
  getDownloadedSurahsList as getDownloadedTextSurahs,
  downloadSurahText,
  deleteSurahText
} from '../utils/quranStorage.js';
import { allSurahs } from '../data/surahs';
import { getSettings, reciters } from '../utils/settingsStorage.js';

const Downloads = ({ darkMode, onSurahClick }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'audio'
  const [downloadedAudioSurahs, setDownloadedAudioSurahs] = useState({});
  const [downloadedTextSurahs, setDownloadedTextSurahs] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState(0);
  const [downloadingAudioId, setDownloadingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentReciter, setCurrentReciter] = useState(getSettings().reciter);

  const cardBg = darkMode ? '#1f2937' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';
  const accent = '#059669';

  const activeReciterName = reciters.find(r => r.id === currentReciter)?.name || 'Hafız';

  useEffect(() => {
    loadDownloads();
  }, [currentReciter]);

  const loadDownloads = async () => {
    setLoading(true);
    // Sadece seçili hafıza ait ses dosyalarını getir
    const audio = await getDownloadedAudioSurahs(currentReciter);
    const texts = await getDownloadedTextSurahs();
    const size = await getTotalSize();
    setDownloadedAudioSurahs(audio);
    setDownloadedTextSurahs(texts);
    setTotalSize(size);
    setLoading(false);
  };

  const handleDeleteAudio = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi (${activeReciterName}) ses dosyalarını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteAudioSurah(surah.number, currentReciter);
        await loadDownloads();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleDownloadAudio = async (surah) => {
    setDownloadingAudioId(surah.number);
    setAudioProgress(0);

    try {
      await downloadAudioSurah(surah.number, surah.ayahCount, (progress) => {
        setAudioProgress(progress);
      }, currentReciter);
      await loadDownloads();
    } catch (error) {
      alert('Ses indirme hatası oluştu.');
    } finally {
      setDownloadingAudioId(null);
    }
  };

  const handleDeleteText = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi metnini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteSurahText(surah.number);
        await loadDownloads();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleDownloadAllText = async () => {
    if (!window.confirm('Tüm Kuran-ı Kerim metinleri ve meali indirilecek. Devam edilsin mi?')) return;

    setIsBulkDownloading(true);
    setBulkDownloadProgress(0);
    const settings = getSettings();

    for (let i = 1; i <= 114; i++) {
      await downloadSurahText(i, settings.translation);
      setBulkDownloadProgress(i);
    }

    setIsBulkDownloading(false);
    await loadDownloads();
    alert('✅ Tüm metinler başarıyla indirildi.');
  };

  const handleDownloadSingleText = async (surah) => {
    const settings = getSettings();
    const success = await downloadSurahText(surah.number, settings.translation);
    if (success) {
      await loadDownloads();
    } else {
      alert('İndirme başarısız.');
    }
  };

  if (loading && !isBulkDownloading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: text }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '15px', paddingBottom: '100px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: text }}>📥 İndirmeler</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('text')}
          style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'text' ? accent : (darkMode ? '#374151' : '#f3f4f6'), color: activeTab === 'text' ? 'white' : text, fontWeight: 'bold' }}>
          📖 Metinler
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'audio' ? accent : (darkMode ? '#374151' : '#f3f4f6'), color: activeTab === 'audio' ? 'white' : text, fontWeight: 'bold' }}>
          🔊 Sesler
        </button>
      </div>

      {activeTab === 'text' && (
        <>
          {isBulkDownloading ? (
            <div style={{ padding: '20px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold', color: text }}>Tüm Kuran İndiriliyor...</div>
              <div style={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden', marginBottom: '5px' }}>
                <div style={{ width: `${(bulkDownloadProgress / 114) * 100}%`, height: '100%', backgroundColor: accent, transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '12px', color: textSec }}>{bulkDownloadProgress} / 114 Sure</div>
            </div>
          ) : (
            <button
              onClick={handleDownloadAllText}
              style={{ width: '100%', padding: '15px', backgroundColor: accent, color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold', fontSize: '16px' }}>
              ✨ Tüm Kuran'ı İndir (Offline Oku)
            </button>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const isDownloaded = downloadedTextSurahs.includes(surah.number);
              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                    <div style={{ fontSize: '12px', color: textSec }}>{surah.ayahCount} Ayet</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isDownloaded ? (
                      <>
                        <button onClick={() => onSurahClick(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontSize: '13px' }}>Oku</button>
                        <button onClick={() => handleDeleteText(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '13px' }}>Sil</button>
                      </>
                    ) : (
                      <button onClick={() => handleDownloadSingleText(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${accent}`, backgroundColor: 'transparent', color: accent, fontSize: '13px', fontWeight: '600' }}>İndir</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'audio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ color: accent, fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>🎙️ Aktif Hafız: {activeReciterName}</div>
            <div style={{ color: textSec, fontSize: '12px' }}>Ses indirmeleri seçili hafıza özeldir. Hafızı ayarlardan değiştirebilirsiniz.</div>
            <div style={{ color: text, fontSize: '13px', marginTop: '8px' }}><strong>Toplam Disk Kullanımı:</strong> {formatBytes(totalSize)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const ayahNumbers = downloadedAudioSurahs[surah.number] || [];
              const isDownloaded = ayahNumbers.length === surah.ayahCount;
              const isDownloading = downloadingAudioId === surah.number;
              const hasSomeAyahs = ayahNumbers.length > 0 && !isDownloaded;

              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                      <div style={{ fontSize: '12px', color: textSec }}>
                        {surah.ayahCount} Ayet
                        {isDownloaded ? ' (Tamamı İndirildi)' : (hasSomeAyahs ? ` (${ayahNumbers.length}/${surah.ayahCount} İndirildi)` : '')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isDownloaded ? (
                        <button onClick={() => handleDeleteAudio(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '13px' }}>Sil</button>
                      ) : (
                        <button
                          disabled={isDownloading}
                          onClick={() => handleDownloadAudio(surah)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${accent}`, backgroundColor: isDownloading ? '#f3f4f6' : 'transparent', color: isDownloading ? '#9ca3af' : accent, fontSize: '13px', fontWeight: '600' }}>
                          {isDownloading ? 'İndiriliyor...' : (hasSomeAyahs ? 'Tamamla' : 'İndir')}
                        </button>
                      )}
                    </div>
                  </div>

                  {isDownloading && (
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${audioProgress}%`, height: '100%', backgroundColor: accent, transition: 'width 0.1s' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Downloads;
