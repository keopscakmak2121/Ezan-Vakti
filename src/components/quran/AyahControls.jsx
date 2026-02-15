import React from 'react';
import MoreOptionsMenu from './MoreOptionsMenu';

const AyahControls = ({
  ayah,
  darkMode,
  onPlay, // QuranReader'daki onPlayClick -> AyahCard'daki onPlayClick
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
    borderRadius: '6px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, paddingTop: '12px', marginTop: '12px' }}>
      
      {/* Dinle Butonu - Artık globalNumber kullanarak menü açar */}
      <button
        onClick={() => onPlay(ayah)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: darkMode ? '#065f46' : '#10b981',
          color: 'white',
          fontWeight: '600',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '25px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <span>▶</span>
        <span>Dinle / İndir</span>
      </button>

      {/* Diğer Seçenekler Menüsü */}
      <MoreOptionsMenu darkMode={darkMode}>
        <button style={buttonStyle} onClick={() => onCopy(ayah)}>
          <span>📋</span>
          <span>Kopyala</span>
        </button>
        <button style={buttonStyle} onClick={() => onToggleBookmark(ayah)}>
          <span>★</span>
          <span>Yer İmi</span>
        </button>
        <button style={buttonStyle} onClick={() => onOpenNote(ayah)}>
          <span>📝</span>
          <span>Not</span>
        </button>
      </MoreOptionsMenu>
    </div>
  );
};

export default AyahControls;
