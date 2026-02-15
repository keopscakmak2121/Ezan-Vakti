import React from 'react';
import AyahControls from './AyahControls';

const AyahCard = ({
  ayah,
  settings,
  darkMode,
  currentAyah,
  copiedAyah,
  isBookmarked,
  note,
  onPlayClick, // "onPlay" yerine "onPlayClick" olarak güncellendi
  onCopy,
  onToggleBookmark,
  onOpenNote
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const isActive = currentAyah === ayah.number;

  return (
    <div
      style={{
        position: 'relative',
        padding: '15px',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
      }}
    >
      {/* Arapça Metin */}
      <div style={{
        fontSize: settings.fontSize + 4,
        textAlign: 'right',
        lineHeight: '2.5',
        color: text,
        marginBottom: '15px',
        direction: 'rtl',
        fontFamily: settings.arabicFont || 'Amiri',
      }}>
        {ayah.arabic}
        <span style={{ color: '#059669', fontSize: '0.8em', marginRight: '10px' }}> ({ayah.number})</span>
      </div>

      {/* Türkçe Çeviri */}
      {settings.showTranslation && (
          <div style={{
              fontSize: settings.fontSize - 2,
              lineHeight: '1.6',
              color: darkMode ? '#cbd5e1' : '#475569',
              marginBottom: '15px',
              borderTop: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`,
              paddingTop: '10px'
            }}>
            {ayah.turkish}
          </div>
      )}
      
      <AyahControls
        ayah={ayah}
        darkMode={darkMode}
        onPlay={onPlayClick} // "onPlayClick" prop'u alt bileşene aktarılıyor
        onCopy={onCopy}
        onToggleBookmark={onToggleBookmark}
        onOpenNote={onOpenNote}
      />
    </div>
  );
};

export default AyahCard;
