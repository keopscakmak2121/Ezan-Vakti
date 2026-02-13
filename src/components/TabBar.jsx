import React from 'react';

const TabBar = ({ darkMode, onNavigate, currentView, frequentItems, menuItems }) => {
  const styles = {
    container: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      display: 'flex',
      justifyContent: 'space-between', // Items on left and right
      alignItems: 'center',
      padding: '0 20px', // Padding on the sides
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
    button: {
      backgroundColor: 'transparent',
      border: 'none',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '24px',
      cursor: 'pointer',
    },
    frequentItemsContainer: {
      display: 'flex',
      gap: '30px', // Adjust gap between frequent items
    },
  };

  const getButtonColor = (view) => {
    // Special condition to keep the menu button un-highlighted when the menu is open
    if (currentView === 'menu' && view !== 'menu') return styles.button.color;
    if (view === 'menu' && currentView !== 'menu') return styles.button.color;

    return currentView === view ? (darkMode ? '#10b981' : '#059669') : styles.button.color;
  };

  // Find the icon for a given view ID
  const getIconForView = (viewId) => {
    const menuItem = menuItems.find(item => item.id === viewId);
    return menuItem ? menuItem.icon : '?'; // Fallback icon
  };

  return (
    <div style={styles.container}>
      {/* Menu button on the far left */}
      <button onClick={() => onNavigate('menu')} style={{ ...styles.button, color: getButtonColor('menu') }}>☰</button>

      {/* Dynamically rendered frequent items */}
      <div style={styles.frequentItemsContainer}>
        {frequentItems.map(item_id => (
          <button 
            key={item_id}
            onClick={() => onNavigate(item_id)} 
            style={{ ...styles.button, color: getButtonColor(item_id) }}
          >
            {getIconForView(item_id)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
