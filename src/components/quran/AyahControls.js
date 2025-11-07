// src/components/quran/AyahControls.js
import React from 'react';

const AyahControls = ({
  ayah,
  currentAyah,
  copiedAyah,
  isBookmarked,
  hasNote,
  darkMode,
  onPlay,
  onCopy,
  onToggleBookmark,
  onOpenNote
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {/* Dinle Butonu */}
      <button
        onClick={() => onPlay(ayah.number)}
        style={{
          padding: '8px 16px',
          backgroundColor: currentAyah === ayah.number ? '#dc2626' : '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        {currentAyah === ayah.number ? '⏸ Durdur' : '▶ Dinle'}
      </button>

      {/* Kopyala Butonu */}
      <button
        onClick={() => onCopy(ayah)}
        style={{
          padding: '8px 16px',
          backgroundColor: copiedAyah === ayah.number ? '#10b981' : (darkMode ? '#6b7280' : '#d1d5db'),
          color: copiedAyah === ayah.number ? 'white' : text,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {copiedAyah === ayah.number ? '✓ Kopyalandı' : '📋 Kopyala'}
      </button>

      {/* Yer İmi Butonu */}
      <button
        onClick={() => onToggleBookmark(ayah)}
        style={{
          padding: '8px 16px',
          backgroundColor: isBookmarked ? '#f59e0b' : (darkMode ? '#6b7280' : '#d1d5db'),
          color: isBookmarked ? 'white' : text,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {isBookmarked ? '★ Yer İminde' : '☆ Yer İmi Ekle'}
      </button>

      {/* Not Butonu */}
      <button
        onClick={() => onOpenNote(ayah)}
        style={{
          padding: '8px 16px',
          backgroundColor: hasNote ? '#3b82f6' : (darkMode ? '#6b7280' : '#d1d5db'),
          color: hasNote ? 'white' : text,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {hasNote ? '📝 Not Düzenle' : '📝 Not Ekle'}
      </button>
    </div>
  );
};

export default AyahControls;