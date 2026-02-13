import React, { useState, useEffect } from 'react';
import { getAllNotes, deleteNote } from '../utils/noteStorage.js';
import { allSurahs } from '../data/surahs';

const Notes = ({ darkMode, onAyahClick }) => {
  const [notes, setNotes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  };

  const handleDeleteNote = (surahNumber, ayahNumber) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      deleteNote(surahNumber, ayahNumber);
      loadNotes();
    }
  };

  const notesList = Object.entries(notes).map(([key, note]) => ({
    key,
    ...note,
    surahName: allSurahs.find(s => s.number === note.surahNumber)?.transliteration || 'Bilinmeyen Sure'
  }));

  const filteredNotes = notesList.filter(note =>
    note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.surahName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      padding: '20px',
      color: darkMode ? '#e5e7eb' : '#1f2937'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Notlarım
      </h2>

      <input
        type="text"
        placeholder="Notlarda ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          color: darkMode ? '#e5e7eb' : '#1f2937',
          fontSize: '16px'
        }}
      />

      {filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: darkMode ? '#9ca3af' : '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            {searchTerm ? 'Not bulunamadı' : 'Henüz not yok'}
          </div>
          <div style={{ fontSize: '14px' }}>
            {searchTerm ? 'Farklı bir arama yapın' : 'Ayetlere not ekleyerek başlayın'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredNotes.map((note) => (
            <div
              key={note.key}
              style={{
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <div
                  onClick={() => onAyahClick && onAyahClick(note.surahNumber, note.ayahNumber)}
                  style={{
                    cursor: 'pointer',
                    color: darkMode ? '#60a5fa' : '#2563eb',
                    fontWeight: '500'
                  }}
                >
                  {note.surahName} - Ayet {note.ayahNumber}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.surahNumber, note.ayahNumber)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: darkMode ? '#ef4444' : '#dc2626',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0',
                    minWidth: '24px'
                  }}
                >
                  🗑️
                </button>
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                borderRadius: '6px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {note.note}
              </div>
              {note.updatedAt && (
                <div style={{
                  fontSize: '12px',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '8px'
                }}>
                  {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
