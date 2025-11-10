
import React from 'react';
import { prayerImages } from './prayerImages.js';

const NextPrayerCard = ({ nextPrayer, countdown, locationName }) => {

  const isLoading = !nextPrayer;
  const prayerName = isLoading ? 'Yükleniyor...' : nextPrayer.name;
  const prayerTime = isLoading ? '--:--' : nextPrayer.time;
  
  // En basit ve en sağlam yöntem:
  // Vakit adını kullanarak doğrudan ilgili resmi al. Bulamazsan varsayılanı kullan.
  const imageUrl = prayerImages[prayerName] || prayerImages.default;

  const cardStyle = {
    borderRadius: '16px',
    textAlign: 'center',
    color: 'white',
    height: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  };

  const imageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 2,
  };

  const contentStyle = {
      position: 'relative',
      zIndex: 3,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%'
  };

  return (
    <div style={cardStyle}>
      <img src={imageUrl} alt={prayerName} style={imageStyle} />
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <div style={{fontSize: '24px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{prayerName}</div>
        <div style={{fontSize: '48px', fontWeight: 'bold', margin: '5px 0'}}>{countdown || '00:00:00'}</div>
        <div style={{fontSize: '16px', opacity: 0.9, marginBottom: '10px'}}>Vakit: {prayerTime}</div>
        {locationName && <div style={{fontSize: '14px', padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '15px'}}>📍 {locationName}</div>}
      </div>
    </div>
  );
};

export default NextPrayerCard;
