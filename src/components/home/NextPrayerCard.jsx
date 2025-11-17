import React from 'react';
import getImageForPrayer from './prayerImages.js';

const NextPrayerCard = ({ nextPrayer, countdown, locationName, darkMode }) => {

  const isLoading = !nextPrayer;
  const prayerName = isLoading ? 'Yükleniyor...' : nextPrayer.name;
  const prayerTime = isLoading ? '--:--' : nextPrayer.time;
  const imageUrl = getImageForPrayer(prayerName);

  // Base styles that apply to both themes
  const baseCardStyle = {
    borderRadius: '16px',
    textAlign: 'center',
    height: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  };

  // Theme-specific styles
  const lightThemeStyles = {
    card: {
      backgroundColor: '#ffffff',
      color: '#1f2937', // Dark text for light background
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      border: '1px solid #e5e7eb',
    },
    prayerName: { fontSize: '24px', fontWeight: '600' },
    countdown: { fontSize: '48px', fontWeight: 'bold', margin: '5px 0', color: '#059669' }, // Highlight color for countdown
    prayerTime: { fontSize: '16px', opacity: 0.8, marginBottom: '10px' },
    location: { fontSize: '14px', padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '15px' },
  };

  const darkThemeStyles = {
    card: {
      color: 'white',
    },
    image: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1,
    },
    overlay: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 2,
    },
    content: {
      position: 'relative', zIndex: 3, padding: '20px', display: 'flex', flexDirection: 'column', 
      justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'
    },
    prayerName: { fontSize: '24px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' },
    countdown: { fontSize: '48px', fontWeight: 'bold', margin: '5px 0' },
    prayerTime: { fontSize: '16px', opacity: 0.9, marginBottom: '10px' },
    location: { fontSize: '14px', padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '15px' },
  };

  // Decide which theme to use
  const theme = darkMode ? darkThemeStyles : lightThemeStyles;

  return (
    <div style={{ ...baseCardStyle, ...theme.card }}>
      {darkMode && <img src={imageUrl} alt={prayerName} style={theme.image} />}
      {darkMode && <div style={theme.overlay}></div>}

      <div style={darkMode ? theme.content : { /* No special content wrapper needed for light theme */ }}>
        <div style={theme.prayerName}>{prayerName}</div>
        <div style={theme.countdown}>{countdown || '00:00:00'}</div>
        <div style={theme.prayerTime}>Vakit: {prayerTime}</div>
        {locationName && 
          <div style={theme.location}>📍 {locationName}</div>
        }
      </div>
    </div>
  );
};

export default NextPrayerCard;
