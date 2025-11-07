// src/components/quran/NoteModal.js
import React, { useState, useEffect } from 'react';

const NoteModal = ({ 
  darkMode, 
  ayah, 
  surahName, 
  initialNote, 
  onSave, 
  onClose 
}) => {
  const [noteText, setNoteText] = useState(initialNote || '');

  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const textSec = darkMode ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    setNoteText(initialNote || '');
  }, [initialNote]);

  const handleSave = () => {
    onSave(noteText);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ 
          color: text, 
          marginBottom: '20px', 
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📝 Not Ekle / Düzenle
        </h3>

        {/* Ayet Bilgisi */}
        {ayah && (
          <div style={{
            backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '16px', 
              color: text, 
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              {surahName} - {ayah.number}. Ayet
            </div>
            <div style={{
              fontSize: '14px',
              color: textSec,
              lineHeight: '1.6'
            }}>
              {ayah.turkish || ayah.text}
            </div>
          </div>
        )}

        {/* Not Alanı */}
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Bu ayet hakkında notunuzu buraya yazın..."
          autoFocus
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: `2px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: text,
            resize: 'vertical',
            fontFamily: 'inherit',
            marginBottom: '20px'
          }}
        />

        {/* Karakter Sayacı */}
        <div style={{
          fontSize: '12px',
          color: textSec,
          marginBottom: '20px',
          textAlign: 'right'
        }}>
          {noteText.length} karakter
        </div>

        {/* Butonlar */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: darkMode ? '#6b7280' : '#d1d5db',
              color: text,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ❌ İptal
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            💾 Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal; 
