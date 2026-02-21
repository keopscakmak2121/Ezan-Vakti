import React, { useState, useRef, useEffect } from 'react';
import { allSurahs } from '../data/surahs';

// Saad Al-Ghamdi + Türkçe meal sesi
// URL pattern: https://download.tvquran.com/download/recitations/340/264/XXX.mp3
const getAudioUrl = (surahNumber) => {
  const num = String(surahNumber).padStart(3, '0');
  return `https://download.tvquran.com/download/recitations/340/264/${num}.mp3`;
};

const AudioMeal = ({ darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const filteredSurahs = allSurahs.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => { setDuration(audio.duration); setLoading(false); };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); autoPlayNext(); };
    const onError = () => { setError('Ses dosyası yüklenemedi'); setLoading(false); setIsPlaying(false); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [currentSurah]);

  const autoPlayNext = () => {
    if (!currentSurah || currentSurah.number >= 114) return;
    const next = allSurahs.find(s => s.number === currentSurah.number + 1);
    if (next) playSurah(next);
  };

  const playSurah = (surah) => {
    const audio = audioRef.current;
    if (!audio) return;

    setError('');
    setCurrentSurah(surah);
    setLoading(true);
    setCurrentTime(0);
    setDuration(0);

    audio.src = getAudioUrl(surah.number);
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setLoading(false);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSurah) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * duration;
  };

  const skipBack = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };
  const skipForward = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
  };

  const prevSurah = () => {
    if (!currentSurah || currentSurah.number <= 1) return;
    const prev = allSurahs.find(s => s.number === currentSurah.number - 1);
    if (prev) playSurah(prev);
  };
  const nextSurah = () => {
    if (!currentSurah || currentSurah.number >= 114) return;
    const next = allSurahs.find(s => s.number === currentSurah.number + 1);
    if (next) playSurah(next);
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const gr = '#059669';
  const grl = '#10b981';

  const st = {
    searchInput: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#e5e7eb' : '#1f2937', fontSize: '16px', boxSizing: 'border-box' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    listItem: (active) => ({
      padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
      backgroundColor: active ? (darkMode ? '#064e3b' : '#ecfdf5') : (darkMode ? '#374151' : '#ffffff'),
      border: `1px solid ${active ? grl : (darkMode ? '#4b5563' : '#e5e7eb')}`,
      display: 'flex', alignItems: 'center', gap: '12px'
    }),
    num: (active) => ({
      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: active ? gr : (darkMode ? '#1f2937' : '#f3f4f6'), color: active ? '#fff' : (darkMode ? '#e5e7eb' : '#1f2937'),
      borderRadius: '50%', fontWeight: 'bold', fontSize: '13px', flexShrink: 0
    })
  };

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
          {/* Surah info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#6ee7b7' : '#064e3b' }}>
                {currentSurah.number}. {currentSurah.transliteration}
              </div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', marginTop: '2px' }}>
                🎧 Sa'd Al-Ghamdi • Türkçe Meal
              </div>
            </div>
            <div style={{ fontSize: '22px', fontFamily: 'Traditional Arabic', color: darkMode ? '#a7f3d0' : '#065f46' }}>
              {currentSurah.name}
            </div>
          </div>

          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={seek}
            onTouchMove={seek}
            style={{
              width: '100%', height: '6px', backgroundColor: darkMode ? '#334155' : '#d1d5db',
              borderRadius: '3px', cursor: 'pointer', marginBottom: '8px', position: 'relative'
            }}
          >
            <div style={{
              width: `${pct}%`, height: '100%', backgroundColor: grl,
              borderRadius: '3px', transition: 'width 0.1s linear'
            }} />
          </div>

          {/* Times */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '10px', fontVariantNumeric: 'tabular-nums' }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button onClick={prevSurah} disabled={!currentSurah || currentSurah.number <= 1}
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: currentSurah?.number <= 1 ? 0.3 : 1, padding: '4px' }}>
              ⏮
            </button>
            <button onClick={skipBack}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', color: darkMode ? '#d1d5db' : '#374151' }}>
              ⏪
            </button>
            <button onClick={togglePlay}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: `linear-gradient(135deg, ${gr}, ${grl})`,
                color: '#fff', fontSize: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(5,150,105,0.3)'
              }}>
              {loading ? '⏳' : isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={skipForward}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', color: darkMode ? '#d1d5db' : '#374151' }}>
              ⏩
            </button>
            <button onClick={nextSurah} disabled={!currentSurah || currentSurah.number >= 114}
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: currentSurah?.number >= 114 ? 0.3 : 1, padding: '4px' }}>
              ⏭
            </button>
          </div>

          {error && <div style={{ textAlign: 'center', fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{error}</div>}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Sure ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={st.searchInput}
      />

      {/* Surah List */}
      <div style={st.listContainer}>
        {filteredSurahs.map((surah) => {
          const active = currentSurah?.number === surah.number;
          return (
            <div key={surah.number} onClick={() => playSurah(surah)} style={st.listItem(active)}>
              <div style={st.num(active)}>{surah.number}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '15px', color: active ? grl : (darkMode ? '#e5e7eb' : '#1f2937') }}>
                  {surah.transliteration}
                </div>
                <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '1px' }}>
                  {surah.totalAyahs} Ayet • {surah.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontFamily: 'Traditional Arabic', color: darkMode ? '#9ca3af' : '#6b7280', flexShrink: 0 }}>
                {surah.name}
              </div>
              {active && isPlaying && (
                <div style={{ fontSize: '14px', marginLeft: '4px', animation: 'pulse 1s infinite' }}>🔊</div>
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
