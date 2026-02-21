import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { allSurahs } from '../data/surahs';

const AUDIO_DIR = 'sesli-meal';
const getOnlineUrl = (n) => `https://download.tvquran.com/download/recitations/340/264/${String(n).padStart(3, '0')}.mp3`;
const getFileName = (n) => `${String(n).padStart(3, '0')}.mp3`;

// İndirilen sureleri localStorage'da takip et
const DL_KEY = 'audio_meal_downloaded';
const getDownloaded = () => { try { return JSON.parse(localStorage.getItem(DL_KEY) || '{}'); } catch { return {}; } };
const markDownloaded = (n) => { const d = getDownloaded(); d[n] = true; localStorage.setItem(DL_KEY, JSON.stringify(d)); };
const markDeleted = (n) => { const d = getDownloaded(); delete d[n]; localStorage.setItem(DL_KEY, JSON.stringify(d)); };

const AudioMeal = ({ darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(getDownloaded());
  const [downloading, setDownloading] = useState({}); // { surahNumber: progress% }
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const isNative = Capacitor.isNativePlatform();

  const filteredSurahs = allSurahs.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const h = {
      loadedmetadata: () => { setDuration(audio.duration); setLoading(false); },
      timeupdate: () => setCurrentTime(audio.currentTime),
      ended: () => { setIsPlaying(false); setCurrentTime(0); autoNext(); },
      error: () => { setError('Ses dosyası yüklenemedi'); setLoading(false); setIsPlaying(false); },
      waiting: () => setLoading(true),
      canplay: () => setLoading(false),
    };
    Object.entries(h).forEach(([e, fn]) => audio.addEventListener(e, fn));
    return () => Object.entries(h).forEach(([e, fn]) => audio.removeEventListener(e, fn));
  }, [currentSurah]);

  const autoNext = () => {
    if (!currentSurah || currentSurah.number >= 114) return;
    const next = allSurahs.find(s => s.number === currentSurah.number + 1);
    if (next) playSurah(next);
  };

  // Lokal dosya URI al
  const getLocalUri = async (surahNumber) => {
    try {
      const result = await Filesystem.getUri({
        path: `${AUDIO_DIR}/${getFileName(surahNumber)}`,
        directory: Directory.Data
      });
      return Capacitor.convertFileSrc(result.uri);
    } catch {
      return null;
    }
  };

  // Sureyi çal - önce lokal, yoksa online
  const playSurah = async (surah) => {
    const audio = audioRef.current;
    if (!audio) return;

    setError('');
    setCurrentSurah(surah);
    setLoading(true);
    setCurrentTime(0);
    setDuration(0);

    let src = getOnlineUrl(surah.number);

    // Lokal dosya varsa onu kullan
    if (isNative && downloaded[surah.number]) {
      const localUri = await getLocalUri(surah.number);
      if (localUri) {
        src = localUri;
      }
    }

    audio.src = src;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setLoading(false);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSurah) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    audio.currentTime = Math.max(0, Math.min(1, x / rect.width)) * duration;
  };

  const skipBack = () => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); };
  const skipForward = () => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10); };
  const prevSurah = () => { if (currentSurah?.number > 1) playSurah(allSurahs.find(s => s.number === currentSurah.number - 1)); };
  const nextSurah = () => { if (currentSurah?.number < 114) playSurah(allSurahs.find(s => s.number === currentSurah.number + 1)); };

  // ═══════ İNDİRME ═══════
  const downloadSurah = async (surah, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!isNative || downloading[surah.number]) return;

    setDownloading(p => ({ ...p, [surah.number]: 1 }));

    try {
      // Dizini oluştur
      try {
        await Filesystem.mkdir({ path: AUDIO_DIR, directory: Directory.Data, recursive: true });
      } catch {} // zaten varsa hata verir, sorun yok

      const url = getOnlineUrl(surah.number);
      const fileName = getFileName(surah.number);

      // XHR ile indir (progress takibi için)
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setDownloading(p => ({ ...p, [surah.number]: pct }));
          }
        };
        xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject(new Error(`HTTP ${xhr.status}`));
        xhr.onerror = () => reject(new Error('İndirme hatası'));
        xhr.send();
      });

      // Blob → base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Dosyaya yaz
      await Filesystem.writeFile({
        path: `${AUDIO_DIR}/${fileName}`,
        data: base64,
        directory: Directory.Data,
      });

      markDownloaded(surah.number);
      setDownloaded(getDownloaded());
    } catch (err) {
      console.error('İndirme hatası:', err);
      setError(`İndirme hatası: ${err.message}`);
    } finally {
      setDownloading(p => { const n = { ...p }; delete n[surah.number]; return n; });
    }
  };

  // Silme
  const deleteSurah = async (surah, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!isNative) return;

    try {
      await Filesystem.deleteFile({
        path: `${AUDIO_DIR}/${getFileName(surah.number)}`,
        directory: Directory.Data,
      });
      markDeleted(surah.number);
      setDownloaded(getDownloaded());
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const gr = '#059669', grl = '#10b981';
  const dlCount = Object.keys(downloaded).length;

  return (
    <div>
      <audio ref={audioRef} preload="none" />

      {/* Player */}
      {currentSurah && (
        <div style={{
          marginBottom: '16px', padding: '14px 16px', borderRadius: '14px',
          background: darkMode ? 'linear-gradient(135deg, #064e3b, #1e293b)' : 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
          border: `1px solid ${darkMode ? '#065f46' : '#a7f3d0'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#6ee7b7' : '#064e3b' }}>
                {currentSurah.number}. {currentSurah.transliteration}
              </div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', marginTop: '2px' }}>
                🎧 Sa'd Al-Ghamdi • Türkçe Meal
                {downloaded[currentSurah.number] && <span style={{ color: grl }}> • 📱 Çevrimdışı</span>}
              </div>
            </div>
            <div style={{ fontSize: '22px', fontFamily: 'Traditional Arabic', color: darkMode ? '#a7f3d0' : '#065f46' }}>
              {currentSurah.name}
            </div>
          </div>

          {/* Progress */}
          <div ref={progressRef} onClick={seek} onTouchMove={seek}
            style={{ width: '100%', height: '6px', backgroundColor: darkMode ? '#334155' : '#d1d5db', borderRadius: '3px', cursor: 'pointer', marginBottom: '8px' }}>
            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: grl, borderRadius: '3px', transition: 'width 0.1s linear' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '10px', fontVariantNumeric: 'tabular-nums' }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button onClick={prevSurah} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: currentSurah?.number <= 1 ? 0.3 : 1, padding: '4px' }}>⏮</button>
            <button onClick={skipBack} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', color: darkMode ? '#d1d5db' : '#374151' }}>⏪</button>
            <button onClick={togglePlay} style={{
              width: '48px', height: '48px', borderRadius: '50%', border: 'none',
              background: `linear-gradient(135deg, ${gr}, ${grl})`, color: '#fff', fontSize: '20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
            }}>{loading ? '⏳' : isPlaying ? '⏸' : '▶'}</button>
            <button onClick={skipForward} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', color: darkMode ? '#d1d5db' : '#374151' }}>⏩</button>
            <button onClick={nextSurah} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: currentSurah?.number >= 114 ? 0.3 : 1, padding: '4px' }}>⏭</button>
          </div>

          {error && <div style={{ textAlign: 'center', fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{error}</div>}
        </div>
      )}

      {/* İndirilen sayısı */}
      {dlCount > 0 && (
        <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '10px', textAlign: 'center' }}>
          📱 {dlCount}/114 sure indirildi — indirilenler çevrimdışı dinlenebilir
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Sure ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#fff', color: darkMode ? '#e5e7eb' : '#1f2937', fontSize: '16px', boxSizing: 'border-box' }} />

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredSurahs.map((surah) => {
          const active = currentSurah?.number === surah.number;
          const isDl = !!downloaded[surah.number];
          const dlProg = downloading[surah.number];
          const isDling = dlProg !== undefined;

          return (
            <div key={surah.number} style={{
              padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: active ? (darkMode ? '#064e3b' : '#ecfdf5') : (darkMode ? '#374151' : '#ffffff'),
              border: `1px solid ${active ? grl : (darkMode ? '#4b5563' : '#e5e7eb')}`,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              {/* Numara + Play */}
              <div onClick={() => playSurah(surah)} style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: active ? gr : (darkMode ? '#1f2937' : '#f3f4f6'), color: active ? '#fff' : (darkMode ? '#e5e7eb' : '#1f2937'),
                borderRadius: '50%', fontWeight: 'bold', fontSize: '13px', flexShrink: 0
              }}>{surah.number}</div>

              {/* Bilgi */}
              <div onClick={() => playSurah(surah)} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '15px', color: active ? grl : (darkMode ? '#e5e7eb' : '#1f2937'), display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {surah.transliteration}
                  {isDl && <span style={{ fontSize: '10px', color: grl }}>📱</span>}
                </div>
                <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '1px' }}>
                  {surah.totalAyahs} Ayet • {surah.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'}
                </div>

                {/* İndirme progress */}
                {isDling && (
                  <div style={{ marginTop: '4px', height: '3px', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${dlProg}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.2s' }} />
                  </div>
                )}
              </div>

              {/* Arapça */}
              <div onClick={() => playSurah(surah)} style={{ fontSize: '18px', fontFamily: 'Traditional Arabic', color: darkMode ? '#9ca3af' : '#6b7280', flexShrink: 0 }}>
                {surah.name}
              </div>

              {/* Çalan sure animasyon */}
              {active && isPlaying && (
                <div style={{ fontSize: '14px', animation: 'pulse 1s infinite', flexShrink: 0 }}>🔊</div>
              )}

              {/* İndir / Sil butonu */}
              {isNative && (
                <div style={{ flexShrink: 0 }}>
                  {isDl ? (
                    <button onClick={(e) => deleteSurah(surah, e)} style={{
                      background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px',
                      opacity: 0.6
                    }} title="Sil">🗑️</button>
                  ) : isDling ? (
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>{dlProg}%</span>
                  ) : (
                    <button onClick={(e) => downloadSurah(surah, e)} style={{
                      background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px'
                    }} title="İndir">⬇️</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default AudioMeal;
