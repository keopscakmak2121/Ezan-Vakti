// src/components/home/NextPrayerCard.js
import React from 'react';

const NextPrayerCard = ({ nextPrayer, timings, darkMode }) => {
  if (!nextPrayer || !timings) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#059669',
      borderRadius: '12px',
      padding: '25px 20px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
      color: 'white'
    }}>
      <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
        {nextPrayer.tomorrow ? '🌙 Yarın' : 'Bir Sonraki Vakit'}
      </div>
      <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '8px' }}>
        {nextPrayer.time}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
        {nextPrayer.name}
      </div>
    </div>
  );
};

export default NextPrayerCard;