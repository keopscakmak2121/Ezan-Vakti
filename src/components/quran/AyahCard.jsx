import React, { useState } from 'react';
import NoteModal from './NoteModal';
import TafsirModal from './TafsirModal';
import { hasNote } from '../../utils/ayahNotesStorage';

const AyahCard = ({
  ayah,
  settings,
  darkMode,
  isPlaying,
  isBookmarked,
  surahName,
  onPlayClick,
  onBookmarkToggle,
  onNoteChange,
  theme // Tema renkleri
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTafsirModal, setShowTafsirModal] = useState(false);
  const [ayahHasNote, setAyahHasNote] = useState(hasNote(ayah.surahNumber || 1, ayah.number));

  const cardBg = theme ? theme.bg : (darkMode ? '#1f2937' : '#ffffff');
  const textColor = theme ? theme.text : (darkMode ? '#f3f4f6' : '#1f2937');
  const subTextColor = theme ? theme.sub : (darkMode ? '#cbd5e1' : '#475569');
  const borderColor = theme ? (settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#374151' : '#e5e7eb') : (darkMode ? '#374151' : '#e5e7eb');

  const handleNoteSave = () => {
    setAyahHasNote(true);
    onNoteChange && onNoteChange();
  };

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: (settings.readerTheme === 'dark' || settings.readerTheme === 'black' ? '#374151' : '#f3f4f6'),
    color: textColor,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          padding: '15px',
          backgroundColor: cardBg,
          borderRadius: '12px',
          border: isPlaying 
            ? '2px solid #059669' 
            : `1px solid ${borderColor}`,
          boxShadow: isPlaying 
            ? '0 4px 12px rgba(5, 150, 105, 0.3)' 
            : '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
        }}
      >
        {/* Not İndikatörü */}
        {ayahHasNote && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            boxShadow: '0 0 4px rgba(245, 158, 11, 0.6)'
          }} />
        )}

        {/* Arapça Metin */}
        <div style={{
          fontSize: settings.fontSize + 4,
          textAlign: 'right',
          lineHeight: '2.5',
          color: textColor,
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
                color: subTextColor,
                marginBottom: '15px',
                borderTop: `1px solid ${borderColor}`,
                paddingTop: '10px'
              }}>
              {ayah.turkish}
            </div>
        )}
        
        {/* Kontroller */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '12px',
          flexWrap: 'wrap'
        }}>
          {/* TEFSİR BUTONU */}
          <button
            onClick={() => setShowTafsirModal(true)}
            title="Tefsir Oku"
            style={buttonStyle}
          >
            📚
          </button>

          {/* Not */}
          <button
            onClick={() => setShowNoteModal(true)}
            style={{
              ...buttonStyle,
              backgroundColor: ayahHasNote ? '#f59e0b' : buttonStyle.backgroundColor,
              color: ayahHasNote ? 'white' : textColor
            }}
          >
            {ayahHasNote ? '📄' : '📝'}
          </button>
          
          {/* Yer İmi */}
          <button
            onClick={onBookmarkToggle}
            style={{
              ...buttonStyle,
              backgroundColor: isBookmarked ? '#059669' : buttonStyle.backgroundColor,
              color: isBookmarked ? 'white' : textColor
            }}
          >
            {isBookmarked ? '🔖' : '📌'}
          </button>
          
          {/* Dinle */}
          <button
            onClick={onPlayClick}
            style={{
              ...buttonStyle,
              backgroundColor: isPlaying ? '#059669' : buttonStyle.backgroundColor,
              color: isPlaying ? 'white' : textColor
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      {showNoteModal && (
        <NoteModal
          surahNumber={ayah.surahNumber || 1}
          ayahNumber={ayah.number}
          surahName={surahName || 'Sure'}
          darkMode={settings.readerTheme === 'dark' || settings.readerTheme === 'black'}
          onClose={() => setShowNoteModal(false)}
          onSave={handleNoteSave}
        />
      )}

      {showTafsirModal && (
        <TafsirModal
          surahNumber={ayah.surahNumber || 1}
          ayahNumber={ayah.number}
          darkMode={settings.readerTheme === 'dark' || settings.readerTheme === 'black'}
          onClose={() => setShowTafsirModal(false)}
        />
      )}
    </>
  );
};

export default AyahCard;
