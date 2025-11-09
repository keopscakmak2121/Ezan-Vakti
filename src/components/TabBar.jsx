import React from 'react';

const TabBar = ({ darkMode, onNavigate }) => {
  const styles = {
    container: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
    button: {
      backgroundColor: 'transparent',
      border: 'none',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '24px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => onNavigate('home')} style={styles.button}>🏠</button>
      <button onClick={() => onNavigate('quran')} style={styles.button}>📖</button>
      <button onClick={() => onNavigate('settings')} style={styles.button}>⚙️</button>
    </div>
  );
};

export default TabBar;
