// src/components/Notes.js
import React, { useState, useEffect } from 'react';
import { getAllNotes, deleteNote } from '../utils/noteStorage';
import { allSurahs } from '../data/surahs';

const Notes = ({ darkMode, onAyahClick }) => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' veya 'surah'

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const allNotes = getAllNotes();
    const notesArray = Object.entries(allNotes).map(([key, value]) => ({
      key,
      ...value
    }));
    setNotes(notesArray);
  };

  const handleDelete = (surahNumber, ayahNumber) => {
    if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
      deleteNote(surahNumber, ayahNumber);
      loadNotes();
    }
  };

  const getSurahName = (surahNumber) => {
    const surah = allSurahs.find(s => s.number === surahNumber);
    return surah ? surah.name : 'Bilinmeyen Sure';
  };

  const filteredNotes = notes.filter(note => 
    note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSurahName(note.surahNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    } else {
      return a.surahNumber - b.surahNumber || a.ayahNumber - b.ayahNumber;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          margin: '0 0 10px 0', 
          color: text,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📝 Notlarım
          <span style={{
            fontSize: '16px',
            backgroundColor: '#059669',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 'normal'
          }}>
            {notes.length}
          </span>
        </h2>
      </div>

      {/* Arama ve Sıralama */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Notlarda ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
            color: text,
            fontSize: '16px'
          }}
        />
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
            color: text,
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          <option value="date">Tarihe Göre</option>
          <option value="surah">Sureye Göre</option>
        </select>
      </div>

      {/* Notlar Listesi */}
      {sortedNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: textSec
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            {searchTerm ? 'Not bulunamadı' : 'Henüz not eklemediniz'}
          </div>
          <div style={{ fontSize: '14px' }}>
            {searchTerm ? 'Farklı bir arama yapın' : 'Ayetlere not ekleyerek başlayın'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sortedNotes.map((note) => (
            <div
              key={note.key}
              style={{
                backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                borderRadius: '10px',
                padding: '20px',
                border: '2px solid transparent',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              {/* Sure ve Ayet Bilgisi */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '5px'
                  }}>
                    {getSurahName(note.surahNumber)} - Ayet {note.ayahNumber}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: textSec
                  }}>
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Not İçeriği */}
              <div style={{
                backgroundColor: darkMode ? '#374151' : '#fef3c7',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{
                  fontSize: '15px',
                  color: text,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {note.note}
                </div>
              </div>

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onAyahClick(note.surahNumber, note.ayahNumber)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📖 Ayete Git
                </button>

                <button
                  onClick={() => handleDelete(note.surahNumber, note.ayahNumber)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Özet Bilgi */}
      {notes.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', color: text }}>
            Toplam <strong>{notes.length}</strong> not kaydettiniz
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;