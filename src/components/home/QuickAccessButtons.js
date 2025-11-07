// src/components/home/QuickAccessButtons.js
import React from 'react';

// Hızlı Erişim Butonu Component
const QuickButton = ({ icon, text, darkMode, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '12px',
      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      minHeight: '70px'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#059669';
      e.target.style.color = 'white';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(5,150,105,0.3)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = darkMode ? '#4b5563' : '#f3f4f6';
      e.target.style.color = darkMode ? '#f3f4f6' : '#1f2937';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }}
  >
    <span style={{ fontSize: '24px' }}>{icon}</span>
    <span style={{ textAlign: 'center', lineHeight: '1.2' }}>{text}</span>
  </button>
);

const QuickAccessButtons = ({ darkMode, onNavigate }) => {
  const cardBg = darkMode ? '#374151' : 'white';
  const text = darkMode ? '#f3f4f6' : '#1f2937';

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        color: text,
        margin: '0 0 15px 0'
      }}>
        ⚡ Hızlı Erişim
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '10px'
      }}>
        <QuickButton 
          icon="📖" 
          text="Kuran Oku" 
          darkMode={darkMode}
          onClick={() => onNavigate('quran')}
        />
        <QuickButton 
          icon="✨" 
          text="Esmaül Hüsna" 
          darkMode={darkMode}
          onClick={() => onNavigate('esma')}
        />
        <QuickButton 
          icon="⭐" 
          text="Yer İmleri" 
          darkMode={darkMode}
          onClick={() => onNavigate('bookmarks')}
        />
        <QuickButton 
          icon="🔍" 
          text="Ayet Ara" 
          darkMode={darkMode}
          onClick={() => onNavigate('search')}
        />
        <QuickButton 
          icon="🧭" 
          text="Kıble" 
          darkMode={darkMode}
          onClick={() => onNavigate('qibla')}
        />
        <QuickButton 
          icon="📝" 
          text="Notlarım" 
          darkMode={darkMode}
          onClick={() => onNavigate('notes')}
        />
      </div>
    </div>
  );
};

export default QuickAccessButtons;