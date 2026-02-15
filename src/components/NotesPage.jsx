// src/components/NotesPage.jsx - Notlarım Sayfası

import React, { useState, useEffect } from 'react';
import { getNotesArray, deleteAyahNote, searchNotesContent, categoryNames, categoryColors } from '../utils/ayahNotesStorage';

const NotesPage = ({ darkMode, onNavigateToAyah }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const cardBg = darkMode ? '#1f2937' : '#ffffff';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadNotes();
  }, [sortBy]);

  useEffect(() => {
    applyFilters();
  }, [notes, searchTerm, filterCategory]);

  const loadNotes = () => {
    const allNotes = getNotesArray(sortBy);
    setNotes(allNotes);
  };

  const applyFilters = () => {
    let filtered = notes;

    // Kategori filtresi
    if (filterCategory !== 'all') {
      filtered = filtered.filter(n => n.category === filterCategory);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = searchNotesContent(searchTerm);
    }

    setFilteredNotes(filtered);
  };

  const handleDelete = (surahNumber, ayahNumber) => {
    if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
      deleteAyahNote(surahNumber, ayahNumber);
      loadNotes();
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
          📝 Notlarım
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: textSec }}>
          {filteredNotes.length} not
        </p>
      </div>

      {/* Arama */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Notlarda ara..."
        style={{
          width: '100%',
          padding: '12px 15px',
          marginBottom: '15px',
          borderRadius: '10px',
          border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          color: text,
          fontSize: '15px',
          boxSizing: 'border-box'
        }}
      />

      {/* Filtreler */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '15px'
      }}>
        <button
          onClick={() => setFilterCategory('all')}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filterCategory === 'all' ? '#059669' : darkMode ? '#374151' : '#e5e7eb',
            color: filterCategory === 'all' ? 'white' : text,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Tümü
        </button>
        {Object.entries(categoryNames).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterCategory === key ? categoryColors[key] : darkMode ? '#374151' : '#e5e7eb',
              color: filterCategory === key ? 'white' : text,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {name}
          </button>
        ))}
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
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: sortBy === 'recent' ? '#059669' : darkMode ? '#374151' : '#e5e7eb',
            color: sortBy === 'recent' ? 'white' : text,
            fontSize: '14px',
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
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: sortBy === 'surah' ? '#059669' : darkMode ? '#374151' : '#e5e7eb',
            color: sortBy === 'surah' ? 'white' : text,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📖 Sure Sırası
        </button>
      </div>

      {/* Notlar Listesi */}
      {filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: cardBg,
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', color: text, marginBottom: '10px' }}>
            {searchTerm || filterCategory !== 'all' ? 'Sonuç bulunamadı' : 'Henüz not yok'}
          </div>
          <div style={{ fontSize: '14px', color: textSec }}>
            Kur'an okurken 📝 ikonuna tıklayarak not ekleyebilirsiniz
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotes.map((note, index) => (
            <div
              key={index}
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                padding: '16px',
                border: `2px solid ${note.color}`,
                borderLeft: `6px solid ${note.color}`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div
                  onClick={() => onNavigateToAyah && onNavigateToAyah(note.surahNumber)}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: note.color,
                    marginBottom: '4px'
                  }}>
                    {note.surahName} - Ayet {note.ayahNumber}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: `${note.color}20`,
                    color: note.color,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {categoryNames[note.category]}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(note.surahNumber, note.ayahNumber)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  🗑️
                </button>
              </div>

              <div style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: text,
                marginBottom: '12px',
                padding: '12px',
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                borderRadius: '8px'
              }}>
                {note.note}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '10px',
                        backgroundColor: `${note.color}15`,
                        color: note.color,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{
                fontSize: '12px',
                color: textSec
              }}>
                {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
