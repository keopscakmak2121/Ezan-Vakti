// src/components/Header.jsx

import React, { useState } from 'react';

// BUILD VERSION: 0.3.1 - Added Home Button
console.log('Header Version 0.3.1 loaded!');

const Header = ({ onNavigate, darkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (view) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  const menuItems = [
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
  ];

  const styles = {
    header: {
      backgroundColor: darkMode ? '#1f2937' : '#059669',
      color: 'white',
      padding: '15px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.3s ease',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hamburgerButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '28px',
      cursor: 'pointer',
      padding: '5px',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    iconButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '10px',
      borderRadius: '50%',
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
    },
    menuOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 999,
    },
    menu: {
      position: 'fixed',
      top: 0,
      left: menuOpen ? '0' : '-100%',
      width: '280px',
      height: '100%',
      backgroundColor: darkMode ? '#111827' : '#ffffff',
      boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto',
      transition: 'left 0.3s ease-in-out',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    },
    menuHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
    },
    menuTitle: {
      margin: 0,
      fontSize: '22px',
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    menuItem: {
      width: '100%',
      padding: '15px',
      marginBottom: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '8px',
      color: darkMode ? '#d1d5db' : '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      transition: 'background-color 0.2s, color 0.2s',
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <button
            onClick={() => setMenuOpen(true)}
            style={styles.hamburgerButton}
            aria-label="Menüyü aç"
          >
            ☰
          </button>
          
          <div style={styles.rightSection}>
             <button onClick={() => onNavigate('home')} style={styles.iconButton} aria-label="Ana Sayfa">
              🏠
            </button>
            <button onClick={toggleDarkMode} style={styles.iconButton} aria-label="Karanlık modu değiştir">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={styles.menuOverlay} />}
      
      <div style={styles.menu}>
        <div style={styles.menuHeader}>
          <h2 style={styles.menuTitle}>Menü</h2>
          <button
            onClick={() => setMenuOpen(false)}
            style={styles.closeButton}
            aria-label="Menüyü kapat"
          >
            ✕
          </button>
        </div>

        <nav>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              style={styles.menuItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#f3f4f6';
                e.currentTarget.style.color = darkMode ? '#ffffff' : '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = darkMode ? '#d1d5db' : '#374151';
              }}
            >
              <span style={{ fontSize: '22px', width: '30px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
