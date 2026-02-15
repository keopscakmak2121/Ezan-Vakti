// src/components/quran/QuranSearch.jsx - Gelişmiş Kur'an Arama

import React, { useState, useEffect } from 'react';

const QuranSearch = ({ darkMode, onNavigateToAyah, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'arabic', 'turkish'
  const [selectedSurah, setSelectedSurah] = useState('all');
  
  const cardBg = darkMode ? '#1f2937' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    // Arama geçmişini yükle
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
      // API'den arama yap
      const query = encodeURIComponent(term);
      const response = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/tr.diyanet`);
      const data = await response.json();

      if (data.code === 200 && data.data.matches) {
        const results = data.data.matches.map(match => ({
          surahNumber: match.surah.number,
          surahName: match.surah.englishName,
          surahNameTurkish: match.surah.name,
          ayahNumber: match.numberInSurah,
          text: match.text,
          edition: match.edition.identifier
        }));

        // Filtrele
        let filtered = results;
        if (selectedSurah !== 'all') {
          filtered = filtered.filter(r => r.surahNumber === parseInt(selectedSurah));
        }

        setSearchResults(filtered);
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

  const clearHistory = () => {
    localStorage.removeItem('quran_search_history');
    setSearchHistory([]);
  };

  return (
    <div style={{
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        padding: '35px 15px 15px 15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <button 
            onClick={onBack}
            style={{
              padding: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: text,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', color: text, flex: 1 }}>
            🔍 Kur'an'da Ara
          </h2>
        </div>

        {/* Arama Formu */}
        <form onSubmit={handleSearch} style={{ marginBottom: '15px' }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
            borderRadius: '12px',
            padding: '5px'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kelime veya cümle ara..."
              style={{
                flex: 1,
                padding: '12px 15px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: text,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: 'white',
                fontWeight: 'bold',
                cursor: searching ? 'not-allowed' : 'pointer',
                opacity: searching ? 0.6 : 1
              }}
            >
              {searching ? '⏳' : '🔍'}
            </button>
          </div>
        </form>

        {/* Filtreler */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: darkMode ? '#374151' : '#ffffff',
              color: text,
              fontSize: '14px'
            }}
          >
            <option value="all">Tüm Sureler</option>
            {[...Array(114)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}. Sure
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ padding: '15px' }}>
        {/* Arama Geçmişi */}
        {!searchTerm && searchHistory.length > 0 && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: text }}>
                📜 Son Aramalar
              </h3>
              <button
                onClick={clearHistory}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: textSec,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Temizle
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(term);
                    performSearch(term);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                    color: text,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Arama Sonuçları */}
        {searching && (
          <div style={{ textAlign: 'center', padding: '40px', color: textSec }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
            <div>Aranıyor...</div>
          </div>
        )}

        {!searching && searchTerm && searchResults.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: cardBg,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>😔</div>
            <div style={{ fontSize: '18px', color: text, marginBottom: '10px' }}>
              Sonuç bulunamadı
            </div>
            <div style={{ fontSize: '14px', color: textSec }}>
              "{searchTerm}" için eşleşme bulunamadı
            </div>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <>
            <div style={{
              padding: '12px 15px',
              backgroundColor: darkMode ? '#374151' : '#e5e7eb',
              borderRadius: '8px',
              marginBottom: '15px',
              textAlign: 'center',
              color: text,
              fontWeight: '600'
            }}>
              {searchResults.length} sonuç bulundu
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => onNavigateToAyah && onNavigateToAyah(result.surahNumber, result.ayahNumber)}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Sure Bilgisi */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#059669'
                    }}>
                      {result.surahNameTurkish} ({result.surahNumber}:{result.ayahNumber})
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                      fontSize: '12px',
                      color: textSec,
                      fontWeight: '600'
                    }}>
                      Ayet {result.ayahNumber}
                    </div>
                  </div>

                  {/* Ayet Metni */}
                  <div style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: text
                  }}>
                    {highlightSearchTerm(result.text, searchTerm)}
                  </div>

                  {/* Git Butonu */}
                  <div style={{
                    marginTop: '12px',
                    textAlign: 'right'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#059669',
                      fontWeight: '600'
                    }}>
                      Git →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* İpuçları */}
        {!searchTerm && searchHistory.length === 0 && (
          <div style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '16px',
              color: text
            }}>
              💡 Arama İpuçları
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: textSec,
              fontSize: '14px',
              lineHeight: '1.8'
            }}>
              <li>Kelime veya cümle arayabilirsiniz</li>
              <li>En az 2 karakter girin</li>
              <li>Türkçe meal üzerinden arama yapılır</li>
              <li>Belirli bir surede aramak için filtre kullanın</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Arama terimini vurgula
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span
          key={index}
          style={{
            backgroundColor: '#fef08a',
            color: '#854d0e',
            fontWeight: 'bold',
            padding: '2px 4px',
            borderRadius: '3px'
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export default QuranSearch;
