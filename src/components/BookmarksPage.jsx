// src/components/BookmarksPage.jsx - Yer İmleri Sayfası

import React, { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark } from '../utils/readingProgressStorage';

const BookmarksPage = ({ darkMode, onNavigateToAyah }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'surah'

  const cardBg = darkMode ? '#1f2937' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadBookmarks();
  }, [sortBy]);

  const loadBookmarks = () => {
    const allBookmarks = getBookmarks();
    const bookmarksArray = Object.values(allBookmarks);

    if (sortBy === 'recent') {
      bookmarksArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      bookmarksArray.sort((a, b) => {
        if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
        return a.ayahNumber - b.ayahNumber;
      });
    }

    setBookmarks(bookmarksArray);
  };

  const handleDelete = (surahNumber, ayahNumber) => {
    if (confirm('Bu yer imini silmek istediğinize emin misiniz?')) {
      removeBookmark(surahNumber, ayahNumber);
      loadBookmarks();
    }
  };

  return (
    <div style={{
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      padding: '15px',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '24px',
          color: '#059669',
          borderBottom: '3px solid #059669',
          paddingBottom: '10px'
        }}>
          🔖 Yer İmlerim
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: textSec }}>
          {bookmarks.length} yer imi
        </p>
      </div>

      {/* Sıralama */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setSortBy('recent')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: sortBy === 'recent' ? '#059669' : darkMode ? '#374151' : '#e5e7eb',
            color: sortBy === 'recent' ? 'white' : text,
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📅 En Yeni
        </button>
        <button
          onClick={() => setSortBy('surah')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: sortBy === 'surah' ? '#059669' : darkMode ? '#374151' : '#e5e7eb',
            color: sortBy === 'surah' ? 'white' : text,
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📖 Sure Sırası
        </button>
      </div>

      {/* Yer İmleri Listesi */}
      {bookmarks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: cardBg,
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔖</div>
          <div style={{ fontSize: '18px', color: text, marginBottom: '10px' }}>
            Henüz yer imi yok
          </div>
          <div style={{ fontSize: '14px', color: textSec }}>
            Kur'an okurken 📌 ikonuna tıklayarak yer imi ekleyebilirsiniz
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookmarks.map((bookmark, index) => (
            <div
              key={index}
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div
                onClick={() => onNavigateToAyah && onNavigateToAyah(bookmark.surahNumber)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#059669',
                  marginBottom: '6px'
                }}>
                  {bookmark.surahName}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: text,
                  marginBottom: '4px'
                }}>
                  Ayet: {bookmark.ayahNumber}
                </div>
                {bookmark.note && (
                  <div style={{
                    fontSize: '13px',
                    color: textSec,
                    fontStyle: 'italic',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '6px'
                  }}>
                    📝 {bookmark.note}
                  </div>
                )}
                <div style={{
                  fontSize: '12px',
                  color: textSec,
                  marginTop: '6px'
                }}>
                  {new Date(bookmark.timestamp).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <button
                onClick={() => handleDelete(bookmark.surahNumber, bookmark.ayahNumber)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
