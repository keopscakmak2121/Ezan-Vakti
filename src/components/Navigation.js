// src/components/Navigation.js
import React from 'react';

const Navigation = ({ currentView, onNavigate, darkMode }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', text: 'Ana Sayfa' },
    { id: 'quran', icon: '📖', text: 'Kuran Oku' },
    { id: 'esma', icon: '✨', text: 'Esmaül Hüsna' },
    { id: 'search', icon: '🔍', text: 'Ayet Ara' },
    { id: 'bookmarks', icon: '⭐', text: 'Yer İmleri' },
    { id: 'notes', icon: '📝', text: 'Notlarım' },
    { id: 'downloads', icon: '💾', text: 'İndirilenler' },
    { id: 'prayerTimes', icon: '🕌', text: 'Namaz Vakitleri' },
    { id: 'qibla', icon: '🧭', text: 'Kıble' },
    { id: 'stats', icon: '📊', text: 'İstatistikler' },
    { id: 'settings', icon: '⚙️', text: 'Ayarlar' }
  ];

  return (
    <nav style={{
      backgroundColor: darkMode ? '#1f2937' : 'white',
      padding: '10px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              padding: '10px 15px',
              backgroundColor: currentView === item.id ? '#059669' : (darkMode ? '#374151' : '#f3f4f6'),
              color: currentView === item.id ? 'white' : (darkMode ? '#f3f4f6' : '#1f2937'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation; 
