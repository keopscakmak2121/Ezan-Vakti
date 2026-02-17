// src/components/quran/QuranSearch.jsx - Ayet Arama (Kelime/Cümle)

import React, { useState, useEffect } from 'react';

const QuranSearch = ({ darkMode, onNavigateToAyah, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const cardBg = darkMode ? '#1f2937' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('quran_search_history') || '[]');
    setSearchHistory(history.slice(0, 10));
  }, []);

  const saveToHistory = (term) => {
    if (!term.trim()) return;
    let history = JSON.parse(localStorage.getItem('quran_search_history') || '[]');
    history = [term, ...history.filter(h => h !== term)].slice(0, 10);
    localStorage.setItem('quran_search_history', JSON.stringify(history));
    setSearchHistory(history);
  };

  const performSearch = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    saveToHistory(term);

    try {
      const query = encodeURIComponent(term);
      // tr.diyanet meali üzerinden arama yapıyoruz
      const response = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/tr.diyanet`);
      const data = await response.json();

      if (data.code === 200 && data.data.matches) {
        const results = data.data.matches.map(match => ({
          surahNumber: match.surah.number,
          surahName: match.surah.englishName,
          surahNameTurkish: match.surah.name,
          ayahNumber: match.numberInSurah,
          text: match.text
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ?
      <mark key={index} style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '2px', borderRadius: '3px' }}>{part}</mark> : part
    );
  };

  return (
    <div style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        padding: '35px 15px 15px 15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', color: text, cursor: 'pointer' }}>←</button>
          <h2 style={{ margin: 0, fontSize: '20px', color: text, flex: 1 }}>🔍 Ayet Ara</h2>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', padding: '5px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kelime veya cümle ara..."
              style={{ flex: 1, padding: '12px 15px', border: 'none', backgroundColor: 'transparent', color: text, outline: 'none', fontSize: '16px' }}
            />
            <button type="submit" disabled={searching} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              {searching ? '⏳' : '🔍'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ padding: '15px' }}>
        {/* Geçmiş */}
        {!searchTerm && searchHistory.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: textSec, marginBottom: '10px' }}>Son Aramalar</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {searchHistory.map((h, i) => (
                <button key={i} onClick={() => { setSearchTerm(h); performSearch(h); }} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', backgroundColor: cardBg, color: text, fontSize: '13px' }}>{h}</button>
              ))}
            </div>
          </div>
        )}

        {/* Sonuçlar */}
        {searching ? (
          <div style={{ textAlign: 'center', padding: '40px', color: textSec }}>Aranıyor...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.map((res, i) => (
              <div key={i} onClick={() => onNavigateToAyah(res.surahNumber, res.ayahNumber)} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, cursor: 'pointer' }}>
                <div style={{ fontSize: '13px', color: '#059669', fontWeight: 'bold', marginBottom: '8px' }}>
                  {res.surahNameTurkish} - {res.surahNumber}:{res.ayahNumber}
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.6', color: text }}>
                  {highlightSearchTerm(res.text, searchTerm)}
                </div>
              </div>
            ))}
            {searchTerm && !searching && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: textSec }}>Sonuç bulunamadı.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranSearch;
