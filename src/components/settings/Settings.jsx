// src/components/settings/Settings.jsx

import React from 'react';

// A reusable Toggle Switch component
const ToggleSwitch = ({ label, checked, onChange, darkMode }) => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      borderRadius: '12px',
      marginBottom: '10px',
    },
    label: {
      fontSize: '16px',
      fontWeight: '500',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    },
    switch: {
      position: 'relative',
      display: 'inline-block',
      width: '50px',
      height: '28px',
    },
    slider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: checked ? (darkMode ? '#10b981' : '#059669') : (darkMode ? '#4b5563' : '#ccc'),
      transition: '.4s',
      borderRadius: '28px',
    },
    sliderBefore: {
      position: 'absolute',
      content: '""', // CORRECTED: This was the source of the build error
      height: '20px',
      width: '20px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
      transform: checked ? 'translateX(22px)' : 'translateX(0)',
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      <label style={styles.switch}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={styles.slider}>
          <span style={styles.sliderBefore}></span>
        </span>
      </label>
    </div>
  );
};

const Settings = ({ darkMode, toggleDarkMode }) => {
  const styles = {
    page: {
      padding: '10px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: darkMode ? '#f9fafb' : '#111827',
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginTop: '20px',
      marginBottom: '10px',
      paddingLeft: '5px',
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Ayarlar</h1>
      
      <h2 style={styles.sectionTitle}>Görünüm Ayarları</h2>
      <ToggleSwitch 
        label="Karanlık Mod"
        checked={darkMode}
        onChange={toggleDarkMode}
        darkMode={darkMode}
      />

      {/* Future settings will be added here */}
    </div>
  );
};

export default Settings;
