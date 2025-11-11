import React from 'react';
import MoreOptionsMenu from './MoreOptionsMenu';

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

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: darkMode ? '#cbd5e1' : '#475569',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '15px',
    borderRadius: '6px', // Added for hover effect
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = darkMode ? '#526071' : '#f1f5f9';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${darkMode ? '#526071' : '#e2e8f0'}`, paddingTop: '12px', marginTop: '12px' }}>
      
      {/* Main 'Listen' Button */}
      <button
        onClick={() => onPlay(ayah.number)}
        style={{
          ...buttonStyle,
          width: 'auto', // Override width
          backgroundColor: currentAyah === ayah.number 
            ? (darkMode ? '#c23d3d' : '#ef4444') 
            : (darkMode ? '#065f46' : '#10b981'),
          color: 'white',
          fontWeight: '600',
          padding: '8px 16px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = currentAyah === ayah.number ? (darkMode ? '#dc2626' : '#f87171') : (darkMode ? '#047857' : '#34d399'); }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentAyah === ayah.number ? (darkMode ? '#c23d3d' : '#ef4444') : (darkMode ? '#065f46' : '#10b981'); }}
      >
        {currentAyah === ayah.number ? '⏸' : '▶'}
        <span>{currentAyah === ayah.number ? 'Durdur' : 'Dinle'}</span>
      </button>

      {/* More Options Menu */}
      <MoreOptionsMenu darkMode={darkMode}>
        <button style={buttonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={() => onCopy(ayah)}>
          <span>📋</span>
          <span>{copiedAyah === ayah.number ? 'Kopyalandı!' : 'Kopyala'}</span>
        </button>
        <button style={buttonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={() => onToggleBookmark(ayah)}>
          <span style={{color: isBookmarked ? '#f59e0b' : 'inherit'}}>★</span>
          <span>{isBookmarked ? 'Yer İmi Kaldır' : 'Yer İmi Ekle'}</span>
        </button>
        <button style={buttonStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={() => onOpenNote(ayah)}>
          <span>📝</span>
          <span>{hasNote ? 'Notu Düzenle' : 'Not Ekle'}</span>
        </button>
      </MoreOptionsMenu>
    </div>
  );
};

export default AyahControls;
