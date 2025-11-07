
import React, { useState } from 'react';
// BUILD VERSION: 0.2.0 - UPDATED $(date)
console.log('Header Version 0.2.0 loaded!');
const Header = ({ onNavigate, darkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      backgroundColor: '#059669',
      color: 'white',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Hamburger Menü */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ☰
          </button>
        </div>

        {/* Sağ Taraf - Ana Sayfa ve Karanlık Mod */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={{
              ...buttonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            🏠 Ana Sayfa
          </button>
          
          <button onClick={toggleDarkMode} style={buttonStyle}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Açılır Menü */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          backgroundColor: darkMode ? '#1f2937' : 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, color: darkMode ? 'white' : '#1f2937' }}>Menü</h2>
            <button 
              onClick={() => setMenuOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: darkMode ? 'white' : '#1f2937'
              }}
            >
              ✕
            </button>
          </div>

          {[
            { id: 'home', icon: '🏠', text: 'Ana Sayfa' },
            { id: 'quran', icon: '📖', text: 'Kuran Oku' },
            { id: 'esma', icon: '✨', text: 'Esmaül Hüsna' },
            { id: 'search', icon: '🔍', text: 'Ayet Arama' },
            { id: 'bookmarks', icon: '⭐', text: 'Yer İmleri' },
            { id: 'notes', icon: '📝', text: 'Notlarım' },
            { id: 'downloads', icon: '💾', text: 'İndirilenler' },
            { id: 'prayerTimes', icon: '🕌', text: 'Namaz Vakitleri' },
            { id: 'qibla', icon: '🧭', text: 'Kıble' },
            { id: 'stats', icon: '📊', text: 'İstatistikler' },
            { id: 'settings', icon: '⚙️', text: 'Ayarlar' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMenuOpen(false);
              }}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: '16px',
                cursor: 'pointer',
                borderRadius: '8px',
                color: darkMode ? 'white' : '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.text}
            </button>
          ))}
        </div>
      )}

      {/* Menü Açıkken Arka Plan Overlay */}
      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

const buttonStyle = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

export default Header;