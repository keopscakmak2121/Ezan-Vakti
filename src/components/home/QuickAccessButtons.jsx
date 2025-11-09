// src/components/home/QuickAccessButtons.jsx

import React from 'react';

// A single, reusable button component for consistent styling
const QuickButton = ({ icon, text, darkMode, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle = {
    padding: '20px',
    backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
    color: darkMode ? '#f3f4f6' : '#1f2937',
    border: `1px solid ${darkMode ? '#5f7088' : '#e5e7eb'}`,
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
  };

  const hoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 15px -3px ${darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}, 0 4px 6px -2px ${darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'}`,
    backgroundColor: darkMode ? '#5f7088' : '#ffffff',
  };

  return (
    <button
      onClick={onClick}
      style={isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ fontSize: '32px' }}>{icon}</span>
      <span style={{ lineHeight: '1.3' }}>{text}</span>
    </button>
  );
};

const QuickAccessButtons = ({ darkMode, onNavigate }) => {
  const styles = {
    container: {
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: darkMode ? '#f9fafb' : '#111827',
      margin: '0 0 20px 0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '15px',
    },
  };

  const buttons = [
    { id: 'quran', icon: '📖', text: 'Kuran Oku' },
    { id: 'esma', icon: '✨', text: 'Esmaül Hüsna' },
    { id: 'bookmarks', icon: '⭐', text: 'Yer İmleri' },
    { id: 'search', icon: '🔍', text: 'Ayet Ara' },
    { id: 'qibla', icon: '🧭', text: 'Kıble Bul' },
    { id: 'notes', icon: '📝', text: 'Notlarım' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Hızlı Erişim</h3>
      <div style={styles.grid}>
        {buttons.map((btn) => (
          <QuickButton
            key={btn.id}
            icon={btn.icon}
            text={btn.text}
            darkMode={darkMode}
            onClick={() => onNavigate(btn.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccessButtons;
