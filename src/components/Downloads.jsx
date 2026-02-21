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
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { allSurahs } from '../data/surahs';
import { getSettings, reciters } from '../utils/settingsStorage.js';

const MEAL_DIR = 'sesli-meal';
const MEAL_DL_KEY = 'audio_meal_downloaded';
const getMealDownloaded = () => { try { return JSON.parse(localStorage.getItem(MEAL_DL_KEY) || '{}'); } catch { return {}; } };
const markMealDownloaded = (n) => { const d = getMealDownloaded(); d[n] = true; localStorage.setItem(MEAL_DL_KEY, JSON.stringify(d)); };
const markMealDeleted = (n) => { const d = getMealDownloaded(); delete d[n]; localStorage.setItem(MEAL_DL_KEY, JSON.stringify(d)); };
const getMealOnlineUrl = (n) => `https://download.tvquran.com/download/recitations/340/264/${String(n).padStart(3, '0')}.mp3`;

const Downloads = ({ darkMode, onSurahClick }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'audio', 'tafsir', 'meal'
  const [downloadedAudioSurahs, setDownloadedAudioSurahs] = useState({});
  const [downloadedTextSurahs, setDownloadedTextSurahs] = useState([]);
  const [downloadedTafsirSurahs, setDownloadedTafsirSurahs] = useState({});
  const [mealDownloaded, setMealDownloaded] = useState(getMealDownloaded());
  const [mealDownloading, setMealDownloading] = useState({});
  const [totalAudioSize, setTotalAudioSize] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState(0);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [itemProgress, setItemProgress] = useState(0);

  const settings = getSettings();
  const currentReciter = settings.reciter || 'Alafasy_128kbps';
  const [selectedTafsirId, setSelectedTafsirId] = useState(tafsirOptions[0].id);

  const cardBg = darkMode ? '#1f2937' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';
  const accent = '#059669';

  const activeReciterName = reciters.find(r => r.id === currentReciter)?.name || 'Hafız';
  const activeTafsirName = tafsirOptions.find(t => t.id === selectedTafsirId)?.name || 'Tefsir';

  useEffect(() => {
    loadDownloads();
    const interval = setInterval(loadDownloads, 5000);
    return () => clearInterval(interval);
  }, [currentReciter, selectedTafsirId]);

  const loadDownloads = async () => {
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
    if (window.confirm(`${surah.transliteration} suresine ait tüm ses dosyalarını silmek istediğinize emin misiniz?`)) {
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

  const handleDownloadAllAudio = async () => {
    if (!window.confirm(`Tüm Kuran sesleri (${activeReciterName}) indirilecek. Devam edilsin mi?`)) return;
    setIsBulkDownloading(true);
    setBulkDownloadProgress(0);
    for (let i = 1; i <= 114; i++) {
      const surah = allSurahs.find(s => s.number === i);
      setDownloadingItemId(i);
      await downloadAudioSurah(i, surah.ayahCount, (p) => setItemProgress(p), currentReciter);
      setBulkDownloadProgress(i);
    }
    setDownloadingItemId(null);
    setIsBulkDownloading(false);
    await loadDownloads();
  };

  const handleDeleteText = async (surah) => {
    if (window.confirm(`${surah.transliteration} suresi metnini silmek istediğinize emin misiniz?`)) {
      await deleteSurahText(surah.number);
      await loadDownloads();
    }
  };

  // ═══════ SESLİ MEAL İNDİRME / SİLME ═══════
  const handleDownloadMeal = async (surah) => {
    if (!Capacitor.isNativePlatform()) return;
    setMealDownloading(p => ({ ...p, [surah.number]: 1 }));
    try {
      try { await Filesystem.mkdir({ path: MEAL_DIR, directory: Directory.Data, recursive: true }); } catch {}

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', getMealOnlineUrl(surah.number), true);
        xhr.responseType = 'blob';
        xhr.onprogress = (e) => {
          if (e.lengthComputable) setMealDownloading(p => ({ ...p, [surah.number]: Math.round((e.loaded / e.total) * 100) }));
        };
        xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject(new Error(`HTTP ${xhr.status}`));
        xhr.onerror = () => reject(new Error('İndirme hatası'));
        xhr.send();
      });

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await Filesystem.writeFile({
        path: `${MEAL_DIR}/${String(surah.number).padStart(3, '0')}.mp3`,
        data: base64,
        directory: Directory.Data,
      });

      markMealDownloaded(surah.number);
      setMealDownloaded(getMealDownloaded());
    } catch (err) {
      console.error('Sesli meal indirme hatası:', err);
      alert(`İndirme hatası: ${err.message}`);
    } finally {
      setMealDownloading(p => { const n = { ...p }; delete n[surah.number]; return n; });
    }
  };

  const handleDeleteMeal = async (surah) => {
    if (!window.confirm(`${surah.transliteration} sesli mealini silmek istediğinize emin misiniz?`)) return;
    try {
      await Filesystem.deleteFile({
        path: `${MEAL_DIR}/${String(surah.number).padStart(3, '0')}.mp3`,
        directory: Directory.Data,
      });
      markMealDeleted(surah.number);
      setMealDownloaded(getMealDownloaded());
    } catch (err) {
      console.error('Sesli meal silme hatası:', err);
    }
  };

  const handleDownloadAllMeal = async () => {
    if (!window.confirm('Tüm sesli mealler indirilecek (Sa\'d Al-Ghamdi • Türkçe Meal). Devam edilsin mi?')) return;
    setIsBulkDownloading(true);
    setBulkDownloadProgress(0);
    try { await Filesystem.mkdir({ path: MEAL_DIR, directory: Directory.Data, recursive: true }); } catch {}

    for (let i = 1; i <= 114; i++) {
      if (getMealDownloaded()[i]) { setBulkDownloadProgress(i); continue; } // zaten indirilmişse atla
      const surah = allSurahs.find(s => s.number === i);
      setMealDownloading(p => ({ ...p, [i]: 1 }));
      try {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', getMealOnlineUrl(i), true);
          xhr.responseType = 'blob';
          xhr.onprogress = (e) => {
            if (e.lengthComputable) setMealDownloading(p => ({ ...p, [i]: Math.round((e.loaded / e.total) * 100) }));
          };
          xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject(new Error(`HTTP ${xhr.status}`));
          xhr.onerror = () => reject(new Error('İndirme hatası'));
          xhr.send();
        });
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({ path: `${MEAL_DIR}/${String(i).padStart(3, '0')}.mp3`, data: base64, directory: Directory.Data });
        markMealDownloaded(i);
        setMealDownloaded(getMealDownloaded());
      } catch (err) {
        console.error(`Sure ${i} indirme hatası:`, err);
      }
      setMealDownloading(p => { const n = { ...p }; delete n[i]; return n; });
      setBulkDownloadProgress(i);
    }
    setIsBulkDownloading(false);
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
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'text', label: '📖 Metin' },
          { id: 'audio', label: '🔊 Ses' },
          { id: 'tafsir', label: '📚 Tefsir' },
          { id: 'meal', label: '🎧 Sesli Meal' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
                flex: 1, padding: '12px 5px', borderRadius: '12px', border: 'none', minWidth: '70px',
                backgroundColor: activeTab === tab.id ? accent : (darkMode ? '#374151' : '#f3f4f6'),
                color: activeTab === tab.id ? 'white' : text, fontWeight: 'bold', fontSize: '13px'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metinler Sekmesi */}
      {activeTab === 'text' && (
        <>
          {!isBulkDownloading && (
            <button onClick={handleDownloadAllText} style={{ width: '100%', padding: '15px', backgroundColor: accent, color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>✨ Tüm Metinleri İndir</button>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const isDownloaded = downloadedTextSurahs.includes(surah.number);
              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                    <div style={{ fontSize: '12px', color: textSec }}>{surah.ayahCount} Ayet</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isDownloaded ? (
                      <>
                        <button onClick={() => onSurahClick(surah)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' }}>Oku</button>
                        <button onClick={() => handleDeleteText(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                      </>
                    ) : (
                      <button onClick={() => downloadSurahText(surah.number, settings.translation).then(loadDownloads)} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>İndir</button>
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
        <>
          {!isBulkDownloading && (
            <button onClick={handleDownloadAllAudio} style={{ width: '100%', padding: '15px', backgroundColor: accent, color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>🎙️ Tüm Sesleri İndir ({activeReciterName})</button>
          )}
          <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '15px' }}>
            <div style={{ color: accent, fontWeight: 'bold', fontSize: '14px' }}>🎙️ Hafız: {activeReciterName}</div>
            <div style={{ color: text, fontSize: '12px', marginTop: '5px' }}>Toplam Ses Verisi: {formatBytes(totalAudioSize)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const downloadedAyahs = downloadedAudioSurahs[surah.number] || [];
              const count = downloadedAyahs.length;
              const isFullyDownloaded = count === surah.ayahCount;
              const hasSomeDownload = count > 0;
              const isDownloading = downloadingItemId === surah.number;

              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                      <div style={{ fontSize: '12px', color: isFullyDownloaded ? '#059669' : (hasSomeDownload ? '#f59e0b' : textSec) }}>
                        {isFullyDownloaded ? 'Tamamı İndirildi' : (hasSomeDownload ? `${count} / ${surah.ayahCount} Ayet İndi` : 'Henüz İndirilmedi')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {hasSomeDownload && (
                        <button onClick={() => handleDeleteAudio(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                      )}

                      {!isFullyDownloaded ? (
                        <button
                          onClick={() => handleDownloadAudio(surah)}
                          disabled={isDownloading}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>
                          {isDownloading ? '...' : (hasSomeDownload ? 'Tamamla' : 'İndir')}
                        </button>
                      ) : (
                        <button onClick={() => onSurahClick(surah)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' }}>Dinle</button>
                      )}
                    </div>
                  </div>
                  {isDownloading && (
                    <div style={{ height: '6px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${itemProgress}%`, height: '100%', background: accent }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
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
            const count = ayahNumbers.length;

            return (
              <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                    <div style={{ fontSize: '12px', color: isDownloaded ? '#059669' : (count > 0 ? '#f59e0b' : textSec) }}>
                        {isDownloaded ? 'Tefsir İndirildi' : (count > 0 ? `${count} / ${surah.ayahCount} Ayet İndi` : 'Tefsir İndirilmedi')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {count > 0 && (
                      <button onClick={() => handleDeleteTafsir(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                    )}
                    {!isDownloaded ? (
                      <button
                        onClick={() => handleDownloadTafsir(surah)}
                        disabled={isDownloading}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>
                        {isDownloading ? '...' : (count > 0 ? 'Tamamla' : 'İndir')}
                      </button>
                    ) : (
                        <button onClick={() => onSurahClick(surah)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold' }}>Oku</button>
                    )}
                  </div>
                </div>
                {isDownloading && <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${itemProgress}%`, height: '100%', background: accent }}></div></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Sesli Meal Sekmesi */}
      {activeTab === 'meal' && (
        <>
          {!isBulkDownloading && Capacitor.isNativePlatform() && (
            <button onClick={handleDownloadAllMeal} style={{ width: '100%', padding: '15px', backgroundColor: accent, color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>🎧 Tüm Sesli Mealleri İndir</button>
          )}

          <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '15px' }}>
            <div style={{ color: accent, fontWeight: 'bold', fontSize: '14px' }}>🎧 Sa'd Al-Ghamdi • Türkçe Meal</div>
            <div style={{ color: text, fontSize: '12px', marginTop: '5px' }}>
              {Object.keys(mealDownloaded).length}/114 sure indirildi
            </div>
          </div>

          {isBulkDownloading && (
            <div style={{ padding: '15px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', marginBottom: '15px' }}>
              <div style={{ color: text, fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>İndiriliyor... {bulkDownloadProgress}/114</div>
              <div style={{ height: '8px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(bulkDownloadProgress / 114) * 100}%`, height: '100%', background: accent, transition: 'width 0.3s' }}></div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allSurahs.map(surah => {
              const isDl = !!mealDownloaded[surah.number];
              const dlProg = mealDownloading[surah.number];
              const isDling = dlProg !== undefined;

              return (
                <div key={surah.number} style={{ padding: '15px', backgroundColor: cardBg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: text }}>{surah.number}. {surah.transliteration}</div>
                      <div style={{ fontSize: '12px', color: isDl ? '#059669' : textSec }}>
                        {isDl ? '✅ İndirildi • Çevrimdışı dinlenebilir' : 'Henüz indirilmedi'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isDl ? (
                        <button onClick={() => handleDeleteMeal(surah)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}>Sil</button>
                      ) : isDling ? (
                        <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>{dlProg}%</span>
                      ) : (
                        <button onClick={() => handleDownloadMeal(surah)} disabled={isBulkDownloading} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${accent}`, color: accent, fontWeight: 'bold', background: 'none' }}>İndir</button>
                      )}
                    </div>
                  </div>
                  {isDling && (
                    <div style={{ height: '6px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${dlProg}%`, height: '100%', background: accent, transition: 'width 0.2s' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Downloads;
