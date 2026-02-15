import React from 'react';

const TabBar = ({ darkMode, onNavigate, currentView, frequentItems = [], menuItems = [] }) => {
  const styles = {
    container: {
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 20px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
    button: {
      backgroundColor: 'transparent', border: 'none',
      color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '24px', cursor: 'pointer',
    },
    frequentItemsContainer: { display: 'flex', gap: '30px' },
  };

  const getButtonColor = (view) => {
    if (currentView === view) return darkMode ? '#10b981' : '#059669';
    return styles.button.color;
  };

  const getIconForView = (viewId) => {
    const item = menuItems?.find(i => i.id === viewId);
    return item ? item.icon : '❓';
  };

  return (
    <div style={styles.container}>
      <button onClick={() => onNavigate('home')} style={{ ...styles.button, color: getButtonColor('home') }}>🏠</button>

      <div style={styles.frequentItemsContainer}>
        {/* frequentItems?.map diyerek listenin boş gelme ihtimalini garantiye alıyoruz */}
        {frequentItems?.map(item_id => (
          <button 
            key={item_id}
            onClick={() => onNavigate(item_id)} 
            style={{ ...styles.button, color: getButtonColor(item_id) }}
          >
            {getIconForView(item_id)}
          </button>
        ))}
      </div>

      <button onClick={() => onNavigate('menu')} style={{ ...styles.button, color: getButtonColor('menu') }}>☰</button>
    </div>
  );
};

export default TabBar;
