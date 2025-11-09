import React from 'react';

const Settings = ({ darkMode, toggleDarkMode }) => {

  const styles = {
    container: {
      padding: '20px',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '30px',
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    },
    settingLabel: {
      fontSize: '18px',
    },
    // Basic toggle switch styles
    toggleSwitch: {
      position: 'relative',
      display: 'inline-block',
      width: '60px',
      height: '34px',
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    slider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? '#4b5563' : '#ccc',
      transition: '.4s',
      borderRadius: '34px',
    },
    sliderBefore: {
      position: 'absolute',
      content: '\'\'',
      height: '26px',
      width: '26px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
      transform: darkMode ? 'translateX(26px)' : 'translateX(0)',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ayarlar</h2>
      
      <div style={styles.settingRow}>
        <span style={styles.settingLabel}>Karanlık Mod</span>
        <label style={styles.toggleSwitch}>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} style={styles.switchInput} />
          <span style={styles.slider}>
             <span style={styles.sliderBefore}></span>
          </span>
        </label>
      </div>

      {/* Other settings can be added here in the future */}

    </div>
  );
};

export default Settings;
