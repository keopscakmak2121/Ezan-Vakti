import React from 'react';

export const menuItems = [
  { id: 'quran', icon: '📖', text: 'Kuran Oku' },
  { id: 'esma', icon: '✨', text: 'Esmaül Hüsna' },
  { id: 'search', icon: '🔍', text: 'Ayet Ara' },
  { id: 'bookmarks', icon: '⭐', text: 'Yer İmleri' },
  { id: 'notes', icon: '📝', text: 'Notlarım' },
  { id: 'downloads', icon: '💾', text: 'İndirilenler' },
  { id: 'prayerTimes', icon: '🕌', text: 'Namaz Vakitleri' },
  { id: 'importantDays', icon: '📅', text: 'Önemli Günler' },
  { id: 'qibla', icon: '🧭', text: 'Kıble' },
  { id: 'stats', icon: '📊', text: 'İstatistikler' },
  { id: 'settings', icon: '⚙️', text: 'Ayarlar' }
];

const Navigation = ({ onNavigate, darkMode }) => {

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)', // Two columns
      gap: '15px',
      padding: '10px', 
    },
    card: {
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      transition: 'transform 0.2s ease-in-out',
      minHeight: '100px',
    },
    icon: {
      fontSize: '32px',
      marginBottom: '10px',
    },
    text: {
      fontSize: '16px',
      fontWeight: '600',
      textAlign: 'center',
    }
  };

  return (
    <div>
      <h2 style={{ 
        color: darkMode ? '#f3f4f6' : '#1f2937',
        textAlign: 'center',
        padding: '20px 10px 10px 10px',
        fontSize: '24px'
      }}>Menü</h2>
      <div style={styles.container}>
        {menuItems.map(item => (
          <div 
            key={item.id} 
            style={styles.card} 
            onClick={() => onNavigate(item.id)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={styles.icon}>{item.icon}</div>
            <div style={styles.text}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
