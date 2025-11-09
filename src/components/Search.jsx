// src/components/Search.js - PROPS DÜZELTİLDİ
import React, { useState } from 'react';
import { allSurahs } from '../data/surahs';

const Search = ({ 
  darkMode, 
  onAyahClick,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  searchType,
  setSearchType
}) => {
  const [searching, setSearching] = useState(false);

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  const searchInQuran = async () => {
    if (!searchQuery.trim()) {
      alert('Lütfen aramak istediğiniz kelimeyi girin.');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const results = [];

      for (const surah of allSurahs) {
        try {
          const response = await fetch(
            `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-simple,tr.diyanet`
          );
          const data = await response.json();

          if (data.code === 200) {
            const arabic = data.data[0].ayahs;
            const turkish = data.data[1].ayahs;

            arabic.forEach((ayah, index) => {
              const searchLower = searchQuery.toLowerCase();
              const turkishText = turkish[index].text.toLowerCase();
              const arabicText = ayah.text;

              let isMatch = false;

              if (searchType === 'turkish' && turkishText.includes(searchLower)) {
                isMatch = true;
              } else if (searchType === 'arabic' && arabicText.includes(searchQuery)) {
                isMatch = true;
              }

              if (isMatch) {
                results.push({
                  surahNumber: surah.number,
                  surahName: surah.name,
                  surahNameArabic: surah.nameArabic,
                  ayahNumber: ayah.numberInSurah,
                  arabicText: ayah.text,
                  turkishText: turkish[index].text
                });
              }
            });
          }
        } catch (error) {
          console.error(`Sure ${surah.number} aramasında hata:`, error);
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Arama hatası:', error);
      alert('Arama sırasında bir hata oluştu.');
    } finally {
      setSearching(false);
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={index}
          style={{
            backgroundColor: '#fbbf24',
            color: '#000',
            fontWeight: 'bold',
            padding: '2px 4px',
            borderRadius: '3px'
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 10px 0', color: text }}>
          🔍 Ayet Arama
        </h2>
        <p style={{ fontSize: '14px', color: textSec, margin: 0 }}>
          Kuran-ı Kerim'de kelime veya cümle arayın
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px'
      }}>
        <button
          onClick={() => setSearchType('turkish')}
          style={{
            padding: '10px 20px',
            backgroundColor: searchType === 'turkish' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: searchType === 'turkish' ? 'white' : text,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Türkçe
        </button>

        <button
          onClick={() => setSearchType('arabic')}
          style={{
            padding: '10px 20px',
            backgroundColor: searchType === 'arabic' ? '#059669' : (darkMode ? '#4b5563' : '#e5e7eb'),
            color: searchType === 'arabic' ? 'white' : text,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Arapça
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchInQuran()}
          placeholder={searchType === 'turkish' ? 'Türkçe kelime girin...' : 'Arapça kelime girin...'}
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            padding: '15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: `2px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: darkMode ? '#4b5563' : 'white',
            color: text
          }}
        />

        <button
          onClick={searchInQuran}
          disabled={searching}
          style={{
            padding: '15px 20px',
            backgroundColor: searching ? '#6b7280' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: searching ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {searching ? 'Aranıyor...' : '🔍 Ara'}
        </button>
      </div>

      {searching && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: textSec
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Kuran-ı Kerim'de aranıyor...
          </div>
          <div style={{ fontSize: '14px' }}>
            Bu işlem birkaç dakika sürebilir
          </div>
        </div>
      )}

      {!searching && searchResults.length > 0 && (
        <div>
          <div style={{
            padding: '15px',
            backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '16px',
            color: text
          }}>
            <strong>{searchResults.length}</strong> sonuç bulundu
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                  borderRadius: '10px',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => onAyahClick && onAyahClick(result.surahNumber, result.ayahNumber, searchQuery)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    {result.surahName} ({result.surahNameArabic}) - Ayet {result.ayahNumber}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAyahClick && onAyahClick(result.surahNumber, result.ayahNumber, searchQuery);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    👁️ Görüntüle
                  </button>
                </div>

                <div style={{
                  fontSize: '18px',
                  textAlign: 'right',
                  lineHeight: '1.8',
                  color: text,
                  marginBottom: '10px',
                  direction: 'rtl'
                }}>
                  {searchType === 'arabic' ? highlightText(result.arabicText, searchQuery) : result.arabicText}
                </div>

                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: text
                }}>
                  {searchType === 'turkish' ? highlightText(result.turkishText, searchQuery) : result.turkishText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searching && searchQuery && searchResults.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: textSec
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Sonuç bulunamadı
          </div>
          <div style={{ fontSize: '14px' }}>
            "{searchQuery}" için eşleşen ayet bulunamadı
          </div>
        </div>
      )}

      {!searching && !searchQuery && searchResults.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: textSec
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Arama yapmaya hazır
          </div>
          <div style={{ fontSize: '14px' }}>
            Aramak istediğiniz kelimeyi girin ve ara butonuna tıklayın
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;