// src/components/Downloads.jsx
import React, { useState, useEffect } from 'react';
import { 
  getDownloadedSurahs as getDownloadedAudioSurahs,
  getTotalSize as getTotalAudioSize,
  formatBytes,
  deleteSurah as deleteAudioSurah,
  downloadSurah as downloadAudioSurah
} from '../utils/audioStorage.js';
import {
  getDownloadedSurahsList as getDownloadedTextSurahs,
  downloadSurahText,
  deleteSurahText
} from '../utils/quranStorage.js';
import {
  getDownloadedTafsirs,
  downloadSurahTafsir,
  deleteSurahTafsir,
  tafsirs as tafsirOptions
} from '../utils/tafsirStorage.js';
import { allSurahs } from '../data/surahs';
import { getSettings, reciters } from '../utils/settingsStorage.js';

const Downloads = ({ darkMode, onSurahClick }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'audio', 'tafsir'
  const [downloadedAudioSurahs, setDownloadedAudioSurahs] = useState({});
  const [downloadedTextSurahs, setDownloadedTextSurahs] = useState([]);
  const [downloadedTafsirSurahs, setDownloadedTafsirSurahs] = useState({});
  const [totalAudioSize, setTotalAudioSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState(0);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [itemProgress, setItemProgress] = useState(0);

  const settings = getSettings();
  const [currentReciter, setCurrentReciter] = useState(settings.reciter);
  const [selectedTafsirId, setSelectedTafsirId] = useState(tafsirOptions[0].id);

  const cardBg = darkMode ? '#1f2937' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';
  const accent = '#059669';

  const activeReciterName = reciters.find(r => r.id === currentReciter)?.name || 'Hafız';
  const activeTafsirName = tafsirOptions.find(t => t.id === selectedTafsirId)?.name || 'Tefsir';

  useEffect(() => {
    loadDownloads();
  }, [currentReciter, selectedTafsirId]);

  const loadDownloads = async () => {
    setLoading(true);
    const [audio, texts, tafsirsData, audioSize] = await Promise.all([
      getDownloadedAudioSurahs(currentReciter),
      getDownloadedTextSurahs(),
      getDownloadedTafsirs(selectedTafsirId),
      getTotalAudioSize()
    ]);

    setDownloadedAudioSurahs(audio);
    setDownloadedTextSurahs(texts);
    setDownloadedTafsirSurahs(tafsirsData);
    setTotalAudioSize(audioSize);
    setLoading(false);
  };

  const handleDeleteAudio = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi (${activeReciterName}) ses dosyalarını silmek istediğinize emin misiniz?`)) {
      await deleteAudioSurah(surah.number, currentReciter);
      await loadDownloads();
    }
  };

  const handleDownloadAudio = async (surah) => {
    setDownloadingItemId(surah.number);
    setItemProgress(0);
    try {
      await downloadAudioSurah(surah.number, surah.ayahCount, (progress) => setItemProgress(progress), currentReciter);
      await loadDownloads();
    } catch (error) { alert('Hata oluştu.'); }
    finally { setDownloadingItemId(null); }
  };

  const handleDeleteText = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi metnini silmek istediğinize emin misiniz?`)) {
      await deleteSurahText(surah.number);
      await loadDownloads();
    }
  };

  const handleDownloadAllText = async () => {
    if (!window.confirm('Tüm Kuran metinleri indirilecek?')) return;
    setIsBulkDownloading(true);
    setBulkDownloadProgress(0);
    for (let i = 1; i <= 114; i++) {
      await downloadSurahText(i, settings.translation);
      setBulkDownloadProgress(i);
    }
    setIsBulkDownloading(false);
    await loadDownloads();
  };

  const handleDownloadSingleText = async (surah) => {
    const success = await downloadSurahText(surah.number, settings.translation);
    if (success) await loadDownloads();
  };

  const handleDownloadTafsir = async (surah) => {
    setDownloadingItemId(surah.number);
    setItemProgress(0);
    try {
      await downloadSurahTafsir(surah.number, surah.ayahCount, selectedTafsirId, (progress) => setItemProgress(progress));
      await loadDownloads();
    } catch (error) { alert('Hata oluştu.'); }
    finally { setDownloadingItemId(null); }
  };

  const handleDeleteTafsir = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi (${activeTafsirName}) tefsirini silmek istiyor musunuz?`)) {
      await deleteSurahTafsir(surah.number, selectedTafsirId);
      await loadDownloads();
    }
  };

  if (loading && !isBulkDownloading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: text }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '15px', paddingBottom: '100px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: text }}>📥 İndirmeler</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {['text', 'audio', 'tafsir'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '10px 5px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === tab ? accent : (darkMode ? '#374151' : '#f3f4f6'), color: activeTab === tab ? 'white' : text, fontWeight: 'bold', fontSize: '13px' }}>
            {tab === 'text' ? '📖 Metin' : tab === 'audio' ? '🔊 Ses' : '📚 Tefsir'}
          </button>
        ))}
      </div>

      {/* Metinler Sekmesi */}
      {activeTab === 'text' && (
        <>
          {isBulkDownloading ? (
            <div style={{ padding: '20px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold', color: text }}>Tüm Kuran İndiriliyor...</div>
              <div style={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${(bulkDownloadProgress / 114) * 100}%`, height: '100%', backgroundColor: accent }}></div>
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px', color: textSec }}>{bulkDownloadProgress} / 114</div>
            </div>
          ) : (
            <button onClick={handleDownloadAllText} style={{ width: '100%', padding: '15px', backgroundColor: accent, color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>✨ Tüm Kuran'ı İndir</button>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const isDownloaded = downloadedTextSurahs.includes(surah.number);
              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div><div style={{ fontSize: '12px', color: textSec }}>{surah.ayahCount} Ayet</div></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isDownloaded ? (
                      <><button onClick={() => onSurahClick(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white' }}>Oku</button><button onClick={() => handleDeleteText(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button></>
                    ) : (
                      <button onClick={() => handleDownloadSingleText(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>İndir</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sesler Sekmesi */}
      {activeTab === 'audio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ color: accent, fontWeight: 'bold', fontSize: '14px' }}>🎙️ Aktif Hafız: {activeReciterName}</div>
            <div style={{ color: text, fontSize: '12px', marginTop: '5px' }}>Toplam: {formatBytes(totalAudioSize)}</div>
          </div>
          {allSurahs.map(surah => {
            const ayahNumbers = downloadedAudioSurahs[surah.number] || [];
            const isDownloaded = ayahNumbers.length === surah.ayahCount;
            const isDownloading = downloadingItemId === surah.number;
            return (
              <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div><div style={{ fontSize: '12px', color: textSec }}>{isDownloaded ? 'İndirildi' : `${ayahNumbers.length}/${surah.ayahCount}`}</div></div>
                  {isDownloaded ? (
                    <button onClick={() => handleDeleteAudio(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                  ) : (
                    <button onClick={() => handleDownloadAudio(surah)} disabled={isDownloading} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>{isDownloading ? '...' : 'İndir'}</button>
                  )}
                </div>
                {isDownloading && <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${itemProgress}%`, height: '100%', background: accent }}></div></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Tefsirler Sekmesi */}
      {activeTab === 'tafsir' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ color: accent, fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>📚 Tefsir Seçimi</div>
            <select
              value={selectedTafsirId}
              onChange={(e) => setSelectedTafsirId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#1f2937' : '#fff', color: text }}
            >
              {tafsirOptions.map(t => <option key={t.id} value={t.id}>{t.name} ({t.author})</option>)}
            </select>
          </div>
          {allSurahs.map(surah => {
            const ayahNumbers = downloadedTafsirSurahs[surah.number] || [];
            const isDownloaded = ayahNumbers.length === surah.ayahCount;
            const isDownloading = downloadingItemId === surah.number;
            return (
              <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div><div style={{ fontSize: '12px', color: textSec }}>{isDownloaded ? 'Tefsir İndirildi' : `${ayahNumbers.length}/${surah.ayahCount} Ayet`}</div></div>
                  {isDownloaded ? (
                    <button onClick={() => handleDeleteTafsir(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                  ) : (
                    <button onClick={() => handleDownloadTafsir(surah)} disabled={isDownloading} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>{isDownloading ? '...' : 'Tefsir İndir'}</button>
                  )}
                </div>
                {isDownloading && <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${itemProgress}%`, height: '100%', background: accent }}></div></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Downloads;
