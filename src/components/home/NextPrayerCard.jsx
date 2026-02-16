import React from 'react';
import getImageForPrayer from './prayerImages.js';

const NextPrayerCard = ({ nextPrayer, countdown, locationName, darkMode }) => {
  const isLoading = !nextPrayer;
  const prayerName = isLoading ? 'Yükleniyor...' : nextPrayer.name;
  const prayerTime = isLoading ? '--:--' : nextPrayer.time;
  const imageUrl = getImageForPrayer(prayerName);

  // Her iki temada da arka plan görseli gösteriyoruz
  // Dark mode: koyu overlay, Light mode: açık overlay
  const overlayColor = darkMode ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.30)';

  return (
    <div style={{
      borderRadius: '16px',
      height: '250px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {/* Arka plan görseli */}
      <img
        src={imageUrl}
        alt={prayerName}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: overlayColor,
        zIndex: 2
      }} />

      {/* İçerik */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        color: '#ffffff',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: '600',
          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          marginBottom: '4px'
        }}>
          {prayerName}
        </div>

        <div style={{
          fontSize: '50px',
          fontWeight: 'bold',
          textShadow: '0 3px 8px rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}>
          {countdown || '00:00:00'}
        </div>

        <div style={{
          fontSize: '15px',
          opacity: 0.9,
          marginBottom: '10px',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)'
        }}>
          Vakit: {prayerTime}
        </div>

        {locationName && (
          <div style={{
            fontSize: '13px',
            padding: '5px 14px',
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            📍 {locationName}
          </div>
        )}
      </div>
    </div>
  );
};

export default NextPrayerCard;
