import React from 'react';
import AyahControls from './AyahControls';

const AyahCard = ({
  ayah,
  surahName,
  settings, // Use the whole settings object
  darkMode,
  currentAyah,
  copiedAyah,
  isBookmarked,
  note,
  onPlay,
  onCopy,
  onToggleBookmark,
  onOpenNote
}) => {
  const text = darkMode ? '#f3f4f6' : '#1f2937';
  const isActive = currentAyah === ayah.number;
  const cardPaddingLeft = isActive ? '25px' : '12px';

  return (
    <div
      style={{
        position: 'relative',
        padding: '15px',
        paddingLeft: cardPaddingLeft,
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        borderRadius: '12px',
        border: isActive ? `1px solid #059669` : `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
        boxShadow: isActive ? '0 4px 8px rgba(5, 150, 105, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
      }}
    >
      
      {isActive && (
        <div 
          style={{
            position: 'absolute',
            left: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#059669',
            fontSize: '20px', 
          }}
        >
          ▶
        </div>
      )}

      {/* Arapça Metin */}
      <div style={{
        fontSize: settings.fontSize + 2,
        textAlign: 'right',
        lineHeight: '2.2',
        color: text,
        fontWeight: '500',
        marginBottom: '15px',
        direction: 'rtl',
        fontFamily: settings.arabicFont, // Use from settings
      }}>
        <span>{ayah.arabic}</span>
        <span style={{ color: '#059669', fontWeight: 'bold', marginRight: '10px' }}>﴿{ayah.number}﴾</span>
      </div>

      {/* Türkçe Çeviri (Conditional) */}
      {settings.showTranslation && (
          <div 
            style={{
              fontSize: settings.fontSize - 3,
              lineHeight: '1.7',
              color: darkMode ? '#cbd5e1' : '#475569',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
            }}
          >
            {ayah.turkish}
          </div>
      )}
      
      {note && (
        <div style={{ /* Note styles ... */ }}>
            {/* ... Note content ... */}
        </div>
      )}

      <AyahControls
        ayah={ayah}
        currentAyah={currentAyah}
        copiedAyah={copiedAyah}
        isBookmarked={isBookmarked}
        hasNote={!!note}
        darkMode={darkMode}
        onPlay={onPlay}
        onCopy={onCopy}
        onToggleBookmark={onToggleBookmark}
        onOpenNote={onOpenNote}
      />
    </div>
  );
};

export default AyahCard;
